import React, { useEffect, useContext, useState } from 'react';
import { useDispatch, useSelector as reduxSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import {
    Badge, Bullseye, Card, CardHeader, CardActions, CardBody, CardTitle,
    EmptyState, EmptyStateIcon, EmptyStateBody,
    Dropdown, Grid, GridItem, KebabToggle,
    Progress, ProgressMeasureLocation, ProgressVariant, Stack, Split,
    Title, Button,
    ToolbarItem, ToolbarGroup, StackItem, DropdownItem, SplitItem
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { SimpleTableFilter, Skeleton, TableToolbar, DateFormat } from '@redhat-cloud-services/frontend-components';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/components/PrimaryToolbar';
import { WrenchIcon } from '@patternfly/react-icons';

import { appUrl } from '../Utilities/urls';
import ConfirmationDialog from './ConfirmationDialog';

import SkeletonTable from '../skeletons/SkeletonTable';
import { useFilter, usePagination, useSelector, useSorter } from '../hooks/table';
import keyBy from 'lodash/keyBy';

import { downloadPlaybook } from '../api';
import { getConnectionStatus, runRemediation, setEtag, getPlaybookRuns, loadRemediation } from '../actions';

import { PermissionContext } from '../App';
import { ExecuteModal } from './Modals/ExecuteModal';
import './RemediationTable.scss';

function buildName (name, id) {
    return (
        <Link to={ `/${id}` }>{ name }</Link>
    );
}

function skeleton () {
    return (
        <React.Fragment>
            <TableToolbar className='ins-c-remediations-details-table__toolbar'>
                <ToolbarGroup>
                    <ToolbarItem>
                        <SimpleTableFilter buttonTitle="" placeholder="Search Playbooks" aria-label="Search Playbooks Loading" />
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarGroup>
                    {
                        // <ToolbarItem><Button isDisabled> Create Remediation </Button></ToolbarItem>
                    }
                    <ToolbarItem>
                        <Button variant='secondary' isDisabled> Download playbook </Button>
                    </ToolbarItem>
                    <ToolbarItem>
                        <Dropdown
                            toggle={ <KebabToggle/> }
                            isPlain
                        >
                        </Dropdown>
                    </ToolbarItem>
                </ToolbarGroup>
                <Skeleton size='sm'/>
            </TableToolbar>
            <SkeletonTable/>
        </React.Fragment>
    );
}

function empty () {
    return (
        <Bullseye>
            <EmptyState className='ins-c-no-remediations'>
                <EmptyStateIcon icon={ WrenchIcon } size='sm' />
                <Title size="lg" headingLevel="h5">You haven&apos;t created any remediation Playbooks yet</Title>
                <EmptyStateBody>
                    Create an Ansible Playbook to remediate or mitigate vulnerabilities or configuration issues.
                    <br />
                    <br />
                    To create a new remediation Playbook, select issues identified in
                    <br />
                    <a href={ appUrl('advisor').toString() }>Recommendations</a>,&nbsp;
                    <a href={ appUrl('compliance').toString() }>Compliance</a> or&nbsp;
                    <a href={ appUrl('vulnerabilities').toString() }>Vulnerability</a>&nbsp;
                    and select
                    <br />
                    <strong>Remediate with Ansible.</strong>
                </EmptyStateBody>
            </EmptyState>
        </Bullseye>
    );
}

function downloadAll (selectedIds, data) {
    const byId = keyBy(data, r => r.id);
    selectedIds.reduce((result, id) => {
        const remediation = byId[id];

        if (remediation && remediation.issue_count === 0) {
            return result;
        }

        return result.then(() => downloadPlaybook(id));
    }, Promise.resolve());
}

const SORTING_ITERATEES = [ null, 'name', 'system_count', 'issue_count', 'updated_at' ];

const PlaybookCardHeader = ({
    remediation,
    remediationIdx,
    archived,
    selector,
    setExecuteOpen,
    loadRemediation,
    getConnectionStatus,
    downloadPlaybook,
    permission
}) => {
    const [ isOpen, setIsOpen ] = useState(false);
    const [ isChecked, setIsChecked ] = useState(false);
    const [ isArchived, setIsArchived ] = useState(archived);
    const dispatch = useDispatch();
    const dropdownItems = [];

    const actionWrapper = (actionsList, callback) => {
        Promise.all(actionsList.map((event) => {
            dispatch(event);
            return event.payload;
        })).then(callback);
    };

    dropdownItems.push(
        <DropdownItem
            key='execute'
            id='execute'
            isDisabled= { !permission.isReceptorConfigured || isArchived }
            className= { `${(!permission.hasSmartManagement || !permission.permissions.execute) && 'ins-m-not-entitled'}` }
            onClick={ () => {
                setExecuteOpen(false);
                actionWrapper([
                    loadRemediation(remediation.id),
                    getConnectionStatus(remediation.id)
                ], () => { setExecuteOpen(true); setIsOpen(false); });
            } }>
        Execute playbook
        </DropdownItem>
    );

    dropdownItems.push(
        <DropdownItem key='download'
            onClick={ () => { downloadPlaybook(remediation.id); setIsOpen(false); } }>
        Download playbook
        </DropdownItem>
    );

    isArchived
        ? dropdownItems.push(
            <DropdownItem key='restore'
                onClick={ () => { setIsArchived(false); setIsOpen(false); } }>
            Restore
            </DropdownItem>
        )
        : dropdownItems.push(
            <DropdownItem key='archive'
                onClick={ () => { setIsArchived(true); setIsOpen(false); } }>
            Archive
            </DropdownItem>
        );

    return (
        <CardHeader>
            <CardActions>
                <Dropdown
                    key='dropdown'
                    id={ `${remediation.id}-dropdown` }
                    isOpen={ isOpen }
                    isPlain
                    onSelect={ f => f }
                    toggle={
                        <KebabToggle
                            id={ `${remediation.id}-toggle` }
                            onToggle={ (isOpen) => setIsOpen(isOpen) }/> }
                    dropdownItems={ dropdownItems }
                    position={ 'right' }
                />
                <input
                    type="checkbox"
                    name={ `${remediation.id}-checkbox` }
                    checked={ isChecked }
                    onChange={ (e) => {
                        setIsChecked(e.target.checked);
                        isChecked
                            ? selector.props.onSelect(e, false, remediationIdx)
                            : selector.props.onSelect(e, true, remediationIdx);
                    } }
                    aria-label={ `${remediation.id}-checkbox` }
                />
            </CardActions>
            <CardTitle>
                <Stack>
                    <StackItem className='ins-c-playbook-title'>
                        { isArchived &&
                            <Badge isRead className='ins-c-playbook-badge'>
                            Archived
                            </Badge>
                        }
                        { buildName(remediation.name, remediation.id) }
                    </StackItem>
                    <StackItem className='ins-c-playbook-last-modified'>
                    Last modified: <DateFormat date={ remediation.updated_at } />
                    </StackItem>
                </Stack>
            </CardTitle>
        </CardHeader>
    );
};

PlaybookCardHeader.propTypes = {
    remediation: PropTypes.object.isRequired,
    remediationIdx: PropTypes.number.isRequired,
    archived: PropTypes.bool.isRequired,
    selector: PropTypes.func.isRequired,
    setExecuteOpen: PropTypes.func.isRequired,
    loadRemediation: PropTypes.func.isRequired,
    getConnectionStatus: PropTypes.func.isRequired,
    downloadPlaybook: PropTypes.func.isRequired,
    permission: PropTypes.func.isRequired
};

function RemediationTable (props) {

    const { value, status } = props;

    const sorter = useSorter(4, 'desc');
    const filter = useFilter();
    const selector = useSelector();
    const pagination = usePagination();
    const permission = useContext(PermissionContext);
    const [ dialogOpen, setDialogOpen ] = useState(false);
    const [ executeOpen, setExecuteOpen ] = useState(false);
    const [ showRefreshMessage, setShowRefreshMessage ] = useState(false);
    const [ filterText, setFilterText ] = useState('');
    const [ showArchived, setShowArchived ] = useState(false);
    const selectedRemediation = reduxSelector(state => state.selectedRemediation);
    const connectionStatus = reduxSelector(state => state.connectionStatus);
    const runningRemediation = reduxSelector(state => state.runRemediation);
    const dispatch = useDispatch();

    function loadRemediations () {
        const column = SORTING_ITERATEES[sorter.sortBy];
        props.loadRemediations(column, sorter.sortDir, filter.value, pagination.pageSize, pagination.offset);
    }

    useEffect(loadRemediations, [ sorter.sortBy, sorter.sortDir, filter.value, pagination.pageSize, pagination.pageDebounced ]);

    useEffect(() => {
        if (runningRemediation.status === 'changed') {
            getConnectionStatus(selectedRemediation.remediation.id);
            setShowRefreshMessage(true);
        } else if (runningRemediation.status === 'fulfilled') {
            setExecuteOpen(false);
        }
    }, [ runningRemediation.status ]);

    // Skeleton Loading
    if (status !== 'fulfilled') {
        return skeleton();
    }

    if (!value.data.length && !filter.value) {
        return empty();
    }

    filter.onChange(pagination.reset);
    sorter.onChange(pagination.reset);

    const rows = value.data.map(remediation => ({
        id: remediation.id,
        archived: false,
        cells: [
            buildName(remediation.name, remediation.id),
            remediation.system_count,
            remediation.issue_count,
            { title: <DateFormat date={ remediation.updated_at } /> }
        ]
    }));

    selector.register(rows);
    const selectedIds = selector.getSelectedIds();

    const renderActionStatus = (complete, total) => {
        return (complete === total
            ? <div><CheckCircleIcon className='ins-c-remediations-success'/> { complete } of { total }</div>
            : `${complete} of ${total}`
        );
    };

    const renderProgress = (complete, total) => {
        return (complete === total
            ? <Progress className='ins-c-progress-success'
                value={ 100 }
                measureLocation={ ProgressMeasureLocation.none }
                variant={ ProgressVariant.success }/>
            : <Progress className='ins-c-progress'
                value={ (complete / total * 100) }
                measureLocation={ ProgressMeasureLocation.none }/>
        );
    };

    return (
        <Stack hasGutter>
            <StackItem>
                { dialogOpen &&
                    <ConfirmationDialog
                        text={ `You will not be able to recover ${selectedIds.length > 1 ? 'these remediations' : 'this remediation'}` }
                        onClose={ async (del) => {
                            setDialogOpen(false);
                            if (del) {
                                await Promise.all(selectedIds.map(r => props.deleteRemediation(r)));
                                loadRemediations();
                                selector.reset();
                            }
                        } } />
                }
                { executeOpen &&
                    <ExecuteModal
                        isOpen = { executeOpen }
                        onClose = { () => { setShowRefreshMessage(false); setExecuteOpen(false); } }
                        showRefresh = { showRefreshMessage }
                        remediationId = { selectedRemediation.remediation.id }
                        data = { connectionStatus.data }
                        etag = { connectionStatus.etag }
                        isLoading = { (connectionStatus.status !== 'fulfilled') }
                        issueCount = { selectedRemediation.remediation.issues.length }
                        remediationStatus = { runningRemediation.status }
                        runRemediation = { (id, etag) => {
                            dispatch(runRemediation(id, etag)).then(() => dispatch(getPlaybookRuns(id)));
                        } }
                        setEtag = { (etag) => { dispatch(setEtag(etag)); } }
                    />
                }
                <PrimaryToolbar
                    filterConfig={ {
                        items: [{
                            label: 'Search playbooks',
                            type: 'text',
                            filterValues: {
                                id: 'filter-by-string',
                                key: 'filter-by-string',
                                placeholder: 'Search playbooks',
                                value: filterText,
                                onChange: (_e, value) => {
                                    setFilterText(value);
                                    filter.setValue(value);
                                }
                            }
                        }]
                    } }
                    bulkSelect={ { items: [{ title: 'Select all',
                        onClick: (e) => selector.props.onSelect(e, true, -1)
                    }],
                    checked: selectedIds.length && value.meta.total > selectedIds.length ? null : selectedIds.length,
                    count: selectedIds.length,
                    onSelect: (isSelected, e) => selector.props.onSelect(e, isSelected, -1) } }
                    actionsConfig={ { actions: [
                        { label: 'Download playbooks',
                            props: { variant: 'secondary', isDisabled: !selectedIds.length },
                            onClick: () => downloadAll(selectedIds, value.data)
                        },
                        { label: 'Delete playbooks',
                            props: { isDisabled: !permission.permissions.write || !selectedIds.length },
                            onClick: () => setDialogOpen(true)
                        },
                        { label: showArchived ? 'Hide archived playbooks' : 'Show archived playbooks',
                            onClick: showArchived ? () => setShowArchived(false) : () => setShowArchived(true)
                        }]} }
                    pagination={ { ...pagination.props, itemCount: value.meta.total } }
                />
            </StackItem>
            <StackItem>
                <Grid sm={ 12 } md={ 6 } lg={ 4 } hasGutter>
                    { value.data.map((remediation, idx) => {
                        return (
                            <GridItem key={ remediation.id }>
                                <Card className='ins-c-playbook-card' isCompact>
                                    <PlaybookCardHeader
                                        remediation={ remediation }
                                        remediationIdx={ idx }
                                        archived={ false }
                                        selector={ selector }
                                        setExecuteOpen={ setExecuteOpen }
                                        loadRemediation={ loadRemediation }
                                        getConnectionStatus={ getConnectionStatus }
                                        downloadPlaybook={ downloadPlaybook }
                                        permission={ permission }
                                    />
                                    <CardBody className='ins-c-playbook-body'>
                                        <Split hasGutter className='ins-c-playbook-split'>
                                            <SplitItem>
                                                <Stack>
                                                    <StackItem className='ins-c-playbook-body'>
                                                    Systems
                                                    </StackItem>
                                                    <StackItem className='ins-c-playbook-body-values'>
                                                        { remediation.system_count }
                                                    </StackItem>
                                                </Stack>
                                            </SplitItem>
                                            <SplitItem>
                                                <Stack>
                                                    <StackItem className='ins-c-playbook-body'>
                                                    Complete actions
                                                    </StackItem>
                                                    <StackItem className='ins-c-playbook-body-values'>
                                                        { renderActionStatus(1, remediation.issue_count) }
                                                    </StackItem>
                                                </Stack>
                                            </SplitItem>
                                        </Split>
                                    </CardBody>
                                    { renderProgress(1, remediation.issue_count) }
                                </Card>
                            </GridItem>
                        );
                    }) }
                </Grid>
            </StackItem>
        </Stack>
    );
}

RemediationTable.propTypes = {
    value: PropTypes.object,
    status: PropTypes.string.isRequired,
    loadRemediations: PropTypes.func.isRequired,
    deleteRemediation: PropTypes.func.isRequired
};

export default RemediationTable;

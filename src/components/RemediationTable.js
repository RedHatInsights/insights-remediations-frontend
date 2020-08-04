import React, { useEffect, useContext, useState } from 'react';
import { useDispatch, useSelector as reduxSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
    Bullseye, Dropdown, EmptyState, EmptyStateIcon, EmptyStateBody,
    Grid, GridItem, KebabToggle,
    Stack, StackItem, Title, Button, ToolbarItem, ToolbarGroup
} from '@patternfly/react-core';
import { SimpleTableFilter, Skeleton, TableToolbar } from '@redhat-cloud-services/frontend-components';
import { WrenchIcon } from '@patternfly/react-icons';
import { appUrl } from '../Utilities/urls';
import SkeletonTable from '../skeletons/SkeletonTable';
import { downloadPlaybook } from '../api';
import { getConnectionStatus, runRemediation, setEtag, getPlaybookRuns, loadRemediation } from '../actions';
import { PermissionContext } from '../App';
import { ExecuteModal } from './Modals/ExecuteModal';
import { PlaybookCard } from './PlaybookCard';
import './RemediationTable.scss';

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

const SORTING_ITERATEES = [ null, 'name', 'system_count', 'issue_count', 'updated_at' ];

function RemediationTable ({
    remediations,
    loadRemediations,
    sorter,
    filter,
    selector,
    pagination,
    shouldUpdateGrid,
    setShouldUpdateGrid
}) {

    const { value, status } = remediations;

    const permission = useContext(PermissionContext);
    const [ executeOpen, setExecuteOpen ] = useState(false);
    const [ showRefreshMessage, setShowRefreshMessage ] = useState(false);
    // const [ showArchived, setShowArchived ] = useState(false);
    const selectedRemediation = reduxSelector(state => state.selectedRemediation);
    const connectionStatus = reduxSelector(state => state.connectionStatus);
    const runningRemediation = reduxSelector(state => state.runRemediation);
    const dispatch = useDispatch();

    function load () {
        const column = SORTING_ITERATEES[sorter.sortBy];
        loadRemediations(column, sorter.sortDir, filter.value, pagination.pageSize, pagination.offset);
    }

    useEffect(() => {
        if (shouldUpdateGrid === true) {
            setShouldUpdateGrid(false);
            load();
        }
    }, [ shouldUpdateGrid ]);

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

    const cards = value.data.map(remediation => ({
        id: remediation.id,
        archived: false
    }));

    selector.register(cards);

    return (
        <React.Fragment>
            <Stack hasGutter>
                <StackItem>
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
                </StackItem>
                <StackItem>
                    <Grid sm={ 12 } md={ 6 } lg={ 4 } hasGutter>
                        { value.data.map((remediation, idx) => {
                            return (
                                <GridItem key={ remediation.id }>
                                    <PlaybookCard
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
                                </GridItem>
                            );
                        }) }
                    </Grid>
                </StackItem>
            </Stack>
        </React.Fragment>
    );
}

RemediationTable.propTypes = {
    remediations: PropTypes.object.isRequired,
    loadRemediations: PropTypes.func.isRequired,
    sorter: PropTypes.object.isRequired,
    filter: PropTypes.object.isRequired,
    selector: PropTypes.object.isRequired,
    pagination: PropTypes.object.isRequired,
    shouldUpdateGrid: PropTypes.bool.isRequired,
    setShouldUpdateGrid: PropTypes.func.isRequired
};

export default RemediationTable;

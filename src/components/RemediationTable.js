import React, { useEffect, useContext, useState } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import {
    Bullseye,
    EmptyState, EmptyStateIcon, EmptyStateBody,
    Dropdown, KebabToggle,
    Pagination,
    Title, Button,
    ToolbarItem, ToolbarGroup
} from '@patternfly/react-core';
import { sortable, Table, TableHeader, TableBody, TableVariant } from '@patternfly/react-table';
import { EmptyTable, SimpleTableFilter, Skeleton, TableToolbar } from '@redhat-cloud-services/frontend-components';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/components/PrimaryToolbar';
import { WrenchIcon } from '@patternfly/react-icons';

import { appUrl } from '../Utilities/urls';
import { formatDate } from '../Utilities/model';
import './RemediationTable.scss';
import ConfirmationDialog from './ConfirmationDialog';

import SkeletonTable from '../skeletons/SkeletonTable';
import { useFilter, usePagination, useSelector, useSorter } from '../hooks/table';
import * as debug from '../Utilities/debug';
import keyBy from 'lodash/keyBy';

import { downloadPlaybook } from '../api';

import { PermissionContext } from '../App';

function buildName (name, id) {
    return ({
        title: <Link to={ `/${id}` }>{ name }</Link>
    });
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
                <Title size="lg">You haven&apos;t created any remediation Playbooks yet</Title>
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

function RemediationTable (props) {

    const { value, status } = props;

    const sorter = useSorter(4, 'desc');
    const filter = useFilter();
    const selector = useSelector();
    const pagination = usePagination();
    const permission = useContext(PermissionContext);
    const [ dialogOpen, setDialogOpen ] = useState(false);

    function loadRemediations () {
        const column = SORTING_ITERATEES[sorter.sortBy];
        props.loadRemediations(column, sorter.sortDir, filter.value, pagination.pageSize, pagination.offset);
    }

    useEffect(loadRemediations, [ sorter.sortBy, sorter.sortDir, filter.value, pagination.pageSize, pagination.pageDebounced ]);

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
        cells: [
            buildName(remediation.name, remediation.id),
            remediation.system_count,
            remediation.issue_count,
            { title: formatDate(remediation.updated_at) }
        ]
    }));

    selector.register(rows);
    const selectedIds = selector.getSelectedIds();

    return (
        <React.Fragment>
            { dialogOpen &&
                <ConfirmationDialog
                    text={ `You will not be able to recover ${selectedIds.length > 1 ? 'these remediations' : 'this remediation'}` }
                    onClose={ async () => {
                        setDialogOpen(false);
                        await Promise.all(selectedIds.map(r => props.deleteRemediation(r)));
                        selector.reset();
                        loadRemediations();
                    } } />
            }
            <PrimaryToolbar
                filterConfig={ { items: [{ label: 'Search playbooks', placeholder: 'Search playbooks' }]} }
                bulkSelect={ { items: [{ title: 'Select all',
                    onClick: (e) => selector.props.onSelect(e, true, -1)
                }], checked: selectedIds.length, count: selectedIds.length,
                onSelect: (isSelected, e) => selector.props.onSelect(e, isSelected, -1) } }
                actionsConfig={ { actions: [
                    { label: 'Download playbooks', props: { variant: 'secondary', isDisabled: !selectedIds.length,
                        onClick: () => downloadAll(selectedIds, value.data) }},
                    { label: 'Delete playbooks',
                        props: { isDisabled: !permission.permissions.write || !selectedIds.length },
                        onClick: () => setDialogOpen(true)
                    }]} }
                pagination={ { ...pagination.props, itemCount: value.meta.total } }
            />
            {
                rows.length > 0 ?
                    <Table
                        variant={ TableVariant.compact }
                        aria-label="Playbooks"
                        canSelectAll={ false }
                        cells={ [
                            {
                                title: 'Playbook',
                                transforms: [ sortable ]
                            }, {
                                title: 'Systems',
                                transforms: [ sortable ]
                            }, {
                                title: 'Actions',
                                transforms: [ sortable ]
                            }, {
                                title: 'Last modified',
                                transforms: [ sortable ]
                            }]
                        }
                        rows={ rows }
                        actions={
                            [{
                                title: 'Download playbook',
                                onClick: (_e, _rowId, rowData) => downloadPlaybook(rowData.id)
                            },
                            {
                                title: 'Delete playbook',
                                props: { isDisabled: !permission.permissions.write },
                                onClick: () => setDialogOpen(true)
                            }]
                        }
                        { ...sorter.props }
                        { ...selector.props }
                    >
                        <TableHeader/>
                        <TableBody { ...selector.tbodyProps } />
                    </Table> :
                    <EmptyTable centered className='ins-c-remediations-table--empty'>No Playbooks found</EmptyTable>
            }
            {
                rows.length > 0 &&
                <TableToolbar isFooter>
                    <Pagination
                        variant='bottom'
                        dropDirection='up'
                        itemCount={ value.meta.total }
                        { ...pagination.props }
                        { ...debug.pagination }
                    />
                </TableToolbar>
            }
        </React.Fragment>
    );
}

RemediationTable.propTypes = {
    value: PropTypes.object,
    status: PropTypes.string.isRequired,
    loadRemediations: PropTypes.func.isRequired
};

export default RemediationTable;

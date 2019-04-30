import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import { Link } from 'react-router-dom';
import {
    Bullseye,
    EmptyState, EmptyStateIcon, EmptyStateBody,
    Dropdown, KebabToggle,
    Title, Button,
    ToolbarItem, ToolbarGroup,
    Tooltip
} from '@patternfly/react-core';
import { sortable, Table, TableHeader, TableBody, TableVariant } from '@patternfly/react-table';
import { EmptyTable, Pagination, SimpleTableFilter, TableToolbar } from '@red-hat-insights/insights-frontend-components';
import { WrenchIcon } from '@patternfly/react-icons';

import { appUrl } from '../Utilities/urls';
import './RemediationTable.scss';

import SkeletonTable from '../skeletons/SkeletonTable';
import { ToolbarActions } from '../containers/ToolbarActions';
import { useFilter, usePagination, useSelector, useSorter } from '../hooks/table';
import * as debug from '../Utilities/debug';

import { downloadPlaybook } from '../api';

function buildName (name, id) {
    return ({
        title: <Link to={ `/${id}` }>{ name }</Link>
    });
}

function formatDate (date) {
    return ({
        title: <Tooltip content={ moment(date).format('LLL') } >
            <span>
                { moment(date).fromNow() }
            </span>
        </Tooltip>
    });
}

function skeleton () {
    return (
        <React.Fragment>
            <TableToolbar
                className='ins-c-remediations-details-table__toolbar'
                results={ 0 }
                selected={ 0 }>
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
                        <Button variant='link' isDisabled> Download Playbook </Button>
                    </ToolbarItem>
                    <ToolbarItem>
                        <Dropdown
                            toggle={ <KebabToggle/> }
                            isPlain
                        >
                        </Dropdown>
                    </ToolbarItem>
                </ToolbarGroup>
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
                    <a href={ appUrl('advisor').toString() }>Red Hat Insights</a>,&nbsp;
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

function RemediationTable (props) {

    const { value, status } = props;

    const sorter = useSorter(4, 'desc');
    const filter = useFilter();
    const selector = useSelector();
    const pagination = usePagination();

    function loadRemediations () {
        const column = SORTING_ITERATEES[sorter.sortBy];
        props.loadRemediations(column, sorter.sortDir, filter.value, pagination.pageSize, pagination.offset);
    }

    useEffect(loadRemediations, [ sorter.sortBy, sorter.sortDir, filter.value, pagination.pageSize, pagination.offset ]);

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
            formatDate(remediation.updated_at)
        ]
    }));

    selector.register(rows);
    const selectedIds = selector.getSelectedIds();

    return (
        <React.Fragment>
            <TableToolbar
                className='ins-c-remediations-table__actions'
                results={ value.meta.total }
                selected={ selectedIds.length }>
                <ToolbarGroup>
                    <ToolbarItem>
                        <SimpleTableFilter buttonTitle="" placeholder="Search Playbooks" { ...filter.props } />
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarGroup>
                    {
                        // <ToolbarItem><Button> Create Remediation </Button></ToolbarItem>
                    }
                    <ToolbarItem>
                        <Button
                            variant='link'
                            isDisabled={ !selectedIds.length }
                            // If a user has a popup blocker, they may only get the last one selected
                            onClick= { () => selectedIds.forEach(r => downloadPlaybook(r)) }
                        >
                            Download Playbook
                        </Button>
                    </ToolbarItem>
                    <ToolbarItem>
                        <ToolbarActions
                            isDisabled={ !selectedIds.length }
                            remediations={ selectedIds }
                            afterDelete={ () => { selector.reset(); loadRemediations(); } }
                        />
                    </ToolbarItem>
                </ToolbarGroup>
            </TableToolbar>
            {
                rows.length > 0 ?
                    <Table
                        variant={ TableVariant.compact }
                        aria-label="Playbooks"
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
                        numberOfItems={ value.meta.total }
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

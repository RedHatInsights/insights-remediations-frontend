import React from 'react';
import PropTypes from 'prop-types';

import flatMap from 'lodash/flatMap';
import orderBy from 'lodash/orderBy';

import {
    Button,
    Pagination,
    ToolbarItem, ToolbarGroup
} from '@patternfly/react-core';

import { sortable, TableHeader, Table, TableBody, TableVariant } from '@patternfly/react-table';
import { SimpleTableFilter, TableToolbar, EmptyTable } from '@redhat-cloud-services/frontend-components';

import { getIssueApplication, getSystemName, includesIgnoreCase } from '../Utilities/model';
import { inventoryUrlBuilder, buildIssueUrl } from '../Utilities/urls';
import './RemediationTable.scss';

import { ConnectResolutionEditButton } from '../containers/ConnectedComponents';
import { DeleteActionsButton } from '../containers/DeleteButtons';
import { isBeta } from '../config';
import RemediationDetailsSystemDropdown from './RemediationDetailsSystemDropdown';

import { useExpander, useFilter, usePagination, useSelector, useSorter } from '../hooks/table';
import * as debug from '../Utilities/debug';

import './RemediationDetailsTable.scss';
import { CheckCircleIcon } from '@patternfly/react-icons';

function resolutionDescriptionCell (remediation, issue) {
    if (issue.resolutions_available <= 1) {
        return issue.resolution.description;
    }

    return (
        <React.Fragment>
            { issue.resolution.description }&nbsp;
            <ConnectResolutionEditButton issue={ issue } remediation={ remediation } />
        </React.Fragment>
    );
}

function issueDescriptionCell (issue) {
    const url = buildIssueUrl(issue.id);

    if (url) {
        return <a href={ url }>{ issue.description }</a>;
    }

    return issue.description;
}

function needsRebootCell (needsReboot) {
    if (needsReboot) {
        return <CheckCircleIcon className="ins-c-remediations-reboot-check-circle" aria-label="reboot required"/>;
    }

    return ('No');
}

const SORTING_ITERATEES = [
    null, // expand toggle
    null, // checkboxes
    i => i.description,
    null, // resolution steps
    i => i.resolution.needs_reboot,
    i => i.systems.length,
    i => getIssueApplication(i)
];

const buildRow = (remediation, expanded) => (issue, index) => {
    const row = [
        {
            isOpen: false,
            id: issue.id,
            cells: [
                {
                    title: issueDescriptionCell(issue)
                },
                {
                    title: resolutionDescriptionCell(remediation, issue)
                },
                {
                    title: needsRebootCell(issue.resolution.needs_reboot)
                },
                issue.systems.length,
                {
                    title: getIssueApplication(issue),
                    props: { className: 'ins-m-nowrap' }
                }
            ]
        }
    ];

    if (issue.id === expanded) {
        const urlBuilder = inventoryUrlBuilder(issue);
        const rows = orderBy(issue.systems, [ s => getSystemName(s), s => s.id ]).map(system => ({
            id: system.id,
            cells: [{
                title:
                    <a href={ urlBuilder(system.id) }>
                        { getSystemName(system) }
                    </a>
            }, {
                title: <RemediationDetailsSystemDropdown remediation={ remediation } issue={ issue } system={ system } />
            }]
        }));

        row.push({
            parent: index * 2,
            cells: [{
                title:
                    <React.Fragment>
                        <Table
                            variant={ TableVariant.compact }
                            className='ins-c-remediations-details-table-systems-table'
                            aria-label="Systems"
                            cells={ [{
                                title: 'Systems'
                            }, {
                                title: ''
                            }] }
                            rows={ rows }
                        >
                            <TableHeader />
                            <TableBody />
                        </Table>
                    </React.Fragment>
            }]
        });
    } else {
        row.push({
            parent: index * 2,
            cells: [{
                title: 'Loading'
            }]
        });
    }

    return row;
};

function RemediationDetailsTable (props) {
    const pagination = usePagination();
    const sorter = useSorter(2, 'asc');
    const filter = useFilter();
    const expander = useExpander();
    const selector = useSelector();

    sorter.onChange(pagination.reset);
    filter.onChange(pagination.reset);

    const filtered = props.remediation.issues.filter(i => includesIgnoreCase(i.description, filter.value.trim()));
    const sorted = orderBy(filtered, [ SORTING_ITERATEES[ sorter.sortBy] ], [ sorter.sortDir ]);
    const paged = sorted.slice(pagination.offset, pagination.offset + pagination.pageSize);

    const rows = flatMap(paged, buildRow(props.remediation, expander.value));

    expander.register(rows);
    selector.register(rows);

    const selectedIds = selector.getSelectedIds();

    return (
        <React.Fragment>
            <TableToolbar className='ins-c-remediations-details-table__toolbar'>
                <ToolbarGroup>
                    <ToolbarItem>
                        <SimpleTableFilter buttonTitle="" placeholder="Search actions" { ...filter.props } />
                    </ToolbarItem>
                </ToolbarGroup>
                {
                    isBeta &&
                    <ToolbarGroup>
                        <ToolbarItem>
                            <Button isDisabled={ true }> Add Action </Button>
                        </ToolbarItem>
                    </ToolbarGroup>
                }
                <ToolbarGroup>
                    <ToolbarItem>
                        <DeleteActionsButton
                            isDisabled={ !selectedIds.length }
                            remediation={ props.remediation }
                            issues={ selectedIds }
                            afterDelete={ selector.reset }
                        />
                    </ToolbarItem>
                </ToolbarGroup>
                <Pagination
                    variant='top'
                    dropDirection='down'
                    itemCount={ filtered.length }
                    { ...pagination.props }
                    { ...debug.pagination }
                />
            </TableToolbar>
            {
                rows.length > 0 ?
                    <Table
                        variant={ TableVariant.compact }
                        aria-label="Actions"
                        className='ins-c-remediations-details-table'
                        cells={ [
                            {
                                title: 'Actions',
                                transforms: [ sortable ]
                            }, {
                                title: 'Resolution'
                            }, {
                                title: 'Reboot required',
                                transforms: [ sortable ]
                            }, {
                                title: 'Systems',
                                transforms: [ sortable ]
                            }, {
                                title: 'Type',
                                transforms: [ sortable ]
                            }]
                        }
                        rows={ rows }
                        { ...sorter.props }
                        { ...expander.props }
                        { ...selector.props }
                    >
                        <TableHeader />
                        <TableBody { ...selector.tbodyProps } />
                    </Table> :
                    filter.value ?
                        <EmptyTable centered className='ins-c-remediation-details-table--empty'>No Actions found</EmptyTable> :
                        <EmptyTable centered className='ins-c-remediation-details-table--empty'>This Playbook is empty</EmptyTable>
            }
            {
                rows.length > 0 &&
                <TableToolbar isFooter>
                    <Pagination
                        variant='bottom'
                        dropDirection='up'
                        itemCount={ filtered.length }
                        { ...pagination.props }
                        { ...debug.pagination }
                    />
                </TableToolbar>
            }
        </React.Fragment>

    );
}

RemediationDetailsTable.propTypes = {
    remediation: PropTypes.object.isRequired,
    status: PropTypes.object.isRequired
};

export default RemediationDetailsTable;

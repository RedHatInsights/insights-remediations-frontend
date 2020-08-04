import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import flatMap from 'lodash/flatMap';
import orderBy from 'lodash/orderBy';

import {
    Button,
    Pagination,
    ToolbarItem, Toolbar, ToolbarContent
} from '@patternfly/react-core';

import { sortable, TableHeader, Table, TableBody, TableVariant } from '@patternfly/react-table';
import { SimpleTableFilter, TableToolbar, EmptyTable } from '@redhat-cloud-services/frontend-components';

import { getIssueApplication, includesIgnoreCase } from '../Utilities/model';
import {  buildIssueUrl } from '../Utilities/urls';
import './RemediationTable.scss';

import { ConnectResolutionEditButton } from '../containers/ConnectedComponents';
import { DeleteActionsButton } from '../containers/DeleteButtons';
import { isBeta } from '../config';
import SystemForActionButton from './SystemForActionButton';

import { useFilter, usePagination, useSelector, useSorter } from '../hooks/table';
import * as debug from '../Utilities/debug';

import './RemediationDetailsTable.scss';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { PermissionContext } from '../App';

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

function systemsForAction(issue, remediation) {
    return <SystemForActionButton key={ issue.id } remediation={ remediation } issue={ issue } />;
}

const SORTING_ITERATEES = [
    null, // checkboxes
    i => i.description,
    null, // resolution steps
    i => i.resolution.needs_reboot,
    i => i.systems.length,
    i => getIssueApplication(i)
];

const buildRow = (remediation) => (issue) => {
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
                {
                    title: systemsForAction(issue, remediation)
                },
                {
                    title: getIssueApplication(issue),
                    props: { className: 'ins-m-nowrap' }
                }
            ]
        }
    ];

    return row;
};

function RemediationDetailsTable (props) {
    const pagination = usePagination();
    const sorter = useSorter(1, 'asc');
    const filter = useFilter();
    const selector = useSelector();
    const permission = useContext(PermissionContext);

    sorter.onChange(pagination.reset);
    filter.onChange(pagination.reset);

    const filtered = props.remediation.issues.filter(i => includesIgnoreCase(i.description, filter.value.trim()));
    const sorted = orderBy(filtered, [ SORTING_ITERATEES[ sorter.sortBy] ], [ sorter.sortDir ]);
    const paged = sorted.slice(pagination.offset, pagination.offset + pagination.pageSize);

    const rows = flatMap(paged, buildRow(props.remediation));

    selector.register(rows);

    const selectedIds = selector.getSelectedIds();

    return (
        <div className='test'>
            <Toolbar className='ins-c-remediations-details-table__toolbar'>
                <ToolbarContent>
                    <ToolbarItem>
                        <SimpleTableFilter buttonTitle="" placeholder="Search actions" { ...filter.props } />
                    </ToolbarItem>
                    {
                        isBeta &&
                        <ToolbarItem>
                            <Button isDisabled={ true }> Add Action </Button>
                        </ToolbarItem>
                    }
                    <ToolbarItem>
                        { permission.permissions.write &&
                            <DeleteActionsButton
                                variant='secondary'
                                isDisabled={ !selectedIds.length }
                                remediation={ props.remediation }
                                issues={ selectedIds }
                                afterDelete={ selector.reset }
                            />
                        }
                    </ToolbarItem>
                    <Pagination
                        variant='top'
                        dropDirection='down'
                        itemCount={ filtered.length }
                        { ...pagination.props }
                        { ...debug.pagination }
                    />
                </ToolbarContent>
            </Toolbar>
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
                        { ...(permission.permissions.write && { ... selector.props }) }
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
        </div>

    );
}

RemediationDetailsTable.propTypes = {
    remediation: PropTypes.object.isRequired,
    status: PropTypes.object.isRequired
};

export default RemediationDetailsTable;

import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import flatMap from 'lodash/flatMap';
import orderBy from 'lodash/orderBy';

import { Button } from '@patternfly/react-core';
import { TableHeader, Table, TableBody } from '@patternfly/react-table';
import { CheckCircleIcon, TimesCircleIcon, InProgressIcon } from '@patternfly/react-icons';

import { EmptyTable } from '@redhat-cloud-services/frontend-components';

import { getIssueApplication, includesIgnoreCase } from '../Utilities/model';
import './RemediationTable.scss';

import { useFilter, usePagination, useSelector, useSorter, useExpander } from '../hooks/table';

import './RemediationActivityTable.scss';
import { PermissionContext } from '../App';

function getRunOnDate() {
    const url = <a href='#'>test</a>
    return url
}

function getRunByPerson() {
    return 'me'
}

function getStatus(status) {
    const permission = useContext(PermissionContext);
    const statusString = status !== 'in_progress' ? status : 'In progress';

    return (
        <React.Fragment>
            <b className={`ins-activity-status__text ins-activity-status__text-${status}`}>{statusString}</b>
            <span className='ins-activity-status__icon ins-activity-status__icon-passed'>
                <CheckCircleIcon/> 10
            </span>
            <span className='ins-activity-status__icon ins-activity-status__icon-failed'>
                <TimesCircleIcon/> 20
            </span>
            <span className='ins-activity-status__icon ins-activity-status__icon-in_progress'>
                <InProgressIcon/> 0
            </span>
            { status === 'in_progress' && permission.permissions.execute &&
                <Button variant='link'> Cancel process</Button>
            }
        </React.Fragment>
    );
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
                    title: getRunOnDate()
                },
                {
                    title: getRunByPerson()
                },
                {
                    title: getStatus('in_progress')
                }
            ]
        },
        {
            parent: index * 2,
            fullWidth: true,
            cells: ['child - 1']
        },
    ];

    return row;
};

function RemediationActivityTable (props) {
    const pagination = usePagination();
    const sorter = useSorter(2, 'asc');
    const filter = useFilter();
    const selector = useSelector();
    const expander = useExpander();

    sorter.onChange(pagination.reset);
    filter.onChange(pagination.reset);

    const filtered = props.remediation.issues.filter(i => includesIgnoreCase(i.description, filter.value.trim()));
    const sorted = orderBy(filtered, [ SORTING_ITERATEES[ sorter.sortBy] ], [ sorter.sortDir ]);
    const paged = sorted.slice(pagination.offset, pagination.offset + pagination.pageSize);

    const rows = flatMap(paged, buildRow(props.remediation, expander.value));

    selector.register(rows);
    expander.register(rows);

    return (
        <React.Fragment>
            {
                rows.length > 0 ?
                    <Table
                        aria-label="Actions"
                        className='ins-c-remediations-activity-table'
                        cells={ [
                            {
                                title: 'Run on'
                            }, {
                                title: 'Run by'
                            }, {
                                title: 'Status'
                            }]
                        }
                        rows={ rows }
                        { ...expander.props }
                    >
                        <TableHeader />
                        <TableBody { ...selector.tbodyProps } />
                    </Table> :
                    <EmptyTable centered className='ins-c-remediation-details-table--empty'>This Playbook is empty</EmptyTable>
            }
        </React.Fragment>

    );
}

RemediationActivityTable.propTypes = {
    remediation: PropTypes.object.isRequired,
    status: PropTypes.object.isRequired
};

export default RemediationActivityTable;

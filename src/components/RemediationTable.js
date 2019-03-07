import React, { useState } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import { Link } from 'react-router-dom';
import {
    Bullseye,
    Card, CardBody,
    EmptyState, EmptyStateIcon, EmptyStateBody,
    Dropdown, KebabToggle,
    Title, Button,
    ToolbarItem, ToolbarGroup
} from '@patternfly/react-core';
import { sortable, Table, TableHeader, TableBody, TableVariant } from '@patternfly/react-table';
import { EmptyTable, Pagination, SimpleTableFilter, TableToolbar } from '@red-hat-insights/insights-frontend-components';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { formatUser, includesIgnoreCase } from '../Utilities/model';
import { appUrl } from '../Utilities/urls';
import './RemediationTable.scss';

import SkeletonTable from './SkeletonTable';
import { DeleteRemediationsButton } from '../containers/DeleteButtons';
import { useFilter, usePagination, useSelector, useSorter } from '../hooks/table';
import * as debug from '../Utilities/debug';

import { downloadPlaybook } from '../api';

function buildName (name, id) {
    return ({
        title: <Link to={ `/${id}` }>{ name }</Link>
    });
}

function formatDate (date) {
    return moment(date).format('lll');
}

function skeleton () {
    return (
        <React.Fragment>
            <TableToolbar className='ins-c-remediations-details-table__toolbar' results={ 0 }>
                <ToolbarGroup>
                    <ToolbarItem>
                        <SimpleTableFilter buttonTitle="" placeholder="Search Playbooks" aria-label="Search Playbooks Loading" isDisabled />
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarItem><Button isDisabled> Create Remediation </Button></ToolbarItem>
                    <ToolbarItem>
                        <Button variant='link' isDisabled> Download Playbook </Button>
                    </ToolbarItem>
                    <ToolbarItem>
                        <Dropdown
                            toggle={ <KebabToggle/> }
                            isDisabled
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
        <Card>
            <CardBody>
                <Bullseye>
                    <EmptyState className='ins-c-no-remediations'>
                        <EmptyStateIcon icon={ InfoCircleIcon } size='lg' />
                        <Title size="lg">No Remediations</Title>
                        <EmptyStateBody>
                            <p>You haven&#39;t created any remediations yet.</p>
                            <p>
                                To create a remediation, please visit&nbsp;
                                <a href={ appUrl('advisor') }>Insights</a>,&nbsp;
                                <a href={ appUrl('vulnerability') }>Vulnerability</a> or&nbsp;
                                <a href={ appUrl('compliance') }>Compliance</a>&nbsp;
                                applications and look for the&nbsp;
                                <strong>Remediate with Ansible</strong>
                                &nbsp;button.
                            </p>
                        </EmptyStateBody>
                    </EmptyState>
                </Bullseye>
            </CardBody>
        </Card>
    );
}

const SORTING_ITERATEES = [ null, 'name', 'system_count', 'issue_count', null, 'updated_at' ];

function RemediationTable (props) {

    const [ isOpen, setIsOpen ] = useState(false);

    const { value, status } = props;

    const sorter = useSorter(5, 'desc');
    const filter = useFilter();
    const selector = useSelector();
    const pagination = usePagination();

    // Skeleton Loading
    if (status !== 'fulfilled') {
        return skeleton();
    }

    if (!value.remediations.length) {
        return empty();
    }

    filter.onChange(pagination.reset);
    sorter.onChange((sortBy, sortDir) => {
        const column = SORTING_ITERATEES[sortBy];
        props.loadRemediations(column, sortDir);
        pagination.reset();
    });

    const filtered = value.remediations.filter(r => includesIgnoreCase(r.name, filter.value.trim()));
    const paged = filtered.slice(pagination.offset, pagination.offset + pagination.pageSize);

    const rows = paged.map(remediation => ({
        id: remediation.id,
        cells: [
            buildName(remediation.name, remediation.id),
            remediation.system_count,
            remediation.issue_count,
            formatUser(remediation.updated_by),
            formatDate(remediation.updated_at)
        ]
    }));

    selector.register(rows);

    const remediationIds = value.remediations.map(remediation => remediation.id);

    return (
        <React.Fragment>
            <TableToolbar results={ filtered.length }>
                <ToolbarGroup>
                    <ToolbarItem>
                        <SimpleTableFilter buttonTitle="" placeholder="Search Playbooks" { ...filter.props } />
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarItem><Button> Create Remediation </Button></ToolbarItem>
                    <ToolbarItem>
                        <Button
                            variant='link'
                            isDisabled={ !selector.getSelectedIds(remediationIds).length }
                            // If a user has a popup blocker, they may only get the last one selected
                            onClick= { () => selector.getSelectedIds(remediationIds).forEach(r => downloadPlaybook(r)) }
                        >
                            Download Playbook
                        </Button>
                    </ToolbarItem>
                    <ToolbarItem>
                        <Dropdown
                            toggle={ <KebabToggle onToggle={ () => setIsOpen(!isOpen) } /> }
                            isOpen={ isOpen }
                            isPlain
                        >
                            <DeleteRemediationsButton
                                isDisabled={ !selector.getSelectedIds(remediationIds).length }
                                remediations={ selector.getSelectedIds(remediationIds) }
                            />
                        </Dropdown>
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
                                title: 'Last Modified By'
                            }, {
                                title: 'Last Modified On',
                                transforms: [ sortable ]
                            }]
                        }
                        rows={ rows }
                        { ...sorter.props }
                        { ...selector.props }
                    >
                        <TableHeader/>
                        <TableBody/>
                    </Table> :
                    <EmptyTable centered className='ins-c-remediations-table--empty'>No Playbooks found</EmptyTable>
            }
            {
                rows.length > 0 &&
                <TableToolbar isFooter>
                    <Pagination
                        numberOfItems={ filtered.length }
                        useNext={ true }
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

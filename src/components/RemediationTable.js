import React from 'react';
import PropTypes from 'prop-types';

import debounce from 'lodash/debounce';
import moment from 'moment';

import { Link } from 'react-router-dom';
import {
    Bullseye,
    Card, CardBody,
    EmptyState, EmptyStateIcon, EmptyStateBody,
    Dropdown, KebabToggle, DropdownPosition,
    Title, Button,
    ToolbarItem, ToolbarGroup
} from '@patternfly/react-core';
import { sortable, TableHeader, TableBody } from '@patternfly/react-table';
import { SimpleTableFilter, TableToolbar } from '@red-hat-insights/insights-frontend-components';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { formatUser, includesIgnoreCase } from '../Utilities/model';
import { appUrl } from '../Utilities/urls';
import './RemediationTable.scss';

import SelectableTable from '../containers/SelectableTable';
import SkeletonTable from './SkeletonTable';
import { DeleteRemediationsButton } from '../containers/DeleteButtons';
import { SEARCH_DEBOUNCE_DELAY } from '../constants';

import { downloadPlaybook } from '../api';

function buildName (name, id) {
    return ({
        title: <Link to={ `/${id}` }>{ name }</Link>
    });
}

function formatDate (date) {
    return moment(date).format('lll');
}

const SORTING_ITERATEES = [ null, 'name', 'system_count', 'issue_count', null, 'updated_at' ];

class RemediationTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filter: '',
            selected: [],
            sortBy: 5,
            sortDir: 'desc',
            isOpen: false
        };
    }

    onToggle = isOpen => {
        this.setState({
            isOpen
        });
    };

    onFilterChange = debounce(filter => this.setState({ filter }), SEARCH_DEBOUNCE_DELAY);

    onSelect = selected => this.setState({ selected });

    onSort = async (event, sortBy, sortDir) => {
        const column = SORTING_ITERATEES[sortBy];
        await this.props.loadRemediations(column, sortDir);
        this.setState({ sortBy, sortDir });
    }

    render () {
        const { value, status } = this.props;
        const { filter, selected, sortBy, sortDir, isOpen } = this.state;

        // Skeleton Loading
        if (status !== 'fulfilled') {
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
                                >
                                </Dropdown>
                            </ToolbarItem>
                        </ToolbarGroup>
                    </TableToolbar>
                    <SkeletonTable/>
                </React.Fragment>
            );
        }

        if (status === 'fulfilled' && !value.remediations.length) {
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

        const filtered = value.remediations.filter(r => includesIgnoreCase(r.name, filter.trim()));

        const rows = filtered.map(remediation => ({
            id: remediation.id,
            cells: [
                buildName(remediation.name, remediation.id),
                remediation.system_count,
                remediation.issue_count,
                formatUser(remediation.updated_by),
                formatDate(remediation.updated_at)
            ]
        }));

        return (
            <React.Fragment>
                <TableToolbar results={ value.remediations.length }>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <SimpleTableFilter buttonTitle="" placeholder="Search Playbooks" onFilterChange={ this.onFilterChange } />
                        </ToolbarItem>
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <ToolbarItem><Button> Create Remediation </Button></ToolbarItem>
                        <ToolbarItem>
                            <Button
                                variant='link'
                                isDisabled={ !selected.length }
                                // If a user has a popup blocker, they may only get the last one selected
                                onClick= { () => selected.forEach(r => downloadPlaybook(r)) }
                            >
                                Download Playbook
                            </Button>
                        </ToolbarItem>
                        <ToolbarItem>
                            <Dropdown
                                position={ DropdownPosition.right }
                                toggle={ <KebabToggle onToggle={ this.onToggle } /> }
                                isOpen={ isOpen }
                                isPlain
                                className='ins-c-remediations-table__actions'
                            >
                                <DeleteRemediationsButton
                                    isDisabled={ !selected.length }
                                    remediations={ selected }
                                />
                            </Dropdown>
                        </ToolbarItem>
                    </ToolbarGroup>
                </TableToolbar>
                {
                    filtered.length ?
                        <SelectableTable
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
                            onSelect={ this.onSelect }
                            onSort={ this.onSort }
                            sortBy={ { index: sortBy, direction: sortDir } }
                            rows={ rows }>
                            <TableHeader/>
                            <TableBody/>
                        </SelectableTable> :
                        <p className='ins-c-remediations-table--empty'>No Playbooks found</p>
                }
            </React.Fragment>
        );
    }
}

RemediationTable.propTypes = {
    value: PropTypes.object,
    status: PropTypes.string.isRequired,
    loadRemediations: PropTypes.func.isRequired
};

export default RemediationTable;

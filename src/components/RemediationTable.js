import React from 'react';
import PropTypes from 'prop-types';

import debounce from 'lodash/debounce';
import moment from 'moment';

import { Link } from 'react-router-dom';
import {
    Bullseye,
    Card, CardBody,
    EmptyState, EmptyStateIcon, EmptyStateBody,
    Level, LevelItem,
    Split, SplitItem,
    Title, Button, TextInput
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
    state = {
        filter: '',
        selected: [],
        sortBy: 5,
        sortDir: 'desc'
    }

    onFilterChange = debounce(filter => this.setState({ filter }), SEARCH_DEBOUNCE_DELAY);

    onSelect = selected => this.setState({ selected });

    onSort = async (event, sortBy, sortDir) => {
        const column = SORTING_ITERATEES[sortBy];
        await this.props.loadRemediations(column, sortDir);
        this.setState({ sortBy, sortDir });
    }

    render () {
        const { value, status } = this.props;
        const { filter, selected, sortBy, sortDir } = this.state;

        // Skeleton Loading
        if (status !== 'fulfilled') {
            return (
                <React.Fragment>
                    <TableToolbar className='ins-c-remediations-details-table__toolbar'>
                        <Level>
                            <LevelItem>
                                <TextInput
                                    type="text"
                                    value='Search Playbooks'
                                    aria-label="Search Playbooks Loading"
                                    isDisabled
                                />
                            </LevelItem>
                            <LevelItem>
                                <Split gutter="md">
                                    <SplitItem><Button isDisabled> Delete </Button></SplitItem>
                                </Split>
                            </LevelItem>
                        </Level>
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
                <TableToolbar>
                    <Level>
                        <LevelItem>
                            <SimpleTableFilter buttonTitle="" placeholder="Search Playbooks" onFilterChange={ this.onFilterChange } />
                        </LevelItem>
                        <LevelItem>
                            <Split gutter="md">
                                <SplitItem>
                                    <DeleteRemediationsButton
                                        isDisabled={ !selected.length }
                                        remediations={ selected }
                                    />
                                </SplitItem>
                            </Split>
                        </LevelItem>
                    </Level>
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

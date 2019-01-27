/*global RELEASE:true*/

import React from 'react';
import PropTypes from 'prop-types';

import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';
import debounce from 'lodash/debounce';
import moment from 'moment';

import { Link } from 'react-router-dom';
import {
    Bullseye,
    Card, CardBody,
    EmptyState, EmptyStateIcon, EmptyStateBody,
    Level, LevelItem,
    Split, SplitItem,
    Stack, StackItem,
    Title
} from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { SimpleTableFilter } from '@red-hat-insights/insights-frontend-components';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { formatUser, includesIgnoreCase } from '../Utilities/model';
import './RemediationTable.scss';

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

class RemediationTable extends React.Component {
    state = {
        selected: {},
        filter: ''
    }

    onSelect = (isSelected, unused, index) => {
        this.setState(state => {
            const selected = (index === -1) ?
                mapValues(keyBy(this.props.value.remediations.map(r => r.id), f => f), () => isSelected) :
                {
                    ...state.selected,
                    [this.props.value.remediations[index].id]: isSelected
                };

            return { selected };
        });
    };

    onFilterChange = debounce(filter => this.setState({ filter }), SEARCH_DEBOUNCE_DELAY);

    getSelectedItems = (selected = this.state.selected) => this.props.value.remediations.filter(r => selected[r.id]);

    render () {
        const { value, status } = this.props;

        // Skeleton Loading
        if (status !== 'fulfilled') {
            return (
                <SkeletonTable/>
            );
        }

        if (status === 'fulfilled' && !value.remediations.length) {
            const basePath = `/${RELEASE}/platform`;

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
                                        <a href={ `${basePath}/advisor` }>Insights</a>,&nbsp;
                                        <a href={ `${basePath}/vulnerability` }>Vulnerability</a> or&nbsp;
                                        <a href={ `${basePath}/compliance` }>Compliance</a>&nbsp;
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

        const filtered = value.remediations.filter(r => includesIgnoreCase(r.name, this.state.filter.trim()));

        const rows = filtered.map(remediation => ({
            selected: this.state.selected[remediation.id] || false,
            cells: [
                buildName(remediation.name, remediation.id),
                remediation.system_count,
                remediation.issue_count,
                formatUser(remediation.updated_by),
                formatDate(remediation.updated_at)
            ]
        }));

        return (
            <Stack gutter="md">
                <StackItem>
                    <Level>
                        <LevelItem>
                            <SimpleTableFilter buttonTitle="" placeholder="Search Playbooks" onFilterChange={ this.onFilterChange } />
                        </LevelItem>
                        <LevelItem>
                            <Split gutter="md">
                                <SplitItem>
                                    <DeleteRemediationsButton
                                        isDisabled={ !this.getSelectedItems().length }
                                        remediations={ this.getSelectedItems() }
                                    />
                                </SplitItem>
                            </Split>
                        </LevelItem>
                    </Level>
                </StackItem>
                <StackItem>
                    {
                        filtered.length ?
                            <Table
                                cells={ [
                                    {
                                        title: 'Playbook'
                                    }, {
                                        title: 'Systems'
                                    }, {
                                        title: 'Actions'
                                    }, {
                                        title: 'Last Modified By'
                                    }, {
                                        title: 'Last Modified On'
                                    }]
                                }
                                onSelect={ this.onSelect }
                                rows={ rows }>
                                <TableHeader/>
                                <TableBody/>
                            </Table> :
                            <p className='ins-c-remediations-table--empty'>No Playbooks found</p>
                    }
                </StackItem>
            </Stack>
        );
    }
}

RemediationTable.propTypes = {
    value: PropTypes.object,
    status: PropTypes.string.isRequired
};

export default RemediationTable;

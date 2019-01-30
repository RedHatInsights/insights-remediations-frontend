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
    Stack, StackItem,
    Title
} from '@patternfly/react-core';
import { TableHeader, TableBody } from '@patternfly/react-table';
import { SimpleTableFilter } from '@red-hat-insights/insights-frontend-components';
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

class RemediationTable extends React.Component {
    state = {
        filter: '',
        selected: []
    }

    onFilterChange = debounce(filter => this.setState({ filter }), SEARCH_DEBOUNCE_DELAY);

    onSelect = selected => this.setState({ selected });

    render () {
        const { value, status } = this.props;

        // Skeleton Loading
        if (status !== 'fulfilled') {
            return (
                <SkeletonTable/>
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

        const filtered = value.remediations.filter(r => includesIgnoreCase(r.name, this.state.filter.trim()));

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
                                        isDisabled={ !this.state.selected.length }
                                        remediations={ this.state.selected }
                                    />
                                </SplitItem>
                            </Split>
                        </LevelItem>
                    </Level>
                </StackItem>
                <StackItem>
                    {
                        filtered.length ?
                            <SelectableTable
                                aria-label="Playbooks"
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
                            </SelectableTable> :
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

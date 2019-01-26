/*global RELEASE:true*/

import React from 'react';
import PropTypes from 'prop-types';

import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';

import { Link } from 'react-router-dom';
import {
    Level, LevelItem,
    Split, SplitItem,
    Stack, StackItem,
    TextInput
} from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

import { Title,
    EmptyState, EmptyStateIcon, EmptyStateBody,
    Card, CardBody, Bullseye } from '@patternfly/react-core';

import { CubesIcon } from '@patternfly/react-icons';

import { formatUser } from '../Utilities/model';
import './RemediationTable.scss';

import moment from 'moment';
import SkeletonTable from './SkeletonTable';

import { DeleteRemediationsButton } from '../containers/DeleteButtons';

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
        selected: {}
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
                            <EmptyState>
                                <EmptyStateIcon icon={ CubesIcon } />
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

        if (status === 'fulfilled' && !value.remediations.length) {
            return <p className='ins-c-remediations-table--empty'>No Remediations</p>;
        }

        const rows = value.remediations.map(remediation => ({
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
                            <TextInput
                                isDisabled={ true }
                                type="text"
                                value=' '
                                placeholder="Filter"
                                aria-label='Filter'
                            />
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
                    <Table
                        cells={ [
                            {
                                title: 'Remediation'
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
                    </Table>
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

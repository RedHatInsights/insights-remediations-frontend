import React from 'react';
import PropTypes from 'prop-types';
import transform from 'lodash/transform';

import { Table } from '@red-hat-insights/insights-frontend-components';

import { Level, LevelItem,
    TextInput,
    Button,
    Card, CardBody,
    Stack, StackItem,
    Grid, GridItem,
    Split, SplitItem } from '@patternfly/react-core';
import { getIssueApplication, getSystemName } from '../Utilities/model';
import './RemediationTable.scss';

import { ConnectResolutionEditButton } from '../containers/ConnectedComponents';

function resolutionDescriptionCell (remediation, issue) {
    return (
        <span> { issue.resolution.description }
            {
                issue.resolutions_available > 1 && (
                    <React.Fragment>
                        &nbsp;
                        <ConnectResolutionEditButton issue={ issue } remediation={ remediation } />
                    </React.Fragment>
                )
            }
        </span>
    );
}

function expandRow (rows, expandedRow) {
    if (!expandedRow) {
        return rows;
    }

    const row = rows[expandedRow];
    if (!row) {
        return rows;
    }

    row.isActive = !row.isActive;
    row.children.forEach(childKey => rows[childKey].isOpen = !rows[childKey].isOpen);
    return rows;
}

class RemediationDetailsTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            expandedRow: false,
            selected: {}
        };
    }

    onExpandClicked = (event, row, rowKey) => {
        this.setState({ expandedRow: this.state.expandedRow === rowKey ? false : rowKey });
    }

    onSelected = (event, rowKey, selected) => {
        rowKey = Math.floor(rowKey / 2); // TODO: remove once a new table component is used

        this.setState(state => ({
            selected: {
                ...state.selected,
                [rowKey]: selected
            }
        }));
    }

    getSelectedIssues = () => transform(
        this.state.selected,
        (result, value, key) => {
            value && result.push(this.props.remediation.issues[parseInt(key)]);
        },
        []
    );

    onRemoveActions = () => {
        const selected = this.getSelectedIssues();
        this.props.onDeleteActions(selected.map(issue => issue.id));
        this.setState({ selected: {}});
    }

    buildRows = remediation => {
        return remediation.issues.flatMap((issue, issueIndex) => ([
            {
                children: [ 1 ],
                isActive: false,
                selected: this.state.selected[issueIndex] || false,
                cells: [
                    issue.description,
                    resolutionDescriptionCell(remediation, issue),
                    issue.resolution.needs_reboot === true ? 'Yes' : 'No',
                    issue.systems.length,
                    getIssueApplication(issue)
                ]
            },
            {
                isOpen: false,
                cells: [{
                    title:
                        <React.Fragment>
                            <Card key={ issueIndex } className='ins-c-system-card'>
                                <CardBody>
                                    <Grid>
                                        <GridItem span={ 9 }> System </GridItem>
                                        <GridItem span={ 3 }> Status </GridItem>
                                    </Grid>
                                </CardBody>
                            </Card>
                            { issue.systems.flatMap((system, systemIndex) => ([
                                <Card key={ systemIndex } className='ins-c-system-card'>
                                    <CardBody>
                                        <Grid>
                                            <GridItem span={ 9 }> { getSystemName(system) } </GridItem>
                                            <GridItem span={ 3 }> unknown </GridItem>
                                        </Grid>
                                    </CardBody>
                                </Card>
                            ])) }
                        </React.Fragment>,
                    colSpan: 4
                }]
            }
        ]));
    }

    render() {
        const rows = expandRow(this.buildRows(this.props.remediation), this.state.expandedRow);

        return (
            <React.Fragment>
                <Stack gutter="md">
                    <StackItem className='ins-c-remediations-details-table__toolbar'>
                        <Level>
                            <LevelItem>
                                { /* TODO: Fix filtering */ }
                                <TextInput
                                    type="text"
                                    value= ' '
                                    placeholder="Filter"
                                    aria-label='Filter'
                                />
                            </LevelItem>
                            <LevelItem>
                                <Split gutter="md">
                                    <SplitItem><Button isDisabled={ true }> Add Action </Button></SplitItem>
                                    <SplitItem>
                                        <Button
                                            isDisabled={ !this.getSelectedIssues().length }
                                            onClick={ this.onRemoveActions }>
                                            Remove Action
                                        </Button>
                                    </SplitItem>
                                </Split>
                            </LevelItem>
                        </Level>
                    </StackItem>
                    <StackItem>
                        <Table
                            className='ins-c-remediations-details-table'
                            header={ [
                                {
                                    title: 'Actions',
                                    hasSort: true
                                }, {
                                    title: 'Resolution',
                                    hasSort: true
                                }, {
                                    title: 'Reboot Required',
                                    hasSort: true
                                }, {
                                    title: '# of systems',
                                    hasSort: true
                                }, {
                                    title: 'Type',
                                    hasSort: true
                                }]
                            }
                            expandable
                            onExpandClick={ (event, row, rowKey) => this.onExpandClicked(event, row, rowKey) }
                            onItemSelect={ this.onSelected }
                            hasCheckbox={ true }
                            rows= { rows }
                        />
                    </StackItem>
                </Stack>
            </React.Fragment>

        );
    };
}

RemediationDetailsTable.propTypes = {
    remediation: PropTypes.object,
    onDeleteActions: PropTypes.func.isRequired
};

export default RemediationDetailsTable;

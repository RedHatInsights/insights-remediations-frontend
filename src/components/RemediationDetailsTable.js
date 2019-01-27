import React from 'react';
import PropTypes from 'prop-types';

import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';
import debounce from 'lodash/debounce';
import flatMap from 'lodash/flatMap';

import {
    Button,
    Card, CardBody,
    Grid, GridItem,
    Level, LevelItem,
    Split, SplitItem,
    Stack, StackItem
} from '@patternfly/react-core';

import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { SimpleTableFilter } from '@red-hat-insights/insights-frontend-components';

import { getIssueApplication, getSystemName, includesIgnoreCase } from '../Utilities/model';
import './RemediationTable.scss';

import { ConnectResolutionEditButton } from '../containers/ConnectedComponents';
import { DeleteActionsButton } from '../containers/DeleteButtons';
import { SEARCH_DEBOUNCE_DELAY } from '../constants';

import './RemediationDetailsTable.scss';

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
    const row = rows[expandedRow];
    if (!row) {
        return rows;
    }

    row.isOpen = !row.isOpen;
    return rows;
}

class RemediationDetailsTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            expandedRow: false,
            selected: {},
            filter: ''
        };
    }

    onExpandClicked = (event, rowKey) => {
        this.setState({ expandedRow: this.state.expandedRow === rowKey ? false : rowKey });
    }

    onSelect = (isSelected, unused, index) => {
        index = Math.floor(index / 2);

        this.setState(state => {
            const selected = (index === -1) ?
                mapValues(keyBy(this.props.remediation.issues, r => r.id), () => isSelected) :
                {
                    ...state.selected,
                    [this.props.remediation.issues[index].id]: isSelected
                };

            return { selected };
        });
    };

    getSelectedIssues = () => this.props.remediation.issues.filter(i => this.state.selected[i.id]);

    onFilterChange = debounce(filter => this.setState({ filter }), SEARCH_DEBOUNCE_DELAY);

    onRemoveActions = () => {
        const selected = this.getSelectedIssues();
        this.props.onDeleteActions(selected.map(issue => issue.id));
        this.setState({ selected: {}});
    }

    getIssueUrl = (issue) => {
        switch (getIssueApplication(issue)) {
            case 'Advisor':
                return 'configuration_assessment';
            case 'Vulnerability':
                return 'configuration_assessment';
            case 'Compliance':
                return 'compliance';
            default:
                return 'general_information';
        }
    };

    buildRows = remediation => {
        const filtered = remediation.issues.filter(i => includesIgnoreCase(i.description, this.state.filter.trim()));

        return flatMap(filtered, (issue, issueIndex) => ([
            {
                isOpen: false,
                selected: this.state.selected[issue.id] || false,
                cells: [
                    issue.description,
                    resolutionDescriptionCell(remediation, issue),
                    issue.resolution.needs_reboot === true ? 'Yes' : 'No',
                    issue.systems.length,
                    {
                        title: getIssueApplication(issue),
                        props: { className: 'ins-m-nowrap' }
                    }
                ]
            },
            {
                parent: issueIndex * 2,
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
                                            <GridItem span={ 9 }>
                                                <a href={ `${document.baseURI}platform/inventory/entity/${system.id}/${this.getIssueUrl(issue)}` }>
                                                    { getSystemName(system) }
                                                </a>
                                            </GridItem>
                                            <GridItem span={ 3 }> unknown </GridItem>
                                        </Grid>
                                    </CardBody>
                                </Card>
                            ])) }
                        </React.Fragment>
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
                                <SimpleTableFilter buttonTitle="" placeholder="Search Actions" onFilterChange={ this.onFilterChange } />
                            </LevelItem>
                            <LevelItem>
                                <Split gutter="md">
                                    <SplitItem><Button isDisabled={ true }> Add Action </Button></SplitItem>
                                    <SplitItem>

                                        <DeleteActionsButton
                                            isDisabled={ !this.getSelectedIssues().length }
                                            remediation={ this.props.remediation }
                                            issues={ this.getSelectedIssues() }
                                        />
                                    </SplitItem>
                                </Split>
                            </LevelItem>
                        </Level>
                    </StackItem>
                    <StackItem>
                        {
                            rows.length ?
                                <Table
                                    className='ins-c-remediations-details-table'
                                    cells={ [
                                        {
                                            title: 'Actions'
                                        }, {
                                            title: 'Resolution'
                                        }, {
                                            title: 'Reboot Required'
                                        }, {
                                            title: '# of systems'
                                        }, {
                                            title: 'Type'
                                        }]
                                    }
                                    onCollapse={ (event, row, rowKey) => this.onExpandClicked(event, row, rowKey) }
                                    onSelect={ this.onSelect }
                                    rows= { rows }
                                >
                                    <TableHeader/>
                                    <TableBody/>
                                </Table> :
                                this.state.filter ?
                                    <p className='ins-c-remediation-details-table--empty'>No Actions found</p> :
                                    <p className='ins-c-remediation-details-table--empty'>This Playbook is empty</p>
                        }

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

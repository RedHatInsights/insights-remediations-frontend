import React from 'react';
import PropTypes from 'prop-types';

import debounce from 'lodash/debounce';
import flatMap from 'lodash/flatMap';
import sortBy from 'lodash/sortBy';

import {
    Button,
    Card, CardBody,
    Grid, GridItem,
    Level, LevelItem,
    Split, SplitItem,
    Stack, StackItem
} from '@patternfly/react-core';

import SelectableTable from '../containers/SelectableTable';
import { TableHeader, TableBody } from '@patternfly/react-table';
import { SimpleTableFilter } from '@red-hat-insights/insights-frontend-components';

import { getIssueApplication, getSystemName, includesIgnoreCase } from '../Utilities/model';
import { buildInventoryUrl, getInventoryTabForIssue, buildIssueUrl } from '../Utilities/urls';
import './RemediationTable.scss';

import { ConnectResolutionEditButton } from '../containers/ConnectedComponents';
import { DeleteActionsButton } from '../containers/DeleteButtons';
import { SEARCH_DEBOUNCE_DELAY } from '../constants';
import { isBeta } from '../config';

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

function issueDescriptionCell (issue) {
    const url = buildIssueUrl(issue.id);

    if (url) {
        return <a href={ url }>{ issue.description }</a>;
    }

    return issue.description;
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
            selected: [],
            filter: ''
        };
    }

    onExpandClicked = (event, rowKey) => {
        this.setState({ expandedRow: this.state.expandedRow === rowKey ? false : rowKey });
    }

    onSelect = selected => this.setState({ selected });

    onFilterChange = debounce(filter => this.setState({ filter }), SEARCH_DEBOUNCE_DELAY);

    buildRows = remediation => {
        const filtered = remediation.issues.filter(i => includesIgnoreCase(i.description, this.state.filter.trim()));

        return flatMap(filtered, (issue, issueIndex) => ([
            {
                isOpen: false,
                id: issue.id,
                cells: [
                    {
                        title: issueDescriptionCell(issue)
                    },
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
                                        <GridItem span={ isBeta ? 9 : 12 }> System </GridItem>
                                        {
                                            isBeta &&
                                            <GridItem span={ 3 }> Status </GridItem>
                                        }
                                    </Grid>
                                </CardBody>
                            </Card>
                            { sortBy(issue.systems, [ s => getSystemName(s), s => s.id ]).map((system, systemIndex) => (
                                <Card key={ systemIndex } className='ins-c-system-card'>
                                    <CardBody>
                                        <Grid>
                                            <GridItem span={ isBeta ? 9 : 12 }>
                                                <a href={ buildInventoryUrl(system.id, getInventoryTabForIssue(issue)) }>
                                                    { getSystemName(system) }
                                                </a>
                                            </GridItem>
                                            {
                                                isBeta &&
                                                <GridItem span={ 3 }> unknown </GridItem>
                                            }

                                        </Grid>
                                    </CardBody>
                                </Card>
                            )) }
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
                                    <SplitItem>
                                        {
                                            isBeta &&
                                            <Button isDisabled={ true }> Add Action </Button>
                                        }

                                    </SplitItem>
                                    <SplitItem>

                                        <DeleteActionsButton
                                            isDisabled={ !this.state.selected.length }
                                            remediation={ this.props.remediation }
                                            issues={ this.state.selected }
                                        />
                                    </SplitItem>
                                </Split>
                            </LevelItem>
                        </Level>
                    </StackItem>
                    <StackItem>
                        {
                            rows.length ?
                                <SelectableTable
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
                                </SelectableTable> :
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
    remediation: PropTypes.object
};

export default RemediationDetailsTable;

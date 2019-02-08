import React from 'react';
import PropTypes from 'prop-types';

import debounce from 'lodash/debounce';
import flatMap from 'lodash/flatMap';
import orderBy from 'lodash/orderBy';

import {
    Button,
    Card, CardBody,
    Grid, GridItem,
    Level, LevelItem,
    Split, SplitItem
} from '@patternfly/react-core';

import SelectableTable from '../containers/SelectableTable';
import { sortable, TableHeader, TableBody } from '@patternfly/react-table';
import { SimpleTableFilter, TableToolbar } from '@red-hat-insights/insights-frontend-components';

import { getIssueApplication, getSystemName, includesIgnoreCase } from '../Utilities/model';
import { buildInventoryUrl, getInventoryTabForIssue, buildIssueUrl } from '../Utilities/urls';
import './RemediationTable.scss';

import { ConnectResolutionEditButton } from '../containers/ConnectedComponents';
import { DeleteActionsButton } from '../containers/DeleteButtons';
import { SEARCH_DEBOUNCE_DELAY } from '../constants';
import { isBeta } from '../config';

import './RemediationDetailsTable.scss';

function resolutionDescriptionCell (remediation, issue) {
    if (issue.resolutions_available <= 1) {
        return issue.resolution.description;
    }

    return (
        <React.Fragment>
            { issue.resolution.description }&nbsp;
            <ConnectResolutionEditButton issue={ issue } remediation={ remediation } />
        </React.Fragment>
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

const SORTING_ITERATEES = [
    null, // expand toggle
    null, // checkboxes
    i => i.description,
    null, // resolution steps
    i => i.resolution.needs_reboot,
    i => i.systems.length,
    i => getIssueApplication(i)
];

class RemediationDetailsTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            expandedRow: false,
            selected: [],
            filter: '',
            sortBy: 2,
            sortDir: 'asc'
        };
    }

    onExpandClicked = (event, rowKey) => {
        this.setState({ expandedRow: this.state.expandedRow === rowKey ? false : rowKey });
    }

    onSelect = selected => this.setState({ selected });
    onFilterChange = debounce(filter => this.setState({ filter }), SEARCH_DEBOUNCE_DELAY);
    onSort = (event, sortBy, sortDir) => this.setState({ sortBy, sortDir });

    buildRows = remediation => {
        const filtered = remediation.issues.filter(i => includesIgnoreCase(i.description, this.state.filter.trim()));
        const sorted = orderBy(filtered, [ SORTING_ITERATEES[this.state.sortBy] ], [ this.state.sortDir ]);

        return flatMap(sorted, (issue, issueIndex) => ([
            {
                isOpen: false,
                id: issue.id,
                cells: [
                    {
                        title: issueDescriptionCell(issue)
                    },
                    {
                        title: resolutionDescriptionCell(remediation, issue)
                    },
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
                            { orderBy(issue.systems, [ s => getSystemName(s), s => s.id ]).map(system => (
                                <Card key={ system.id } className='ins-c-system-card'>
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
        const { filter, selected, sortBy, sortDir } = this.state;

        return (
            <React.Fragment>
                <TableToolbar className='ins-c-remediations-details-table__toolbar' results={ this.props.remediation.issues.length }>
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
                                        isDisabled={ !selected.length }
                                        remediation={ this.props.remediation }
                                        issues={ selected }
                                    />
                                </SplitItem>
                            </Split>
                        </LevelItem>
                    </Level>
                </TableToolbar>
                {
                    rows.length ?
                        <SelectableTable
                            aria-label="Actions"
                            className='ins-c-remediations-details-table'
                            cells={ [
                                {
                                    title: 'Actions',
                                    transforms: [ sortable ]
                                }, {
                                    title: 'Resolution'
                                }, {
                                    title: 'Reboot Required',
                                    transforms: [ sortable ]
                                }, {
                                    title: 'Systems',
                                    transforms: [ sortable ]
                                }, {
                                    title: 'Type',
                                    transforms: [ sortable ]
                                }]
                            }
                            onCollapse={ (event, row, rowKey) => this.onExpandClicked(event, row, rowKey) }
                            onSelect={ this.onSelect }
                            onSort={ this.onSort }
                            sortBy={ { index: sortBy, direction: sortDir } }
                            rows= { rows }
                        >
                            <TableHeader/>
                            <TableBody/>
                        </SelectableTable> :
                        filter ?
                            <p className='ins-c-remediation-details-table--empty'>No Actions found</p> :
                            <p className='ins-c-remediation-details-table--empty'>This Playbook is empty</p>
                }
            </React.Fragment>

        );
    };
}

RemediationDetailsTable.propTypes = {
    remediation: PropTypes.object
};

export default RemediationDetailsTable;

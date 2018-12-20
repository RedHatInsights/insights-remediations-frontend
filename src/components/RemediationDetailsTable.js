import React from 'react';
import PropTypes from 'prop-types';

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

class RemediationDetailsTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: this.props.remediation.issues.flatMap((issue, issueIndex) => ([
                {
                    children: [ 1 ],
                    isActive: false,
                    cells: [
                        issue.description,
                        issue.resolution.description,
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
                                { this.props.remediation.issues[issueIndex].systems.flatMap((system, systemIndex) => ([
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
            ]))
        };
        this.onExpandClicked = this.onExpandClicked.bind(this);
    }

    onExpandClicked(event, row, rowKey) {
        const { rows } = this.state;
        rows[rowKey].isActive = !row.isActive;
        row.children.forEach(childKey => rows[childKey].isOpen = !rows[childKey].isOpen);
        this.setState({ rows });
    }

    render() {

        const { rows } = this.state;

        return (
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
                                <SplitItem><Button isDisabled ={ true }> Add Action </Button></SplitItem>
                                <SplitItem><Button> Remove Action </Button></SplitItem>
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
                        hasCheckbox={ true }
                        rows= { rows }
                    />
                </StackItem>
            </Stack>
        );
    };
}

RemediationDetailsTable.propTypes = {
    remediation: PropTypes.object
};

export default RemediationDetailsTable;

import React from 'react';
import PropTypes from 'prop-types';

import { Table, Battery } from '@red-hat-insights/insights-frontend-components';

import { Level, LevelItem,
    TextInput,
    Button,
    Card, CardBody,
    Stack, StackItem,
    Grid, GridItem,
    Split, SplitItem } from '@patternfly/react-core';
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
                        'fix'
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
                                            <GridItem span={ 6 }> System </GridItem>
                                            <GridItem span={ 3 }> Total Risk </GridItem>
                                            <GridItem span={ 3 }> Status </GridItem>
                                        </Grid>
                                    </CardBody>
                                </Card>
                                { this.props.remediation.issues[issueIndex].systems.flatMap((system, systemIndex) => ([
                                    <Card key={ systemIndex } className='ins-c-system-card'>
                                        <CardBody>
                                            <Grid>
                                                <GridItem span={ 6 }> { system.display_name === null ? system.display_name : system.id } </GridItem>
                                                <GridItem span={ 3 }> <Battery label='fix' severity='medium'/></GridItem>
                                                <GridItem span={ 3 }> fix </GridItem>
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
                                <SplitItem><Button> Add Action </Button></SplitItem>
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

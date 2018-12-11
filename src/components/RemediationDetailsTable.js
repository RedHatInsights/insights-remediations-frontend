import React from 'react';
import PropTypes from 'prop-types';

import { Table } from '@red-hat-insights/insights-frontend-components';
import { Level, LevelItem, TextInput, Button, Stack, StackItem, Split, SplitItem } from '@patternfly/react-core';
import './RemediationTable.scss';

class RemediationDetailsTable extends React.Component {

    constructor(props) {
        super(props);
    }

    onExpandClicked(event, row, rowKey) {
        const { rows } = this.state;
        rows[rowKey].isActive = !row.isActive;
        row.children.forEach(childKey => rows[childKey].isOpen !== rows[childKey].isOpen);
        this.setState({ rows });
    }

    render() {

        const { remediation } = this.props;

        const rows = remediation.issues.map(issue => (
            {
                cells: [
                    issue.description,
                    issue.resolution.description,
                    issue.resolution.needs_reboot === true ? 'Yes' : 'No',
                    issue.systems.length,
                    'fix'
                ]
            }
        ));

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

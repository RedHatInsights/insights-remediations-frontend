import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Button, EmptyState, EmptyStateBody, EmptyStateIcon, Title, Bullseye } from '@patternfly/react-core';
import { TableHeader, Table, TableBody, expandable } from '@patternfly/react-table';
import SkeletonTable from '../skeletons/SkeletonTable';

import { statusSummary, normalizeStatus } from './statusHelper';

import { getPlaybookRuns, loadRemediation } from '../actions';

import './RemediationActivityTable.scss';

import { WrenchIcon } from '@patternfly/react-icons';

const RemediationActivityTable = ({
    remediation,
    playbookRuns,
    getPlaybookRuns
}) => {

    useEffect(() => {
        getPlaybookRuns(remediation.id);
    }, [ getPlaybookRuns ]);

    const systemsStatus = { running: 1, success: 2, failure: 1 };

    // TOOD, make expandable, fill in that data
    if (remediation && playbookRuns) {
        return playbookRuns.length ? (
            <Table
                aria-label="Activity Table"
                rows={ playbookRuns.map(playbooks => (
                    {
                        isOpen: true,
                        cells: [
                            { title: <Link to={ `/${remediation.id}/${playbooks.id}` }> { playbooks.created_at } </Link>,
                                cellFormatters: [ expandable ]},
                            `${playbooks.created_by.first_name} ${playbooks.created_by.last_name}`,
                            statusSummary(normalizeStatus(playbooks.status), systemsStatus)
                        ]
                    }
                )) }
                cells={ [{ title: 'Run on' }, { title: 'Run by' }, { title: 'Status' }] }>
                <TableHeader />
                <TableBody />
            </Table>
        ) : (
            <Bullseye>
                <EmptyState>
                    <EmptyStateIcon icon={ WrenchIcon } />
                    <Title headingLevel="h5" size="lg">
                        Do more with Find it Fix it.
                    </Title>
                    <EmptyStateBody>
                        Configure Cloud Connector to connect cloud.redhat.com with your
                        Satellite instances and execute remediation across all regions,
                        geographies, and Satellites in one place.
                    </EmptyStateBody>
                    <Button variant="link">Learn how to configure</Button>
                </EmptyState>
            </Bullseye>
        );
    }

    return (
        <SkeletonTable/>
    );

};

RemediationActivityTable.propTypes = {
    remediation: PropTypes.object,
    playbookRuns: PropTypes.object,
    getPlaybookRuns: PropTypes.func
};

const connected = connect(
    ({ playbookRuns, selectedRemediation }) => ({
        playbookRuns: playbookRuns.data,
        remediation: selectedRemediation.remediation
    }),
    (dispatch) => ({
        getPlaybookRuns: (id) => dispatch(getPlaybookRuns(id)),
        loadRemediation: id => dispatch(loadRemediation(id))
    })
)(RemediationActivityTable);
export default connected;

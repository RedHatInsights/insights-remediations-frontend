import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Table } from '@red-hat-insights/insights-frontend-components';
import { Progress, ProgressMeasureLocation } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import './RemediationTable.scss';

import moment from 'moment';

function buildName (name, id) {
    return (
        <Link to={ `/${id}` }>{ name }</Link>
    );
}

function formatDate (date) {
    return moment(date).format('ll');
}

function issueProgress (issueCount) {
    // TODO Remove random issues fixed
    const issuesFixed = Math.floor(Math.random() * (issueCount + 1));

    const title = `${issuesFixed} of ${issueCount}`;
    const progress = (issuesFixed / issueCount) * 100;

    return (

        // TODO Fix when pf releases new version of progress that fixes title
        <Progress
            className = 'remediationProgress'
            title=''
            value={ progress }
            label={ title }
            measureLocation={ ProgressMeasureLocation.outside }
        />
    );
}

const RemediationTable = function ({ value, status }) {

    if (status === 'loading') {
        return (
            <p className='loading'>
                <SyncAltIcon/>
            </p>
        );
    }

    if (status !== 'fulfilled') {
        return null;
    }

    const rows = value.remediations.map(remediation => ({
        cells: [
            buildName(remediation.name, remediation.id),
            remediation.system_count,
            issueProgress(remediation.issue_count),
            String(remediation.owner),
            formatDate(remediation.updated_at)
        ]
    }));

    return (
        <Table
            header={ [
                {
                    title: 'Plan',
                    hasSort: true
                }, {
                    title: '# of systems',
                    hasSort: true
                }, {
                    title: 'Rule Hits Resolved',
                    hasSort: true
                }, {
                    title: 'Last Modified By',
                    hasSort: true
                }, {
                    title: 'Last Modified On',
                    hasSort: true
                }]
            }
            rows={ rows }
        />
    );
};

RemediationTable.propTypes = {
    value: PropTypes.object,
    status: PropTypes.string.isRequired
};

export default RemediationTable;

import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Table } from '@red-hat-insights/insights-frontend-components';
import { SyncAltIcon } from '@patternfly/react-icons';
import { formatUser } from '../Utilities/model';
import './RemediationTable.scss';

import moment from 'moment';

function buildName (name, id) {
    return (
        <Link to={ `/${id}` }>{ name }</Link>
    );
}

function formatDate (date) {
    return moment(date).format('lll');
}

const RemediationTable = function ({ value, status }) {

    if (status !== 'fulfilled') {
        return (
            <p className='ins-c-remediations-table--loading'>
                <SyncAltIcon/>
            </p>
        );
    }

    if (status === 'fulfilled' && !value.remediations.length) {
        return <p className='ins-c-remediations-table--empty'>No Remediations</p>;
    }

    const rows = value.remediations.map(remediation => ({
        cells: [
            buildName(remediation.name, remediation.id),
            remediation.system_count,
            remediation.issue_count,
            formatUser(remediation.updated_by),
            formatDate(remediation.updated_at)
        ]
    }));

    return (
        <Table
            header={ [
                {
                    title: 'Remediation',
                    hasSort: true
                }, {
                    title: 'Systems',
                    hasSort: true
                }, {
                    title: 'Actions',
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

import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Table } from '@red-hat-insights/insights-frontend-components';
import { SyncAltIcon } from '@patternfly/react-icons';
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
            remediation.issue_count,
            String(remediation.updated_by),
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

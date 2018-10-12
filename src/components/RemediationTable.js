import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Table } from '@red-hat-insights/insights-frontend-components';
import { SyncAltIcon } from '@patternfly/react-icons';
import './RemediationTable.scss';

function buildName (name, id) {
    return (
        <Link to={ `/${id}` }>{ name }</Link>
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
            remediation.issueCount,
            remediation.updated_at,
            String(remediation.needsReboot)
        ]
    }));

    return (
        <Table
            header={ [
                {
                    title: 'Name',
                    hasSort: false
                }, {
                    title: '# of issues',
                    hasSort: false
                }, {
                    title: 'Last updated',
                    hasSort: false
                }, {
                    title: 'Reboot required',
                    hasSort: false
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

import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { formatUser } from '../Utilities/model';
import './RemediationTable.scss';

import moment from 'moment';
import SkeletonTable from './SkeletonTable';

function buildName (name, id) {
    return ({
        title: <Link to={ `/${id}` }>{ name }</Link>
    });
}

function formatDate (date) {
    return moment(date).format('lll');
}

const RemediationTable = function ({ value, status }) {

    // Skeleton Loading
    if (status !== 'fulfilled') {
        return (
            <SkeletonTable/>
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
        <React.Fragment>
            <Table
                cells={ [
                    {
                        title: 'Remediation'
                    }, {
                        title: 'Systems'
                    }, {
                        title: 'Actions'
                    }, {
                        title: 'Last Modified By'
                    }, {
                        title: 'Last Modified On'
                    }]
                }
                rows={ rows }>
                <TableHeader/>
                <TableBody/>
            </Table>
        </React.Fragment>
    );
};

RemediationTable.propTypes = {
    value: PropTypes.object,
    status: PropTypes.string.isRequired
};

export default RemediationTable;

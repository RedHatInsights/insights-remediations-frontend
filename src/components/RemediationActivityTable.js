import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import {
    Table,
    TableHeader,
    TableBody,
    expandable
} from '@patternfly/react-table';

import { DateFormat } from '@redhat-cloud-services/frontend-components';

import { StatusSummary, normalizeStatus } from './statusHelper';

import { PermissionContext } from '../App';

const RemediationActivityTable = ({ remediation, playbookRuns }) => {

    const [ rows, setRows ] = useState([]);
    const permission = useContext(PermissionContext);

    const systemsStatus = { running: 1, success: 2, failure: 1 };

    const generateRows = (playbookRuns) => {
        console.log(playbookRuns);
        return (playbookRuns.reduce((acc, playbooks, i) => (
            [
                ...acc,
                {
                    isOpen: false,
                    cells: [
                        { title: <Link to={ `/${remediation.id}/${playbooks.id}` }><DateFormat type='exact' date={ playbooks.created_at }/></Link>,
                            cellFormatters: [ expandable ]},
                        `${playbooks.created_by.first_name} ${playbooks.created_by.last_name}`,
                        { title: <StatusSummary
                                executorStatus={normalizeStatus(playbooks.status)}
                                systemsStatus={systemsStatus}
                                permission={permission}
                                needsText/>
                        }
                    ]
                }, {
                    parent: 2 * i,
                    fullWidth: true,
                    cells: [{
                        title: <Table
                            aria-label="Compact expandable table"
                            cells={ [ 'Connection', 'Systems', 'Playbook run status' ] }
                            rows={ playbooks.executors.map(e => (
                                { cells: [
                                    { title: <Link to={ `/${remediation.id}/${playbooks.id}/${e.executor_id}` }>{ e.executor_name }</Link> },
                                    e.system_count,
                                    { title: <StatusSummary
                                        executorStatus={normalizeStatus(playbooks.status)}
                                        systemsStatus={systemsStatus}
                                        permission={permission}
                                        onCancel={() => console.log('cancel')}
                                        needsText
                                        needsTooltip/> }
                                ]}
                            )) }
                        >
                            <TableHeader />
                            <TableBody />
                        </Table>
                    }]
                }
            ]
        ), []));
    };

    useEffect(() => {
        if (playbookRuns && playbookRuns.length) {
            setRows(() => generateRows(playbookRuns));
        }
    }, [ playbookRuns ]);

    const handleOnCollapse = (event, rowId, isOpen) => {
        const collapseRows = [ ...rows ];
        collapseRows[rowId] = { ...collapseRows[rowId], isOpen };
        setRows(collapseRows);
    };

    const columns = [
        'Run on',
        'Run by',
        'Status'
    ];

    return (
        <Table aria-label="Collapsible table" onCollapse={ handleOnCollapse } rows={ rows } cells={ columns }>
            <TableHeader />
            <TableBody />
        </Table>
    );
};

RemediationActivityTable.propTypes = {
    remediation: PropTypes.object,
    playbookRuns: PropTypes.array
};

export default RemediationActivityTable;

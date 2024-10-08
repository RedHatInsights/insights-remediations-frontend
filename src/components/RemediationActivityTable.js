import React, { useState, useEffect, useContext } from 'react';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';
import PropTypes from 'prop-types';

import { expandable } from '@patternfly/react-table';
import {
  Table,
  TableHeader,
  TableBody,
} from '@patternfly/react-table/deprecated';

import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';

import { StatusSummary, normalizeStatus } from './statusHelper';

import { PermissionContext } from '../App';

import './RemediationActivityTable.scss';

export const ACTIVITY_LIST_COLUMNS = ['Run on', 'Run by', 'Status'];

const RemediationActivityTable = ({ remediation, playbookRuns }) => {
  const [rows, setRows] = useState([]);
  const permission = useContext(PermissionContext);

  const generateRows = (playbookRuns) => {
    return playbookRuns.reduce(
      (acc, playbooks, i) => [
        ...acc,
        {
          isOpen: false,
          cells: [
            {
              title: (
                <Link to={`/${remediation.id}/${playbooks.id}`}>
                  <DateFormat type="exact" date={playbooks.created_at} />
                </Link>
              ),
              cellFormatters: [expandable],
            },
            playbooks.created_by.last_name // for reasons unknown, last_name is not available sometimes
              ? `${playbooks.created_by.first_name} ${playbooks.created_by.last_name}`
              : `${playbooks.created_by.username}`,
            {
              title: (
                <StatusSummary
                  executorStatus={normalizeStatus(playbooks.status)}
                  counts={playbooks.executors.reduce(
                    (acc, ex) => ({
                      pending: acc.pending + ex.counts.pending,
                      running: acc.running + ex.counts.running,
                      success: acc.success + ex.counts.success,
                      failure: acc.failure + ex.counts.failure,
                      canceled: acc.canceled + ex.counts.canceled,
                      acked: acc.acked + ex.counts.acked,
                    }),
                    {
                      pending: 0,
                      running: 0,
                      success: 0,
                      failure: 0,
                      canceled: 0,
                      acked: 0,
                    }
                  )}
                  hasCancel
                  remediationName={remediation.name}
                  remediationId={remediation.id}
                  playbookId={playbooks.id}
                  permission={permission}
                />
              ),
            },
          ],
        },
        {
          parent: 2 * i,
          fullWidth: true,
          cells: [
            {
              title: (
                <Table
                  aria-label="Compact expandable table"
                  cells={['Connection', 'Systems', 'Playbook run status']}
                  rows={playbooks.executors.map((e) => ({
                    cells: [
                      {
                        title: (
                          <Link
                            to={`/${remediation.id}/${playbooks.id}/${e.executor_id}`}
                          >
                            {e.executor_name}
                          </Link>
                        ),
                      },
                      e.system_count,
                      {
                        title: (
                          <StatusSummary
                            executorStatus={normalizeStatus(e.status)}
                            counts={e.counts}
                            permission={permission}
                          />
                        ),
                      },
                    ],
                  }))}
                >
                  <TableHeader />
                  <TableBody />
                </Table>
              ),
            },
          ],
        },
      ],
      []
    );
  };

  useEffect(() => {
    if (playbookRuns && playbookRuns.length) {
      setRows(() => generateRows(playbookRuns));
    }
  }, [playbookRuns]);

  const handleOnCollapse = (event, rowId, isOpen) => {
    const collapseRows = [...rows];
    collapseRows[rowId] = { ...collapseRows[rowId], isOpen };
    setRows(collapseRows);
  };

  return (
    <Table
      className="rem-c-activity-table"
      aria-label="Collapsible table"
      onCollapse={handleOnCollapse}
      rows={rows}
      cells={ACTIVITY_LIST_COLUMNS}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

RemediationActivityTable.propTypes = {
  remediation: PropTypes.object,
  playbookRuns: PropTypes.array,
};

export default RemediationActivityTable;

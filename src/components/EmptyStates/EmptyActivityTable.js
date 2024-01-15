import React from 'react';

import { EmptyState, EmptyStateBody, EmptyStateHeader,  } from '@patternfly/react-core';
import {
	Table,
	TableHeader,
	TableBody
} from '@patternfly/react-table/deprecated';

import './EmptyActivityTable.scss';

const EmptyActivityTable = () => (
  <Table
    aria-label="No activity"
    cells={['Run on', 'Run by', 'Status']}
    ouiaId="activity-table"
    rows={[
      {
        cells: [
          {
            title: (
              <EmptyState className="rem-c-activity-table__empty">
                <EmptyStateHeader titleText="No activity" headingLevel="h5" />
                <EmptyStateBody>
                  Execute this playbook to see a history and summary of the
                  activity.
                </EmptyStateBody>
              </EmptyState>
            ),
            props: { colSpan: 3 },
          },
        ],
      },
    ]}
  >
    <TableHeader />
    <TableBody />
  </Table>
);

export default EmptyActivityTable;

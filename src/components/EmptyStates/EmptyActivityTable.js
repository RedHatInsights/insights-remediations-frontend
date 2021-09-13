import React from 'react';

import { EmptyState, EmptyStateBody, Title } from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

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
                <Title headingLevel="h5" size="lg">
                  No activity
                </Title>
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

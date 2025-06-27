import React from 'react';
import {
  Name as NameCell,
  LastExecutedCell,
  ExecutionStatusCell,
  ActionsCell,
  SystemsCell,
  CreatedCell,
  LastModifiedCell,
} from './Cells.js';
import { wrappable } from '@patternfly/react-table';

export const Name = {
  title: 'Name',
  transforms: [wrappable],
  sortable: 'name',
  exportKey: 'name',
  component: NameCell,
};

export const LastExecuted = {
  title: 'Last executed',
  transforms: [wrappable],
  sortable: 'last_run_at',
  exportKey: 'last_run_at',
  component: LastExecutedCell,
};

export const ExecutionStatus = {
  title: 'Execution status',
  transforms: [wrappable],
  //TODO: Enable once Backend is ready
  // sortable: 'status',
  exportKey: 'status',
  component: ExecutionStatusCell,
};

export const Actions = {
  title: 'Actions',
  transforms: [wrappable],
  sortable: 'issue_count',
  exportKey: 'Actions',
  component: ActionsCell,
};

export const Systems = {
  title: 'Systems',
  transforms: [wrappable],
  sortable: 'system_count',
  exportKey: 'system_count',
  component: SystemsCell,
};

export const Created = {
  title: 'Created',
  transforms: [wrappable],
  sortable: 'created_at',
  exportKey: 'created_at',
  component: CreatedCell,
};

export const LastModified = {
  title: 'Last modified',
  transforms: [wrappable],
  sortable: 'updated_at',
  exportKey: 'updated_at',
  component: LastModifiedCell,
};

export default [
  Name,
  LastExecuted,
  ExecutionStatus,
  Actions,
  Systems,
  Created,
  LastModified,
];

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
  Component: NameCell,
  manageable: false,
};

export const LastExecuted = {
  title: 'Last executed',
  transforms: [wrappable],
  sortable: 'last_run_at',
  exportKey: 'last_run_at',
  Component: LastExecutedCell,
};

export const ExecutionStatus = {
  title: 'Execution status',
  transforms: [wrappable],
  sortable: 'status',
  exportKey: 'status',
  Component: ExecutionStatusCell,
};

export const Actions = {
  title: 'Actions',
  transforms: [wrappable],
  sortable: 'issue_count',
  exportKey: 'Actions',
  Component: ActionsCell,
};

export const Systems = {
  title: 'Systems',
  transforms: [wrappable],
  sortable: 'system_count',
  exportKey: 'system_count',
  Component: SystemsCell,
};

export const Created = {
  title: 'Created',
  transforms: [wrappable],
  sortable: 'created_at',
  exportKey: 'created_at',
  Component: CreatedCell,
};

export const LastModified = {
  title: 'Last modified',
  transforms: [wrappable],
  sortable: 'updated_at',
  exportKey: 'updated_at',
  Component: LastModifiedCell,
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

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

// eslint-disable-next-line react/display-name
export const renderComponent = (Component, props) => (_data, _id, entity) =>
  <Component {...entity} {...props} />;

export const Name = {
  title: 'Name',
  transforms: [wrappable],
  sortable: 'name',
  exportKey: 'name',
  renderFunc: renderComponent(NameCell),
};

export const LastExecuted = {
  title: 'Last executed',
  transforms: [wrappable],
  sortable: 'last_run_at',
  exportKey: 'last_run_at',
  renderFunc: renderComponent(LastExecutedCell),
};

export const ExecutionStatus = {
  title: 'Execution status',
  transforms: [wrappable],
  //TODO: Enable once Backend is ready
  // sortable: 'status',
  exportKey: 'status',
  renderFunc: renderComponent(ExecutionStatusCell),
};

export const Actions = {
  title: 'Actions',
  transforms: [wrappable],
  sortable: 'issue_count',
  exportKey: 'Actions',
  renderFunc: renderComponent(ActionsCell),
};

export const Systems = {
  title: 'Systems',
  transforms: [wrappable],
  sortable: 'system_count',
  exportKey: 'system_count',
  renderFunc: renderComponent(SystemsCell),
};

export const Created = {
  title: 'Created',
  transforms: [wrappable],
  sortable: 'created_at',
  exportKey: 'created_at',
  renderFunc: renderComponent(CreatedCell),
};

export const LastModified = {
  title: 'Last modified',
  transforms: [wrappable],
  sortable: 'updated_at',
  exportKey: 'updated_at',
  renderFunc: renderComponent(LastModifiedCell),
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

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
import { fitContent } from '@patternfly/react-table';

// eslint-disable-next-line react/display-name
export const renderComponent = (Component, props) => (_data, _id, entity) =>
  <Component {...entity} {...props} />;

export const Name = {
  title: 'Name',
  transforms: [fitContent],
  sortable: 'name',
  props: {
    width: 10,
  },
  exportKey: 'name',
  renderFunc: renderComponent(NameCell),
};

export const LastExecuted = {
  title: 'Last executed',
  transforms: [fitContent],
  sortable: 'last_run_at',
  props: {
    width: 30,
  },
  exportKey: 'last_run_at',
  renderFunc: renderComponent(LastExecutedCell),
};

export const ExecutionStatus = {
  title: 'Execution status',
  transforms: [fitContent],
  sortable: 'status',
  props: {
    width: 30,
  },
  exportKey: 'status',
  renderFunc: renderComponent(ExecutionStatusCell),
};

export const Actions = {
  title: 'Actions',
  transforms: [fitContent],
  sortable: 'issue_count',
  props: {
    width: 30,
  },
  exportKey: 'Actions',
  renderFunc: renderComponent(ActionsCell),
};

export const Systems = {
  title: 'Systems',
  transforms: [fitContent],
  sortable: 'system_count',
  props: {
    width: 30,
  },
  exportKey: 'system_count',
  renderFunc: renderComponent(SystemsCell),
};

export const Created = {
  title: 'Created',
  transforms: [fitContent],
  sortable: 'created_at',
  props: {
    width: 30,
  },
  exportKey: 'created_at',
  renderFunc: renderComponent(CreatedCell),
};

export const LastModified = {
  title: 'Last modified',
  transforms: [fitContent],
  sortable: 'updated_at',
  props: {
    width: 30,
  },
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

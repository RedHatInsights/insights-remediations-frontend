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

// eslint-disable-next-line react/display-name
export const renderComponent = (Component, props) => (_data, _id, entity) =>
  <Component {...entity} {...props} />;

export const Name = {
  title: 'Name',
  sortable: 'name',
  props: {
    width: 10,
  },
  exportKey: 'name',
  renderFunc: renderComponent(NameCell),
};

export const LastExecuted = {
  title: 'Last executed',
  sortable: 'LastExecuted',
  props: {
    width: 30,
  },
  exportKey: 'LastExecuted',
  renderFunc: renderComponent(LastExecutedCell),
};

export const ExecutionStatus = {
  title: 'Execution status',
  sortable: 'ExecutionStatus',
  props: {
    width: 30,
  },
  exportKey: 'ExecutionStatus',
  renderFunc: renderComponent(ExecutionStatusCell),
};

export const Actions = {
  title: 'Actions',
  sortable: 'Actions',
  props: {
    width: 30,
  },
  exportKey: 'Actions',
  renderFunc: renderComponent(ActionsCell),
};

export const Systems = {
  title: 'Systems',
  sortable: 'Systems',
  props: {
    width: 30,
  },
  exportKey: 'Systems',
  renderFunc: renderComponent(SystemsCell),
};

export const Created = {
  title: 'Created',
  sortable: 'Created',
  props: {
    width: 30,
  },
  exportKey: 'Created',
  renderFunc: renderComponent(CreatedCell),
};

export const LastModified = {
  title: 'Last modified',
  sortable: 'LastModified',
  props: {
    width: 30,
  },
  exportKey: 'LastModified',
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

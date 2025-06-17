import React from 'react';
import {
  ConnectionTypeCell,
  SystemsCell,
  ConnectionStatusCell,
} from './Cells.js';
import { wrappable } from '@patternfly/react-table';

// eslint-disable-next-line react/display-name
export const renderComponent = (Component, props) => (_data, _id, entity) =>
  <Component {...entity} {...props} />;

export const Systems = {
  title: 'Systems',
  transforms: [wrappable],
  sortable: 'system_count',
  exportKey: 'system_count',
  renderFunc: renderComponent(SystemsCell),
};

export const ConnectionType = {
  title: 'Connection type',
  transforms: [wrappable],
  exportKey: 'connection_type',
  renderFunc: renderComponent(ConnectionTypeCell),
};

export const ConnectionStatus = {
  title: 'Connection status',
  transforms: [wrappable],
  exportKey: 'connection_status',
  renderFunc: renderComponent(ConnectionStatusCell),
};
export default [ConnectionType, Systems, ConnectionStatus];

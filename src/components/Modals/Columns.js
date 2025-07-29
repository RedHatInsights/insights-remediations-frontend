import {
  ConnectionTypeCell,
  SystemsCell,
  ConnectionStatusCell,
} from './Cells.js';
import { wrappable } from '@patternfly/react-table';

export const Systems = {
  title: 'Systems',
  transforms: [wrappable],
  sortable: 'system_count',
  exportKey: 'system_count',
  Component: SystemsCell,
};

export const ConnectionType = {
  title: 'Connection type',
  transforms: [wrappable],
  exportKey: 'connection_type',
  Component: ConnectionTypeCell,
};

export const ConnectionStatus = {
  title: 'Connection status',
  transforms: [wrappable],
  exportKey: 'connection_status',
  Component: ConnectionStatusCell,
};
export default [ConnectionType, Systems, ConnectionStatus];

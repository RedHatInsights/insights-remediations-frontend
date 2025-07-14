import { wrappable } from '@patternfly/react-table';
import {
  SystemNameCell,
  InsightsConnectCell,
  ExecutionStatusCell,
} from './Cells';

export default [
  {
    title: 'System name',
    transforms: [wrappable],
    // sortable: 'action',
    exportKey: 'action',
    Component: SystemNameCell,
  },
  {
    title: 'Insights connection',
    transforms: [wrappable],
    // sortable: 'reboot',
    exportKey: 'reboot',
    Component: InsightsConnectCell,
  },
  {
    title: 'Execution status',
    transforms: [wrappable],
    // sortable: 'system_count',
    exportKey: 'system_count',
    Component: ExecutionStatusCell,
  },
];

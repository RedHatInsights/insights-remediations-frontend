import { wrappable } from '@patternfly/react-table';
import {
  SystemNameCell,
  InsightsConnectCell,
  ExecutionStatusCell,
} from './Cells';
import { renderComponent } from '../helpers';

export default [
  {
    title: 'System name',
    transforms: [wrappable],
    // sortable: 'action',
    exportKey: 'action',
    renderFunc: renderComponent(SystemNameCell),
  },
  {
    title: 'Insights connection',
    transforms: [wrappable],
    // sortable: 'reboot',
    exportKey: 'reboot',
    renderFunc: renderComponent(InsightsConnectCell),
  },
  {
    title: 'Execution status',
    transforms: [wrappable],
    // sortable: 'system_count',
    exportKey: 'system_count',
    renderFunc: renderComponent(ExecutionStatusCell),
  },
];

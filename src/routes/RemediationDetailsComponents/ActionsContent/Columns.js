import { wrappable } from '@patternfly/react-table';
import {
  ActionsCell,
  IssueTypeCell,
  SystemsCell,
  RebootRequiredCell,
} from './Cells';

export default [
  {
    title: 'Action',
    transforms: [wrappable],
    // sortable: 'action',
    exportKey: 'action',
    Component: ActionsCell,
    manageable: false,
  },
  {
    title: 'Reboot required',
    transforms: [wrappable],
    // sortable: 'reboot',
    exportKey: 'reboot',
    Component: RebootRequiredCell,
  },
  {
    title: 'Affected systems',
    transforms: [wrappable],
    // sortable: 'system_count',
    exportKey: 'system_count',
    Component: SystemsCell,
  },
  {
    title: 'Issue type',
    transforms: [wrappable],
    // sortable: 'type',
    exportKey: 'type',
    Component: IssueTypeCell,
  },
];

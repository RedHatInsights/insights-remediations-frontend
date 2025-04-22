import { wrappable } from '@patternfly/react-table';
import { renderComponent } from './helpers';
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
    renderFunc: renderComponent(ActionsCell),
  },
  {
    title: 'Reboot required',
    transforms: [wrappable],
    // sortable: 'reboot',
    exportKey: 'reboot',
    renderFunc: renderComponent(RebootRequiredCell),
  },
  {
    title: 'Affected systems',
    transforms: [wrappable],
    // sortable: 'system_count',
    exportKey: 'system_count',
    renderFunc: renderComponent(SystemsCell),
  },
  {
    title: 'Issue type',
    transforms: [wrappable],
    // sortable: 'type',
    exportKey: 'type',
    renderFunc: renderComponent(IssueTypeCell),
  },
];

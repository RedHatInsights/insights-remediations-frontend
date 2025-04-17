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
    sortable: 'action',
    exportKey: 'action',
    renderFunc: renderComponent(ActionsCell),
  },
  {
    title: 'Reboot Required',
    transforms: [wrappable],
    sortable: 'reboot',
    exportKey: 'reboot',
    renderFunc: renderComponent(RebootRequiredCell),
  },
  {
    title: 'Systems',
    transforms: [wrappable],
    sortable: 'system_count',
    exportKey: 'system_count',
    renderFunc: renderComponent(SystemsCell),
  },
  {
    title: 'Issue Type',
    transforms: [wrappable],
    sortable: 'type',
    exportKey: 'type',
    renderFunc: renderComponent(IssueTypeCell),
  },
];

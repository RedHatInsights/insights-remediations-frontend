import { wrappable } from '@patternfly/react-table';
import { renderComponent } from '../../helpers';
import {
  ActionsCell,
  IssueTypeCell,
  RebootRequiredCell,
} from '../../ActionsContent/Cells';

export default [
  {
    title: 'Action',
    transforms: [wrappable],
    exportKey: 'actions',
    renderFunc: renderComponent(ActionsCell),
  },
  {
    title: 'Reboot required',
    transforms: [wrappable],
    // sortable: 'type',
    exportKey: 'rebootrequired',
    renderFunc: renderComponent(RebootRequiredCell),
  },
  {
    title: 'Type',
    transforms: [wrappable],
    // sortable: 'type',
    exportKey: 'actionCount',
    renderFunc: renderComponent(IssueTypeCell),
  },
];

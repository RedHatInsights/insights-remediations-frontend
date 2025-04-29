import { wrappable } from '@patternfly/react-table';
import { renderComponent } from '../helpers';
import {
  ActionsCell,
  NameCell,
  TagsCell,
  RebootRequiredCell,
  OSCell,
  ConnectionStatusCell,
} from './Cells';

export default [
  {
    title: 'Name',
    transforms: [wrappable],
    // sortable: 'action',
    exportKey: 'name',
    renderFunc: renderComponent(NameCell),
  },
  {
    title: 'Tags',
    transforms: [wrappable],
    // sortable: 'reboot',
    exportKey: 'tags',
    renderFunc: renderComponent(TagsCell),
  },
  {
    title: 'OS',
    transforms: [wrappable],
    // sortable: 'system_count',
    exportKey: 'os',
    renderFunc: renderComponent(OSCell),
  },
  {
    title: 'Actions',
    transforms: [wrappable],
    // sortable: 'type',
    exportKey: 'actionCount',
    renderFunc: renderComponent(ActionsCell),
  },
  {
    title: 'Reboot required',
    transforms: [wrappable],
    // sortable: 'type',
    exportKey: 'type',
    renderFunc: renderComponent(RebootRequiredCell),
  },
  {
    title: 'Connection status',
    transforms: [wrappable],
    // sortable: 'type',
    exportKey: 'connection_status',
    renderFunc: renderComponent(ConnectionStatusCell),
  },
];

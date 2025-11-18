import { wrappable } from '@patternfly/react-table';
import { IssueNameCell, RebootCell, TypeCell } from './Cells';

export default [
  {
    title: 'Action',
    transforms: [wrappable],
    exportKey: 'description',
    Component: IssueNameCell,
  },
  {
    title: 'Reboot required',
    transforms: [wrappable],
    exportKey: 'needs_reboot',
    Component: RebootCell,
  },
  {
    title: 'Type',
    transforms: [wrappable],
    exportKey: 'id',
    Component: TypeCell,
  },
];

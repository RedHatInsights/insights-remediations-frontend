import { wrappable } from '@patternfly/react-table';
import { SystemNameCell } from './Cells';

export default [
  {
    title: 'Name',
    transforms: [wrappable],
    exportKey: 'display_name',
    Component: SystemNameCell,
  },
];

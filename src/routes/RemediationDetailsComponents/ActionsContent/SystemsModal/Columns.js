import { wrappable } from '@patternfly/react-table';
import { SystemNameCell } from './Cells';
import { renderComponent } from '../../helpers';

export default [
  {
    title: 'Name',
    transforms: [wrappable],
    exportKey: 'name',
    renderFunc: renderComponent(SystemNameCell),
  },
];

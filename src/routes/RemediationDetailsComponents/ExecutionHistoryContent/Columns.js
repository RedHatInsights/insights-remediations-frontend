import { wrappable } from '@patternfly/react-table';
import {
  SystemNameCell,
  RedHatLightSpeedCell,
  ExecutionStatusCell,
} from './Cells';

const useColumns = () => {
  return [
    {
      title: 'System name',
      transforms: [wrappable],
      // sortable: 'action',
      exportKey: 'action',
      Component: SystemNameCell,
    },
    {
      title: 'Red Hat Lightspeed connection',
      transforms: [wrappable],
      // sortable: 'reboot',
      exportKey: 'reboot',
      Component: RedHatLightSpeedCell,
    },
    {
      title: 'Execution status',
      transforms: [wrappable],
      // sortable: 'system_count',
      exportKey: 'system_count',
      Component: ExecutionStatusCell,
    },
  ];
};

export default useColumns;

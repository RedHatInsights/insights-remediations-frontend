import { wrappable } from '@patternfly/react-table';
import {
  SystemNameCell,
  RedHatLightSpeedCell,
  ExecutionStatusCell,
} from './Cells';

/** Default API `sort` for playbook run systems; must match TableTools default (column 0 asc). */
export const RUN_SYSTEMS_DEFAULT_SORT = 'system_name';

const useColumns = () => {
  return [
    {
      title: 'System name',
      transforms: [wrappable],
      sortable: RUN_SYSTEMS_DEFAULT_SORT,
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

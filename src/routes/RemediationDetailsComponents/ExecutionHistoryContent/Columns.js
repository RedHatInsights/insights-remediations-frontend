import { wrappable } from '@patternfly/react-table';
import {
  SystemNameCell,
  InsightsConnectCell,
  RedHatLightSpeedCell,
  ExecutionStatusCell,
} from './Cells';
import { useFeatureFlag } from '../../../Utilities/Hooks/useFeatureFlag';

const useColumns = () => {
  const isLightspeedRebrandEnabled = useFeatureFlag(
    'platform.lightspeed-rebrand',
  );

  return [
    {
      title: 'System name',
      transforms: [wrappable],
      // sortable: 'action',
      exportKey: 'action',
      Component: SystemNameCell,
    },
    {
      title: isLightspeedRebrandEnabled
        ? 'Red Hat Lightspeed connection'
        : 'Insights connection',
      transforms: [wrappable],
      // sortable: 'reboot',
      exportKey: 'reboot',
      Component: isLightspeedRebrandEnabled
        ? RedHatLightSpeedCell
        : InsightsConnectCell,
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

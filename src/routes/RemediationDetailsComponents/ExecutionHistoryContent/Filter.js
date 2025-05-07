import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

export const systemFilter = [
  {
    type: conditionalFilterType.text,
    label: 'System',
    placeholder: 'Search',
    filterAttribute: 'description',
  },
];

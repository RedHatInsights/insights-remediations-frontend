import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

export const actionNameFilter = [
  {
    type: conditionalFilterType.text,
    label: 'Name',
    placeholder: 'Filter by actions',
    filterAttribute: 'description',
  },
];

export const systemNameFilter = [
  {
    type: conditionalFilterType.text,
    label: 'Name',
    placeholder: 'Filter by systems',
    filterAttribute: 'description',
  },
];

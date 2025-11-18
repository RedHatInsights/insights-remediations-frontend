import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

export const actionNameFilter = [
  {
    id: 'id',
    type: conditionalFilterType.text,
    label: 'Name',
    placeholder: 'Filter by action ID',
    filterAttribute: 'id',
  },
];

export const actionsSystemFilter = [
  {
    id: 'display_name',
    type: conditionalFilterType.text,
    label: 'Name',
    placeholder: 'Filter by actions',
    filterAttribute: 'display_name',
  },
];

export const systemNameFilter = [
  {
    id: 'description',
    type: conditionalFilterType.text,
    label: 'Name',
    placeholder: 'Filter by systems',
    filterAttribute: 'description',
  },
];

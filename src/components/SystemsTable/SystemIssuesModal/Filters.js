import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

export const issueNameFilter = [
  {
    type: conditionalFilterType.text,
    label: 'Name',
    placeholder: 'Filter by action',
    filterAttribute: 'description',
  },
];

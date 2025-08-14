import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

export const remediationNameFilter = [
  {
    type: conditionalFilterType.text,
    label: 'Name',
    placeholder: 'Search',
    filterAttribute: 'name',
  },
];

export const stringToId = (string) => string.split(' ').join('').toLowerCase();

//Make sure its converted to UTC
const subtractMinutes = (minutes) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();
const subtractHours = (hours) => subtractMinutes(hours * 60);
const subtractDays = (days) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export const LastExecutedFilter = [
  {
    type: conditionalFilterType.singleSelect,
    label: 'Last executed',
    filterAttribute: 'last_run_after',

    items: [
      { label: 'Last hour', value: subtractHours(1) },
      { label: 'Last 24 hours', value: subtractHours(24) },
      { label: 'Last week', value: subtractDays(7) },
      { label: 'Last 30 days', value: subtractDays(30) },
      { label: 'Last 90 days', value: subtractDays(90) },
      { label: 'Last year', value: subtractDays(365) },
      { label: 'Never', value: 'never' },
    ],
  },
];

export const LastModifiedFilter = [
  {
    type: conditionalFilterType.singleSelect,
    label: 'Last modified',
    filterAttribute: 'updated_after',
    items: [
      { label: 'Last hour', value: subtractHours(1) },
      { label: 'Last 24 hours', value: subtractHours(24) },
      { label: 'Last week', value: subtractDays(7) },
      { label: 'Last 30 days', value: subtractDays(30) },
      { label: 'Last 90 days', value: subtractDays(90) },
      { label: 'Last year', value: subtractDays(365) },
    ],
  },
];

export const ExecutionStatusFilter = [
  {
    type: conditionalFilterType.singleSelect,
    label: 'Execution status',
    filterAttribute: 'status',
    items: [
      { label: 'Succeeded', value: 'success' },
      { label: 'In progress', value: 'running' },
      { label: 'Failed', value: 'failure' },
    ],
  },
];

export const CreatedByFilter = [
  {
    type: 'calendar',
    label: 'Created',
    filterAttribute: 'created_after',
  },
];

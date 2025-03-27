import React from 'react';
import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';
import { CalanderFilter } from './CalendarFilter';

export const remediationNameFilter = [
  {
    type: conditionalFilterType.text,
    label: 'Name',
    placeholder: 'Search',
    filterAttribute: 'name',
  },
];

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

export const ExecutionStatusFilter = [
  {
    type: conditionalFilterType.checkbox,
    label: 'Execution status',
    filterAttribute: 'status',
    items: [
      { label: 'Succeeded', value: 'success' },
      { label: 'In progress', value: 'running' },
      { label: 'Failed', value: 'failure' },
      { label: 'Timed out', value: 'timeout' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
];

//TODO: custom PF Calander
export const CreatedFilter = (onChange, value) => {
  return [
    {
      type: conditionalFilterType.custom,
      label: 'Created By',
      value,
      filterValues: {
        children: (
          <>
            <CalanderFilter onChange={onChange} />
          </>
        ),
      },
    },
  ];
};

export const LastModified = [
  {
    type: conditionalFilterType.text,
    label: 'Last modified	',
    filterAttribute: 'updated_after',
  },
];

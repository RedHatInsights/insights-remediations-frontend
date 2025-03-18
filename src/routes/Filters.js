import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

export const remediationNameFilter = [
  {
    type: conditionalFilterType.text,
    label: 'Remediation',
    filterAttribute: 'name',
  },
];

export const LastExecutedFilter = [
  {
    type: conditionalFilterType.text,
    label: 'Last Executed',
    filterAttribute: 'last_run_after',
  },
];

export const ExecutionStatusFilter = [
  {
    type: conditionalFilterType.checkbox,
    label: 'Execution Status',
    filterAttribute: 'status',
    items: ['running', 'success', 'failure', 'timeout', 'cancelled'].map(
      (value) => ({ label: value, value })
    ),
  },
];

export const ActionsFilter = [
  {
    type: conditionalFilterType.text,
    label: 'Last Executed',
    filterAttribute: 'LastExecuted',
  },
];

export const SystemsFilter = [
  {
    type: conditionalFilterType.text,
    label: 'Last Executed',
    filterAttribute: 'LastExecuted',
  },
];

export const CreatedFilter = [
  {
    type: conditionalFilterType.text,
    label: 'Last Executed',
    filterAttribute: 'LastExecuted',
  },
];

export const LastModified = [
  {
    type: conditionalFilterType.text,
    label: 'Last Executed',
    filterAttribute: 'LastExecuted',
  },
];

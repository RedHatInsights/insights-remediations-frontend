export const RETENTION_PERIOD_OPTIONS = [
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '2 months' },
  { value: 90, label: '3 months' },
  { value: 120, label: '4 months' },
  { value: 150, label: '5 months' },
  { value: 180, label: '6 months' },
];

export const EXPIRATION_WARNING_OPTIONS = [
  { value: 3, label: '3 days' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '2 months' },
  { value: 90, label: '3 months' },
  { value: 120, label: '4 months' },
  { value: 150, label: '5 months' },
];

export const DEFAULT_RETENTION_DAYS = 120;
export const DEFAULT_WARNING_DAYS = 30;

const ALL_DURATION_OPTIONS = [
  ...RETENTION_PERIOD_OPTIONS,
  ...EXPIRATION_WARNING_OPTIONS,
];

export const formatDuration = (days) => {
  const match = ALL_DURATION_OPTIONS.find((option) => option.value === days);
  return match?.label ?? `${days} days`;
};

export const getValidWarningOptions = (retentionDays) =>
  EXPIRATION_WARNING_OPTIONS.filter((option) => option.value < retentionDays);

export const normalizeRetentionDays = (days) =>
  RETENTION_PERIOD_OPTIONS.find((option) => option.value === days)?.value ??
  DEFAULT_RETENTION_DAYS;

export const normalizeWarningDays = (days, retentionDays) => {
  const validOptions = getValidWarningOptions(retentionDays);
  const match = validOptions.find((option) => option.value === days);
  return match?.value ?? validOptions.at(-1)?.value ?? DEFAULT_WARNING_DAYS;
};

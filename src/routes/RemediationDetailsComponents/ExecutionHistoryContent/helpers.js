import { capitalize } from '../../../Utilities/utils';

export const formatUtc = (iso) => {
  // Ex: 29 Apr 2025 18:00
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const MMM = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const YYYY = d.getUTCFullYear();
  const HH = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dd} ${MMM} ${YYYY} ${HH}:${mm} UTC`;
};

export const formatConnectionType = (executor_type) => {
  if (!executor_type || typeof executor_type !== 'string') return '';
  const polished_executor_type = capitalize(executor_type.trim());
  return `${polished_executor_type} connected`;
};

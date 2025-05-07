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

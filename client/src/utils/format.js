export const formatDate = (value, lang) =>
  value ? new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '';

export const formatNumber = (value, lang, digits = 1) =>
  new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', { maximumFractionDigits: digits }).format(value ?? 0);

export function formatDuration(start, end) {
  const ms = Math.max(0, new Date(end ?? Date.now()) - new Date(start));
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function dateLabel(date: string, monthOnly = false) {
  return new Intl.DateTimeFormat(
    'en-GB',
    monthOnly
      ? { month: 'short', year: 'numeric', timeZone: 'UTC' }
      : { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
  ).format(new Date(date.length === 7 ? date + '-01T00:00:00Z' : date + 'T00:00:00Z'));
}

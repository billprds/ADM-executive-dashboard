export function parseISO(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function fmtDate(s: string | null | undefined): string {
  const d = parseISO(s);
  if (!d) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function fmtDateTime(s: string): string {
  const d = new Date(s);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

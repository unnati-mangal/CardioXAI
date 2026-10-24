/**
 * Pure formatting helpers — no side effects, no imports.
 */

/** Format an ISO date string to a readable local date (e.g. "14 Jan 2025") */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}

/** Format an ISO date string to a readable local date+time */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
    hour:  '2-digit',
    minute:'2-digit',
  });
}

/**
 * Convert a risk probability (0–1) to a colour-coded label.
 * Thresholds are illustrative — they will be calibrated in the ML phase.
 */
export function formatRiskLabel(prob: number): { label: string; level: 'low' | 'moderate' | 'high' } {
  if (prob < 0.10) return { label: 'Low Risk',      level: 'low'      };
  if (prob < 0.20) return { label: 'Moderate Risk', level: 'moderate' };
  return             { label: 'High Risk',     level: 'high'     };
}

/** Convert a camelCase or snake_case field key to a readable label */
export function formatFieldLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Format a sex code (0/1) to a readable string */
export function formatSex(sex: number): string {
  return sex === 1 ? 'Male' : 'Female';
}

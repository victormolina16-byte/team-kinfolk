import { describe, it, expect } from 'vitest';
import { formatTime } from '../app.js';

describe('formatTime', () => {
  it('formats a valid ISO timestamp as a 12-hour time', () => {
    const out = formatTime('2026-06-18T14:32:00');
    // Locale/timezone-dependent, but should be a "h:mm AM/PM" shape, never raw ISO.
    expect(out).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/);
  });

  it('returns the em-dash placeholder for missing input', () => {
    expect(formatTime('')).toBe('—');
    expect(formatTime(undefined)).toBe('—');
    expect(formatTime(null)).toBe('—');
  });

  it('returns the em-dash placeholder for unparseable input instead of "Invalid Date"', () => {
    expect(formatTime('not-a-date')).toBe('—');
  });
});

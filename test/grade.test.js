import { describe, it, expect } from 'vitest';
import { gradeClass } from '../app.js';

describe('gradeClass', () => {
  it('maps known grades to their lowercase class suffix', () => {
    expect(gradeClass('A')).toBe('a');
    expect(gradeClass('B')).toBe('b');
    expect(gradeClass('C')).toBe('c');
    expect(gradeClass('D')).toBe('d');
  });

  it('falls back to "c" (amber) for unknown or missing grades', () => {
    expect(gradeClass('Z')).toBe('c');
    expect(gradeClass('')).toBe('c');
    expect(gradeClass(undefined)).toBe('c');
  });
});

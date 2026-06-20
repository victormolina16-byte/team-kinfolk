import { describe, it, expect } from 'vitest';
import { edgeClass } from '../app.js';

// Regression coverage for the live bug: the old logic
//   edgePositive = play.edgeGap && !play.edgeGap.startsWith('-')
// treated the em-dash placeholder "—" as a POSITIVE edge (truthy, no leading
// '-'), painting no-edge plays green. edgeClass() must treat "—" as neutral.
describe('edgeClass', () => {
  it('classifies an explicit positive edge as positive', () => {
    expect(edgeClass('+1.3')).toBe('positive');
  });

  it('classifies an explicit negative edge as negative', () => {
    expect(edgeClass('-0.7')).toBe('negative');
  });

  it('treats the em-dash placeholder as neutral (no class)', () => {
    expect(edgeClass('—')).toBe('');
  });

  it('treats empty string as neutral', () => {
    expect(edgeClass('')).toBe('');
  });

  it('treats non-string input as neutral', () => {
    expect(edgeClass(undefined)).toBe('');
    expect(edgeClass(null)).toBe('');
    expect(edgeClass(1.3)).toBe('');
  });
});

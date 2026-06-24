import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Ajv from 'ajv';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const load = (rel) => JSON.parse(readFileSync(join(root, rel), 'utf8'));

const schema = load('schema/slate.schema.json');
const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
const validate = ajv.compile(schema);

describe('slate.json data contract', () => {
  it('the committed slate.json conforms to the schema', () => {
    const valid = validate(load('slate.json'));
    if (!valid) console.error(validate.errors);
    expect(valid).toBe(true);
  });
});

describe('schema rejects known drift / invalid slates', () => {
  const base = {
    date: 'June 19, 2026',
    updatedAt: '2026-06-19T16:56:23',
    plays: [
      { rank: 1, grade: 'A', pitcher: 'X', team: 'CIN', opponent: 'NYY', prop: 'BB', direction: 'OVER', cbProjection: 4.2 },
    ],
  };

  it('rejects a slate missing required top-level keys', () => {
    expect(validate({ plays: [] })).toBe(false);
  });

  it('rejects grade C/D (eliminated from the pipeline)', () => {
    const bad = structuredClone(base);
    bad.plays[0].grade = 'C';
    expect(validate(bad)).toBe(false);
  });

  it('rejects a play missing a required field (pitcher)', () => {
    const bad = structuredClone(base);
    delete bad.plays[0].pitcher;
    expect(validate(bad)).toBe(false);
  });

  it('rejects an unknown prop value', () => {
    const bad = structuredClone(base);
    bad.plays[0].prop = 'Saves';
    expect(validate(bad)).toBe(false);
  });

  it('accepts both abbreviated and full prop names', () => {
    for (const prop of ['BB', 'ER', 'K', 'HA', 'Outs', 'Walks', 'Earned Runs', 'Strikeouts', 'Hits Allowed']) {
      const ok = structuredClone(base);
      ok.plays[0].prop = prop;
      expect(validate(ok), `prop=${prop}`).toBe(true);
    }
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bootstrap, DEMO_SLATE } from '../app.js';
import { mountSkeleton, $ } from './helpers/dom.js';

const okResponse = (data) => ({ ok: true, status: 200, json: () => Promise.resolve(data) });
const errResponse = (status) => ({ ok: false, status, json: () => Promise.resolve({}) });

const realSlate = {
  date: 'June 19, 2026',
  updatedAt: '2026-06-19T16:56:23',
  plays: [
    { rank: 1, grade: 'A', pitcher: 'Rhett Lowder', team: 'CIN', opponent: 'NYY', prop: 'BB', line: '—', direction: 'OVER', cbProjection: 4.2, edgeGap: '—', odds: '—', trends: '—', splits: '—' },
  ],
};

beforeEach(() => mountSkeleton());

describe('bootstrap', () => {
  it('renders a pre-injected KINFOLK_SLATE without fetching', async () => {
    const fetch = vi.fn();
    const scope = { KINFOLK_SLATE: realSlate, fetch };
    const result = await bootstrap(scope);

    expect(fetch).not.toHaveBeenCalled();
    expect(result).toBe(realSlate);
    expect($('slateDate').textContent).toBe('June 19, 2026');
    expect(typeof scope.loadSlate).toBe('function');
  });

  it('fetches and renders slate.json on a successful response', async () => {
    const fetch = vi.fn(() => Promise.resolve(okResponse(realSlate)));
    const result = await bootstrap({ fetch });

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0]).toMatch(/^slate\.json\?t=\d+/);
    expect(result).toBe(realSlate);
    expect($('slateDate').textContent).toBe('June 19, 2026');
  });

  it('falls back to DEMO_SLATE on a non-2xx response (404)', async () => {
    const fetch = vi.fn(() => Promise.resolve(errResponse(404)));
    const result = await bootstrap({ fetch });
    expect(result).toBe(DEMO_SLATE);
  });

  it('falls back to DEMO_SLATE on a 500 response', async () => {
    const fetch = vi.fn(() => Promise.resolve(errResponse(500)));
    const result = await bootstrap({ fetch });
    expect(result).toBe(DEMO_SLATE);
  });

  it('falls back to DEMO_SLATE on a network error', async () => {
    const fetch = vi.fn(() => Promise.reject(new Error('network down')));
    const result = await bootstrap({ fetch });
    expect(result).toBe(DEMO_SLATE);
  });

  it('falls back to DEMO_SLATE on malformed JSON', async () => {
    const fetch = vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError('bad json')),
    }));
    const result = await bootstrap({ fetch });
    expect(result).toBe(DEMO_SLATE);
  });

  it('falls back to DEMO_SLATE when no fetch is available', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = undefined; // also exercises the no-global-fetch guard
    try {
      const result = await bootstrap({});
      expect(result).toBe(DEMO_SLATE);
    } finally {
      globalThis.fetch = original;
    }
  });
});

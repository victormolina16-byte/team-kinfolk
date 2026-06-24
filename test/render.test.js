import { describe, it, expect, beforeEach } from 'vitest';
import { renderSlate } from '../app.js';
import { mountSkeleton, $ } from './helpers/dom.js';

const play = (overrides = {}) => ({
  rank: 1,
  grade: 'A',
  pitcher: 'Zack Wheeler',
  team: 'PHI',
  opponent: 'NYM',
  prop: 'Strikeouts',
  line: 6.5,
  direction: 'Over',
  cbProjection: 7.8,
  edgeGap: '+1.3',
  odds: '-112',
  trends: 'trend text',
  splits: 'split text',
  ...overrides,
});

beforeEach(() => mountSkeleton());

describe('renderSlate — header', () => {
  it('renders date, timestamp, play count and grade breakdown', () => {
    renderSlate({
      date: 'June 18, 2026',
      updatedAt: '2026-06-18T14:32:00',
      plays: [play({ grade: 'A' }), play({ rank: 2, grade: 'A' }), play({ rank: 3, grade: 'B' })],
    });

    expect($('slateDate').textContent).toBe('June 18, 2026');
    expect($('timestamp').textContent).toMatch(/^Updated /);
    expect($('playCount').textContent).toBe('3 plays');
    expect($('gradeBreakdown').textContent).toBe('2A · 1B');
  });

  it('omits grades with zero plays from the breakdown', () => {
    renderSlate({ date: 'x', updatedAt: '', plays: [play({ grade: 'B' })] });
    expect($('gradeBreakdown').textContent).toBe('1B');
  });
});

describe('renderSlate — cards', () => {
  it('emits one section label per contiguous grade group', () => {
    renderSlate({
      date: 'x',
      updatedAt: '',
      plays: [
        play({ rank: 1, grade: 'A' }),
        play({ rank: 2, grade: 'A' }),
        play({ rank: 3, grade: 'B' }),
      ],
    });
    const labels = [...document.querySelectorAll('.section-label')].map((n) => n.textContent);
    expect(labels).toEqual(['Grade A', 'Grade B']);
    expect(document.querySelectorAll('.card').length).toBe(3);
  });

  it('renders a no-edge "—" without the positive (green) class', () => {
    renderSlate({ date: 'x', updatedAt: '', plays: [play({ edgeGap: '—' })] });
    const edgeCell = document.querySelectorAll('.stat-value')[2];
    expect(edgeCell.textContent).toBe('—');
    expect(edgeCell.classList.contains('positive')).toBe(false);
    expect(edgeCell.classList.contains('negative')).toBe(false);
  });

  it('renders a positive edge with the positive class', () => {
    renderSlate({ date: 'x', updatedAt: '', plays: [play({ edgeGap: '+1.3' })] });
    const edgeCell = document.querySelectorAll('.stat-value')[2];
    expect(edgeCell.classList.contains('positive')).toBe(true);
  });
});

describe('renderSlate — empty / malformed', () => {
  it('shows 0 plays and renders no cards for an empty plays array', () => {
    renderSlate({ date: 'x', updatedAt: '', plays: [] });
    expect($('playCount').textContent).toBe('0 plays');
    expect(document.querySelectorAll('.card').length).toBe(0);
  });

  it('does not throw when plays is missing', () => {
    expect(() => renderSlate({ date: 'x', updatedAt: '' })).not.toThrow();
    expect($('playCount').textContent).toBe('0 plays');
  });

  it('does not throw when called with no slate', () => {
    expect(() => renderSlate(undefined)).not.toThrow();
  });
});

describe('renderSlate — text fields (characterization)', () => {
  // DELIBERATE: trends/splits are interpolated as raw HTML so the pipeline can
  // emit inline <span class="hot">/<span class="warn"> markup (see CSS in
  // index.html). Data is trusted (Victor's own pipeline). This test pins that
  // behavior so any future change to escaping is a conscious decision.
  it('passes through inline markup in trends/splits unescaped', () => {
    renderSlate({
      date: 'x',
      updatedAt: '',
      plays: [play({ trends: '<span class="hot">4 of 5 Over</span>' })],
    });
    const trendValue = document.querySelectorAll('.info-value')[0];
    expect(trendValue.querySelector('span.hot')).not.toBeNull();
  });
});

// ── Team Kinfolk — slate rendering logic ─────────────────────────
// Extracted from index.html so the logic is importable + testable.
// Loads in the browser as a plain <script>, and exports for tests via
// CommonJS at the bottom. No build step.
//
// Data shape (see CLAUDE.md for the full contract):
// {
//   date: "June 17, 2026",
//   updatedAt: "2026-06-17T14:32:00",
//   plays: [
//     {
//       rank: 1,
//       grade: "A",           // A | B
//       pitcher: "Zack Wheeler",
//       team: "PHI",
//       opponent: "NYM",
//       prop: "Strikeouts",
//       line: 6.5,
//       direction: "Over",    // Over | Under
//       cbProjection: 7.8,
//       edgeGap: "+1.3",      // string with explicit sign
//       odds: "-115",
//       trends: "...",
//       splits: "..."
//     }
//   ]
// }

const DEMO_SLATE = {
  date: "June 17, 2026",
  updatedAt: new Date().toISOString(),
  plays: [
    {
      rank: 1,
      grade: "A",
      pitcher: "Zack Wheeler",
      team: "PHI",
      opponent: "NYM",
      prop: "Strikeouts",
      line: 6.5,
      direction: "Over",
      cbProjection: 7.8,
      edgeGap: "+1.3",
      odds: "-112",
      trends: "4 of last 5 Over. Averaging 7.2 K over last 3 starts.",
      splits: "vs RHH: .198 BA. Strikeout rate up 8% at home."
    },
    {
      rank: 2,
      grade: "A",
      pitcher: "Corbin Burnes",
      team: "ARI",
      opponent: "COL",
      prop: "Outs",
      line: 17.5,
      direction: "Over",
      cbProjection: 19.2,
      edgeGap: "+1.7",
      odds: "+102",
      trends: "Hit Over in 3 straight. Deep into games vs. weak lineups.",
      splits: "vs COL this season: 19 outs avg. Coors neutral — dome game."
    },
    {
      rank: 3,
      grade: "B",
      pitcher: "Logan Gilbert",
      team: "SEA",
      opponent: "OAK",
      prop: "Strikeouts",
      line: 5.5,
      direction: "Over",
      cbProjection: 6.9,
      edgeGap: "+1.4",
      odds: "-118",
      trends: "3 of last 4 Over. Elevated K rate last 2 weeks.",
      splits: "OAK K% 24.1 vs RHP this month — top-5 strikeout team."
    },
    {
      rank: 4,
      grade: "C",
      pitcher: "Marcus Stroman",
      team: "CHC",
      opponent: "MIL",
      prop: "Hits Allowed",
      line: 5.5,
      direction: "Under",
      cbProjection: 4.8,
      edgeGap: "-0.7",
      odds: "-105",
      trends: "Under in 2 of last 3. GB-heavy profile limits extra-base damage.",
      splits: "MIL .261 BA vs RHP — moderate. Monitor lineup card."
    },
    {
      rank: 5,
      grade: "D",
      pitcher: "Chad Kuhl",
      team: "COL",
      opponent: "LAD",
      prop: "Walks",
      line: 2.5,
      direction: "Under",
      cbProjection: 3.4,
      edgeGap: "+0.9",
      odds: "+108",
      trends: "Walk rate spiking — 4+ in 2 of last 3. No edge confirmed.",
      splits: "LAD patient lineup: 4th in BB drawn vs RHP. High risk."
    }
  ]
};

// ── RENDER ───────────────────────────────────────────────────────
function gradeClass(g) {
  return { A: 'a', B: 'b', C: 'c', D: 'd' }[g] || 'c';
}

function formatTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Classify an edgeGap string into the stat-cell color class.
// edgeGap is a signed string ("+1.3" / "-0.7"). Non-numeric placeholders
// like "—" are neutral and must NOT be styled as a positive edge.
function edgeClass(edgeGap) {
  if (typeof edgeGap !== 'string') return '';
  if (edgeGap.startsWith('-')) return 'negative';
  if (edgeGap.startsWith('+')) return 'positive';
  return '';
}

function renderSlate(slate) {
  const plays = (slate && slate.plays) || [];
  const container = document.getElementById('slateContainer');

  document.getElementById('slateDate').textContent = (slate && slate.date) || '—';
  document.getElementById('timestamp').textContent = (slate && slate.updatedAt)
    ? 'Updated ' + formatTime(slate.updatedAt)
    : '—';

  const counts = { A: 0, B: 0, C: 0, D: 0 };
  plays.forEach(p => counts[p.grade] = (counts[p.grade] || 0) + 1);
  document.getElementById('playCount').innerHTML = `<strong>${plays.length}</strong> plays`;

  const breakdown = ['A', 'B', 'C', 'D']
    .filter(g => counts[g] > 0)
    .map(g => `<strong>${counts[g]}${g}</strong>`)
    .join(' · ');
  document.getElementById('gradeBreakdown').innerHTML = breakdown;

  if (!plays.length) return;

  let html = '';
  let lastGrade = null;

  plays.forEach(play => {
    const g = gradeClass(play.grade);

    if (play.grade !== lastGrade) {
      html += `<div class="section-label">Grade ${play.grade}</div>`;
      lastGrade = play.grade;
    }

    html += `
      <div class="card">
        <div class="card-accent accent-${g}"></div>
        <div class="card-inner">

          <div class="card-top">
            <div class="rank">${play.rank}</div>
            <div class="pitcher-name">${play.pitcher}</div>
            <div class="grade-badge badge-${g}">${play.grade}</div>
          </div>

          <div class="card-sub">
            <div class="prop-tag">${play.prop}</div>
            <div class="matchup">${play.team} vs ${play.opponent} · ${play.direction} ${play.line} · ${play.odds}</div>
          </div>

          <div class="stats-grid">
            <div class="stat-cell">
              <div class="stat-label">CB Proj</div>
              <div class="stat-value">${play.cbProjection}</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">Line</div>
              <div class="stat-value">${play.line}</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">Edge</div>
              <div class="stat-value ${edgeClass(play.edgeGap)}">${play.edgeGap}</div>
            </div>
          </div>

          <div class="card-bottom">
            <div class="info-row">
              <div class="info-label">Trends</div>
              <div class="info-value">${play.trends}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Splits</div>
              <div class="info-value">${play.splits}</div>
            </div>
          </div>

        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ── BOOTSTRAP ────────────────────────────────────────────────────
// Resolve the slate to render: pre-injected window.KINFOLK_SLATE wins,
// otherwise fetch slate.json (cache-busted), falling back to DEMO_SLATE
// on any error (non-2xx, network failure, malformed JSON).
function bootstrap(scope) {
  const w = scope || (typeof window !== 'undefined' ? window : {});
  w.loadSlate = renderSlate;

  if (w.KINFOLK_SLATE) {
    renderSlate(w.KINFOLK_SLATE);
    return Promise.resolve(w.KINFOLK_SLATE);
  }

  const fetchFn = w.fetch || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchFn) {
    renderSlate(DEMO_SLATE);
    return Promise.resolve(DEMO_SLATE);
  }

  return fetchFn('slate.json?t=' + Date.now())
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => { renderSlate(data); return data; })
    .catch(() => { renderSlate(DEMO_SLATE); return DEMO_SLATE; });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEMO_SLATE, gradeClass, formatTime, edgeClass, renderSlate, bootstrap };
}

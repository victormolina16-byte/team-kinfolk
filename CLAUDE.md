# Team Kinfolk — MLB Prop Slate PWA

Progressive Web App that displays Victor's daily MLB pitcher prop plays, ranked by grade (A/B), pushed from the local pipeline after each game window.

Live: `https://victormolina16-byte.github.io/team-kinfolk`
Repo: `github.com/victormolina16-byte/team-kinfolk`

---

## What this repo is

A single-page PWA (installable on iPhone via Safari → Add to Home Screen) that renders a dark-themed card list of today's MLB prop plays. Data is pushed here from Victor's local pipeline after each game window's `/grade` or `/edges` run.

The pipeline lives on the local machine — this repo is display-only. The pipeline pushes `slate.json` here; the frontend fetches it and renders cards.

---

## File structure

```
team-kinfolk/
├── index.html      — the entire PWA (one file, no build step)
├── manifest.json   — PWA manifest (name: "Team Kinfolk", icons, theme)
├── slate.json      — live play data, pushed by push_to_pwa.py after each window
├── icon-192.png    — PWA icon
├── icon-512.png    — PWA icon (large)
└── CLAUDE.md       — this file
```

---

## Data flow

```
edges_latest.json                       (local: ~/Downloads/mlb-props/)
    ↓
python3 push_to_pwa.py                  (local: ~/Downloads/mlb-props/)
    ↓
slate.json  →  GitHub repo  →  GitHub Pages
    ↓
index.html fetches slate.json at runtime and renders cards
```

Push script: `~/Downloads/mlb-props/push_to_pwa.py`
GitHub token: macOS Keychain key `kinfolk-github` (never hardcode)

To push a new slate manually:
```bash
cd ~/Downloads/mlb-props
python3 push_to_pwa.py
```

---

## slate.json format

```json
{
  "date": "June 18, 2026",
  "updatedAt": "2026-06-18T14:32:00",
  "plays": [
    {
      "rank": 1,
      "grade": "A",
      "pitcher": "Zack Wheeler",
      "team": "PHI",
      "opponent": "NYM",
      "prop": "Strikeouts",
      "line": 6.5,
      "direction": "Over",
      "cbProjection": 7.8,
      "edgeGap": "+1.3",
      "odds": "-115",
      "trends": "4 of last 5 Over. 7.2 K avg last 3 starts.",
      "splits": "vs RHH: .198 BA. Home K rate up 8%."
    }
  ]
}
```

Props: `Strikeouts` | `Hits Allowed` | `Walks` | `Earned Runs` | `Outs`
Grades: `A` (best) | `B` — Grade C eliminated from pipeline, never appears
Direction: `Over` | `Under`
edgeGap: string with explicit sign ("+1.3", "-0.7")

---

## Design system

**Colors (CSS variables in index.html):**
```
--bg:       #0d0d0d    background
--surface:  #161616    card background
--surface-2:#1e1e1e    stat cells
--border:   #2a2a2a    borders
--text:     #e8e8e8    primary text
--muted:    #999       secondary text
--dim:      #6a6a6a    labels

--grade-a:  #00e676    A plays (bright green)
--grade-b:  #69f0ae    B plays (light green)
--grade-c:  #ffca28    (reserved, not used)
--grade-d:  #ef5350    (reserved, not used)
```

**Fonts:** IBM Plex Mono (monospace, headers/labels/numbers) + Inter (sans, body)

**Card structure:** colored left-accent bar → pitcher name + grade badge → prop tag + matchup line → 3-cell stats grid (CB Proj / Line / Edge) → Trends + Splits rows

---

## How the PWA loads data

`index.html` fetches `slate.json` at init with a cache-bust param (`?t=Date.now()`).
Falls back to `DEMO_SLATE` (hardcoded sample data) if fetch fails or file not found.
`window.KINFOLK_SLATE` can also pre-inject data before the script runs.

No build step, no bundler. Everything is vanilla JS in a single HTML file.

---

## How to update the PWA

**Add a new field to cards:** edit the `renderSlate()` function in `index.html` and add the field to the `slate.json` schema in `push_to_pwa.py`'s `format_slate()` function.

**Change colors/fonts:** edit the CSS variables at the top of `index.html`'s `<style>` block.

**Change what `push_to_pwa.py` reads from edges:** edit the `format_slate()` function. The edges_latest.json schema can be found at `~/Downloads/mlb-props/edges_latest.json`.

**Deploy changes to index.html or CLAUDE.md:** push via GitHub API (same approach as push_to_pwa.py uses for slate.json) or use git directly if the repo is cloned locally.

---

## Pipeline context

This PWA is the "phone display" layer of the CB Comprehension Project. The full pipeline:

1. `/preview` — 8 AM, groups games into windows, generates window PDFs
2. `/odds` — pulls Onyx Odds lines → `onyx_latest.json`
3. `/cb` — pulls Crushed Bats projections → `cb_latest.json`
4. `/qa` — merges CB + Onyx → `merged_slate.json`
5. `/edges` — scores plays, applies A/B criteria → `edges_latest.json`
6. `/grade` — builds dashboard, sends iMessage + PDF to iCloud
7. `push_to_pwa.py` — run after `/edges` or `/grade` to update this PWA

Full pipeline docs: `~/Downloads/mlb-props/CLAUDE.md` (local machine)
Skills: `~/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/...`

---

## Qualifying criteria (what appears in slate.json)

| Prop | Min confidence | Plus-money exception |
|------|---------------|---------------------|
| K | 75% | No |
| HA | 70% | No |
| ER / BB / Outs | 65% | 60%+ if odds are plus-money |

Odds cap: -150 max (anything worse is cut regardless of grade)
Grade C: eliminated — only A and B appear

---

## Hard rules — never override

- NEVER click Pick OVER / UNDER on Crushed Bats
- NEVER place bets on Onyx or any sportsbook
- This repo is display-only — it shows plays, it does not place them

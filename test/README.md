# Tests

Vitest + happy-dom unit/DOM tests plus an ajv schema check for the
`slate.json` data contract. No build step — `app.js` loads in the browser as a
plain `<script>` and exports its functions via CommonJS for the tests.

```bash
npm install
npm test          # vitest run
npm run test:watch
```

## What's covered

| File | Covers |
|------|--------|
| `grade.test.js` | `gradeClass` mapping + unknown-grade fallback |
| `format.test.js` | `formatTime` valid / missing / unparseable input |
| `edge.test.js` | `edgeClass` — incl. the `"—"` no-edge regression |
| `render.test.js` | `renderSlate` header, section grouping, empty/malformed slates |
| `bootstrap.test.js` | init path: `KINFOLK_SLATE`, fetch success, and every fallback branch |
| `slate-schema.test.js` | committed `slate.json` validates; schema rejects drift |
| `manifest.test.js` | manifest fields, icon sizes, `index.html` wiring |

## Deliberate decisions

- **Text fields render as raw HTML, not escaped.** `renderSlate` interpolates
  `trends`/`splits` directly into `innerHTML` so the pipeline can emit inline
  `<span class="hot">` / `<span class="warn">` markup (see the CSS in
  `index.html`). Data is trusted — it comes only from Victor's own pipeline,
  with no untrusted input path reaching the renderer. `render.test.js` pins
  this so any future change to escaping is a conscious decision.

## Known gaps (skipped tests)

- `manifest.test.js` skips the "icons exist on disk" check: `manifest.json`
  references `icon-192.png` / `icon-512.png` but neither is committed, so the
  installed PWA currently has broken home-screen icons. Add the icons, then
  un-skip the test.

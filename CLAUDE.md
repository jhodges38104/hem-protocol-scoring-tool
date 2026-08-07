# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A static, dependency-free single-page app that scores hospital clinical-trial protocols against the "Non-Malignant Hematology Protocol Complexity & Workload Rubric (Draft v0.1)." Part A produces a 32-item, 7-domain weighted complexity score (0–100); Part B turns that score plus live participant counts into a Monthly Workload Index (WU), with an optional WU→FTE conversion. Everything runs client-side — no backend, no network calls. Live at https://jhodges38104.github.io/hem-protocol-scoring-tool/.

The rubric is an explicitly unvalidated draft (see the disclaimer in `README.md` and the validation plan in `docs/rubric.md`); the app computes its arithmetic faithfully but doesn't claim the weights are calibrated — e.g. the FTE figure is deliberately labeled "this protocol only," not "Required FTE."

## Commands

There is no build step, package manager, linter, or test framework — no `package.json`, `Makefile`, or lint/format config exists anywhere in the repo. Per `README.md`, that's a deliberate design goal, not an oversight: the app has no framework, bundler, or external network calls "so this runs unmodified on a hospital network and stays auditable by reading three files." Don't introduce build/lint/test tooling unless asked to.

- **Preview:** open `index.html` directly in a browser (`open index.html` on macOS), or serve the directory with any static file server (e.g. `python3 -m http.server`) if you prefer a URL. If autosave or the "restored an unsaved entry" banner seems to misbehave, try the http-server route — `file://` origins don't handle `localStorage` consistently across all browsers, so it's the safer default specifically for testing persistence.
- **Test a change:** there's no automated test suite and nothing to run. Verify by hand in a browser: enter item scores and confirm domain subtotals/tier/Monthly WU update correctly, and exercise Export JSON → Import JSON to confirm the round-trip still matches — that's the closest thing this app has to a regression check.
- **Deploy:** not a local command — see Deployment below.

## Deployment

`.github/workflows/pages.yml` is the current and only deployment mechanism: `actions/checkout` → `actions/configure-pages` → `actions/upload-pages-artifact` (`path: '.'`) → `actions/deploy-pages`, triggered on every push to `main` or manually via `workflow_dispatch`. Live at https://jhodges38104.github.io/hem-protocol-scoring-tool/.

Two things worth knowing that aren't obvious from the workflow file alone:
- **`path: '.'` publishes the whole repo root**, not just `index.html`/`app.js`/`styles.css`. `docs/` (including the source PDF) and `README.md` are live and publicly fetchable too — confirmed by loading `docs/rubric.md` directly at the deployed URL. Anything added at the repo root, including this file, becomes publicly served on the next push to `main`.
- **This repo has to stay public.** GitHub Pages on a private repo requires GitHub Enterprise Cloud; per `README.md`, switching this repo to private would take the live site down unless that tier is available.

## Architecture

The whole app is three files with no imports or modules between them: `index.html` (structure) loads `styles.css` in `<head>` and `app.js` (~600 lines, all logic) via a plain `<script>` at the end of `<body>`. `app.js` wraps its own startup in a `DOMContentLoaded` listener. There is no other JS file and no framework.

### Rubric content is data, not scattered logic

All 32 scoring items live in one `DOMAINS` array literal near the top of `app.js` — 7 domains, each with `id`/`title`/optional `cap`/an `items` array (`id`/`label`/`max`/`note`). A loop immediately after the literal derives each domain's `itemizedMax` and effective `max` (`cap` if present, else `itemizedMax`) once, rather than duplicating it by hand. Sibling tables in the same style hold the rest of the rubric's numbers: `TIERS` (score band → tier), `STATUS_ROWS` (participant status → per-tier WU), `STATIC_WU`, `PHASE_MULTIPLIERS`. **To change a weight, add an item, or move a tier boundary, edit these tables — the render and compute functions just iterate over them generically and shouldn't need to change.**

### The DOM is the source of truth

This is a direct comment in `app.js`, not a paraphrase. There's no persistent JS object mirroring form state. `collectState()` reads every input's live `.value` into a fresh plain object on every call; `applyState(s)` is its inverse, writing a plain object back into the form (used for both localStorage restore and JSON import). `computeAll()` always starts by calling `collectState()` fresh — nothing is cached between calls. **A new field has to be wired into both `collectState()` and `applyState()`, or it silently won't persist, export, or restore.**

### One render orchestrator, one report node for screen and print

`update()` fires on every `input`/`change` event and runs, in order: `computeAll()` → `updateDomainSubtotals()` → `renderPartBBreakdown()` → `renderFteReadout()` → `renderReport()` → `saveToLocalStorage()`. `#report` in `index.html` is filled only by `renderReport()`, and it **is** both the live results panel and the printed report — there's no separate print view to keep in sync. Screen-vs-print differences are pure CSS: elements that should vanish on paper (the input form, restore banner, footer) carry a `.no-print` class, hidden by `@media print` in `styles.css`, which also flattens the two-column layout and forces the light-mode CSS variables regardless of the viewer's OS dark-mode setting, so a printed/PDF report is always legible. (Confirmed working via the browser's print dialog this session.)

### Persistence and export, no backend

`update()` autosaves to `localStorage` (key `hemProtocolScoringTool.v1`) at the end of every call, wrapped in try/catch for private-mode/quota failures. Export JSON / Import JSON round-trip the full `collectState()` output, which carries a `schema: 1` field (separate from `TOOL_VERSION`) for forward compatibility. The CSV export — labeled "Reliability CSV row" in the UI, not a generic export — writes one wide two-row file (header + one data row of every item score and computed field), shaped specifically so exports from multiple scorers can be pooled for the inter-rater reliability analysis `docs/rubric.md`'s validation plan calls for. Destructive actions (Import JSON's overwrite, New/Clear form) share a reusable confirm pattern, `wireArmedButton()`: the first click arms the button (relabels it, starts a 4-second auto-disarm timer) only if there's unsaved data to lose; a second click within the window confirms.

### Runtime-generated DOM and an undeclared CSS contract

`index.html` provides static page chrome plus three empty mount points `app.js` fills at runtime: `#domainsRoot` (via `generateDomains()`, the first line of `init()`), `#partBBreakdown`, `#report`. Element IDs like `item_${id}` and `subtotal_${id}` are built from the `DOMAINS`/`STATUS_ROWS` tables and don't exist anywhere in the static HTML — don't go looking for them there, and don't rename an item's `id` without checking the template strings that build IDs from it. `styles.css` and `app.js` also share an **undeclared class-name contract**: classes like `.domain`, `.item-row`, `.tier-badge`, `.wu-table` are emitted only by `app.js` template strings and styled only in `styles.css`. There's no CSS Modules/scoping, so renaming a class in one file silently breaks styling in the other with nothing to catch it.

## Non-obvious rules and magic numbers

- **Domain 5's cap is deliberate.** Its items sum to 18, but `cap: 16` limits its contribution to the 100-point total (`d.cap != null ? Math.min(raw, d.cap) : raw` in `computeAll()`), because the 7 domain maxima are meant to sum to exactly 100 (18+12+18+12+**16**+12+12). Changing any domain's items without checking this sum will break it silently.
- **The "100" total-points figure is a hardcoded literal in three places** — twice in `app.js` (the report's summary tile, the Part A total line) and once in `index.html` (the Part A heading) — not derived from `DOMAINS.reduce(...)`. It's only correct today because the domain maxima happen to sum to 100. A future change to any domain's items or cap requires updating all three literals by hand, or the displayed "/ 100" will silently go stale even though the underlying math is still right.
- **The phase multiplier applies to the protocol total**, `(staticWU + participantSubtotal) × phase.value`, not just the participant term. This is a deliberate interpretive call: the source rubric's formula notation reads ambiguously under normal operator precedence, but its multiplier table is explicitly captioned to apply to the total. Documented in a comment directly above `PHASE_MULTIPLIERS` in `app.js` and in `README.md`'s "Interpretive decisions" section. Also deliberate: **only one multiplier is ever applied** — `phaseSelect` is a single `<select>`, so if two conditions land in the same month (e.g. a substantive amendment during startup), the rubric doesn't define stacking and this tool doesn't invent one; `index.html`'s help text says to pick the single most applicable condition or apply your own documented convention. Don't add multi-condition stacking without resolving that gap first.
- **Participant counts clamp to `[0, 999999]`** as a practical unbounded ceiling, applied in both `computeAll()` and the CSV export.
- **Three separate version concepts exist — don't conflate them:** `TOOL_VERSION` (`'1.0.0'`, this app's own version), `RUBRIC_VERSION` (`'Draft v0.1'`, the source document's version, shown wherever the UI needs to remind the reader the instrument is unvalidated), and the JSON export's `schema: 1` field (bumped only if the export's shape changes, independent of either version number).

## Documentation structure

`docs/rubric.md` is the canonical source for every rubric number — it says so explicitly ("Numbers here are the single source of truth for this project"). `docs/quick-guide.md` (a ~10-minute operational walkthrough) and `docs/user-guide.md` (longer reference: two-scorer reconciliation workflow, an "interpreting your result" section, FAQ, glossary) both link into specific `rubric.md` anchors instead of restating its tables. `docs/TrialComplexityRubric.pdf` is the original source document `rubric.md` transcribes and reorganizes.

This is a separate hierarchy from `app.js`'s `DOMAINS`/`TIERS`/etc. tables, which are the source of truth for the *running code*. Nothing links the two — they're independent, hand-maintained descriptions of the same numbers. A weight changed in one won't propagate to the other; changing a rubric number means updating both `app.js` and `docs/rubric.md` yourself.

// Invariant tests for the HEM Protocol Complexity & Workload Tool.
//
// Run from the repo root:
//   node tests/invariants.js
//   /System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc tests/invariants.js
//
// Zero dependencies, matching the rest of the repo — it runs under Node (which
// is what CI has) or macOS's bundled jsc (which is what a Mac has without a
// Node install). Exits non-zero on any failure so pages.yml can gate on it.
//
// WHY THIS EXISTS. CLAUDE.md warns that "changing any domain's items without
// checking this sum will break it silently," and v0.2's central promise — the
// first seven domains still total 100, and a protocol scoring zero on every
// Domain 8 item scores, tiers, and costs exactly what it did under v0.1 — is
// asserted in the v0.2 commit message, README.md, docs/rubric.md and CLAUDE.md
// but was verified only by hand, once. These are the assertions behind those
// sentences. If one fails, a doc claim the tool's credibility rests on has
// stopped being true.
//
// It loads the real app.js against a stub DOM rather than re-declaring the
// tables, so it exercises the shipped computeAll()/exportCsv()/init() and
// cannot drift from them the way a transcribed copy would.

const log = (typeof console !== 'undefined' && console.log) ? console.log.bind(console) : print;

function readText(path) {
  if (typeof require === 'function') return require('fs').readFileSync(path, 'utf8');
  if (typeof readFile === 'function') return readFile(path); // jsc
  if (typeof read === 'function') return read(path);         // jsc, older
  throw new Error('no file-reading primitive in this runtime');
}

// ─────────────────────────────────────────────────────────────────────────
// Stub host environment
// ─────────────────────────────────────────────────────────────────────────

let elements = new Map();
function stubEl(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      id, value: '', textContent: '', innerHTML: '', hidden: true, disabled: false,
      classList: (() => {
        const set = new Set();
        return {
          add: (...c) => c.forEach((x) => set.add(x)),
          remove: (...c) => c.forEach((x) => set.delete(x)),
          contains: (c) => set.has(c),
          toggle: (c, force) => {
            const on = force === undefined ? !set.has(c) : !!force;
            if (on) set.add(c); else set.delete(c);
            return on;
          },
        };
      })(),
      addEventListener() {}, appendChild() {}, removeChild() {}, click() {}, focus() {},
      setAttribute() {}, style: {},
    });
  }
  return elements.get(id);
}

let lastBlobText = '';
let lsStore = {};

globalThis.document = {
  getElementById: stubEl,
  addEventListener() {},
  createElement: () => ({ style: {}, click() {}, setAttribute() {}, appendChild() {} }),
  body: { appendChild() {}, removeChild() {} },
};
globalThis.window = { print() {} };
globalThis.localStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(lsStore, k) ? lsStore[k] : null),
  setItem: (k, v) => { lsStore[k] = String(v); },
  removeItem: (k) => { delete lsStore[k]; },
};
globalThis.Blob = function Blob(parts) { lastBlobText = parts.join(''); };
globalThis.URL = { createObjectURL: () => 'blob:stub', revokeObjectURL() {} };
globalThis.FileReader = function FileReader() {};
if (typeof setTimeout !== 'function') globalThis.setTimeout = () => 0;

// Indirect eval runs in global scope, so app.js's top-level declarations are
// visible to the snippet appended after it — that's how we get a handle on
// internals the browser never needs to export.
const NAMES = [
  'DOMAINS', 'PART_A_MAX', 'TIERS', 'STATIC_WU', 'STATUS_ROWS', 'PHASE_MULTIPLIERS',
  'DATA_VOLUME_ITEMS', 'DATA_VOLUME_MAX', 'DATA_VOLUME_FACTOR_RANGE',
  'SCHEMA_VERSION', 'RUBRIC_VERSION', 'TOOL_VERSION', 'LS_KEY',
  'tierFor', 'computeAll', 'generateDomains', 'init', 'setVal', 'collectState',
  'applyState', 'hasAnyData', 'isPlausibleState', 'schemaGapMessage', 'exportCsv',
  'hideRestoreBanner',
];
(0, eval)(readText('app.js') + '\n;globalThis.APP = { ' + NAMES.join(', ') + ' };');
const APP = globalThis.APP;

// ─────────────────────────────────────────────────────────────────────────
// Assertions
// ─────────────────────────────────────────────────────────────────────────

let passed = 0;
const failures = [];

function check(name, ok, detail) {
  if (ok) { passed++; return; }
  failures.push(name + (detail ? ' — ' + detail : ''));
}
function eq(name, actual, expected) {
  check(name, actual === expected, 'expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
}
function close(name, actual, expected) {
  check(name, Math.abs(actual - expected) < 1e-9, 'expected ~' + expected + ', got ' + actual);
}
function section(title) { log('\n' + title); }

// Score a protocol through the real engine. Anything unspecified is 0.
function score(items, participants, opts) {
  opts = opts || {};
  for (const d of APP.DOMAINS) {
    for (const it of d.items) APP.setVal('item_' + it.id, (items && items[it.id] != null) ? items[it.id] : 0);
  }
  for (const r of APP.STATUS_ROWS) {
    APP.setVal('p_' + r.id, (participants && participants[r.id] != null) ? participants[r.id] : 0);
  }
  APP.setVal('phaseSelect', opts.phase || 'steady');
  APP.setVal('capacityConstant', opts.capacity != null ? opts.capacity : '');
  return APP.computeAll();
}

const allItems = APP.DOMAINS.flatMap((d) => d.items);
const maxAll = (predicate) => {
  const out = {};
  for (const d of APP.DOMAINS) for (const it of d.items) if (predicate(d, it)) out[it.id] = it.max;
  return out;
};

// ─────────────────────────────────────────────────────────────────────────
// 1. Structure — the sums CLAUDE.md says break silently
// ─────────────────────────────────────────────────────────────────────────
section('Structure');

eq('8 domains', APP.DOMAINS.length, 8);
eq('37 items', allItems.length, 37);
eq('PART_A_MAX is 116', APP.PART_A_MAX, 116);
eq('domain maxima sum to PART_A_MAX',
  APP.DOMAINS.reduce((s, d) => s + d.max, 0), APP.PART_A_MAX);
check('every item id is unique', new Set(allItems.map((i) => i.id)).size === allItems.length);

for (const d of APP.DOMAINS) {
  const itemized = d.items.reduce((s, it) => s + it.max, 0);
  eq(`${d.id}: max is min(itemized, cap)`, d.max, d.cap != null ? Math.min(itemized, d.cap) : itemized);
  check(`${d.id}: every item max is a positive integer`,
    d.items.every((it) => Number.isInteger(it.max) && it.max > 0));
}

const d5 = APP.DOMAINS.find((d) => d.max === 16 && d.cap === 16);
check('Domain 5 is capped at 16 with an itemized max of 18',
  !!d5 && d5.itemizedMax === 18 && d5.items.reduce((s, it) => s + it.max, 0) === 18);
eq('Domain 8 is uncapped', APP.DOMAINS[7].cap ?? null, null);
eq('Domain 8 contributes 16', APP.DOMAINS[7].max, 16);

// The v0.1 compatibility anchor, stated in four docs and tested nowhere until now.
eq('first seven domains still total exactly 100',
  APP.DOMAINS.slice(0, 7).reduce((s, d) => s + d.max, 0), 100);

eq('data volume factor is driven by exactly two items',
  APP.DATA_VOLUME_ITEMS.map((i) => i.id).join(','), 'chart_abstraction,diary_pro_frequency');
eq('DATA_VOLUME_MAX is 7', APP.DATA_VOLUME_MAX, 7);
check('every data-volume item lives in Domain 8',
  APP.DATA_VOLUME_ITEMS.every((it) => APP.DOMAINS[7].items.includes(it)));

// ─────────────────────────────────────────────────────────────────────────
// 2. Tiers — cutoffs must not move, and must cover the whole 0–116 range
// ─────────────────────────────────────────────────────────────────────────
section('Tiers');

for (const [total, expected] of [[0, 1], [20, 1], [21, 2], [38, 2], [39, 3], [58, 3], [59, 4], [76, 4], [77, 5], [116, 5]]) {
  eq(`total ${total} → tier ${expected}`, APP.tierFor(total).n, expected);
}
check('every integer total 0..116 resolves to a tier',
  Array.from({ length: 117 }, (_, i) => i).every((t) => !!APP.tierFor(t)));
check('every tier has a static WU and a rate for every status row',
  APP.TIERS.every((t) => APP.STATIC_WU[t.n] != null && APP.STATUS_ROWS.every((r) => r.wu[t.n] != null)));

// ─────────────────────────────────────────────────────────────────────────
// 3. v0.1 equivalence — the load-bearing claim of the whole v0.2 change
// ─────────────────────────────────────────────────────────────────────────
section('v0.1 equivalence (Domain 8 all zero)');

const SHAPES = [
  { name: 'empty', items: {}, p: {} },
  { name: 'tier-boundary 38', items: null, p: { active: 10, ltfu: 40 } },
  { name: 'tier-boundary 39', items: null, p: { active: 10, ltfu: 40 } },
  { name: 'all v0.1 domains maxed', items: maxAll((d) => d.id !== APP.DOMAINS[7].id), p: { screening: 3, active: 12, follow_up: 20, ltfu: 55, closeout: 4 } },
];

// Build the two boundary shapes by loading Domain 1 up to an exact total.
function itemsTotalling(target) {
  const out = {};
  let left = target;
  for (const d of APP.DOMAINS.slice(0, 7)) {
    for (const it of d.items) {
      const take = Math.min(it.max, left);
      out[it.id] = take;
      left -= take;
      if (left <= 0) return out;
    }
  }
  return out;
}
SHAPES[1].items = itemsTotalling(38);
SHAPES[2].items = itemsTotalling(39);

for (const shape of SHAPES) {
  const c = score(shape.items, shape.p);
  const domain8 = c.domainScores[7];

  eq(`${shape.name}: Domain 8 contributes 0`, domain8.capped, 0);
  eq(`${shape.name}: total equals the first seven domains alone`,
    c.total, c.domainScores.slice(0, 7).reduce((s, ds) => s + ds.capped, 0));
  close(`${shape.name}: data volume factor is exactly 1.0`, c.dataVolumeFactor, 1);

  // The Part B figure must be byte-identical to what v0.1's formula produced:
  // static WU for the tier, plus raw participant WU, times the phase factor.
  const v01 = (APP.STATIC_WU[c.tier.n]
    + APP.STATUS_ROWS.reduce((s, r) => s + ((shape.p[r.id] || 0) * r.wu[c.tier.n]), 0)) * c.phase.value;
  close(`${shape.name}: monthly WU matches the v0.1 formula`, c.monthlyWU, v01);
}

eq('maxing all v0.1 domains still totals 100', score(maxAll((d) => d.id !== APP.DOMAINS[7].id), {}).total, 100);
eq('maxing every domain totals 116', score(maxAll(() => true), {}).total, 116);

// ─────────────────────────────────────────────────────────────────────────
// 4. Data volume factor — range, and what it is allowed to touch
// ─────────────────────────────────────────────────────────────────────────
section('Data volume factor');

const dvIds = APP.DATA_VOLUME_ITEMS.map((i) => i.id);
const structural = APP.DOMAINS[7].items.filter((it) => !it.dataVolume).map((i) => i.id);
const parts = { screening: 2, active: 8, follow_up: 15, ltfu: 30, closeout: 1 };

close('factor floor is 1.0', score({}, parts).dataVolumeFactor, 1);
close('factor ceiling is 1.3',
  score({ [dvIds[0]]: 4, [dvIds[1]]: 3 }, parts).dataVolumeFactor, 1.3);
close('factor interpolates linearly',
  score({ [dvIds[0]]: 2 }, parts).dataVolumeFactor, 1 + 0.3 * (2 / 7));

const maxed = score({ [dvIds[0]]: 4, [dvIds[1]]: 3 }, parts);
close('factor scales the participant term only',
  maxed.participantSubtotal,
  APP.STATUS_ROWS.reduce((s, r) => s + (parts[r.id] * r.wu[maxed.tier.n]), 0) * 1.3);
eq('static WU is untouched by the factor', maxed.staticWU, APP.STATIC_WU[maxed.tier.n]);

// The three structural Domain 8 items must raise the total without touching
// the multiplier — that separation is the whole reason the factor exists.
const struct = score({ [structural[0]]: 3, [structural[1]]: 3, [structural[2]]: 3 }, parts);
eq('structural Domain 8 items raise the Part A total', struct.total, 9);
close('structural Domain 8 items leave the factor at 1.0', struct.dataVolumeFactor, 1);

// ─────────────────────────────────────────────────────────────────────────
// 5. Reliability CSV — header and row must stay aligned
// ─────────────────────────────────────────────────────────────────────────
section('Reliability CSV');

score({ [dvIds[0]]: 2 }, parts, { capacity: 120 });
APP.exportCsv();
const csvLines = lastBlobText.trim().split('\r\n');
eq('CSV has a header and exactly one data row', csvLines.length, 2);
// A real RFC 4180 split, not a regex: csvEscape() quotes any field holding a
// comma, quote or newline, and the row ends on an empty `notes` field that a
// naive splitter drops — which is exactly the off-by-one this guards against.
function parseCsvLine(line) {
  const out = [];
  let cur = '', quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c !== '"') { cur += c; }
      else if (line[i + 1] === '"') { cur += '"'; i++; }
      else { quoted = false; }
    } else if (c === '"') { quoted = true; }
    else if (c === ',') { out.push(cur); cur = ''; }
    else { cur += c; }
  }
  out.push(cur);
  return out;
}
const header = parseCsvLine(csvLines[0]);
const row = parseCsvLine(csvLines[1]);
eq('header and row have the same field count', row.length, header.length);
eq('one column per add() call in exportCsv', header.length, 82);
eq('the trailing empty notes field survives', header[header.length - 1], 'notes');
check('CSV records the rubric version so pre-v0.2 rows can be filtered out',
  csvLines[0].includes('rubric_version') && csvLines[1].includes(APP.RUBRIC_VERSION));
for (const it of allItems) {
  check(`CSV carries item_${it.id}`, csvLines[0].includes('item_' + it.id));
}

// ─────────────────────────────────────────────────────────────────────────
// 6. Loading an older state — must warn, never silently zero-fill
// ─────────────────────────────────────────────────────────────────────────
section('Loading older//malformed state');

check('isPlausibleState rejects junk',
  [null, undefined, 0, 'x', {}, { items: {} }, { meta: {} }].every((v) => !APP.isPlausibleState(v)));
check('isPlausibleState accepts a real state', APP.isPlausibleState({ items: {}, meta: {} }));
check('hasAnyData tolerates a state missing sub-objects', (() => {
  try { APP.hasAnyData({}); return true; } catch (e) { return false; }
})());
check('the schema-gap message names Domain 8',
  APP.schemaGapMessage(1, 'The file').includes('Domain 8'));

function bootWith(rawJson) {
  elements = new Map();
  lsStore = {};
  if (rawJson != null) lsStore[APP.LS_KEY] = rawJson;
  APP.init();
  return { banner: stubEl('restoreBanner'), message: stubEl('restoreMessage'), partB: stubEl('partBBreakdown') };
}

const stale = JSON.stringify({
  schema: 1, meta: { protocolId: 'HEM-2025-001' },
  items: { visit_burden: 3 }, participants: { active: 5 },
});
let boot = bootWith(stale);
check('a schema-1 autosave shows the restore banner', boot.banner.hidden === false);
check('a schema-1 autosave warns about Domain 8', boot.message.textContent.includes('Domain 8'));
check('a schema-1 autosave styles the banner as a warning',
  boot.banner.classList.contains('banner-warn') && !boot.banner.classList.contains('banner-info'));

// Dismissing must not leave banner-warn on a hidden element.
APP.hideRestoreBanner();
check('hideRestoreBanner hides and resets the schema styling',
  boot.banner.hidden === true
  && !boot.banner.classList.contains('banner-warn')
  && boot.banner.classList.contains('banner-info'));

const current = JSON.stringify({
  schema: APP.SCHEMA_VERSION, meta: { protocolId: 'HEM-2026-014' },
  items: { visit_burden: 3 }, participants: { active: 5 },
});
boot = bootWith(current);
check('a current-schema autosave shows the plain restore message',
  boot.banner.hidden === false && !boot.message.textContent.includes('Domain 8'));
check('a current-schema autosave is not styled as a warning',
  !boot.banner.classList.contains('banner-warn') && boot.banner.classList.contains('banner-info'));

// Before the guard, hasAnyData() threw here and took init() down with it —
// wireEvents() and update() never ran, leaving a rendered but inert page.
for (const junk of ['{"hello":"world"}', 'null', 'not json at all', '[]']) {
  let threw = false;
  try { boot = bootWith(junk); } catch (e) { threw = true; }
  check(`malformed autosave (${junk.slice(0, 18)}) does not abort init`, !threw);
  check(`malformed autosave (${junk.slice(0, 18)}) still renders Part B`,
    !threw && boot.partB.innerHTML.length > 0);
  check(`malformed autosave (${junk.slice(0, 18)}) shows no restore banner`,
    !threw && boot.banner.hidden === true);
}

// ─────────────────────────────────────────────────────────────────────────
// 7. index.html literals that duplicate app.js tables
//
// styles.css/app.js share an undeclared contract and so do index.html and the
// rubric tables: the markup restates numbers the JS owns. The Part A ceiling
// is now filled from PART_A_MAX at init, but the phase <select> still hardcodes
// every id and multiplier — and a renamed id is silent, since computeAll()
// falls back to steady state (x1.0) when the value matches nothing.
// ─────────────────────────────────────────────────────────────────────────
section('index.html / app.js consistency');

const html = readText('index.html');
// Scope to the phase <select> — index.html has other selects (scorer role,
// score type) whose options are unrelated to PHASE_MULTIPLIERS.
const phaseSelectHtml = (html.match(/<select id="phaseSelect">([\s\S]*?)<\/select>/) || [])[1] || '';
check('the phase <select> was found in index.html', phaseSelectHtml.length > 0);

check('the Part A heading has the element init() fills', html.includes('id="partAMaxLabel"'));
boot = bootWith(null);
eq('init() fills the Part A ceiling from PART_A_MAX',
  stubEl('partAMaxLabel').textContent, `(${APP.PART_A_MAX} points)`);

for (const phase of APP.PHASE_MULTIPLIERS) {
  const optionRe = new RegExp('<option value="' + phase.id + '"[^>]*>([^<]*)</option>');
  const match = phaseSelectHtml.match(optionRe);
  check(`phase option "${phase.id}" exists`, !!match);
  const label = (match || [])[1] || '';
  check(`phase option "${phase.id}" shows ×${phase.value}`, label.includes('×' + phase.value),
    'option reads ' + JSON.stringify(label));
}
eq('the phase select declares no options beyond PHASE_MULTIPLIERS',
  (phaseSelectHtml.match(/<option /g) || []).length, APP.PHASE_MULTIPLIERS.length);
check('the phase select defaults to a real PHASE_MULTIPLIERS id',
  APP.PHASE_MULTIPLIERS.some((p) => phaseSelectHtml.includes(`value="${p.id}" selected`)));

const dvCeiling = (1 + APP.DATA_VOLUME_FACTOR_RANGE).toFixed(1);
check(`Part B help text states the x1.0-x${dvCeiling} factor range`,
  html.includes('×1.0–×' + dvCeiling));

// ─────────────────────────────────────────────────────────────────────────

section('');
if (failures.length) {
  log(`FAILED — ${passed} passed, ${failures.length} failed:`);
  for (const f of failures) log('  ✗ ' + f);
  if (typeof process !== 'undefined') process.exit(1);
  throw new Error(failures.length + ' assertion(s) failed');
}
log(`OK — ${passed} assertions passed (rubric ${APP.RUBRIC_VERSION}, tool v${APP.TOOL_VERSION}, schema ${APP.SCHEMA_VERSION}).`);

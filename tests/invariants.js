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
// Functional enough to drive the real onImportJsonFile(): it assigns onload
// before calling readAsText, so firing synchronously is faithful here.
globalThis.FileReader = function FileReader() {
  this.readAsText = (file) => { this.result = file.text; if (this.onload) this.onload(); };
};
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
  'hideRestoreBanner', 'generatePhaseOptions', 'DEFAULT_PHASE',
  'onImportJsonFile', 'resetFormToDefaults', 'update', 'AUTOFILLED_META_KEYS',
  'PARTICIPANT_MAX', 'generateParticipantInputs', 'resolvePhase', 'csvEscape',
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
// 7. index.html no longer restates app.js's tables
//
// styles.css/app.js share an undeclared class-name contract. index.html used
// to share a worse one: the phase <select> restated every PHASE_MULTIPLIERS id
// and value, and since computeAll() resolves a phase by id and falls back
// rather than erroring, a renamed id silently costed every protocol at the
// default rate. The options are generated now, so these assertions check the
// duplication is gone and stays gone.
// ─────────────────────────────────────────────────────────────────────────
section('index.html / app.js consistency');

const html = readText('index.html');
const phaseSelectHtml = (html.match(/<select id="phaseSelect">([\s\S]*?)<\/select>/) || [])[1] || '';

check('the phase <select> is present in index.html', html.includes('id="phaseSelect"'));
eq('index.html declares no phase options of its own',
  (phaseSelectHtml.match(/<option/g) || []).length, 0);
check('index.html states no phase multiplier as a literal',
  !APP.PHASE_MULTIPLIERS.some((ph) => phaseSelectHtml.includes('×' + ph.value.toFixed(1))));

boot = bootWith(null);

// What init() actually generated into the select.
const generated = stubEl('phaseSelect').innerHTML;
eq('one option generated per phase',
  (generated.match(/<option/g) || []).length, APP.PHASE_MULTIPLIERS.length);
// The expected option text is spelled out here rather than rebuilt from
// PHASE_MULTIPLIERS with the same expression app.js uses. Re-deriving it is
// exactly what let `String(1.0) === '1'` ship "Steady state — ×1" where the
// markup being replaced read "×1.0": the assertion reproduced the bug and
// passed. These strings are what the <select> read before it was generated.
const EXPECTED_OPTIONS = [
  ['startup', 'Startup (activation −3 mo to first enrollment) — ×1.6'],
  ['steady', 'Steady state — ×1.0'],
  ['amendment', 'Substantive amendment month (+ following month) — ×1.3'],
  ['audit', 'Audit/inspection or monitoring visit month — ×1.4'],
  ['closeout_qtr', 'Closeout quarter — ×1.2'],
];
eq('every phase has an expected-label entry', EXPECTED_OPTIONS.length, APP.PHASE_MULTIPLIERS.length);
for (const [id, text] of EXPECTED_OPTIONS) {
  check(`generated option "${id}" reads exactly as the markup it replaced`,
    generated.includes(`>${text}</option>`), 'generated: ' + JSON.stringify(generated));
  check(`generated option "${id}" carries its id`, generated.includes(`value="${id}"`));
}
check('every multiplier renders with one decimal place',
  APP.PHASE_MULTIPLIERS.every((ph) => generated.includes('×' + ph.value.toFixed(1))));
check('DEFAULT_PHASE names a real phase',
  APP.PHASE_MULTIPLIERS.some((ph) => ph.id === APP.DEFAULT_PHASE));
eq('exactly one option is preselected', (generated.match(/ selected/g) || []).length, 1);
check('the preselected option is DEFAULT_PHASE',
  generated.includes(`value="${APP.DEFAULT_PHASE}" selected`));

// Every generated id must resolve in computeAll() — this is the direction that
// used to fail silently, costing the protocol at the default multiplier.
for (const ph of APP.PHASE_MULTIPLIERS) {
  const c = score({}, { active: 4 }, { phase: ph.id });
  eq(`phase "${ph.id}" resolves to ×${ph.value}`, c.phase.value, ph.value);
}
const fallback = score({}, { active: 4 }, { phase: 'no_such_phase' });
eq('an unknown phase falls back to DEFAULT_PHASE', fallback.phase.id, APP.DEFAULT_PHASE);

// The other two headings that ship a literal and get overwritten from the constant.
check('the Part A heading has the element init() fills', html.includes('id="partAMaxLabel"'));
eq('init() fills the Part A ceiling from PART_A_MAX',
  stubEl('partAMaxLabel').textContent, `(${APP.PART_A_MAX} points)`);
check('the Part B help text has the element init() fills', html.includes('id="dataVolumeRangeLabel"'));
eq('init() fills the data volume range from DATA_VOLUME_FACTOR_RANGE',
  stubEl('dataVolumeRangeLabel').textContent,
  `×1.0–×${(1 + APP.DATA_VOLUME_FACTOR_RANGE).toFixed(1)}`);

// ─────────────────────────────────────────────────────────────────────────
// 8. A form nobody has touched is not "data"
//
// init() writes today's score date and the score-type <select> ships a
// default, so meta is never entirely empty. While hasAnyData() counted those,
// a virgin form reported data and both of its callers misfired: the
// destructive-action confirms armed with nothing to lose, and init()'s own
// autosave of the blank default state came back as a "restored entry" on the
// next load. The banner that fired is the one that also carries the schema-gap
// warning — the reason a false positive on every visit is not cosmetic.
// ─────────────────────────────────────────────────────────────────────────
section('A virgin form is not data');

boot = bootWith(null);
const virgin = APP.collectState();
check('init() still fills the score date on a virgin form',
  /^\d{4}-\d{2}-\d{2}$/.test(String(virgin.meta.scoreDate)));
check('a virgin form does not count as data', !APP.hasAnyData(virgin));
check('hasAnyData ignores every autofilled meta key even when populated',
  !APP.hasAnyData({ meta: Object.fromEntries(APP.AUTOFILLED_META_KEYS.map((k) => [k, 'set'])), items: {}, participants: {} }));

// The other direction: anything the scorer can actually type must still count.
check('a typed meta field still counts as data',
  APP.hasAnyData({ meta: { protocolId: 'HEM-2026-014' }, items: {}, participants: {} }));
check('a scored item still counts as data',
  APP.hasAnyData({ meta: {}, items: { reg_status: '3' }, participants: {} }));
check('a participant count still counts as data',
  APP.hasAnyData({ meta: {}, items: {}, participants: { active: '5' } }));

// The regression itself, end to end: open the tool with nothing saved, type
// nothing, then open it again against whatever that first visit autosaved.
elements = new Map();
lsStore = {};
APP.init();
const virginAutosave = lsStore[APP.LS_KEY];
check('a virgin visit still autosaves', !!virginAutosave);
boot = bootWith(virginAutosave);
check('the next visit shows no restore banner for an untouched form',
  boot.banner.hidden === true);

elements = new Map();
lsStore = {};
APP.init();
APP.setVal('metaProtocolId', 'HEM-2026-014');
APP.update();
boot = bootWith(lsStore[APP.LS_KEY]);
check('a visit that did enter something still restores and banners',
  boot.banner.hidden === false);

// ─────────────────────────────────────────────────────────────────────────
// 9. Import replaces the form, it does not merge into it
//
// applyState() only writes the ids the loaded state actually contains, so
// importing onto a form that already has entries used to fold two protocols
// into one score — while the button label said "overwrites current form" and
// the schema-gap warning said the five Domain 8 items were "set to 0 here".
// onImportJsonFile() now resets first, which is what makes both true.
// ─────────────────────────────────────────────────────────────────────────
section('Import replaces the form');

function importFile(text) {
  APP.onImportJsonFile({ target: { files: [{ text }], value: 'chosen.json' } });
  return stubEl('importFeedback').textContent;
}

elements = new Map();
lsStore = {};
APP.init();
// A scorer part-way through a v0.2 score, Domain 8 fully entered.
for (const it of APP.DOMAINS[7].items) APP.setVal('item_' + it.id, it.max);
APP.setVal('metaProtocolId', 'HEM-2026-999');
eq('setup: Domain 8 is fully scored before the import',
  APP.computeAll().domainScores[7].capped, APP.DOMAINS[7].max);

// A pre-v0.2 export: it names no Domain 8 item at all.
const legacyFeedback = importFile(JSON.stringify({
  schema: 1, meta: { protocolId: 'HEM-2025-001' },
  items: { reg_status: 5, sponsor_type: 3 }, participants: { active: 5 },
}));
const imported = APP.computeAll();

eq('Domain 8 is cleared by an import that never mentions it',
  imported.domainScores[7].capped, 0);
close('the data volume factor drops back to 1.0', imported.dataVolumeFactor, 1);
eq('the total is exactly what the imported file describes', imported.total, 8);
eq('the imported protocol id replaces the one on the form',
  imported.state.meta.protocolId, 'HEM-2025-001');
check('the schema gap is still reported', legacyFeedback.includes('Domain 8'));
check('the warning\'s claim that the five items are 0 is now true',
  APP.DOMAINS[7].items.every((it) => Number(APP.collectState().items[it.id]) === 0));

const currentFeedback = importFile(JSON.stringify({
  schema: APP.SCHEMA_VERSION, meta: { protocolId: 'HEM-2026-014' },
  items: { chart_abstraction: 4 }, participants: {},
}));
eq('a current-schema import reports nothing', currentFeedback, '');
eq('a current-schema import applies its own values and only its own',
  APP.computeAll().total, 4);

// The reset sits after the parse and the plausibility check on purpose: a file
// that fails either must not cost the scorer the entry already on the form.
elements = new Map();
lsStore = {};
APP.init();
APP.setVal('item_reg_status', 5);
const junkFeedback = importFile('not json at all');
eq('a failed import leaves the form untouched', APP.computeAll().total, 5);
check('a failed import still explains itself',
  junkFeedback.includes('does not look like'));
const implausibleFeedback = importFile('{"hello":"world"}');
eq('an implausible import also leaves the form untouched', APP.computeAll().total, 5);
check('an implausible import explains itself too',
  implausibleFeedback.includes('does not look like'));

// ─────────────────────────────────────────────────────────────────────────
// 10. index.html no longer restates STATUS_ROWS either
//
// The same contract section 7 covers for the phase <select>, and this was the
// last place left holding it: the participant grid restated all five status
// ids and labels as static markup. strVal() returns '' for an element that
// isn't there, so renaming a status id in STATUS_ROWS alone never errored —
// every count read as 0 and the protocol costed Static WU alone. The grid is
// generated now, and PARTICIPANT_MAX reaches the inputs as a max attribute so
// the field and the computation can't state different ceilings.
// ─────────────────────────────────────────────────────────────────────────
section('index.html / STATUS_ROWS consistency');

const gridHtml = (html.match(/<div class="status-grid"[^>]*>([\s\S]*?)<\/div>\s*<h3>/) || [])[1] || '';
check('the participant grid is a mount point in index.html', html.includes('id="participantsRoot"'));
eq('index.html declares no participant inputs of its own', (gridHtml.match(/<input/g) || []).length, 0);
check('index.html states no participant id of its own', !/id="p_/.test(html));
check('index.html states no status label of its own',
  !APP.STATUS_ROWS.some((r) => html.includes('>' + r.label + '</label>')));

boot = bootWith(null);
const grid = stubEl('participantsRoot').innerHTML;
eq('one input generated per status row', (grid.match(/<input/g) || []).length, APP.STATUS_ROWS.length);
for (const r of APP.STATUS_ROWS) {
  check(`generated input "${r.id}" carries its id`, grid.includes(`id="p_${r.id}"`));
  check(`generated input "${r.id}" is labelled from STATUS_ROWS`,
    grid.includes(`<label for="p_${r.id}">${r.label}</label>`));
}
eq('every generated input states PARTICIPANT_MAX as its max',
  (grid.match(new RegExp('max="' + APP.PARTICIPANT_MAX + '"', 'g')) || []).length, APP.STATUS_ROWS.length);

// Every generated id must reach computeAll() — the direction that used to fail
// silently, leaving the protocol costed at Static WU alone.
for (const r of APP.STATUS_ROWS) {
  const c = score({}, { [r.id]: 1 });
  close(`status "${r.id}" reaches Part B at its own rate`, c.participantSubtotal, r.wu[c.tier.n]);
}
const everyRow = score({}, Object.fromEntries(APP.STATUS_ROWS.map((r) => [r.id, 2])));
close('all five rows sum into the participant subtotal', everyRow.participantSubtotal,
  APP.STATUS_ROWS.reduce((sum, r) => sum + 2 * r.wu[everyRow.tier.n], 0));

// One ceiling: the attribute the field clamps against and the bound
// computeAll()/exportCsv() apply are the same constant.
const overCeiling = score({}, { active: APP.PARTICIPANT_MAX + 1000 });
eq('a count above the ceiling clamps in Part B',
  overCeiling.rows.find((r) => r.row.id === 'active').count, APP.PARTICIPANT_MAX);
APP.exportCsv();
const ceilLines = lastBlobText.trim().split('\r\n');
eq('the CSV clamps to the same ceiling',
  parseCsvLine(ceilLines[1])[parseCsvLine(ceilLines[0]).indexOf('participants_active')],
  String(APP.PARTICIPANT_MAX));

// ─────────────────────────────────────────────────────────────────────────
// 11. The printable cards still say what the tool scores
//
// README calls these "generated from app.js's DOMAINS/TIERS/etc. tables rather
// than hand-transcribed" — true of how they were produced, but they are
// checked in as static HTML with every number as a literal, and there is no
// generator to re-run. Nothing but this section makes the second half of that
// sentence true. A laminated card is what a scorer has in front of them when
// the screen doesn't; one that has gone stale is a wrong score, not a typo.
// ─────────────────────────────────────────────────────────────────────────
section('Printable cards match the tables');

// Domain-major item numbering, 1.1 … 8.5, as the cards print it.
const ITEM_NUMBERS = APP.DOMAINS.flatMap((d, di) => d.items.map((it, ii) => `${di + 1}.${ii + 1}`));

for (const cardPath of ['docs/quick-reference-card.html', 'docs/laminated-card.html']) {
  const card = readText(cardPath);
  const name = cardPath.replace('docs/', '');
  // The cards escape & as &amp;; compare against both spellings.
  const esc = (t) => String(t).replace(/&/g, '&amp;');
  const has = (t) => card.includes(t) || card.includes(esc(t));
  const cardRows = card.match(/<tr[\s\S]*?<\/tr>/g) || [];
  const rowFor = (label) => cardRows.find((r) => r.includes(label) || r.includes(esc(label)));

  eq(`${name}: one numbered row per item, in table order`,
    (card.match(/class="itemno">([\d.]+)</g) || []).map((m) => m.replace(/\D*([\d.]+)</, '$1')).join(','),
    ITEM_NUMBERS.join(','));

  for (const d of APP.DOMAINS) {
    check(`${name}: states "${d.title}"`, has(d.title));
    check(`${name}: states domain ${d.id}'s range as 0–${d.max}`,
      new RegExp('\\(0[–-]' + d.max + '\\)').test(card));
    for (const it of d.items) {
      const row = rowFor(it.label);
      check(`${name}: has a row for "${it.label}"`, !!row);
      check(`${name}: "${it.label}" is scored 0–${it.max}`,
        !!row && new RegExp('0[–-]' + it.max + '(?!\\d)').test(row));
    }
  }

  check(`${name}: states the Part A ceiling ${APP.PART_A_MAX}`, has(String(APP.PART_A_MAX)));
  for (const t of APP.TIERS) {
    check(`${name}: names tier ${t.n} "${t.label}"`, has(t.label));
    check(`${name}: states tier ${t.n}'s Static WU (${APP.STATIC_WU[t.n]})`,
      new RegExp('\\b' + APP.STATIC_WU[t.n] + '\\b').test(card));
  }
  for (const r of APP.STATUS_ROWS) check(`${name}: lists the "${r.label}" status row`, has(r.label));
  for (const ph of APP.PHASE_MULTIPLIERS) {
    check(`${name}: states the ${ph.id} multiplier as ×${ph.value.toFixed(1)}`,
      card.includes(ph.value.toFixed(1)));
  }
  check(`${name}: states the data volume factor's ceiling`,
    card.includes((1 + APP.DATA_VOLUME_FACTOR_RANGE).toFixed(1)));
  check(`${name}: names the rubric version it was cut from`, has(APP.RUBRIC_VERSION.replace('Draft ', '')));
}

// ─────────────────────────────────────────────────────────────────────────
// 12. Text tokens clear WCAG AA against every surface they sit on
//
// .item-anchor — the anchor descriptions a rater reads to choose a number —
// is 12.5px --ink-muted. That token was #898781, which is 3.50:1 on
// --surface-1: below the 4.5:1 floor for normal text, and below it only on
// screen, since @media print already redefined it darker. Contrast is exactly
// the kind of thing that regresses silently during a palette tweak, so the
// floor is asserted rather than remembered.
// ─────────────────────────────────────────────────────────────────────────
section('Colour contrast (WCAG AA, 4.5:1)');

const css = readText('styles.css');

function tokensIn(block) {
  const out = {};
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g)) out[m[1]] = m[2];
  return out;
}
function rootBlockAt(from) {
  const start = css.indexOf(':root {', from);
  return start === -1 ? '' : css.slice(start, css.indexOf('}', start));
}
function relativeLuminance(hex) {
  const chan = (i) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(0) + 0.7152 * chan(1) + 0.0722 * chan(2);
}
function contrast(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Sanity-check the maths against two known pairs before trusting it on tokens.
close('contrast(#000,#fff) is 21', Math.round(contrast('#000000', '#ffffff')), 21);
close('contrast(#ffffff,#ffffff) is 1', contrast('#ffffff', '#ffffff'), 1);

const light = tokensIn(rootBlockAt(0));
const dark = { ...light, ...tokensIn(rootBlockAt(css.indexOf('@media (prefers-color-scheme: dark)'))) };
// Not `print`: that's jsc's global, and the log fallback above references it.
const printPalette = { ...light, ...tokensIn(rootBlockAt(css.indexOf('@media print'))) };

const INKS = ['ink-primary', 'ink-secondary', 'ink-muted'];
const SURFACES = ['surface-1', 'surface-2', 'page-bg'];

for (const [palette, tokens] of [['light', light], ['dark', dark], ['print', printPalette]]) {
  check(`${palette}: every ink and surface token is defined`,
    INKS.concat(SURFACES).every((t) => /^#[0-9a-fA-F]{6}$/.test(tokens[t] || '')));
  for (const ink of INKS) {
    for (const surface of SURFACES) {
      const r = contrast(tokens[ink], tokens[surface]);
      check(`${palette}: --${ink} on --${surface} clears 4.5:1`,
        r >= 4.5, `${tokens[ink]} on ${tokens[surface]} is ${r.toFixed(2)}:1`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 13. An unrecognised phase resolves in the form, not just in the arithmetic
//
// computeAll() has always fallen back to DEFAULT_PHASE for an id this build
// doesn't carry. applyState() didn't: it wrote the unknown id into the
// <select>, which sets selectedIndex to -1 in a browser — a blank control
// above a report saying "Steady state — ×1.0". Worse, collectState() then read
// that id back out and the autosave kept it. Both sides go through
// resolvePhase() now, so the form states the multiplier being applied.
// ─────────────────────────────────────────────────────────────────────────
section('Unrecognised phase');

for (const ph of APP.PHASE_MULTIPLIERS) {
  eq(`resolvePhase("${ph.id}") returns that phase`, APP.resolvePhase(ph.id).id, ph.id);
}
for (const junk of ['no_such_phase', '', null, undefined, 0]) {
  eq(`resolvePhase(${JSON.stringify(junk)}) falls back to DEFAULT_PHASE`,
    APP.resolvePhase(junk).id, APP.DEFAULT_PHASE);
}

elements = new Map();
lsStore = {};
APP.init();
APP.applyState({ meta: {}, items: {}, participants: {}, phase: 'no_such_phase' });
eq('applying an unknown phase leaves a real id in the form',
  APP.collectState().phase, APP.DEFAULT_PHASE);
eq('the form and the computation name the same phase',
  APP.computeAll().phase.id, APP.collectState().phase);

// The id must not survive into what the next load reads back.
APP.update();
eq('the autosave carries the resolved phase, not the unknown one',
  JSON.parse(lsStore[APP.LS_KEY]).phase, APP.DEFAULT_PHASE);

// A phase this build does carry is still applied verbatim.
APP.applyState({ meta: {}, items: {}, participants: {}, phase: 'audit' });
eq('a known phase is applied unchanged', APP.collectState().phase, 'audit');
close('a known phase still costs its own multiplier', APP.computeAll().phase.value, 1.4);

// ─────────────────────────────────────────────────────────────────────────
// 14. The reliability CSV can't hand a spreadsheet a formula
//
// The whole point of this export is that rows from several scorers get pooled
// and opened in a spreadsheet. A field beginning =, +, -, @, tab or CR is
// evaluated there, and quoting doesn't prevent it — the parser strips the
// quotes first. csvEscape() prefixes an apostrophe so the cell reads as text.
// ─────────────────────────────────────────────────────────────────────────
section('Reliability CSV: formula injection');

for (const lead of ['=', '+', '-', '@', '\t', '\r']) {
  eq(`csvEscape neutralises a leading ${JSON.stringify(lead)}`,
    APP.csvEscape(lead + 'SUM(A1:A9)').replace(/^"|"$/g, ''), "'" + lead + 'SUM(A1:A9)');
}
eq('ordinary text is untouched', APP.csvEscape('HEM-2026-014'), 'HEM-2026-014');
eq('a dash inside a value is not a leading dash', APP.csvEscape('a-b'), 'a-b');
eq('quoting still applies on top of the prefix', APP.csvEscape('=a,b'), '"\'=a,b"');
eq('embedded quotes are still doubled', APP.csvEscape('say "hi"'), '"say ""hi"""');
eq('a newline still forces quoting', APP.csvEscape('one\ntwo'), '"one\ntwo"');

// End to end, through the real export: a scorer types these into the form.
elements = new Map();
lsStore = {};
APP.init();
APP.setVal('metaProtocolId', '=1+1');
APP.setVal('metaScorerName', '+SUM(A1:A9)');
APP.setVal('metaNotes', '@ref');
APP.exportCsv();
const injLines = lastBlobText.trim().split('\r\n');
const injHeader = parseCsvLine(injLines[0]);
const injRow = parseCsvLine(injLines[1]);
const cell = (name) => injRow[injHeader.indexOf(name)];
eq('the exported protocol id is inert', cell('protocol_id'), "'=1+1");
eq('the exported scorer name is inert', cell('scorer_name'), "'+SUM(A1:A9)");
eq('the exported notes field is inert', cell('notes'), "'@ref");
eq('the header row is unaffected', injHeader[0], 'export_datetime');

// The comment above csvEscape() claims no numeric column can lead with one of
// these characters. Hold it here: a future negative-valued column would start
// picking up an apostrophe silently. Fresh form first — score() only writes
// items and participants, so the injected meta above would otherwise persist.
elements = new Map();
lsStore = {};
APP.init();
score({ [dvIds[0]]: 2 }, parts, { capacity: 120 });
APP.exportCsv();
const cleanLines = lastBlobText.trim().split('\r\n');
const cleanHeader = parseCsvLine(cleanLines[0]);
const cleanRow = parseCsvLine(cleanLines[1]);
check('no column of a normally-filled export needs neutralising',
  cleanRow.every((v) => !/^'/.test(v)),
  'neutralised: ' + cleanHeader.filter((_, i) => /^'/.test(cleanRow[i])).join(', '));

// ─────────────────────────────────────────────────────────────────────────

section('');
if (failures.length) {
  log(`FAILED — ${passed} passed, ${failures.length} failed:`);
  for (const f of failures) log('  ✗ ' + f);
  if (typeof process !== 'undefined') process.exit(1);
  throw new Error(failures.length + ' assertion(s) failed');
}
log(`OK — ${passed} assertions passed (rubric ${APP.RUBRIC_VERSION}, tool v${APP.TOOL_VERSION}, schema ${APP.SCHEMA_VERSION}).`);

// HEM Protocol Complexity & Workload Tool
// Implements the arithmetic in "Non-Malignant Hematology Protocol Complexity &
// Workload Rubric, Draft v0.2" (Parts A and B). Everything runs client-side;
// nothing is transmitted anywhere.
//
// v0.2 change (see docs/rubric.md "v0.2 change note"): added Domain 8 (Data
// Volume, Abstraction & Registry Burden) and a Part B data-volume factor.
// Motivated by a review comment that data-entry-heavy registries (ATHN,
// SCCRIP, SCDIC-II, REALAnswr, MOTIVATE-shaped protocols) had no way to score
// above Tier 2 even maxing the old Domain 5 cap. v0.1's seven domains and
// their weights are otherwise untouched — a protocol scoring zero on every
// Domain 8 item scores and tiers identically under v0.2 as it did under v0.1.

const RUBRIC_VERSION = 'Draft v0.2';
const TOOL_VERSION = '2.0.0';
const LS_KEY = 'hemProtocolScoringTool.v1';
// Bumped 1 → 2 because v0.2 added five Domain 8 item ids that a schema-1
// state won't contain. Both paths that can load an older state —
// onImportJsonFile() and init()'s autosave restore — compare against this and
// warn rather than silently treating a pre-Domain-8 state as a complete v0.2
// score. LS_KEY deliberately stays '.v1': bumping it would silently discard a
// staffer's in-progress entry, trading one quiet failure for another.
const SCHEMA_VERSION = 2;

// ─────────────────────────────────────────────────────────────────────────
// Config — transcribed from the source rubric
// ─────────────────────────────────────────────────────────────────────────

const DOMAINS = [
  {
    id: 'd1', title: 'Domain 1 — Regulatory & Sponsorship Framework',
    items: [
      { id: 'reg_status', label: 'Regulatory status', max: 5, note: '0 = Not FDA-regulated · Mid = IND/IDE exempt determination required · Max = Active IND/IDE held by St. Jude' },
      { id: 'sponsor_type', label: 'Sponsor type', max: 3, note: '0 = Investigator-initiated, internal · Mid = NIH/federal · Max = Industry, or federal with external coordinating center' },
      { id: 'site_role', label: 'Site role', max: 5, note: '0 = Single-site · Mid = Participating site, multi-site · Max = Coordinating center for multi-site' },
      { id: 'oversight_bodies', label: 'Oversight bodies', max: 3, note: '0 = IRB only · Mid = + DSMB or independent monitor · Max = + external audit/inspection readiness obligations' },
      { id: 'irb_model', label: 'IRB model', max: 2, note: '0 = Local IRB only · Mid = sIRB relying · Max = sIRB reviewing for external sites' },
    ],
  },
  {
    id: 'd2', title: 'Domain 2 — Population & Consent',
    items: [
      { id: 'pediatric_assent', label: 'Pediatric enrollment with assent tiers', max: 3, note: '0 = adults only; 3 = multiple assent age bands with reconsent at transition' },
      { id: 'vulnerable_pop', label: 'Vulnerable/protected populations', max: 3, note: 'decisionally impaired, wards, pregnant participants' },
      { id: 'reconsent_burden', label: 'Re-consent burden', max: 3, note: 'anticipated amendments requiring re-consent of active cohort' },
      { id: 'language_access', label: 'Language/literacy accommodation', max: 3, note: 'translated materials, interpreter-dependent visits' },
    ],
  },
  {
    id: 'd3', title: 'Domain 3 — Visit & Procedure Burden',
    items: [
      { id: 'visits_per_year', label: 'Protocol-required visits per participant-year', max: 5, note: '0 = ≤1; 5 = >12' },
      { id: 'procedure_intensity', label: 'Procedure intensity', max: 5, note: '0 = none/records only; 5 = apheresis, conditioning/HSCT, sedated imaging' },
      { id: 'timed_pk', label: 'Timed/PK or serial sampling', max: 3, note: 'any window <30 min counts as max' },
      { id: 'visit_window', label: 'Visit window rigidity', max: 2, note: '±14 d vs ±2 d' },
      { id: 'offsite_remote', label: 'Off-site, home, or remote assessment', max: 3, note: 'includes wearables and home phlebotomy logistics' },
    ],
  },
  {
    id: 'd4', title: 'Domain 4 — Investigational Product / Intervention',
    items: [
      { id: 'ip_handling', label: 'IP handling & accountability', max: 4, note: '0 = no IP; 4 = cell/gene product with chain-of-custody' },
      { id: 'blinding_rand', label: 'Blinding & randomization', max: 3, note: '0 = open-label/none; 3 = double-blind with unblinding procedures' },
      { id: 'pharmacy_interface', label: 'Pharmacy/manufacturing interface', max: 3, note: '0 = none; 3 = on-site manufacturing or apheresis-to-product workflow' },
      { id: 'dose_mod', label: 'Dose modification complexity', max: 2, note: 'rules requiring per-visit adjudication' },
    ],
  },
  {
    id: 'd5', title: 'Domain 5 — Data & Specimen Management', cap: 16,
    items: [
      { id: 'ecrf_volume', label: 'eCRF volume', max: 4, note: 'fields per participant-visit' },
      { id: 'data_systems', label: 'Number of distinct data systems', max: 4, note: 'sponsor EDC + REDCap + registry + imaging portal each count' },
      { id: 'biospecimen', label: 'Biospecimen processing/shipping', max: 3, note: '0 = none; 3 = time-critical processing with international shipment' },
      { id: 'central_lab', label: 'Central/core lab or imaging read', max: 2, note: '' },
      { id: 'epro', label: 'PRO/ePRO administration', max: 2, note: '' },
      { id: 'linked_data', label: 'Linked or derived data (geospatial, EHR extract, genomic)', max: 3, note: 'includes SDOH/neighborhood-level linkage' },
    ],
  },
  {
    id: 'd6', title: 'Domain 6 — Safety Reporting & Monitoring',
    items: [
      { id: 'ae_sae_volume', label: 'Expected AE/SAE volume', max: 4, note: '' },
      { id: 'expedited_reporting', label: 'Expedited reporting obligations', max: 3, note: 'multi-recipient (FDA, sponsor, sIRB, DSMB) = max' },
      { id: 'monitoring_freq', label: 'Monitoring visit frequency', max: 3, note: '' },
      { id: 'ltfu_horizon', label: 'Long-term follow-up horizon', max: 2, note: '0 = ≤2 yr; 2 = ≥5 yr (gene therapy LTFU obligations)' },
    ],
  },
  {
    id: 'd7', title: 'Domain 7 — Qualitative, Mixed-Method & Community Engagement',
    items: [
      { id: 'interview_burden', label: 'Interview/focus group data collection', max: 4, note: 'count × duration; includes scheduling burden' },
      { id: 'transcription_load', label: 'Transcription, coding & analysis load', max: 4, note: 'multi-coder with reliability requirements = max' },
      { id: 'community_board', label: 'Community advisory board or partner site coordination', max: 2, note: '' },
      { id: 'dissemination', label: 'Dissemination obligations beyond manuscript', max: 2, note: 'community reports, policy briefs, stakeholder convenings' },
    ],
  },
  {
    id: 'd8', title: 'Domain 8 — Data Volume, Abstraction & Registry Burden',
    items: [
      { id: 'chart_abstraction', label: 'Chart/EHR abstraction burden', max: 4, note: '0 = none; 4 = comprehensive structured abstraction of the full record at every encounter (concurrent or retrospective)', dataVolume: true },
      { id: 'diary_pro_frequency', label: 'Diary/PRO review frequency', max: 3, note: "0 = none or ≤1/yr; 3 = continuous/near-real-time patient diary requiring ongoing physician review. Distinct from Domain 5's ePRO item, which scores administering the instrument, not reviewing entries.", dataVolume: true },
      { id: 'consortium_dcc', label: 'External registry/consortium/DCC submission cadence', max: 3, note: '0 = none; 3 = recurring structured submission to an external data-coordinating center on a fixed cadence' },
      { id: 'substudy_layering', label: 'Linked sub-studies / optional data modules', max: 3, note: '0 = none; 3 = ≥4 layered sub-studies, each with its own specimen/data cadence' },
      { id: 'lifetime_horizon', label: 'Open-ended/lifetime data-collection horizon', max: 3, note: "0 = fixed end date <2 yr out; 3 = open-ended/lifetime cohort with no defined data-collection end date. Distinct from Domain 6's LTFU item, which scores safety follow-up duration, not data-submission duration." },
    ],
  },
];

// Derive each domain's itemized max and effective (post-cap) max once.
for (const d of DOMAINS) {
  d.itemizedMax = d.items.reduce((sum, it) => sum + it.max, 0);
  d.max = d.cap != null ? d.cap : d.itemizedMax;
}

// Part A total (sum of all domain maxima) — computed, not hardcoded, so it
// can't drift from DOMAINS. v0.1 was 100 across 7 domains; v0.2 is 116 across
// 8 (Domain 8 adds 16). TIERS below is intentionally left as v0.1 defined it
// — see the TIERS comment.
const PART_A_MAX = DOMAINS.reduce((sum, d) => sum + d.max, 0);

// The two Domain 8 items that describe per-encounter data-entry intensity
// (as opposed to protocol-level structural items like DCC cadence or
// lifetime horizon, which already flow into Part B correctly via tier).
// These drive DATA_VOLUME_FACTOR in computeAll() — see docs/rubric.md's
// Part B section for why only these two, and why the cap is 1.3 not higher.
const DATA_VOLUME_ITEMS = DOMAINS.flatMap((d) => d.items).filter((it) => it.dataVolume);
const DATA_VOLUME_MAX = DATA_VOLUME_ITEMS.reduce((sum, it) => sum + it.max, 0);
const DATA_VOLUME_FACTOR_RANGE = 0.3; // factor runs 1.0 (no data-volume burden) to 1.3 (max)

// Cutoffs are unchanged from v0.1 on purpose — see the header comment. Since
// Domain 8 only adds points (never subtracts), a v0.1 protocol re-scored
// under v0.2 with identical Domain-8-eligible items at 0 lands on the exact
// same tier. The practical effect of the wider 0–116 range with the same
// cutoffs is that Tier 5 (≥77) is reachable over a wider span than before —
// that's intentional, not a bug: it's what lets a data-volume-heavy registry
// climb without re-tiering every existing interventional protocol.
const TIERS = [
  { n: 1, label: 'Minimal', max: 20 },
  { n: 2, label: 'Low', max: 38 },
  { n: 3, label: 'Moderate', max: 58 },
  { n: 4, label: 'High', max: 76 },
  { n: 5, label: 'Very high', max: Infinity },
];

const STATUS_ROWS = [
  { id: 'screening', label: 'In screening / consent', wu: { 1: 0.5, 2: 1.0, 3: 1.5, 4: 2.5, 5: 3.5 } },
  { id: 'active', label: 'Active intervention / on-treatment', wu: { 1: 1.0, 2: 2.0, 3: 3.5, 4: 6.0, 5: 9.0 } },
  { id: 'follow_up', label: 'Active follow-up (protocol visits)', wu: { 1: 0.5, 2: 1.0, 3: 1.5, 4: 2.5, 5: 3.5 } },
  { id: 'ltfu', label: 'Long-term follow-up (annual contact)', wu: { 1: 0.1, 2: 0.2, 3: 0.3, 4: 0.5, 5: 0.7 } },
  { id: 'closeout', label: 'Closed to accrual, data cleaning/closeout', wu: { 1: 0.2, 2: 0.3, 3: 0.5, 4: 0.8, 5: 1.0 } },
];

const STATIC_WU = { 1: 2, 2: 4, 3: 8, 4: 14, 5: 22 };

// Phase multipliers apply to the protocol TOTAL (static + participant WU), per
// the source table's caption — not just the participant term. The formula box
// in the source reads ambiguously (operator precedence vs. the stated intent);
// this tool follows the explicit caption. See README for the full note.
const PHASE_MULTIPLIERS = [
  { id: 'startup', label: 'Startup (activation −3 mo to first enrollment)', value: 1.6 },
  { id: 'steady', label: 'Steady state', value: 1.0 },
  { id: 'amendment', label: 'Substantive amendment month (+ following month)', value: 1.3 },
  { id: 'audit', label: 'Audit/inspection or monitoring visit month', value: 1.4 },
  { id: 'closeout_qtr', label: 'Closeout quarter', value: 1.2 },
];

const ROLE_LABELS = {
  CRC: 'Clinical Research Coordinator', 'Regulatory Coordinator': 'Regulatory Coordinator',
  'Data Manager': 'Data Manager', Nurse: 'Nurse', PI: 'PI', Finance: 'Finance', Other: 'Other',
};
const SCORE_TYPE_LABELS = { Feasibility: 'Feasibility (initial)', Annual: 'Annual re-score', Amendment: 'Amendment re-score' };

// ─────────────────────────────────────────────────────────────────────────
// Small utilities
// ─────────────────────────────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);
const strVal = (id) => { const el = $(id); return el ? el.value : ''; };
const setVal = (id, v) => { const el = $(id); if (el && v != null) el.value = v; };

function clampInt(raw, min, max) {
  let n = Math.round(Number(raw));
  if (!Number.isFinite(n)) n = 0;
  if (n < min) n = min;
  if (n > max) n = max;
  return n;
}

function clampFloatOrNull(raw, min) {
  if (raw == null) return null;
  const str = String(raw).trim();
  if (str === '') return null;
  const n = Number(str);
  if (!Number.isFinite(n) || n < min) return null;
  return n;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const fmt1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
const fmt2 = (n) => (Math.round(n * 100) / 100).toFixed(2);
const roleLabel = (v) => ROLE_LABELS[v] || '—';
const scoreTypeLabel = (v) => SCORE_TYPE_LABELS[v] || v || '—';

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function tierFor(total) {
  return TIERS.find((t) => total <= t.max) || TIERS[TIERS.length - 1];
}

function tierBadgeHTML(tier) {
  return `<span class="tier-badge"><span class="swatch tier-${tier.n}" aria-hidden="true"></span>Tier ${tier.n} — ${tier.label}</span>`;
}

// ─────────────────────────────────────────────────────────────────────────
// State: the DOM is the source of truth. collectState() reads it into a
// plain object (for computation/export); applyState() writes a plain object
// back into the DOM (for restore/import).
// ─────────────────────────────────────────────────────────────────────────

function collectState() {
  const items = {};
  for (const d of DOMAINS) for (const it of d.items) items[it.id] = strVal(`item_${it.id}`);
  const participants = {};
  for (const r of STATUS_ROWS) participants[r.id] = strVal(`p_${r.id}`);
  return {
    schema: SCHEMA_VERSION,
    toolVersion: TOOL_VERSION,
    rubricVersion: RUBRIC_VERSION,
    meta: {
      protocolId: strVal('metaProtocolId'),
      piName: strVal('metaPiName'),
      scorerName: strVal('metaScorerName'),
      scorerRole: strVal('metaScorerRole'),
      scoreDate: strVal('metaScoreDate'),
      scoreType: strVal('metaScoreType'),
      notes: strVal('metaNotes'),
    },
    items,
    participants,
    phase: strVal('phaseSelect'),
    capacityConstant: strVal('capacityConstant'),
  };
}

function applyState(s) {
  if (!s) return;
  if (s.meta) {
    setVal('metaProtocolId', s.meta.protocolId);
    setVal('metaPiName', s.meta.piName);
    setVal('metaScorerName', s.meta.scorerName);
    setVal('metaScorerRole', s.meta.scorerRole);
    setVal('metaScoreDate', s.meta.scoreDate);
    setVal('metaScoreType', s.meta.scoreType);
    setVal('metaNotes', s.meta.notes);
  }
  if (s.items) for (const [k, v] of Object.entries(s.items)) setVal(`item_${k}`, v);
  if (s.participants) for (const [k, v] of Object.entries(s.participants)) setVal(`p_${k}`, v);
  if (s.phase) setVal('phaseSelect', s.phase);
  setVal('capacityConstant', s.capacityConstant ?? '');
}

// Accepts only what applyState()/hasAnyData() can actually read, on the same
// items+meta criteria the import path has always used. Guards both loaders.
// Without it a malformed payload under LS_KEY reached Object.values(s.meta)
// in hasAnyData() and threw — and since init() has no try/catch, that aborted
// before wireEvents()/update() and left a rendered but completely inert page.
function isPlausibleState(s) {
  return !!s && typeof s === 'object' && !!s.items && !!s.meta;
}

// One wording for one hazard, shared by both loaders. applyState() leaves any
// item id absent from the loaded state at its current value (0 by default), so
// a pre-v0.2 state scores and tiers as though its five Domain 8 items were
// genuinely zero — a complete-looking result missing exactly the data-volume
// burden Domain 8 was added to capture.
function schemaGapMessage(schema, lead) {
  return `${lead} was saved under schema ${schema ?? '?'}, which predates Domain 8 — Data Volume, Abstraction & Registry Burden, added in Rubric v0.2. Its five items are set to 0 here. Score them before treating this total or tier as current.`;
}

function hasAnyData(s) {
  const vals = (o) => (o && typeof o === 'object' ? Object.values(o) : []);
  const metaNonEmpty = vals(s.meta).some((v) => String(v || '').trim() !== '');
  const itemsNonZero = vals(s.items).some((v) => Number(v) > 0);
  const participantsNonZero = vals(s.participants).some((v) => Number(v) > 0);
  return metaNonEmpty || itemsNonZero || participantsNonZero;
}

function resetFormToDefaults() {
  for (const d of DOMAINS) for (const it of d.items) setVal(`item_${it.id}`, 0);
  for (const r of STATUS_ROWS) setVal(`p_${r.id}`, 0);
  setVal('phaseSelect', 'steady');
  setVal('capacityConstant', '');
  setVal('metaProtocolId', '');
  setVal('metaPiName', '');
  setVal('metaScorerName', '');
  setVal('metaScorerRole', '');
  setVal('metaScoreDate', todayISO());
  setVal('metaScoreType', 'Feasibility');
  setVal('metaNotes', '');
}

// ─────────────────────────────────────────────────────────────────────────
// Computation
// ─────────────────────────────────────────────────────────────────────────

function computeAll() {
  const s = collectState();

  const domainScores = DOMAINS.map((d) => {
    const raw = d.items.reduce((sum, it) => sum + clampInt(s.items[it.id], 0, it.max), 0);
    const capped = d.cap != null ? Math.min(raw, d.cap) : raw;
    return { domain: d, raw, capped };
  });
  const total = domainScores.reduce((sum, ds) => sum + ds.capped, 0);
  const tier = tierFor(total);

  // Data volume factor: scales only the participant-WU term (not Static WU),
  // driven only by the two per-encounter Domain 8 items (chart/EHR
  // abstraction + diary/PRO frequency) — not the whole domain, so it doesn't
  // double-count the structural items that already raised the total/tier.
  const dataVolumeRaw = DATA_VOLUME_ITEMS.reduce((sum, it) => sum + clampInt(s.items[it.id], 0, it.max), 0);
  const dataVolumeFactor = 1 + DATA_VOLUME_FACTOR_RANGE * (DATA_VOLUME_MAX > 0 ? dataVolumeRaw / DATA_VOLUME_MAX : 0);

  const rows = STATUS_ROWS.map((r) => {
    const count = clampInt(s.participants[r.id], 0, 999999);
    const perUnit = r.wu[tier.n];
    const subtotal = count * perUnit * dataVolumeFactor;
    return { row: r, count, perUnit, subtotal };
  });
  const participantSubtotal = rows.reduce((sum, r) => sum + r.subtotal, 0);
  const staticWU = STATIC_WU[tier.n];
  const preMultiplier = staticWU + participantSubtotal;
  const phase = PHASE_MULTIPLIERS.find((p) => p.id === s.phase) || PHASE_MULTIPLIERS.find((p) => p.id === 'steady');
  const monthlyWU = preMultiplier * phase.value;

  const C = clampFloatOrNull(s.capacityConstant, 0);
  const fte = C && C > 0 ? monthlyWU / C : null;

  return { state: s, domainScores, total, tier, dataVolumeRaw, dataVolumeFactor, rows, participantSubtotal, staticWU, preMultiplier, phase, monthlyWU, C, fte };
}

// ─────────────────────────────────────────────────────────────────────────
// Rendering — form generation (once) and live results/report (every update)
// ─────────────────────────────────────────────────────────────────────────

function generateDomains() {
  const parts = [];
  for (const d of DOMAINS) {
    parts.push(`<div class="domain" data-domain="${d.id}">`);
    parts.push(`<div class="domain-head"><h3>${d.title} <span class="muted">(0–${d.max})</span></h3>`);
    parts.push(`<div class="domain-subtotal">Subtotal: <strong id="subtotal_${d.id}">0</strong> / ${d.max}</div></div>`);
    if (d.cap != null) {
      parts.push(`<p class="section-help">Itemized max is ${d.itemizedMax}; the domain contribution is capped at ${d.cap}.</p>`);
    }
    parts.push(`<div class="items">`);
    for (const it of d.items) {
      parts.push(`<div class="item-row">
        <div class="item-main">
          <label for="item_${it.id}">${it.label}</label>
          ${it.note ? `<span class="item-anchor">${it.note}</span>` : ''}
        </div>
        <div class="item-input">
          <input type="number" id="item_${it.id}" min="0" max="${it.max}" step="1" value="0" inputmode="numeric">
          <span class="item-max">/ ${it.max}</span>
        </div>
      </div>`);
    }
    parts.push(`</div></div>`);
  }
  $('domainsRoot').innerHTML = parts.join('');
}

function updateDomainSubtotals(domainScores) {
  for (const ds of domainScores) {
    const el = $(`subtotal_${ds.domain.id}`);
    if (!el) continue;
    el.textContent = ds.domain.cap != null && ds.raw > ds.domain.cap ? `${ds.raw} → ${ds.capped} (capped)` : String(ds.capped);
  }
}

function renderPartBBreakdown(computed) {
  const { rows, staticWU, preMultiplier, phase, monthlyWU, tier, dataVolumeRaw, dataVolumeFactor } = computed;
  $('pbTierBadge').innerHTML = tierBadgeHTML(tier);

  const parts = [];
  parts.push(`<p class="section-help">Data volume factor (Domain 8, items 8.1+8.2 only): ${dataVolumeRaw} / ${DATA_VOLUME_MAX} → <strong>×${fmt2(dataVolumeFactor)}</strong>. Applied to participant WU below, not Static WU.</p>`);
  parts.push(`<table class="wu-table"><thead><tr><th>Status</th><th>Count</th><th>Base WU/participant (Tier ${tier.n})</th><th>Subtotal (× data volume)</th></tr></thead><tbody>`);
  for (const r of rows) {
    parts.push(`<tr><td>${r.row.label}</td><td class="num">${r.count}</td><td class="num">${fmt1(r.perUnit)}</td><td class="num">${fmt1(r.subtotal)}</td></tr>`);
  }
  parts.push(`<tr><td colspan="3">Static WU (Tier ${tier.n})</td><td class="num">${fmt1(staticWU)}</td></tr>`);
  parts.push(`<tr><td colspan="3">Pre-multiplier total</td><td class="num">${fmt1(preMultiplier)}</td></tr>`);
  parts.push(`<tr><td colspan="3">× Phase multiplier — ${phase.label}</td><td class="num">×${phase.value}</td></tr>`);
  parts.push(`<tr class="total-row"><td colspan="3">Monthly Workload Units</td><td class="num"><strong>${fmt1(monthlyWU)}</strong></td></tr>`);
  parts.push(`</tbody></table>`);
  $('partBBreakdown').innerHTML = parts.join('');
}

function renderFteReadout(computed) {
  const el = $('fteReadout');
  if (computed.C == null) {
    el.innerHTML = `<p class="muted">No capacity constant entered — FTE not calculated.</p>`;
    return;
  }
  el.innerHTML = `<p>This protocol alone ≈ <strong>${fmt2(computed.fte)} FTE-equivalent</strong> (${fmt1(computed.monthlyWU)} WU ÷ ${computed.C} WU/FTE/month).</p>`;
}

function metaRow(label, value) {
  return `<tr><th>${label}</th><td>${value}</td></tr>`;
}

function renderReport(computed) {
  const { state: s, domainScores, total, tier, rows, staticWU, preMultiplier, phase, monthlyWU, C, fte, dataVolumeRaw, dataVolumeFactor } = computed;
  const meta = s.meta;
  const parts = [];

  parts.push(`<h2>Protocol Complexity &amp; Workload Report</h2>`);
  parts.push(`<table class="meta-table">`);
  parts.push(metaRow('Protocol / short title', escapeHtml(meta.protocolId) || '—'));
  parts.push(metaRow('Principal Investigator', escapeHtml(meta.piName) || '—'));
  parts.push(metaRow('Scorer', `${escapeHtml(meta.scorerName) || '—'} (${escapeHtml(roleLabel(meta.scorerRole))})`));
  parts.push(metaRow('Score date', escapeHtml(meta.scoreDate) || '—'));
  parts.push(metaRow('Score type', escapeHtml(scoreTypeLabel(meta.scoreType))));
  parts.push(metaRow('Rubric version', `${RUBRIC_VERSION} (unvalidated)`));
  parts.push(`</table>`);

  parts.push(`<div class="summary-tiles">`);
  parts.push(`<div class="tile"><div class="tile-label">Part A total</div><div class="tile-value">${total}<span class="tile-max"> / ${PART_A_MAX}</span></div></div>`);
  parts.push(`<div class="tile"><div class="tile-label">Complexity tier</div><div class="tile-value">${tierBadgeHTML(tier)}</div></div>`);
  parts.push(`<div class="tile"><div class="tile-label">Monthly workload</div><div class="tile-value">${fmt1(monthlyWU)}<span class="tile-max"> WU</span></div></div>`);
  if (fte != null) {
    parts.push(`<div class="tile"><div class="tile-label">FTE-equiv. (this protocol only)</div><div class="tile-value">${fmt2(fte)}</div></div>`);
  }
  parts.push(`</div>`);

  parts.push(`<h3>Part A — item detail</h3>`);
  for (const ds of domainScores) {
    const d = ds.domain;
    const capNote = d.cap != null ? `, itemized 0–${d.itemizedMax} capped at ${d.cap}` : '';
    parts.push(`<table class="domain-table"><caption>${d.title} (0–${d.max}${capNote})</caption><thead><tr><th>Item</th><th>Score</th></tr></thead><tbody>`);
    for (const it of d.items) {
      const v = clampInt(s.items[it.id], 0, it.max);
      parts.push(`<tr><td>${it.label}</td><td class="num">${v} / ${it.max}</td></tr>`);
    }
    const subtotalText = d.cap != null && ds.raw > d.cap ? `${ds.raw} → <strong>${ds.capped}</strong> (capped)` : `<strong>${ds.capped}</strong>`;
    parts.push(`<tr class="subtotal-row"><td>Domain subtotal</td><td class="num">${subtotalText} / ${d.max}</td></tr>`);
    parts.push(`</tbody></table>`);
  }
  parts.push(`<div class="total-row-block">Total Part A score: <strong>${total} / ${PART_A_MAX}</strong> → ${tierBadgeHTML(tier)}</div>`);

  parts.push(`<h3>Part B — monthly workload detail</h3>`);
  parts.push(`<p class="section-help">Tier ${tier.n} per-participant rates; phase condition: ${phase.label} (×${phase.value}); data volume factor (Domain 8.1+8.2, ${dataVolumeRaw}/${DATA_VOLUME_MAX}): ×${fmt2(dataVolumeFactor)}, applied to participant WU only.</p>`);
  parts.push(`<table class="wu-table"><thead><tr><th>Status</th><th>Count</th><th>Base WU/participant</th><th>Subtotal (× data volume)</th></tr></thead><tbody>`);
  for (const r of rows) {
    parts.push(`<tr><td>${r.row.label}</td><td class="num">${r.count}</td><td class="num">${fmt1(r.perUnit)}</td><td class="num">${fmt1(r.subtotal)}</td></tr>`);
  }
  parts.push(`<tr><td colspan="3">Static WU (Tier ${tier.n})</td><td class="num">${fmt1(staticWU)}</td></tr>`);
  parts.push(`<tr><td colspan="3">Pre-multiplier total (static + participant)</td><td class="num">${fmt1(preMultiplier)}</td></tr>`);
  parts.push(`<tr><td colspan="3">× Phase multiplier — ${phase.label}</td><td class="num">×${phase.value}</td></tr>`);
  parts.push(`<tr class="total-row"><td colspan="3">Monthly Workload Units</td><td class="num"><strong>${fmt1(monthlyWU)}</strong></td></tr>`);
  parts.push(`</tbody></table>`);

  if (C != null) {
    parts.push(`<p>FTE-equivalent for this protocol alone: <strong>${fmt2(fte)}</strong> (C = ${C} WU/FTE/month, site-supplied). This is not a staffing determination — a regulatory coordinator's WU and a bedside CRC's WU are not substitutable, and portfolio-level concurrency penalties are not reflected here.</p>`);
  }

  if (meta.notes && meta.notes.trim()) {
    parts.push(`<h3>Notes</h3><p class="notes-block">${escapeHtml(meta.notes).replace(/\n/g, '<br>')}</p>`);
  }

  parts.push(`<div class="report-footer">`);
  parts.push(`<p><strong>Unvalidated draft instrument</strong> (${RUBRIC_VERSION}). Not for staffing or budget decisions until the Part E calibration — content validity, inter-rater reliability (target weighted κ ≥ 0.70 item-level, ICC ≥ 0.80 total), criterion validity/capacity-constant time study, and known-groups check — is complete. Re-score annually and on any amendment touching Domains 3, 4, 5, 6, or 8 (Part C). Two independent scorers should reconcile raw item scores for reliability tracking (Part C/D).</p>`);
  parts.push(`<p class="generated-at">Generated ${escapeHtml(new Date().toLocaleString())} · HEM CTM Protocol Complexity &amp; Workload Tool v${TOOL_VERSION}</p>`);
  parts.push(`</div>`);

  $('report').innerHTML = parts.join('');
}

function update() {
  const computed = computeAll();
  updateDomainSubtotals(computed.domainScores);
  renderPartBBreakdown(computed);
  renderFteReadout(computed);
  renderReport(computed);
  saveToLocalStorage(computed.state);
  return computed;
}

// ─────────────────────────────────────────────────────────────────────────
// Persistence
// ─────────────────────────────────────────────────────────────────────────

function saveToLocalStorage(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* private mode / quota — export still works */ }
}

// The restore path warns on a schema gap exactly as the import path does.
// This is the path a returning scorer actually hits — reopening the tool
// restores their last entry automatically — so leaving it unguarded meant the
// most common way to load a pre-v0.2 score was the only one that said nothing.
function showRestoreBanner(schema) {
  const banner = $('restoreBanner');
  const message = $('restoreMessage');
  const stale = schema !== SCHEMA_VERSION;
  if (message) {
    message.textContent = stale
      ? schemaGapMessage(schema, "Restored this browser's autosaved entry — it")
      : 'Restored an unsaved entry from this browser.';
  }
  banner.classList.toggle('banner-warn', stale);
  banner.classList.toggle('banner-info', !stale);
  banner.hidden = false;
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

// ─────────────────────────────────────────────────────────────────────────
// Export / import
// ─────────────────────────────────────────────────────────────────────────

function filenameFor(state, ext) {
  const id = (state.meta.protocolId || 'protocol').trim().replace(/[^a-z0-9_-]+/gi, '_') || 'protocol';
  const date = state.meta.scoreDate || todayISO();
  return `hem-complexity_${id}_${date}.${ext}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportJson() {
  const state = collectState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filenameFor(state, 'json'));
}

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function exportCsv() {
  const computed = computeAll();
  const s = computed.state;
  const cols = [];
  const vals = [];
  const add = (k, v) => { cols.push(k); vals.push(v); };

  add('export_datetime', new Date().toISOString());
  add('tool_version', TOOL_VERSION);
  add('rubric_version', RUBRIC_VERSION);
  add('protocol_id', s.meta.protocolId);
  add('pi_name', s.meta.piName);
  add('scorer_name', s.meta.scorerName);
  add('scorer_role', s.meta.scorerRole);
  add('score_date', s.meta.scoreDate);
  add('score_type', s.meta.scoreType);

  for (const d of DOMAINS) for (const it of d.items) add(`item_${it.id}`, clampInt(s.items[it.id], 0, it.max));
  for (const ds of computed.domainScores) { add(`${ds.domain.id}_raw`, ds.raw); add(`${ds.domain.id}_score`, ds.capped); }
  add('total_score', computed.total);
  add('tier_number', computed.tier.n);
  add('tier_label', computed.tier.label);

  for (const r of STATUS_ROWS) add(`participants_${r.id}`, clampInt(s.participants[r.id], 0, 999999));
  add('phase_id', computed.phase.id);
  add('phase_multiplier', computed.phase.value);
  add('data_volume_raw', computed.dataVolumeRaw);
  add('data_volume_max', DATA_VOLUME_MAX);
  add('data_volume_factor', fmt2(computed.dataVolumeFactor));
  add('static_wu', computed.staticWU);
  add('participant_wu_subtotal', fmt1(computed.participantSubtotal));
  add('pre_multiplier_total', fmt1(computed.preMultiplier));
  add('monthly_wu', fmt1(computed.monthlyWU));
  add('capacity_constant', computed.C ?? '');
  add('protocol_fte_equiv', computed.fte != null ? fmt2(computed.fte) : '');
  add('notes', s.meta.notes);

  const csv = cols.map(csvEscape).join(',') + '\r\n' + vals.map(csvEscape).join(',') + '\r\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filenameFor(s, 'csv'));
}

function showImportFeedback(msg) {
  const el = $('importFeedback');
  el.textContent = msg;
  el.hidden = !msg;
}

function onImportJsonFile(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(String(reader.result));
      if (!isPlausibleState(obj)) throw new Error('missing items/meta');
      applyState(obj);
      showImportFeedback(obj.schema === SCHEMA_VERSION ? '' : schemaGapMessage(obj.schema, 'The file you imported'));
      update();
    } catch (err) {
      showImportFeedback('Could not import that file — it does not look like a JSON export from this tool.');
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
}

// ─────────────────────────────────────────────────────────────────────────
// Events / init
// ─────────────────────────────────────────────────────────────────────────

function wireArmedButton(btn, normalLabel, armedLabel, shouldArm, onConfirm) {
  let armed = false;
  let timer = null;
  const disarm = () => { armed = false; btn.textContent = normalLabel; btn.classList.remove('btn-armed'); if (timer) clearTimeout(timer); };
  btn.textContent = normalLabel;
  btn.addEventListener('click', () => {
    if (armed) { disarm(); onConfirm(); return; }
    if (!shouldArm()) { onConfirm(); return; }
    armed = true;
    btn.textContent = armedLabel;
    btn.classList.add('btn-armed');
    timer = setTimeout(disarm, 4000);
  });
}

function onAnyInput(e) {
  const t = e.target;
  if (!t || !t.id || t.id === 'fileImportJson') return;
  update();
}

function onFocusOutClamp(e) {
  const t = e.target;
  if (!(t && t.tagName === 'INPUT' && t.type === 'number')) return;
  if (t.id === 'capacityConstant') {
    if (t.value.trim() === '') return;
    const n = clampFloatOrNull(t.value, 0);
    t.value = n == null ? '' : String(n);
    update();
    return;
  }
  const min = t.min !== '' ? Number(t.min) : 0;
  const max = t.max !== '' ? Number(t.max) : Number.MAX_SAFE_INTEGER;
  t.value = String(clampInt(t.value, min, max));
  update();
}

function wireEvents() {
  document.addEventListener('input', onAnyInput);
  document.addEventListener('change', onAnyInput);
  document.addEventListener('focusout', onFocusOutClamp);

  $('restoreKeep').addEventListener('click', () => { $('restoreBanner').hidden = true; });
  $('restoreClear').addEventListener('click', () => {
    localStorage.removeItem(LS_KEY);
    $('restoreBanner').hidden = true;
    resetFormToDefaults();
    update();
  });

  $('btnPrint').addEventListener('click', () => window.print());
  $('btnExportJson').addEventListener('click', exportJson);
  $('btnExportCsv').addEventListener('click', exportCsv);
  $('fileImportJson').addEventListener('change', onImportJsonFile);

  wireArmedButton($('btnImportJson'), 'Import JSON', 'Click again to confirm — overwrites current form',
    () => hasAnyData(collectState()), () => $('fileImportJson').click());

  wireArmedButton($('btnClear'), 'New / Clear form', 'Click again to confirm — clears everything',
    () => hasAnyData(collectState()), () => {
      localStorage.removeItem(LS_KEY);
      showImportFeedback('');
      resetFormToDefaults();
      update();
    });
}

function init() {
  generateDomains();
  setVal('metaScoreDate', todayISO());

  const saved = loadFromLocalStorage();
  if (isPlausibleState(saved) && hasAnyData(saved)) {
    applyState(saved);
    showRestoreBanner(saved.schema);
  }

  wireEvents();
  update();
}

document.addEventListener('DOMContentLoaded', init);

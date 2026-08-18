# The rubric, in full

This page is the canonical, citable write-up of the scoring rules the [tool](../index.html) implements. Numbers here are the single source of truth for this project — the [quick guide](quick-guide.md) and [user guide](user-guide.md) link to specific sections instead of restating tables, so there's one place to update if the rubric changes.

> **Status: unvalidated draft (v0.2).** This is a reasoned starting point, not an empirically derived instrument. Section 6 (Validation plan) below specifies the calibration work required before scores drive any staffing or budget decision. Nothing on this page should be read as having cleared that bar yet.

Source: internal HEM CTM draft, [*Non-Malignant Hematology Protocol Complexity & Workload Rubric (Draft v0.1)*](TrialComplexityRubric.pdf) — the original PDF is included alongside this file. This write-up reorganizes and lightly expands that draft for readability and adds the [References](#references) section; it does not change any weight, range, or formula from the source PDF.

> **v0.2 change note.** A review-meeting question — "how does this capture something very data-entry heavy, on the scale of ATHN or MOTIVATE?" — surfaced a real gap: v0.1's Domain 5 cap (16 pts) meant a protocol that was *all* data-entry burden and nothing else (no visits, no IP, minimal safety reporting) topped out around Tier 2, regardless of how much registry/abstraction work it actually generated. v0.2 adds [Domain 8](#domain-8--data-volume-abstraction--registry-burden-016) (16 pts, bringing the Part A total to 116) and a [Part B data volume factor](#3-part-b--monthly-workload-index) driven by two of its items. This is additive only: v0.1's seven domains, their weights, and the tier cutoffs are unchanged, so a protocol scoring zero on every Domain 8 item scores and tiers identically to how it scored under v0.1. Anchors were sanity-checked (not statistically validated — that's still Section 6) by scoring SCCRIP, ATHN, SCDIC-II, and REALAnswr against this portfolio's existing OPAL-based complexity ledger and confirming the ordering held.

## Contents

1. [Purpose](#1-purpose)
2. [Part A — Protocol Complexity Score](#2-part-a--protocol-complexity-score-116-points)
3. [Part B — Monthly Workload Index](#3-part-b--monthly-workload-index)
4. [Converting WU to FTE](#4-converting-wu-to-fte)
5. [Governance](#5-governance)
6. [Validation plan](#6-validation-plan)
7. [References](#references)

## 1. Purpose

Two linked instruments. **Part A** scores a protocol's intrinsic complexity once, at feasibility review, and again on annual re-score or any amendment touching Domains 3, 4, 5, 6, or 8. **Part B** converts that score plus live accrual into a monthly workload figure for staffing conversations. The two are kept separate deliberately: a very complex protocol with two enrolled participants generates less month-to-month work than a simple registry with 400.

**Why not an existing oncology tool.** Two published instruments already do something similar for oncology treatment trials — OPAL and IWAT (see [References](#references)). Both are anchored in patient-facing treatment encounters. This draft adds weight for three things that dominate a non-malignant hematology portfolio and are absent or underweighted in those tools: long-horizon follow-up obligations (gene therapy LTFU), observational/registry data burden (Domain 5, and — after v0.2 found Domain 5 alone insufficient for registries like ATHN or SCCRIP — Domain 8), and qualitative/community-engaged components (Domain 7).

## 2. Part A — Protocol Complexity Score (116 points)

Score each item once. Anchors are given for the low and high end of each item's range; interpolate for values in between — see the [user guide's scoring-method section](user-guide.md#how-to-score-part-a) for how to do that consistently. Domain contributions sum to a 116-point total across eight domains (v0.2 — v0.1's seven domains summed to 100; see [Domain 8](#domain-8--data-volume-abstraction--registry-burden-016)).

### Domain 1 — Regulatory & Sponsorship Framework (0–18)

| Item | 0 | Mid | Max | Pts |
|---|---|---|---|---|
| Regulatory status | Not FDA-regulated | IND/IDE exempt determination required | Active IND/IDE held by St. Jude | 0–5 |
| Sponsor type | Investigator-initiated, internal | NIH/federal | Industry, or federal with external coordinating center | 0–3 |
| Site role | Single-site | Participating site, multi-site | Coordinating center for multi-site | 0–5 |
| Oversight bodies | IRB only | + DSMB or independent monitor | + external audit/inspection readiness obligations | 0–3 |
| IRB model | Local IRB only | sIRB relying | sIRB reviewing for external sites | 0–2 |

### Domain 2 — Population & Consent (0–12)

| Item | Range | Notes |
|---|---|---|
| Pediatric enrollment with assent tiers | 0–3 | 0 = adults only; 3 = multiple assent age bands with reconsent at transition |
| Vulnerable/protected populations | 0–3 | decisionally impaired, wards, pregnant participants |
| Re-consent burden | 0–3 | anticipated amendments requiring re-consent of active cohort |
| Language/literacy accommodation | 0–3 | translated materials, interpreter-dependent visits |

### Domain 3 — Visit & Procedure Burden (0–18)

| Item | Range | Notes |
|---|---|---|
| Protocol-required visits per participant-year | 0–5 | 0 = ≤1; 5 = >12 |
| Procedure intensity | 0–5 | 0 = none/records only; 5 = apheresis, conditioning/HSCT, sedated imaging |
| Timed/PK or serial sampling | 0–3 | any window <30 min counts as max |
| Visit window rigidity | 0–2 | ±14 d vs ±2 d |
| Off-site, home, or remote assessment | 0–3 | includes wearables and home phlebotomy logistics |

### Domain 4 — Investigational Product / Intervention (0–12)

| Item | Range | Notes |
|---|---|---|
| IP handling & accountability | 0–4 | 0 = no IP; 4 = cell/gene product with chain-of-custody |
| Blinding & randomization | 0–3 | 0 = open-label/none; 3 = double-blind with unblinding procedures |
| Pharmacy/manufacturing interface | 0–3 | 0 = none; 3 = on-site manufacturing or apheresis-to-product workflow |
| Dose modification complexity | 0–2 | rules requiring per-visit adjudication |

### Domain 5 — Data & Specimen Management (0–16)

| Item | Range | Notes |
|---|---|---|
| eCRF volume | 0–4 | fields per participant-visit |
| Number of distinct data systems | 0–4 | sponsor EDC + REDCap + registry + imaging portal each count |
| Biospecimen processing/shipping | 0–3 | 0 = none; 3 = time-critical processing with international shipment |
| Central/core lab or imaging read | 0–2 | — |
| PRO/ePRO administration | 0–2 | — |
| Linked or derived data (geospatial, EHR extract, genomic) | 0–3 | includes SDOH/neighborhood-level linkage |

Items sum to 18. **The domain's contribution to the total is capped at 16.** In v0.1 this cap was why the seven domain maxima (18+12+18+12+**16**+12+12) summed to exactly 100 instead of 102. That's still true in v0.2, just against a 116-point total (18+12+18+12+**16**+12+12+**16** — see Domain 8 below) — the cap itself hasn't moved, and the tool still always shows both the raw itemized sum and the capped value when they differ.

### Domain 6 — Safety Reporting & Monitoring (0–12)

| Item | Range | Notes |
|---|---|---|
| Expected AE/SAE volume | 0–4 | — |
| Expedited reporting obligations | 0–3 | multi-recipient (FDA, sponsor, sIRB, DSMB) = max |
| Monitoring visit frequency | 0–3 | — |
| Long-term follow-up horizon | 0–2 | 0 = ≤2 yr; 2 = ≥5 yr (gene therapy LTFU obligations — see [FDA guidance](#references)) |

### Domain 7 — Qualitative, Mixed-Method & Community Engagement (0–12)

| Item | Range | Notes |
|---|---|---|
| Interview/focus group data collection | 0–4 | count × duration; includes scheduling burden |
| Transcription, coding & analysis load | 0–4 | multi-coder with reliability requirements = max |
| Community advisory board or partner site coordination | 0–2 | — |
| Dissemination obligations beyond manuscript | 0–2 | community reports, policy briefs, stakeholder convenings |

### Domain 8 — Data Volume, Abstraction & Registry Burden (0–16)

*Added in v0.2.* Domains 1–7 assume a study generates complexity mainly through visits, IP, and safety reporting. A protocol can be almost entirely data-entry burden — a registry or natural-history cohort with no extra visits, no IP, and light safety reporting — and score near zero on Domains 3, 4, and 6. This domain gives that shape of protocol somewhere to score.

| Item | Range | Notes |
|---|---|---|
| Chart/EHR abstraction burden | 0–4 | 0 = none; 4 = comprehensive structured abstraction of the full record at every encounter (concurrent or retrospective) |
| Diary/PRO review frequency | 0–3 | 0 = none or ≤1/yr; 3 = continuous/near-real-time patient diary requiring ongoing physician review. Distinct from Domain 5's PRO/ePRO item, which scores *administering* the instrument, not reviewing entries as they accumulate. |
| External registry/consortium/DCC submission cadence | 0–3 | 0 = none; 3 = recurring structured submission to an external data-coordinating center on a fixed cadence |
| Linked sub-studies / optional data modules | 0–3 | 0 = none; 3 = ≥4 layered sub-studies, each with its own specimen/data cadence |
| Open-ended/lifetime data-collection horizon | 0–3 | 0 = fixed end date <2 yr out; 3 = open-ended/lifetime cohort with no defined data-collection end date. Distinct from Domain 6's LTFU item, which scores safety follow-up duration, not data-submission duration. |

Items sum to 16; no cap is needed (unlike Domain 5, the itemized sum already equals the domain's contribution).

**Why only two of these five items drive Part B's data volume factor.** Chart/EHR abstraction and diary/PRO frequency describe *per-encounter* burden — how much work touches each participant each time. The other three (DCC cadence, sub-study count, lifetime horizon) are protocol-level structural facts that already raise the Part A total and therefore the tier — and tier already sets both Static WU and every per-participant rate in Part B. Feeding all five items into the Part B multiplier as well would double-count the structural three. See [Part B](#3-part-b--monthly-workload-index) below.

### Complexity tiers

| Total | Tier | Label |
|---|---|---|
| ≤ 20 | 1 | Minimal |
| 21–38 | 2 | Low |
| 39–58 | 3 | Moderate |
| 59–76 | 4 | High |
| ≥ 77 | 5 | Very high |

These cutoffs are unchanged from v0.1, deliberately: Domain 8 only adds points, never subtracts, so a protocol scoring zero on it tiers identically under v0.2 as it did under v0.1 — nothing already scored gets re-tiered by this change. The visible effect is that Tier 5 (≥77) now spans a wider raw-score range (77–116 instead of 77–100), which is what lets a data-volume-heavy registry climb into High/Very High without touching the boundary any existing interventional protocol sits on.

The rubric does not define what a given tier implies operationally (staffing action, review cadence, etc.) — that mapping is exactly what the [time study in Section 6](#6-validation-plan) is meant to produce. Until it exists, tier is a relative ranking within your own portfolio, not an absolute threshold. See the user guide's [interpreting results](user-guide.md#interpreting-your-result) section for how to read a tier and a total without overreaching.

## 3. Part B — Monthly Workload Index

```
Monthly WU = (Static WU[tier] + Data Volume Factor × Σ (participants in status × per-participant WU[status, tier])) × Phase multiplier
```

The source draft's formula box reads, under normal operator precedence, as applying the phase multiplier only to the participant term. But the phase multiplier table (below) is explicitly captioned "apply to the protocol total." **This tool follows the caption**, multiplying the full static-plus-participant sum. At Tier 4 with 3 participants in screening and 2 on-treatment during a startup month, that's `(14 + 7.5 + 12) × 1.6 = 53.6`, not `14 + 19.5×1.6 = 45.2`. If your team reads the source draft differently, say so — this is a genuine ambiguity in v0.1, not a settled interpretation, and it changes the output by double digits of percent.

### Data Volume Factor *(new in v0.2)*

```
Data Volume Factor = 1 + 0.3 × (chart-abstraction score + diary/PRO-frequency score) / 7
```

Range 1.0 (neither item scored) to 1.3 (both items maxed). It multiplies only the participant-WU term, not Static WU — the rationale in both cases is the same one the user asked for directly: two protocols in the same tier with the same participant counts can differ hugely in how much data-entry work each participant-encounter actually generates, and tier/status alone don't capture that. A registry where every visit means pulling a full structured chart abstraction plus reviewing a continuous patient diary (factor 1.3) costs meaningfully more coordinator time per participant than one where the same tier comes from, say, visit burden or IP handling instead (factor 1.0).

Deliberately narrow: only Domain 8's two *per-encounter* items feed this factor (see [Domain 8](#domain-8--data-volume-abstraction--registry-burden-016) for why the other three don't). The cap is 1.3, not higher, because this is an unvalidated instrument — a bigger multiplier is a bigger claim than the current evidence supports; Section 6's time study is what would earn a wider range.

**Worked example.** A Tier 3 registry with the chart-abstraction item at 4/4 and diary/PRO-frequency at 2/3: factor = 1 + 0.3×(6/7) ≈ 1.26 (the tool carries full precision internally; only the displayed factor is rounded to two decimals). With 40 participants in active follow-up (Tier 3 rate 1.5 WU each): participant subtotal = 40 × 1.5 × 1.2571… ≈ 75.4 WU, versus 60 WU without the factor — a ~26% increase specifically attributable to per-encounter data burden, on top of whatever Domain 8's structural items already did to the tier itself.

### Static WU — accrues whether or not anyone is enrolled

| Tier | Static WU/month |
|---|---|
| 1 | 2 |
| 2 | 4 |
| 3 | 8 |
| 4 | 14 |
| 5 | 22 |

### Per-participant WU per month, by status and tier

| Status | T1 | T2 | T3 | T4 | T5 |
|---|---|---|---|---|---|
| In screening / consent | 0.5 | 1.0 | 1.5 | 2.5 | 3.5 |
| Active intervention / on-treatment | 1.0 | 2.0 | 3.5 | 6.0 | 9.0 |
| Active follow-up (protocol visits) | 0.5 | 1.0 | 1.5 | 2.5 | 3.5 |
| Long-term follow-up (annual contact) | 0.1 | 0.2 | 0.3 | 0.5 | 0.7 |
| Closed to accrual, data cleaning/closeout | 0.2 | 0.3 | 0.5 | 0.8 | 1.0 |

Note that "In screening/consent" and "Active follow-up" are identical rows across every tier. That may be intentional — both could genuinely cost the same regardless of protocol complexity — or it may be an under-differentiated artifact of the draft. Either way, it's a specific, testable claim the [time study](#6-validation-plan) should check rather than something this write-up resolves by assertion.

### Phase multipliers — apply to the protocol total

| Condition | Multiplier |
|---|---|
| Startup (activation −3 mo to first enrollment) | 1.6 |
| Steady state | 1.0 |
| Substantive amendment month (+ following month) | 1.3 |
| Audit/inspection or monitoring visit month | 1.4 |
| Closeout quarter | 1.2 |

The source draft doesn't define what happens when two conditions land in the same month (e.g., an amendment during startup). The tool applies exactly one multiplier at a time and asks the scorer to use judgment and record the reasoning — see the [user guide](user-guide.md#phase-condition).

## 4. Converting WU to FTE

**Do not adopt a national ratio.** Establish your own capacity constant *C* = the WU one 1.0 FTE coordinator sustains per month, via the time study in [Section 6](#6-validation-plan). Then:

```
Required CRC FTE = Total portfolio WU/month ÷ C
```

For order-of-magnitude reference only: IWAT (see [References](#references)) settled on a monthly score of 500–600 as appropriate for one full-time CRC, on a different point scale than this rubric. That number is evidence that the calibration step matters — not a value to import.

Two corrections apply before acting on any FTE figure, and both are **portfolio-level**, not single-protocol:

1. **Non-substitutability.** A regulatory coordinator's WU and a bedside CRC's WU are not interchangeable — compute portfolio WU separately by role before converting to FTE, or a regulatory bottleneck gets "solved" by hiring a nurse.
2. **Concurrency penalty.** Coordinators carrying more than 5 protocols lose time to context-switching that this model doesn't capture. Apply a ×1.1 multiplier at 6–8 concurrent protocols, ×1.2 at 9+, until your own data says otherwise.

The tool's optional FTE readout is explicitly scoped to one protocol — it is not this formula, and is labeled accordingly. See the user guide's [FTE caveats](user-guide.md#the-fte-figure) for what that figure is and isn't safe to use for.

## 5. Governance

- **Score at feasibility review**, before institutional commitment. The score is an input to the go/no-go decision, not a post-hoc justification for one already made.
- **Two independent scorers, reconciled.** Log both raw scores — reliability testing (Section 6) needs them.
- **Re-score annually**, and on any amendment touching Domains 3, 4, 5, 6, or 8.
- **Freeze weights for 12 months** once calibrated. Mid-cycle weight changes destroy the trend data that makes this useful for budget requests.

### Build notes

The source draft specified a REDCap build: one instrument for Part A (versioned via a repeating instrument so amendment history is preserved), one repeating instrument for monthly Part B counts, domain sums and tier assignment in calculated fields so scorers never do arithmetic, Part B status counts pulled from the CTMS where possible rather than hand-entered, and the reliability export (both scorers' raw item scores, wide format) built on day one rather than after it's needed.

This project took a different implementation path — a standalone web tool instead of REDCap — but the same principles apply and are met the same way: domain sums and tier are calculated automatically (never hand-added), and the **Reliability CSV row** export produces the wide-format, per-item row the source draft asked for on day one. See the [two-scorer workflow](user-guide.md#the-two-scorer-workflow) for how to use it. The one principle this tool does *not* fulfill is CTMS-sourced Part B counts — participant status counts are entered by hand here, same tradeoff the source draft warned about ("hand entry across 50+ protocols monthly will not survive contact with reality") if your portfolio grows past what one or two people can enter monthly.

## 6. Validation plan

Given the intended use — staffing and budget justification — face validity is not enough.

1. **Content validity.** A panel of 6–8 (CRC, regulatory coordinator, data manager, nurse, PI, finance) rates each item for relevance; compute I-CVI/S-CVI (Lynn 1986; Polit & Beck 2006 — see [References](#references)) and drop items scoring below 0.78.
2. **Inter-rater reliability.** 20–25 protocols spanning all five tiers, two independent scorers. Target weighted κ ≥ 0.70 at item level (Cohen 1968), ICC ≥ 0.80 on total score (Shrout & Fleiss 1979; Koo & Li 2016 for reporting practice). Items that fail need better anchors, not removal.
3. **Criterion validity / capacity constant.** A 6–8 week prospective time study on a stratified sample of staff. Regress actual hours on predicted WU — the slope gives you *C*; the residuals tell you which domains are mis-weighted.
4. **Known-groups check.** Scores should separate protocols staff already identify as heavy vs. light. If they don't, the instrument is wrong and the staff are right. Domain 8 and the data volume factor (v0.2) were sanity-checked this way informally — SCCRIP, ATHN, SCDIC-II, and REALAnswr were scored against this portfolio's existing OPAL-based complexity ledger and the relative ordering held — but that is not a substitute for running the formal check on the full item set once real inter-rater data exists.
5. **Re-calibration every 24 months**, or after any material change in portfolio composition.

Steps 1–3 constitute a publishable methods paper — there is a documented gap for complexity instruments outside oncology, and a non-malignant hematology instrument covering interventional, observational, and qualitative designs would fill it.

## References

**Comparator tools named in the source draft** (both retrieved and confirmed, not recalled from memory):

- Smuck B, Bettello P, Berghout K, Hanna T, Kowaleski B, Phippard L, Au D, Friel K. Ontario Protocol Assessment Level: Clinical Trial Complexity Rating Tool for Workload Planning in Oncology Clinical Trials. *Journal of Oncology Practice*. 2011;7(2):80–84. doi:10.1200/JOP.2010.000051 — this is **OPAL**.
- Fabbri F, Gentili G, Serra P, Vertogen B, Andreis D, Dall'Agata M, Fabbri G, Gallà V, Massa I, Montanari E, Monti M, Pagan F, Piancastelli A, Ragazzini A, Rudnas B, Testoni S, Valmorri L, Zingaretti C, Zumaglini F, Nanni O. How Many Cancer Clinical Trials Can a Clinical Research Coordinator Manage? The Clinical Research Coordinator Workload Assessment Tool. *JCO Oncology Practice*. 2021;17(1):e68–e76. doi:10.1200/JOP.19.00386 — this is **IWAT** ("Istituto Scientifico Romagnolo per lo Studio e la Cura dei Tumori Workload Assessment Tool," named for the developing institute), source of the 500–600 monthly-score reference point in Section 4.

**Supplementary literature** — added for this write-up to ground the Section 6 validation plan and specific Domain 1/6 items in their regulatory source. The source draft does not cite these; they're included here as background reading, not as claims about what v0.1's authors consulted:

- Lynn MR. Determination and Quantification of Content Validity. *Nursing Research*. 1986;35(6):382–385.
- Polit DF, Beck CT. The Content Validity Index: Are You Sure You Know What's Being Reported? Critique and Recommendations. *Research in Nursing & Health*. 2006;29:489–497.
- Cohen J. Weighted kappa: Nominal scale agreement with provision for scaled disagreement or partial credit. *Psychological Bulletin*. 1968;70(4):213–220.
- Shrout PE, Fleiss JL. Intraclass correlations: Uses in assessing rater reliability. *Psychological Bulletin*. 1979;86(2):420–428.
- Koo TK, Li MY. A Guideline of Selecting and Reporting Intraclass Correlation Coefficients for Reliability Research. *Journal of Chiropractic Medicine*. 2016;15(2):155–163.
- U.S. Food and Drug Administration. Long Term Follow-Up After Administration of Human Gene Therapy Products: Guidance for Industry. January 2020. (Finalizes the July 2018 draft; supersedes the November 2006 guidance on observing subjects for delayed adverse events — relevant to Domain 6's long-term follow-up item.)
- National Institutes of Health. Final NIH Policy on the Use of a Single Institutional Review Board for Multi-Site Research (NOT-OD-16-094). Issued June 21, 2016; effective for applications with receipt dates on or after January 25, 2018. (Relevant to Domain 1's IRB model item.)

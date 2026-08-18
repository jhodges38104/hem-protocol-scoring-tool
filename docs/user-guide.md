# User guide

This is the longer reference: how to score consistently, how to run the two-scorer workflow the rubric requires, and — the part most likely to get skipped — how to read a result without claiming more than it supports. If you just need to produce a score right now, the [quick guide](quick-guide.md) is faster. For every table, formula, and the reference list, see [rubric.md](rubric.md).

**Who this is for:** anyone scoring a protocol, and anyone who needs to explain, defend, or act on a score afterward — CTM leadership, PIs, finance, or a scorer preparing for a reconciliation meeting.

> **Status: unvalidated draft (v0.2).** Everything below describes how to apply the rubric as written and how to read its output honestly. It is not a claim that the weights are correct — that's what the [validation plan](rubric.md#6-validation-plan) is for. Nothing in this guide should be read as staffing or budget advice.

## Contents

- [Before you score](#before-you-score)
- [How to score Part A](#how-to-score-part-a)
- [How to score Part B](#how-to-score-part-b)
- [The two-scorer workflow](#the-two-scorer-workflow)
- [Interpreting your result](#interpreting-your-result)
- [FAQ / troubleshooting](#faq--troubleshooting)
- [Data handling](#data-handling)
- [Glossary](#glossary)

## Before you score

**Who scores.** The rubric calls for two independent scorers who reconcile afterward ([Governance](rubric.md#5-governance)). Score separately — don't fill out the form together — then compare. Disagreement isn't a failure mode; it's the raw material the validation plan uses to find items that need better anchors. A score with only one scorer is a legitimate first pass, but flag it as such (score type + a Notes line) so nobody downstream mistakes it for reconciled.

**When to score.** At feasibility review, before the study is institutionally committed to — the score is meant to be an input to that go/no-go, not a justification written after the fact. Then annually, and again on any amendment that touches Domains 3 (visits/procedures), 4 (IP/intervention), 5 (data/specimens), 6 (safety reporting), or 8 (data volume/registry burden — v0.2). An amendment that only changes, say, the community advisory board arrangement (Domain 7) doesn't require a re-score under the rubric as written, though nothing stops you from doing one.

**Who's in the room for reconciliation.** The rubric's content-validity step ([Section 6](rubric.md#6-validation-plan)) names CRC, regulatory coordinator, data manager, nurse, PI, and finance as the perspectives that matter. You don't need all of them for routine reconciliation, but if a score is going to justify a staffing conversation, it's worth having more than one role's eyes on it before it's final.

## How to score Part A

Each item gives you three anchors — a description at 0, roughly at the midpoint, and at the max — and a whole-number range. The rubric's own instruction is: *"Anchor descriptors are given for the endpoints; scorers interpolate."* In practice:

1. Read the 0 and max anchors first. Decide whether the protocol is closer to one end or genuinely in between.
2. If it's not at an anchor, place it at the integer that best reflects where between the two descriptions the protocol actually sits. There's no formula for this — it's a judgment call, which is exactly why two scorers do it independently.
3. If you're stuck between two adjacent integers, pick one and write a one-line reason in the Notes field. That's not busywork: those notes are what the [inter-rater reliability step](rubric.md#6-validation-plan) uses to figure out which items need sharper anchors. An item where scorers keep landing on different integers for the same reason is a signal about the *item*, not about the scorers.

**Worked example — illustrative only, not a scoring key.** Suppose a protocol is investigator-initiated, single-site, IRB-only oversight, using a local IRB. Under Domain 1:

- *Regulatory status* (0–5): if it's an IND-exempt device study, that's the "Mid" anchor by description — a reasonable score is in the 2–3 range, not 0 (which is reserved for genuinely non-FDA-regulated activity) and not 5 (reserved for an active IND/IDE).
- *Sponsor type* (0–3): investigator-initiated and internal is explicitly the 0 anchor — score 0.
- *Site role* (0–5): single-site is explicitly the 0 anchor — score 0.

That's one domain, two items at their anchors and one interpolated, to show the method — not a template to reproduce across all 37 items. The rubric deliberately left the other anchors open for judgment; manufacturing a worked answer for each one here would just be inventing the calibration the validation plan hasn't done yet.

**Domain 5's cap.** Score all six items normally. The tool automatically caps the domain's contribution to the 116-point total at 16, even though the items themselves sum to a possible 18. You'll see both numbers if your raw sum exceeds the cap — that's expected ([why, in rubric.md](rubric.md#domain-5--data--specimen-management-016)).

**Domain 8 (v0.2).** Data-entry-heavy, visit-light protocols (registries, natural-history cohorts) often score near zero on Domains 3, 4, and 6 — Domain 8 is where their actual burden shows up. Score all five items normally; there's no cap here, the itemized sum of 16 *is* the domain's contribution. Two of the five items (chart/EHR abstraction, diary/PRO frequency) also drive Part B's data volume factor automatically — see [how to score Part B](#how-to-score-part-b).

## How to score Part B

Part B asks how many participants are currently in each of five statuses. These aren't perfectly self-defining, so apply them consistently within your team:

- **In screening/consent** — pre-enrollment activity: consent process, eligibility screening, not yet on study.
- **Active intervention/on-treatment** — receiving the studied intervention or actively undergoing protocol-specified treatment procedures.
- **Active follow-up (protocol visits)** — off active intervention but still inside the protocol's defined visit schedule.
- **Long-term follow-up (annual contact)** — the low-intensity, often annual-contact tail (this is where gene therapy LTFU obligations live).
- **Closed to accrual, data cleaning/closeout** — no more visits, but the record isn't finalized.

If a specific participant doesn't cleanly fit one bucket, use judgment and be consistent protocol-to-protocol and month-to-month — the exact edge case matters less than scoring it the same way next month.

**Data volume factor (v0.2).** You don't enter anything extra for this — it's computed automatically from two Domain 8 items you already scored in Part A (chart/EHR abstraction, diary/PRO frequency) and shown above the participant table as a ×1.0–×1.3 multiplier. It scales participant WU only, not Static WU. If it looks wrong, the fix is to revisit those two Domain 8 item scores, not to look for a separate Part B input.

### Phase condition

Pick the one condition from the dropdown that best describes the *current month* — startup, steady state, substantive amendment month, audit/monitoring visit month, or closeout quarter. The source rubric doesn't define what happens when two conditions genuinely coincide (an audit landing during startup, say). When that happens: use judgment about which one dominates that month's actual burden, apply that one, and record the call in Notes. Don't split the difference by averaging multipliers — that's not a rule the rubric supports, it's just a second invented convention on top of the first.

## The two-scorer workflow

The tool doesn't merge two scorers' entries automatically — reconciliation is a human step, by design (Part C wants both raw scores logged, not just a blended result). A practical flow:

1. Each scorer opens a fresh copy of the tool (their own browser/session) and scores Part A independently, filling in their own name under Scorer.
2. Each scorer clicks **Reliability CSV row** and saves the file. (This produces one wide-format row: every item score, domain subtotals, total, tier, and Part B figures — see [Build notes in rubric.md](rubric.md#build-notes) for why this shape.)
3. Combine both CSVs (append the second scorer's data row under the first's, keeping one header row) — a spreadsheet is enough for two scorers; if you're doing this across many protocols for a formal reliability study, that combined file is the input to the weighted-κ/ICC analysis in [Section 6](rubric.md#6-validation-plan).
4. Compare item by item. Where scores match, done. Where they diverge, the two scorers discuss and agree on a final value — or agree they genuinely can't, which is itself worth recording.
5. One scorer enters the reconciled values into a final copy of the tool, sets Score type appropriately, and that copy's **Print/Save as PDF** and **Export JSON** become the record of the reconciled score. Use Notes to record that it's reconciled and by whom.

**Resuming a session.** The tool autosaves to your browser's local storage as you type, so closing the tab isn't fatal. But that storage is per-browser, per-device, and not backed up — export JSON if the entry needs to survive a browser reset, a different computer, or being handed to someone else.

## Interpreting your result

This is the part worth reading slowly before a score goes into a staffing conversation.

**What Tier is, and isn't.** Tier is a weighted-sum bucket ([bands in rubric.md](rubric.md#complexity-tiers)) — it tells you where a protocol sits *relative to the scoring range itself*. The rubric does not yet define what a given tier implies operationally — how many coordinators, what review cadence, what budget line. That mapping is precisely what the [time study](rubric.md#6-validation-plan) is designed to produce, and it hasn't been run yet. Until it has, treat Tier as a relative ranking across your own portfolio ("this protocol scores higher than that one, and here's specifically why"), not as an absolute action threshold ("Tier 4 means X"). Anyone who tells you "Tier 4 means you need a dedicated coordinator" is stating a conclusion the instrument doesn't yet support.

**What the domain breakdown tells you, which is more useful than the total.** The total collapses eight domains into one number; the breakdown doesn't. A Tier 3 protocol that's high in Domain 7 (qualitative/community engagement) and low everywhere else needs a different kind of staff time than a Tier 3 protocol that's high in Domain 3 (visit/procedure burden) and low in Domain 7 — more coordination and interview/transcription capacity in the first case, more clinical-visit throughput in the second. Read the printed report's domain-by-domain table, not just the headline score, when the question is *what kind* of work a protocol will generate.

**What Monthly WU is, and isn't.** WU combines a fixed monthly cost that accrues even with nobody enrolled (Static WU, by tier) with an enrollment-driven cost (participants × per-status rate), scaled by a condition multiplier for the current month ([formula in rubric.md](rubric.md#3-part-b--monthly-workload-index)). It is an internally consistent index, not a validated hours figure — nothing has yet regressed WU against actual measured time (that's Section 6, step 3). Two protocols with the same WU are not guaranteed to take the same actual hours until that regression has been run.

### The FTE figure

If you enter a capacity constant (C), the tool divides this protocol's Monthly WU by C and shows the result. Read that number as **"this protocol's share of one coordinator's capacity, in isolation"** — not as a staffing determination, for two concrete reasons the rubric spells out ([Section 4](rubric.md#4-converting-wu-to-fte)):

1. It's one protocol. Real staffing needs are portfolio WU, summed by role, because a regulatory coordinator and a bedside CRC aren't substitutable for each other.
2. It doesn't include the concurrency penalty (×1.1 at 6–8 concurrent protocols per coordinator, ×1.2 at 9+) that applies at the portfolio level.

If C is blank, that's correct unless your site has already run its own time study — the rubric explicitly warns against importing a published ratio from a different-scale instrument (IWAT's 500–600, see [References](rubric.md#references)) as your C.

## FAQ / troubleshooting

**My Part A total doesn't match what I added up by hand.** Check Domain 5 — its contribution is capped at 16 even though the six items can sum to 18. The tool shows "raw → capped" whenever that's happening. (Domain 8 has no cap — its five items sum straight to its 16-point contribution.)

**I only changed a Part A item, but Monthly WU changed too.** Expected. Per-participant WU rates depend on tier ([table](rubric.md#per-participant-wu-per-month-by-status-and-tier)), and tier comes from the Part A total. Crossing a tier boundary changes every participant's rate, not just the item you edited.

**Two phase conditions both seem to apply this month.** The rubric doesn't define stacking. See [Phase condition](#phase-condition) above — pick the dominant one, note why.

**Can I edit and re-export after I've already printed a copy?** Yes. The tool has no concept of a "locked" score — re-open, adjust, re-export, and use Notes/Score type to make clear which export is the current one of record.

**I imported a JSON file and got a warning about "schema 1."** That file was exported before v0.2 added Domain 8, so it has no scores for those five items — the import banner tells you this rather than silently showing an incomplete total as if it were current. Score Domain 8 for that protocol, then re-export.

**Where does my data go?** Nowhere but your browser. See [Data handling](#data-handling).

**A second scorer's numbers don't match mine and we can't agree.** Record both, and the disagreement itself, in Notes. Don't average them to make the discomfort go away — an unresolved disagreement on a specific item is exactly the signal the [inter-rater reliability step](rubric.md#6-validation-plan) is designed to catch.

## Data handling

The tool is a static page with no backend — there is nowhere for your entries to go except your own browser. Autosave uses browser local storage (survives a closed tab, doesn't survive clearing browser data, and isn't shared across devices). Nothing is transmitted to a server, because the tool doesn't have one. Exporting (PDF/JSON/CSV) is the only way data leaves your browser, and it's a normal file save — handle those files the way you'd handle any document containing a protocol ID and a PI name.

## Glossary

| Term | Meaning |
|---|---|
| IND/IDE | Investigational New Drug / Investigational Device Exemption — FDA authorization to study an unapproved drug or device |
| sIRB | single IRB — one IRB of record reviewing for multiple sites |
| DSMB | Data and Safety Monitoring Board |
| eCRF | electronic Case Report Form |
| ePRO | electronic Patient-Reported Outcome |
| LTFU | Long-Term Follow-Up |
| HSCT | Hematopoietic Stem Cell Transplant |
| WU | Workload Unit(s) — this rubric's internal workload index, defined in [Part B](rubric.md#3-part-b--monthly-workload-index) |
| FTE | Full-Time Equivalent |
| C (capacity constant) | site-specific WU-per-FTE-per-month figure, derived locally, never imported ([Section 4](rubric.md#4-converting-wu-to-fte)) |
| CVI (I-CVI / S-CVI) | Content Validity Index, item- and scale-level — a panel-agreement measure used in the validation plan |
| Weighted κ (kappa) | a chance-corrected inter-rater agreement statistic for ordinal items |
| ICC | Intraclass Correlation Coefficient — inter-rater reliability for a total score |

---
Shorter version: [quick-guide.md](quick-guide.md). Full tables, formulas, and references: [rubric.md](rubric.md).

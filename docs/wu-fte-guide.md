# WU and FTE — what they mean, and how to validate them

> **Status: unvalidated draft (v0.2).** Everything below describes what these two
> numbers currently are and how your team would earn the right to act on them. It is
> not a claim that either is calibrated. Until [step 3](#step-3--criterion-validity-and-the-capacity-constant-c)
> has run at your site, WU is a relative index and the FTE line is not a staffing figure.

This is the companion to [user-guide.md](user-guide.md), aimed at the question that comes
up first in a study-team meeting: *what is this number, and why should I believe it?* The
short answer is that you should believe the first one relatively, the second one not yet,
and this page explains both halves of that and what it takes to change the second one.

## Contents

- [Monthly WU, in plain terms](#monthly-wu-in-plain-terms)
- [The FTE figure, in plain terms](#the-fte-figure-in-plain-terms)
- [Sanity checks you can run today](#sanity-checks-you-can-run-today)
- [The validation plan, as work you can schedule](#the-validation-plan-as-work-you-can-schedule)
- [What changes when each step lands](#what-changes-when-each-step-lands)

## Monthly WU, in plain terms

A Workload Unit is this rubric's internal currency for coordinator effort in a month. It
is not an hour, a visit, or a dollar. It is a made-up unit whose only job is to let you
compare protocols to each other on a consistent scale.

Every protocol's monthly WU is built from two parts:

- **A fixed cost that accrues whether or not anyone is enrolled** — Static WU, set by the
  protocol's tier. A Tier 5 protocol with zero participants still costs Static WU every
  month, because regulatory maintenance, amendments, and monitoring don't pause for
  enrollment. ([table](rubric.md#static-wu--accrues-whether-or-not-anyone-is-enrolled))
- **A cost driven by who is on study right now** — each participant contributes at a rate
  set by *their current status* and the protocol's tier, so somebody in active treatment
  costs several times what somebody in annual long-term follow-up does.
  ([table](rubric.md#per-participant-wu-per-month-by-status-and-tier))

That participant total is then scaled by a **data volume factor** (×1.0 to ×1.3), which
captures how much data work each encounter generates — the difference between a visit
that produces a short form and one that produces a full chart abstraction plus a diary
review. It touches the participant term only, never Static WU.
([why](rubric.md#data-volume-factor-new-in-v02))

Finally the whole thing is multiplied by **one phase multiplier** for the month — startup,
steady state, amendment, audit, or closeout quarter. Only one ever applies; the rubric
doesn't define what to do when two coincide, so you pick the dominant one and say so in
Notes. ([table](rubric.md#phase-multipliers--apply-to-the-protocol-total),
[guidance](user-guide.md#phase-condition))

The full formula and a worked example live in
[rubric.md §3](rubric.md#3-part-b--monthly-workload-index). You never have to compute it —
the tool shows every row of the arithmetic in the printed report, which is the point: a
number you can't audit is a number you shouldn't defend in a budget meeting.

**What WU can tell you today.** That protocol A scores higher than protocol B, and
exactly which domains and which participant statuses drove the difference. That a protocol
is about to get more expensive because a cohort is moving from follow-up into active
treatment. Both are real, useful, and available now.

**What WU cannot tell you today.** How many hours anything takes. Nobody has yet regressed
WU against measured time — that is [step 3](#step-3--criterion-validity-and-the-capacity-constant-c).
Two protocols at the same WU are not guaranteed to consume the same effort until it runs.

## The FTE figure, in plain terms

If you enter a capacity constant **C**, the tool divides this protocol's monthly WU by C:

> This protocol alone ≈ *N* FTE-equivalent (*WU* ÷ *C* WU/FTE/month)

C means **the number of WU that one full-time coordinator sustains in a month**. It is a
property of your site's staff and processes, not of the rubric, which is why the tool
ships with it blank and the rubric
[explicitly forbids importing one](rubric.md#4-converting-wu-to-fte) from a published
instrument on a different scale.

Three things about that line, all of which matter more than the number itself:

1. **It is one protocol in isolation.** Real staffing is portfolio WU, summed *separately
   by role* — a regulatory coordinator's WU and a bedside CRC's WU are not
   interchangeable, and averaging them lets a regulatory bottleneck get "solved" by hiring
   a nurse.
2. **It excludes the concurrency penalty.** Coordinators carrying many protocols lose time
   to context-switching that this model doesn't capture (×1.1 at 6–8 concurrent, ×1.2 at
   9+, applied at portfolio level).
3. **Blank is the correct value** until your site has run its own time study. An FTE line
   computed from a placeholder C is not a conservative estimate — it is a wrong number
   wearing two decimal places.

See also [user-guide.md § The FTE figure](user-guide.md#the-fte-figure).

## Sanity checks you can run today

The tool now warns about the two ways these numbers most often go wrong in practice. Both
warnings are advisory — they never change a result — and both appear in the printed report
as well as on screen, so they travel with the record.

**Every participant belongs in exactly one row.** Under the Part B table you will see:

> Participants counted across all five statuses: **N**. Each participant belongs in exactly one row.

The five statuses are mutually exclusive. A 250-person cohort sitting in long-term
follow-up is 250 in the LTFU row and 0 in the others — not 250 in three rows. If that
total reads higher than the number of people actually on the study, a row is being counted
twice, and the participant term is inflated. When the same non-zero count lands in three or
more rows, the tool says so directly:

> The same count (N) appears in … The five statuses are mutually exclusive — each participant belongs in exactly one of them this month. If that figure is total enrollment rather than the number currently in each status, the participant WU above is overstated.

Two rows matching is left alone deliberately — small cohorts collide by chance, and one
person in follow-up plus one in LTFU is two different people. The headcount total is what
catches that case.

**A capacity constant below Static WU is impossible.** If C is smaller than the protocol's
own Static WU, you will see:

> C = *n* WU/FTE/month is below this protocol's own Static WU (*x* at Tier *t*), which accrues with nobody enrolled — so it implies *y* FTE before a single participant is enrolled. Confirm C came from the Part E time study rather than standing in as a placeholder; until then read the WU figure, not the FTE.

The reasoning is worth understanding rather than just obeying: Static WU is what the
protocol costs with nobody enrolled. If one full-time coordinator supposedly sustains fewer
WU than that, the protocol consumes more than a whole person before it has enrolled anyone
— which cannot be true of a constant that means "WU per FTE per month." A nine-protocol
test batch run before this warning existed shipped nine reports whose FTE figures were
meaningless for exactly this reason, and three whose participant counts were entered in
three rows at once. Neither error was visible in the output at the time.

**When either warning fires,** the fix is in the entry, not the score: recount the
statuses so each person appears once, and either leave C blank or replace it with a figure
that came from a time study. The WU figure above the warning is unaffected and remains
usable.

## The validation plan, as work you can schedule

[rubric.md §6](rubric.md#6-validation-plan) states the plan as a research design. This is
the same five steps as work with owners and dates. Steps 1–3 together constitute a
publishable methods paper.

### Step 1 — Content validity: are these the right 37 items?

- **Who:** a panel of 6–8 — CRC, regulatory coordinator, data manager, nurse, PI, finance.
- **Effort:** roughly an hour each, once.
- **What they do:** rate every item for relevance to non-malignant hematology work.
- **What you record:** one rating per panelist per item.
- **The statistic:** I-CVI is the proportion of panelists rating an item as relevant;
  S-CVI averages that across the instrument. Plain version: *did most of the experts agree
  this item belongs?*
- **Pass:** I-CVI ≥ 0.78 per item. Below that, the item gets rewritten anchors or gets cut.

### Step 2 — Inter-rater reliability: do two people score the same protocol the same way?

- **Who:** two independent scorers, not conferring.
- **How many:** 20–25 protocols spanning all five tiers.
- **How:** the [two-scorer workflow](user-guide.md#the-two-scorer-workflow) — each scorer
  exports a **Reliability CSV row**, and the rows are pooled. Check `rubric_version`
  before pooling; a v0.1 row and a v0.2 row are not the same instrument.
- **The statistic:** weighted κ per item (agreement beyond chance, on an ordinal scale);
  ICC on the total score (how much of the variation is real protocol difference rather
  than scorer difference).
- **Pass:** weighted κ ≥ 0.70 at item level, ICC ≥ 0.80 on the total.
- **When an item fails:** it needs better anchors, not removal. Disagreement means the item
  is ambiguously worded, not that the concept is worthless — record the disagreement
  rather than averaging it away.

This is the step your team can start soonest, because it needs no new instrumentation —
just two people, the tool, and the CSV export that already exists.

### Step 3 — Criterion validity and the capacity constant C

This is the step that makes the FTE line real, and the only one that can.

- **Who:** a stratified sample of staff across roles.
- **How long:** 6–8 weeks, prospective.
- **What you record:** actual hours spent per protocol per month, alongside that
  protocol's predicted WU for the same month.
- **The statistic:** regress measured hours on predicted WU. The slope is your C. The
  residuals tell you which domains are mis-weighted — protocols that consistently take
  longer than predicted are pointing at an under-weighted domain.
- **Pass:** there is no threshold here; the output *is* the calibration. What you are
  looking for is a relationship tight enough that the slope means something.

Record hours by role, not pooled — the non-substitutability correction above depends on it.

### Step 4 — Known-groups: does it agree with what staff already know?

Scores should separate the protocols your team already calls heavy from the ones they call
light. **If they don't, the instrument is wrong and the staff are right.** Domain 8 and the
data volume factor were sanity-checked this way informally against the portfolio's existing
complexity ledger and the ordering held, but that is not the formal check on the full item
set.

### Step 5 — Re-calibrate every 24 months

Or sooner after any material change in portfolio composition. Between calibrations,
[freeze the weights](rubric.md#5-governance) — mid-cycle changes destroy the trend data
that makes any of this useful for a budget request.

## What changes when each step lands

| After | You can defensibly say |
|---|---|
| Nothing yet (today) | "Protocol A scores higher than B, and here is which domain drives it." |
| Step 1 | "The items were vetted by a multi-role panel for this specialty." |
| Step 2 | "Two coordinators score the same protocol the same way, within a stated tolerance." |
| Step 3 | "This portfolio needs *N* FTE" — the first point at which the FTE line is a staffing figure rather than an illustration. |
| Step 4 | "The instrument agrees with experienced staff judgment where we can check it." |

Until step 3, quote WU and tier, cite the domain breakdown for *what kind* of work a
protocol generates, and leave C blank. That is a defensible position. A calibrated-looking
FTE number resting on a placeholder is not.

---
Shorter version: [quick-guide.md](quick-guide.md). Interpreting a result, the two-scorer
workflow, FAQ, glossary: [user-guide.md](user-guide.md). Full tables, formulas, references:
[rubric.md](rubric.md).

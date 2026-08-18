# Quick guide — scoring a protocol in ~10 minutes

For when you have the [tool](../index.html) open and need to produce a score. For the reasoning behind the numbers, governance workflow, and how to interpret what comes out, see the [user guide](user-guide.md).

> **This is an unvalidated draft instrument (v0.2).** Don't use the output alone to justify a staffing or budget decision. Full detail: [rubric.md](rubric.md).

## Before you start

- **Who scores:** two people, independently, then reconcile. If you're the only scorer today, that's fine for a first pass — just flag the score as not-yet-reconciled (use the Notes field) and get a second set of eyes before it's used for anything consequential.
- **When to score:** at feasibility review (before the study is committed to), then again every year, and again on any amendment that touches visit schedule, IP handling, data systems/registry burden, or safety monitoring.

## Steps

1. **Open the tool** and fill in Protocol ID, PI, your name/role, and score date at the top. This is what makes your export identifiable later.
2. **Score Part A**, domain by domain. Each item shows its 0/mid/max anchors — place your protocol between them; whole numbers only. If you're genuinely torn between two values, pick one and say why in the Notes field at the bottom of the form. That note is useful data, not clutter — see [how to score Part A](user-guide.md#how-to-score-part-a) if you want the reasoning behind interpolation.
3. **Check the tier badge.** It updates live as you score. Domain 5 (Data & Specimen Management) has a cap — if your raw item sum there exceeds 16, the tool shows both numbers; that's expected, not a bug. Domain 8 (Data Volume, Abstraction & Registry Burden — new in v0.2) is where visit-light, data-entry-heavy protocols (registries, natural-history cohorts) should expect to score, not Domain 3.
4. **Fill in Part B.** Enter how many participants are currently in each status (screening, active, follow-up, LTFU, closeout), and pick the one condition that best describes this month (steady state, startup, amendment, audit, or closeout). If two conditions genuinely apply at once, pick the one that dominates and note it — the rubric doesn't define stacking. Participant WU is also scaled by a data volume factor (×1.0–×1.3, shown above the table) driven by two of Domain 8's items — you don't enter this separately, it's computed from Part A.
5. **Read the Monthly WU** in the results panel. Leave the capacity constant (C) field blank unless your site has already completed its own time study — don't paste in a number from a published tool on a different scale.
6. **Export.** Click **Print / Save as PDF** for a record you can file or share. Click **Export JSON** if you (or the second scorer) will re-open this exact entry later. Click **Reliability CSV row** if this score needs to be pooled with other scorers' rows for agreement checking.

## Reading your result, briefly

- **Tier** is a relative ranking within your own portfolio right now — the rubric doesn't yet define what staffing action a given tier implies (that's what calibration is for). Don't over-read it.
- **Monthly WU** combines a fixed monthly cost (accrues even with zero participants) with an enrollment-driven cost, scaled by this month's condition. It moves month to month even if Part A never changes.
- **FTE** (if you entered C) is for *this protocol only*. It is explicitly not a hiring number — see [the FTE caveats](user-guide.md#the-fte-figure) before anyone treats it as one.

Full walkthrough, worked example, and FAQ: [user-guide.md](user-guide.md). Full rubric with every table and the reference list: [rubric.md](rubric.md).

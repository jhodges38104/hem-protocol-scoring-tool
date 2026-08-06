# HEM Protocol Complexity & Workload Tool

A static, single-page calculator for the **Non-Malignant Hematology Protocol
Complexity & Workload Rubric (Draft v0.1)**. HEM CTM staff enter a protocol's
Part A item scores and Part B monthly participant counts; the page computes
domain subtotals, the complexity tier, and the Monthly Workload Units (WU)
figure, and can print/export the result.

> **The rubric itself is an unvalidated draft.** This tool performs the
> arithmetic the document defines — it does not validate, endorse, or
> calibrate the instrument. See "Status" in the source rubric and Part E
> (validation plan) before using scores for staffing or budget decisions.

## Using it

Open `index.html` in a browser — no build step, no server, no dependencies.
Everything runs client-side and autosaves to the browser's local storage as
you type; nothing is transmitted anywhere. From the **Export** section you can:

- **Print / Save as PDF** — uses the browser's print dialog against a
  dedicated report layout (not a screenshot of the form).
- **Export JSON** — full fidelity save file; re-load later via **Import JSON**.
- **Reliability CSV row** — one wide-format row (all item scores + computed
  fields), for pooling exports from multiple scorers per Part D/C of the
  rubric (inter-rater reliability tracking).

## Deploying on GitHub Pages

1. Push this repository to GitHub.
2. Repo Settings → Pages → Deploy from a branch → select `main` and `/ (root)`.
3. The page will be live at `https://<org-or-user>.github.io/<repo>/`.

No secrets, backend, or build step are involved, so any repo visibility works;
see the note on private-repo Pages requiring GitHub Enterprise Cloud if that
matters for your org.

## Interpretive decisions baked into the arithmetic

The source PDF is a draft and left a few things ambiguous. Where it did, this
tool made an explicit choice rather than guessing silently:

- **Domain 5 cap.** Items sum to 18, but the domain's contribution to the
  100-point total is capped at 16 (stated directly in the source and required
  for the domain maxima to sum to exactly 100). The UI shows both the raw
  itemized sum and the capped value whenever they differ.
- **Phase multiplier scope.** The formula is presented as
  `Static WU + Σ(participant WU) × Phase multiplier`, which under normal
  operator precedence would apply the multiplier only to the participant
  term. But the phase multiplier table is explicitly captioned "apply to the
  protocol total." This tool follows the caption:
  `Monthly WU = (Static WU + Σ participant WU) × Phase multiplier`.
- **Multiplier stacking.** The rubric doesn't say what happens when two phase
  conditions land in the same month (e.g., a substantive amendment during
  startup). This tool applies exactly one multiplier at a time; the form
  surfaces this as a note rather than silently picking a convention for you.
- **FTE labeling.** The rubric's FTE formula (`portfolio WU ÷ C`) is a
  portfolio-level calculation requiring role-separated WU and a concurrency
  penalty for coordinators carrying multiple protocols. This tool scores one
  protocol at a time, so its optional FTE figure is explicitly labeled
  "this protocol only" rather than "Required FTE," and is not meant to
  justify a hiring decision by itself.

## Files

- `index.html` — page structure and the input form.
- `app.js` — rubric data (domains/items/weights), scoring logic, rendering,
  export/import, autosave.
- `styles.css` — layout, light/dark theme, and the print stylesheet.

No framework, bundler, or external network calls — deliberately, so this runs
unmodified on a hospital network and stays auditable by reading three files.

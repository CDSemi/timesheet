# GOV-E8-FIX dispatch brief

- Mission/task: timesheet-software-readiness / GOV-E8-FIX; board package GOV; kind fix;
  attempt 1; governance change required by owner decision E-8 (2026-10-03, board
  `owner_decisions`, owner reply "dùng đề xuất").
- Profile/routing: timesheet-worker, requested sonnet/medium, no override. Routing:
  size S, risk M (governance text), novelty no. Task record in English; AGENTS.md is
  human-facing and keeps its .vi.md pair.
- Read AGENTS.md from disk first, plus docs/04 "Visual standard" (just added by WP2-DEC),
  src/client/styles.css (read-only) and docs/08 governance-path rules.

## Decision to encode (binding)

Keep plain CSS, and put the 4px radius and the 300 ms ease-out transitions in CSS custom
properties. Change the AGENTS.md UI section ("Unified Frontend & UI/UX Standards",
lines 31–39) minimally. Remove only what conflicts with the repository; keep the
owner's intent and the three-skill orchestration.

- Item 1: replace the `tailwind.config.js` reference with `src/client/styles.css` (CSS
  custom properties), global CSS and established components. Replace "rogue utility
  classes" with: introduce new values only as CSS custom properties.
- Shapes: replace "defined in the `brandkit`" with a radius custom property set to 4px.
- Shadows: replace "product/platform cards (e.g., P8000, P9000)" with "cards and panels".
- Transitions: replace the Tailwind class with `transition: all 300ms ease-out` through
  a shared custom property, and "buttons and product links" with "buttons and links".
- Item 2 and the section heading stay as written, unless a phrase directly contradicts
  plain CSS.
- Apply the equivalent change to the matching section of AGENTS.vi.md.

## Owned (writable) paths

AGENTS.md; AGENTS.vi.md; this report; handoff/delivery/evidence/GOV-E8-FIX/. Nothing
else (no CSS or source changes; T09 implements the visual standard).

## Checks

- `python handoff/delivery/validate_package.py --preflight` with the workflow Python
  recorded in handoff/delivery/evidence/orchestration/run-validation.ps1. It must pass:
  pairs, links and 91 scenarios.
- `git diff --check`.
- Evidence must be masked, with LF line endings and a single final newline.
- Return at most 150 words, beginning with your self-reported model: before and after
  text of each changed line, check exits, deviations.

## Results

(Worker appends here.)

Edited AGENTS.md lines 34, 37-39 and AGENTS.vi.md lines 36, 39-41 per the brief.
validate_package.py --preflight (workflow Python): exit 0, 91 scenarios.
git diff --check: exit 0. Evidence: handoff/delivery/evidence/GOV-E8-FIX/.
Deviation: none. Vietnamese line 41 subject wording kept; only the transition token changed.

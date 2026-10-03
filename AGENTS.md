# Project instructions

1. Read the active prompt in `handoff/prompts/` (`handoff/NEXT_ACTION.md` names it) and its named English documents. English is authoritative; keep matching `.vi.md` translations. Discuss progress (chat) in Vietnamese. Code, comments and API contracts are English. Task briefs/results under `handoff/delivery/tasks/` are English-only; Vietnamese stays for human-facing docs, prompts, templates, NEXT_ACTION, CHECKPOINT/HANDOFF/REVIEW and chat.
2. Implement the active work package only. The authorized orchestration mission may advance through WP1–WP5 after each required gate and independent audit passes; do not skip gates. Inspect the repository before editing; preserve unrelated work. Use a small modular app and one production calculation engine. Routine implementation choices are autonomous within the contracts.
3. Use subscription sign-in. The coordinator may select supported subagent models/effort and bounded concurrency under document 08 without asking again. Do not enable overage, attach API billing, purchase credits, or change global settings/speed. Prompt text alone does not configure the client.
4. Enforce ownership on all data/file actions. Keep PDFs, signatures and tokens private. Never publish production secrets, signature images or personal timesheet data; the tracked workbook is the sanitized template described in `reference/inputs/README.md`.
5. Follow the required acceptance gate. Record executable commands and actual results; never invent test evidence. A reported result is not independent proof.
6. During implementation/review use synthetic data and local mail capture/dry-run. Prepare a concrete pilot packet before owner authorization of real sending/deployment. Do not request credentials in chat.
7. UTC instants, explicit accounting dates and saved IANA reporting zones are different values. Device-zone changes must not regroup timesheets.
8. User-confirmed requirements outrank inherited formulas. Flag a real contradiction and update the canonical rule plus translation; do not silently change business behavior.
9. Before stopping, save HANDOFF or CHECKPOINT in `handoff/delivery/` (forms in `handoff/templates/`) with files/commit, evidence, remaining scope and one next action. During orchestration, persist `handoff/delivery/ORCHESTRATION.json` before dispatch and after each result, not only at a usage warning. Continue interrupted work rather than restarting accepted packages.
10. This file is project guidance, not an installable skill or a request to change global assistant settings.
11. Do not use deprecated APIs, types, options or packages of the language, runtime, libraries or tools; use the documented replacement. `npm run lint` (typescript-eslint `no-deprecated`) must pass, and a deprecation warning from the toolchain or runtime is a defect to fix, not to suppress.
12. After file changes, every response must include a concise `Commit description` (use skill `commit-message`). Owner standing authorization (2026-10-02, see `docs/08_AI_WORKFLOW_AND_BUDGET.md`): only `timesheet-committer` commits and pushes, under the rules there. Outside that authorization leave changes uncommitted and NEVER create/amend/push a commit unless the user explicitly requests it.
13. Work roles are vendor-neutral. For the single-prompt mission, read `handoff/prompts/ORCHESTRATE.md` and `docs/08_AI_WORKFLOW_AND_BUDGET.md`: the main agent coordinates and records state; subagents plan, implement, fix, verify and independently audit. A fresh auditor must not have authored the audited change. ChatGPT/Codex participation is optional; never require a manual vendor handoff to satisfy a gate.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for `CDSemi/timesheet` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Unified Frontend & UI/UX Standards (Taste Skills Integration)
Whenever editing, refactoring, or creating any UI components or views for C&D Semi, you must strictly orchestrate three skills: `stitch-design-taste`, `design-taste-frontend`, and `high-end-visual-design` using the following unified workflow:

1. **Pre-flight Consistency Check (Stitch Taste):** Before generating any code, inspect the existing `src/client/styles.css` (CSS custom properties), global CSS files, and established components in the repository. Match the exact spacing density (padding/margin), font weights, and corporate color palette. Never introduce arbitrary styling; introduce new values only as CSS custom properties.
2. **Structural & Layout Foundations (Frontend Taste):** Ensure high-density, grid-based layouts with strict typographic hierarchy and a responsive mobile-first default. Every component must have proper "breathing room" (clean padding/gap) and structured data presentation suitable for B2B semiconductor hardware.
3. **High-End Industrial Polish (High-End Design):** Elevate the visual aesthetic without losing technical seriousness:
- **Shapes:** Avoid organic or playful shapes. Maintain strict adherence to the sharp, low-radius `4px / rounded` corners set by a radius CSS custom property of `4px`.
- **Shadows:** For cards and panels, use ultra-subtle, multi-layered diffuse soft shadows instead of harsh borders to project a premium, high-tech instrument feel.
- **Transitions:** Implement smooth micro-interactions. All interactive states (`hover`, `active`, `focus`) for buttons and links must use fluid, non-abrupt CSS transitions (`transition: all 300ms ease-out`) through a shared CSS custom property.

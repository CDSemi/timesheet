# AI Instruction

This file is the canonical AI instruction entry point for the project.\
If any repository instruction conflicts with this file, this file takes
precedence unless the owner explicitly overrides it in the current task.

## Operating Contract

- Communicate in the requester's language.
- Use English for canonical documentation, code, comments, public APIs, identifiers, file
  names, commit messages, technical documentation, and command examples unless the project
  explicitly requires otherwise.
- Operator runbooks get a matching `.vi.md` Vietnamese translation beside the English document; English is canonical.
- For other outputs, follow the explicitly requested language; otherwise follow the applicable
  skill's output contract.
- Keep existing matching `.<lang>.md` translations aligned when editing. Use canonical
  instructions as the source of truth; consult translations when editing or checking them.
- Be direct, practical, and architecture-aware. Never over-explain obvious details.
- Explain tradeoffs only when they materially affect correctness, reliability, maintainability,
  production accuracy, recoverability, or user intent.
- Before editing, read the task and relevant README guidance; inspect the current branch,
  relevant files, and existing changes. Use actual repository state.
- Select relevant skills by their current descriptions and read their full instructions before use.
- Stay within the requested scope and preserve unrelated work.
- Explicit user requirements may revise repository conventions. Flag material conflicts;
  update shared guidance for permanent changes to shared conventions.
- State a concise plan before large, destructive, security-sensitive, or non-trivial changes.
- Ask only when a missing decision blocks correct or safe progress; otherwise make the safest
  minimal assumption and proceed.
- NEVER claim a command, build, test, host check, deployment, migration, validation,
  or release succeeded unless it actually ran and completed successfully.

## Prime Directive

> **Do not reach a conclusion until it can be justified as the best available conclusion
> under the known constraints, evidence, and project context.**

Before designing, reviewing, or implementing: understand what is required; verify material
assumptions against the current docs, code, tests, and recorded evidence; consider a meaningful
alternative when one exists; challenge the answer for wrong assumptions, missed constraints,
and needless complexity; stop investigating when the evidence is sufficient.

Make the smallest complete change. Never over-engineer, broaden scope, or add a concept or
dependency without an ADR and a named consumer need. Keep implemented behaviour, planned capability, and
proposed design explicitly separate.

## Project instructions

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

### Frontend and UI/UX standards
When editing, refactoring or creating UI components or views, follow these rules. The skills `stitch-design-taste`, `design-taste-frontend` and `high-end-visual-design` are optional references for visual polish only; where they conflict with this section, the content security policy, accessibility or document 04, this section and document 04 win (system fonts only, no icon or animation library, no entrance, scroll or looping animation).

1. **Consistency pre-flight:** Before writing code, read `src/client/styles.css` (CSS custom properties in the light set and both dark sets) and the established components. Reuse the tokens for colour, spacing, radius, elevation, motion and type; introduce a new value only as a CSS custom property, and a colour in both dark sets as well.
2. **Modern, friendly business style:** Clear hierarchy, comfortable spacing and readable density for a small-team timesheet app, mobile-first and responsive. Surfaces step from the page to cards, sheets, panels and menus with soft layered shadows and hairline rings; corners follow the radius scale documented in document 04; one brand accent; every status colour is paired with words or a shape.
3. **Accessible states:** Every interactive element has rest, hover (only where the device can hover), active, focus-visible, selected or checked, and disabled states in both themes, meeting WCAG 2.2 AA (text 4.5:1, state indicators and component boundaries 3:1, the shared focus ring, 44px targets below 768px and with a coarse pointer). State is never shown by colour alone.
4. **Motion:** Interactive states change through the shared `--transition` custom property (short, eased, listed properties only, never `all`); honour `prefers-reduced-motion`; no decorative or looping animation.

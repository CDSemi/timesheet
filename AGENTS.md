# Project instructions

1. Read the active prompt and its named English documents. English is authoritative; keep matching `.vi.md` translations. Discuss progress with Huy in Vietnamese. Code, comments and API contracts are English.
2. Implement the active work package only. Inspect the repository before editing; preserve unrelated work. Use a small modular app and one production calculation engine. Routine implementation choices are autonomous within the contracts.
3. Use subscription sign-in. Do not enable overage, attach API billing, purchase credits, switch model/speed/effort or start parallel agents on the user's behalf. Prompt text does not configure the client.
4. Enforce ownership on all data/file actions. Keep PDFs, signatures and tokens private. Never publish production secrets, signature images or personal timesheet data; the tracked workbook is the sanitized template described in `inputs/README.md`.
5. Follow the required acceptance gate. Record executable commands and actual results; never invent test evidence. A reported result is not independent proof.
6. During implementation/review use synthetic data and local mail capture/dry-run. Prepare a concrete pilot packet before owner authorization of real sending/deployment. Do not request credentials in chat.
7. UTC instants, explicit accounting dates and saved IANA reporting zones are different values. Device-zone changes must not regroup timesheets.
8. User-confirmed requirements outrank inherited formulas. Flag a real contradiction and update the canonical rule plus translation; do not silently change business behavior.
9. Before stopping, save HANDOFF or CHECKPOINT with files/commit, evidence, remaining scope and one next action. Continue interrupted work rather than restarting accepted packages.
10. This file is project guidance, not an installable skill or a request to change global assistant settings.
11. Do not use deprecated APIs, types, options or packages of the language, runtime, libraries or tools; use the documented replacement. `npm run lint` (typescript-eslint `no-deprecated`) must pass, and a deprecation warning from the toolchain or runtime is a defect to fix, not to suppress.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for `CDSemi/timesheet` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

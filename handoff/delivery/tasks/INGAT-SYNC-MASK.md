# INGAT-SYNC-MASK dispatch brief (remove commit identity lines from two evidence files)

- **Task.** Side track "Ingat deployability", task INGAT-SYNC-MASK, kind evidence masking,
  attempt 1. It answers the stop of INGAT-SYNC-RECORD2 attempt 1: the precommit check
  blocked four "email address" findings in
  `handoff/delivery/evidence/INGAT-SYNC-CHECK/02-M.txt` (lines 4-5) and `03-R.txt` (lines
  3-4): the `author` and `committer` lines of `git cat-file -p` output, which carry the
  owner's commit e-mail address. Not on `ORCHESTRATION.json`.
- **Profile and routing.** timesheet-light (effort low), requested model haiku; routing
  S/L/no. English record.

## Edit (Edit tool only)

- In `02-M.txt`, replace lines 4 and 5 (`author …` and `committer …`) with the single line
  `author and committer lines omitted (the repository's commit identity; see the commit on GitHub)`.
- In `03-R.txt`, replace lines 3 and 4 the same way.
- Change nothing else: the `tree`, `parent` and message lines stay byte-identical. The
  `Co-Authored-By: … <noreply@anthropic.com>` line stays (that address is allowed).
- Then Grep every file under `handoff/delivery/evidence/INGAT-SYNC-*` and
  `handoff/delivery/tasks/INGAT-SYNC-*.md` for `@` and report each hit with its file and
  line, without copying any address into your report. Edit nothing else; if another
  address appears, report it only.

## Owned paths

- `handoff/delivery/evidence/INGAT-SYNC-CHECK/02-M.txt` and `03-R.txt`; this brief's
  Results. Nothing else. No git command that writes; no staging, commit or push.

## Runtime

Use the Read, Edit and Grep tools only (no shell needed). If a permission check denies a
call, stop and report. End the brief with "Status: done" and exactly one newline.

Return at most 80 words, beginning 'Self-reported model: ...'.

## Results

- Edits (Edit tool): `02-M.txt` lines 4-5 and `03-R.txt` lines 3-4 replaced by the single
  omission line from the brief. Tree, parent, message and the Co-Authored-By line unchanged.
  Both edits reported success.
- Grep for `@` (line numbers only; no address copied):
  - `evidence/INGAT-SYNC-CHECK/03-R.txt` line 16: Co-Authored-By noreply line (allowed).
  - `evidence/INGAT-SYNC-CHECK/02-M.txt` line 18: Co-Authored-By noreply line (allowed).
  - `evidence/INGAT-SYNC-GATE/verify.txt` lines 2, 6, 10, 14, 27, 31, 35, 55: pnpm-style
    package-name headers (`timesheet@0.1.0`), not addresses.
  - `evidence/INGAT-SYNC-GATE/verify.txt` line 62: a synthetic example-domain address in
    smoke output (address not copied; a further address, not a commit identity).
  - `evidence/INGAT-SYNC-GATE/typecheck.txt` line 2, `test.txt` line 2, `lint.txt` line 2:
    package-name headers.
  - `evidence/INGAT-SYNC-MERGE/record-message.txt` line 12 and `commit-message.txt` line 13:
    Co-Authored-By noreply lines (allowed).
  - `evidence/INGAT-SYNC-RECORD/commit-message.txt` line 13: Co-Authored-By noreply line (allowed).
  - `tasks/INGAT-SYNC-GATE.md` lines 36, 39, 90: image digest references (`ghcr.io/...@sha256`),
    not addresses.
  - `tasks/INGAT-SYNC-MASK.md` lines 18 and 20: this brief's own text.
- No other file edited. No git write command run.

Status: done

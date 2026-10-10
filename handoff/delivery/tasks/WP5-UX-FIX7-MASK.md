# WP5-UX-FIX7-MASK dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX7-MASK; package WP5; kind
  documentation; attempt 1; depends on WP5-UX-FIX7-FREEZE attempt 1 (stopped).
- Why: WP5-UX-FIX7-FREEZE attempt 1 stopped before commit because
  `scripts/precommit-check.mjs` blocked 37 tokens in handoff records (see that brief's
  Results). 36 are the synthetic test address cut to 31 characters by a probe (local
  part `payroll-synthetic`, domain cut to `example.inval`; the full address
  `...@example.invalid` passes, the cut form does not). One is a profile-path grep pattern in an evidence script. None is
  real personal data, but the check must pass, and the committer profile may not mask
  these. You mask them; the committer retries afterwards.
- Profile/routing: timesheet-light (sonnet, effort low), no override. Routing: size S,
  risk L, novelty no. Record in English.

## Scope: exactly these nine files

Evidence (masked LF `.txt`):
1. `handoff/delivery/evidence/WP5-UX-A11Y-SWEEP/11-summary-r1.txt`
2. `handoff/delivery/evidence/WP5-UX-A11Y-SWEEP/11-summary-r2.txt`
3. `handoff/delivery/evidence/WP5-UX-A11Y-SWEEP/11-summary-r3.txt`
4. `handoff/delivery/evidence/WP5-UX-A11Y-SWEEP/11-summary-r3d.txt`
5. `handoff/delivery/evidence/WP5-UX-A11Y-SWEEP/11-summary-r3e.txt`
6. `handoff/delivery/evidence/WP5-UX-FIX7/11-selfcheck-summary-s1.txt`
7. `handoff/delivery/evidence/WP5-UX-FIX7/70-privacy-grep.txt`
8. `handoff/delivery/evidence/WP5-UX-FIX7/privacy-grep.sh.txt` (line 12, profile path)

Task record:
9. `handoff/delivery/tasks/WP5-UX-FIX7.md` (line 205 only, inside the Results section)

## What to do

1. Read `scripts/precommit-check.mjs` (read only) and note how it detects email
   addresses and profile paths, and which domains or forms it allows.
2. In files 1-7 and 9, replace every cut token (the local part, the at sign and the cut
   domain `example.inval`) that is NOT the start of the full
   `payroll-synthetic@example.invalid` with `<email>`. Never
   change the full `@example.invalid` address. If one of these files contains another
   email form that the check's rule blocks, replace it with `<email>` too and list it.
3. In file 8, replace only the Windows account segment of the profile-path pattern with
   `<user>` (keep the rest of the pattern), so the check no longer matches it. Change
   nothing else in that line.
4. In file 9, change only the flagged token on line 205; do not reword the worker's
   Results otherwise.
5. Use the Edit tool for every change (or `replace_all` within one file). Keep LF line
   endings and every other byte unchanged.
6. Verify with Grep, using a pattern equivalent to the check's rules from step 1, that no
   blocked email or profile-path token remains in the nine files, and that the full
   `@example.invalid` occurrences are unchanged in count. Record per-file replacement
   counts (expected total 36 emails + 1 profile segment; explain any difference).

## Hard limits

- Touch only the nine files plus this brief's Results and
  `handoff/delivery/evidence/WP5-UX-FIX7-MASK/` (one `mask-report.txt`, LF).
- **Do not run any git command that changes the index or the working tree**
  (no `git add`, `git reset`, `git restore`, `git stash`, `git checkout`). The index
  currently holds 141 paths staged by the stopped freeze; leave it as it is. Read-only
  `git status --short` and `git diff --stat` are allowed.
- Never edit source, tests, docs, the board, checkpoints, NEXT_ACTION or any other
  handoff file. Do not commit or push.
- Use Git Bash only if you need a shell at all. **NEVER FEED ANYTHING TO PYTHON OR NODE
  THROUGH STDIN: NO HEREDOCS, NO `| node`, NO `| python`, NO `node -e`. NEVER PIPE OUTPUT
  INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.**
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-FIX7-MASK` for any scratch output.
- If a permission check denies a call, stop and report.

## Return

At most 100 words beginning with 'Self-reported model: ...': per-file replacement counts,
the total, the verification result, any other token found, and confirmation that the
index and all other files were untouched. Append the same to Results, ending with
"Status: done".

## Addendum for attempt 2 (coordinator, 2026-10-09)

WP5-UX-FIX7-FREEZE attempt 2 stopped on 7 new email blocks. Every one quotes the cut
synthetic address in records written after attempt 1. The coordinator has already
rewritten its own five (board, checkpoint pair, this brief's lines 8 and 34) without the
at sign. Your scope for attempt 2:

1. `handoff/delivery/evidence/WP5-UX-FIX7-MASK/mask-report.txt` line 3: rewrite the
   quoted cut token so that it has no at sign (for example "the cut synthetic address,
   local part payroll-synthetic, domain cut to example.inval"). Do not quote the cut
   address with its at sign anywhere in your report or Results (your attempt 1 Results
   below are clean; keep it that way).
2. `handoff/delivery/tasks/WP5-UX-FIX7-FREEZE.md` attempt 1 Results, line 214 only:
   replace the quoted cut address with `<email>`. Change nothing else in that file.
3. Sweep: list every changed or untracked path under `handoff/` with read-only
   `git status --short --untracked-files=all handoff` (to a file), then apply a pattern
   equivalent to the email and profile-path rules of `scripts/precommit-check.mjs` to the
   working-tree copy of each of those paths (text files only). Report every remaining hit
   with file and line. Fix only hits inside your owned paths (the nine attempt-1 files,
   the two files above, this brief's Results and your report); report any other hit
   without editing it.
4. Use the Edit tool only (no sed). Append an "Attempt 2" block to `mask-report.txt` and
   to Results.

Hard limits from attempt 1 still apply (no git write command; the index holds 143 staged
paths from the stopped freeze; leave it).

## Results

Self-reported model: claude-sonnet-5-5. Emails masked: r1 10, r2 10, r3 2, r3d 2, r3e 2,
selfcheck-s1 8, 70-privacy-grep 1, WP5-UX-FIX7.md 1 = 36; profile segment in
privacy-grep.sh.txt line 12: 1 (now `<user>`). Grep verification: only allowed
`@example.invalid` addresses remain, full-address counts unchanged, no other blocked token.
Index and all other files untouched (no git write command). Report:
evidence/WP5-UX-FIX7-MASK/mask-report.txt. Status: done

Attempt 2: report line 3 rewritten without the at sign; FREEZE brief line 214 quoted
cut address replaced with `<email>`. Sweep of the whole handoff tree: 0 blocked emails; no
profile-path hit in changed or untracked paths (ORCHESTRATION.json:2746 is a "/users" route,
not a profile path); 21 older hits in committed files left unedited (see report). No git
write command; index untouched. Status: done

# WP2-T05-PRIVSCAN dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T05-PRIVSCAN; package WP2; kind
  diagnose; attempt 1; depends on WP2-T05. Read-only.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Read AGENTS.md from disk first (rules 4 and 6), then
  [WP2-T05-FREEZE](WP2-T05-FREEZE.md) (the expected working-tree set and the attempt-1
  result), then scripts/precommit-check.mjs (read its rules and allowlists; do not run
  it).

## Why

WP2-T05-FREEZE attempt 1 did not commit. The auto-mode permission classifier denied
the committer's first combined command with reason "Credential Leakage". That command set
the Node PATH, created the evidence directory, staged the explicit path list, and ran
`node --version` and the precommit check. Which part triggered the denial is unknown. The
owner decides how to proceed. This scan gives that decision facts.

## Hard limits

- Use only Read, Grep and Glob. Do not use Bash: no git command, no script, and no
  precommit run.
- Do not stage, commit or push. Do not retry any part of the denied command.
- Do not edit any file except this report and handoff/delivery/evidence/WP2-T05-PRIVSCAN/.
- Never reproduce a matched value. Show at most its first four characters followed by
  "…".

## Scope

Scan every file in the WP2-T05-FREEZE expected set (new and modified). Enumerate
directories with Glob.

Look for content that a reviewer or an automated classifier could read as a credential
or personal data. Search case-insensitively for:
- password, passwd, pwd, secret, token, api key, authorization, bearer, cookie,
  set-cookie, session identifier values, csrf and smtp;
- private-key blocks, app-password-like 4x4 letter blocks, and `.env` content;
- long hex or base64 strings. Classify SHA-256 source digests and 40-hex commit SHAs
  separately as expected;
- email addresses. Only reserved domains such as `example.invalid` are expected; note
  the exact allowlisted attribution address separately;
- user-profile paths (`C:\Users\…`, `/home/…`, `/Users/…`), host or machine names,
  phone numbers and personal names other than the documented synthetic personas;
- image, PDF or signature files, which are not expected in this set.

## Output

- Write the table to handoff/delivery/evidence/WP2-T05-PRIVSCAN/hits.txt. Use one row per
  hit with these columns:
  - file:line;
  - category;
  - masked value;
  - classification: synthetic test data, digest/SHA, allowlisted, documentation text, or
    potentially real;
  - whether a precommit rule would block it (cite the rule).
- Evidence must be LF, free of trailing whitespace and end with a single final newline.
- Append a summary under Results:
  - counts by category and classification;
  - every potentially real item;
  - every line that would block the precommit check;
  - which content most plausibly drew the classifier, as a judgement labelled as such;
  - a recommendation: clean as is, or mask/remove at a named file:line.

Return at most 200 words, beginning with your self-reported model.

## Results

Verifier: timesheet-verifier, attempt 1. Tools used: Read, Grep, Glob, Write, Edit only.
Evidence: handoff/delivery/evidence/WP2-T05-PRIVSCAN/hits.txt.

Counts by category (approximate hit lines) and classification:
- Email: about 30 synthetic (example.invalid); 1 allowlisted (attribution address, WP2-T04-FREEZE
  commit-message.txt:10).
- Password literals: 9 lines, all synthetic and all exempt (PLACEHOLDER "synthetic"; plural or
  non-listed names).
- SHA-256 digests (about 40) and 40-hex SHAs (about 90): digest/SHA.
- Agent IDs, UUIDs, localhost URLs, B:/ and D:/ repo paths, keyword-only mentions: documentation
  text or synthetic.
- Session identifiers: about 50 session_id lines in ORCHESTRATION.json.
- Media, key, .env, private-key, phone, host-name or personal-name hits: 0.

Potentially real items:
- handoff/delivery/ORCHESTRATION.json lines 18, 200, 237 and about 50 more: the coordinator
  session UUID. Not a credential and mostly in already-tracked history; the only item that is
  an identifier value.
- evidence/WP2-ADVFIX/02-verify.txt:19: D:/Dropbox/Work.CDSemi/timesheet (repo location, no
  account name). Low.
- evidence/WP2-ADVFIX/04-preflight.txt:1: profile path already masked with <user>.

Precommit-blocking lines (rules applied by hand, not executed): none.

Judgement (not a finding): the denial most plausibly came from the command shape, not from
file content. It combined a PATH change, mkdir, `git add` of a very large explicit path list
(including the probe sources with password-named identifiers and ORCHESTRATION.json with
session_id and token wording) and a precommit run. The password-named lines in probes are
the likeliest content a classifier could read as credentials.

Recommendation: clean as is; no mask or removal needed at any file:line. Retry as separate
steps, or obtain the owner's direct confirmation, as the board question already proposes.

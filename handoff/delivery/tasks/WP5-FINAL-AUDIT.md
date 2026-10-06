# WP5-FINAL-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / WP5-FINAL-AUDIT; package WP5; kind
  audit; attempt 1; depends on WP5-GATE (PASS) and WP5-PILOT.
- Scope: the final independent WP5 audit on the package-final freeze. It has three
  parts:
  - recheck findings WP5-B-01 and WP5-B-02;
  - recheck area B on the new digest;
  - an integration pass over the release notes and the pilot packet.

  WP5-ASSESS-A attempt 2 runs at the same time. It is a separate fresh auditor that
  covers the area-A delta, so this audit does not repeat that work.
- Profile/routing: timesheet-auditor (xhigh), model opus. Routing: size L, risk H,
  novelty no.
- Fresh context: you authored no WP1–WP5 change. You are not the WP5-ASSESS-A or
  WP5-ASSESS-B auditor of attempt 1, and not the WP5-ASSESS-A attempt-2 auditor.
- Language: the task record is in English. `WP5_REVIEW_FINAL.md` and its `.vi.md`
  follow the REVIEW form.
- Target: `reviewed_commit` is the WP5-GATE `freeze_commit`. The coordinator gives the
  SHA and the gate digest in the dispatch prompt. Record HEAD and the digest before
  and after: in the repository, in the `git ls-tree` form and on your export.

## Read

- AGENTS.md, from disk.
- [WP5_REVIEW](../../prompts/WP5_REVIEW.md) and the documents it names, plus docs/11
  and docs/12.
- [WP5_REVIEW_B](../WP5_REVIEW_B.md), its findings and risks.
- The results of WP5-FIXB, WP5-AC13, WP5-REL, WP5-GATE and WP5-PILOT, with their
  evidence. Inspect it; do not trust the summaries.
- `handoff/delivery/WP5_PILOT_PACKET.md` and `handoff/delivery/WP5_HANDOFF.md`.

## Scope

1. **WP5-B-01 and WP5-B-02.**
   - Run `docker compose config` for each documented form yourself: the live
     instance, the restored instance and the rollback to the previous tag.
   - Start the restored instance on a restore folder under its own project, using a
     backup you made with synthetic data. Check that it binds the right data and
     image and starts paused.
   - Check the env-file retention step and the checklist line.
2. **Area B on the new digest.**
   - Two clean exports with byte-identical `dist/`.
   - The image is non-root and has no forbidden files.
   - Run the drill `--wp3`, stages 1–6, or justify relying on the WP5-GATE drill
     after you inspect its evidence.
   - Operations privacy holds.
3. **Release notes and runbook additions (docs/12, the docs/11 activation,
   deactivation and rollback card).**
   - Every step is executable with the documented placeholders.
   - Every env key exists in `.env.example` or `src/server/config.ts`.
   - Owner decisions appear as pending wherever the owner has not answered.
   - EN/VI parity.
   - Nothing contradicts docs/05, docs/06 or docs/07.
4. **The pilot packet.**
   - It is complete against WP5-PLAN section C.
   - The samples come from the gated freeze. Recipients are `example.invalid`, and
     the PDFs are rendered and synthetic.
   - It holds no real host, address, credential, signature or personal data.
   - The authorization record keeps software readiness, owner permission, provider
     acceptance and recipient receipt separate, with nothing pre-ticked.
5. **Overall verdict** under the docs/06 block list, for software readiness only.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-FINAL-AUDIT`. Ports 47760–47779.
- Docker:
  - Use Compose project `ts-wp5-final`; one-off containers use the same prefix.
  - Use non-TTY flags only.
  - Remove your image by exact tag and your project by name.
  - Record `docker ps --all --filter name=ts-wp5-final`; it must be empty.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER feed anything to python or node through stdin.** Never pipe into head or
  tail.
- Stop only processes you spawned, through their own handle. Never kill by PID.
- Never redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Do not fix anything, send real mail or set `PRODUCTION_SENDING_ENABLED`.

## Output

- `handoff/delivery/WP5_REVIEW_FINAL.md` and `.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence in `handoff/delivery/evidence/WP5-FINAL-AUDIT/`, with
  probes saved as `*.mjs.txt`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED. List findings separately, each
  with file and function, reproduction, expected and actual results, rule or AC ID,
  and a bounded fix.
- Separate software readiness, owner permission and the real pilot outcome.
- Leave nothing running.

Return at most 200 words, beginning with your self-reported model.

## Results

(Auditor appends here.)

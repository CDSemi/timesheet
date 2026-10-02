# Next action: fix WP1 finding F-01, then independent recheck

**Current status: WP1 independently reviewed — FIX REQUIRED (2026-10-02); F-01 unresolved; WP2 not started.** Cross-check [STATE](delivery/STATE.json), [DEVELOPMENT](../DEVELOPMENT.md), the [WP1 handoff](delivery/WP1_HANDOFF.md) and the [independent review](delivery/WP1_REVIEW.md). Claude's next action is [FIX_FINDINGS](prompts/FIX_FINDINGS.md), limited to F-01: replace saved breaks with the confirmed actual break set at Clock out, with regression coverage and the required WP1 gate. Then return the updated bilingual handoff and source for independent recheck with [WP1_REVIEW](prompts/WP1_REVIEW.md). Start WP2 only after that recheck returns PASS.

Use this prompt for the current action:

~~~text
Read AGENTS.md, handoff/delivery/WP1_HANDOFF.md,
handoff/delivery/WP1_REVIEW.md and handoff/prompts/FIX_FINDINGS.md.
Reproduce and fix WP1 finding F-01 only. Add meaningful regression tests,
run the required WP1 gate and update the bilingual WP1 handoff with actual
evidence and one next action: independent WP1 recheck. Communicate in
Vietnamese. Preserve unrelated work. Do not implement WP2 or commit/push.
~~~

Sections 1–4 keep the historical r1.1 startup walkthrough for reference; do not repeat them on the implemented repository. Since 2026-09-30 this file, `prompts/`, `templates/` and `delivery/` live in `handoff/`, and `fixtures/`, `examples/` and `inputs/` in `reference/`; the paths below follow that layout except the r1.1 extraction checklist in section 1. **WP means work package**, one of the five stages in the roadmap.

Your screenshot confirms **Claude Max 20x**, replacing the original conservative 5x assumption. Keep the five stages and use included usage first; planned spending from the 2,500 ChatGPT reserve credits remains zero. The estimate of 16–23 sessions describes work, not quota or a requirement to open that many chats. See [document 08](../docs/08_AI_WORKFLOW_AND_BUDGET.md).

## 1. Historical setup: put the documents in your project folder

1. Extract TIMESHEET_WEB_DOCS_r1.zip to a temporary folder.
2. Open its outer TIMESHEET_WEB_DOCS_r1 folder.
3. Copy **everything inside that folder** into your project root, preserving subfolders and both languages.
4. Check that the following paths exist:

~~~text
D:\DropBox\Work.CDsemi\timesheet\CLAUDE.md
D:\DropBox\Work.CDsemi\timesheet\AGENTS.md
D:\DropBox\Work.CDsemi\timesheet\NEXT_ACTION.vi.md
D:\DropBox\Work.CDsemi\timesheet\prompts\WP1_IMPLEMENT.md
~~~

No extra TIMESHEET_WEB_DOCS_r1 folder is needed inside timesheet. This places project instructions at the root Claude will open. The package contains specifications, prompts, examples and the reference workbook; Claude will create application source in this project. Read the .vi.md files for understanding; the AI follows the English .md files as authoritative.

If you extracted the previous release but have not started coding, replace its documentation with this update. If implementation has begun, compare documentation changes while preserving source and handoffs.

Dropbox can hold documents and source. Keep a running SQLite database and active container data on a local Docker/NAS volume outside the synchronized folder; see document 07 for backups.

## 2. Historical setup: open Claude Code and choose settings

Recommended route: Claude Desktop's **Code** tab, signed in with your Max account.

1. Create a session, choose **Local**, and select the timesheet folder.
2. Choose **Sonnet 5.5** and **High**. Windows shortcuts for model and effort menus: **Ctrl+Shift+I** and **Ctrl+Shift+E**.
3. Select **Accept edits** for implementation. **Plan** is a separate permission mode for planning.

See [Claude Code Desktop](https://code.claude.com/docs/en/desktop). Check the displayed settings. If a control/model is unavailable, update the client or use document 08's fallback. Use subscription sign-in rather than adding API billing.

**You choose model and effort in the client.** This package's prompts recommend settings but do not configure them. Choose them when starting a stage or a new session; no need to reset them before every follow-up if the displayed settings remain correct. Effort controls reasoning, not file permissions. The AI decides implementation details within the specifications, not your billing settings.

If you already use the Claude Code terminal client, this PowerShell command is an alternative to Desktop:

~~~powershell
Set-Location 'D:\DropBox\Work.CDsemi\timesheet'
claude --model claude-sonnet-5-5 --effort high
~~~

These are launch options, not prompt text; see [model configuration](https://code.claude.com/docs/en/model-config). Choose one route, without simultaneous edits from both.

## 3. Historical setup: first implementation prompt

Once Claude Code has the folder open, paste this into its task box. No need to upload each document or manually copy the whole implementation prompt.

~~~text
This is the Timesheet project root. Read CLAUDE.md and AGENTS.md, then read
handoff/prompts/WP1_IMPLEMENT.md and the English documents it names.

Implement WP1 now within that prompt's scope. Preserve existing work.
Communicate in Vietnamese. English specifications are authoritative;
maintain matching .vi.md translations when changing documentation.

Run the required WP1 checks and report actual results. Save the handoff as
handoff/delivery/WP1_HANDOFF.md and handoff/delivery/WP1_HANDOFF.vi.md using the HANDOFF
template. If interrupted, save handoff/delivery/WP1_CHECKPOINT.md and its .vi.md
translation with one precise next action. Do not begin WP2.
~~~

Claude should inspect the project, implement code, run available checks and save a handoff. If a necessary local development tool is missing, ask it to identify that prerequisite and the setup needed. NAS access, real email credentials and production recipients are later setup inputs.

WP1 covers the application skeleton, database/authentication foundation and time/OT engine. The finished PDF/email workflow belongs to WP3, so it is expected to be absent after WP1.

## 4. Historical setup: handoff and interruptions

Expect source, migrations, runnable tests, exact commands/results and both WP1_HANDOFF files. The handoff must identify untested or blocked work. A completion claim alone is insufficient.

If usage interrupts work, resume the same package after reset. In the existing session, ask Claude to continue from its saved checkpoint. In a new session, use [RESUME](prompts/RESUME.md) and identify handoff/delivery/WP1_CHECKPOINT.md. Keep the same project folder; do not extract again or repeat accepted work.

## 5. Give WP1 to ChatGPT Work/Codex for review

Select **GPT-6.1 Sol / High / Standard speed**, when available; document 08 defines the fallback. In ChatGPT Work, **Advanced** exposes specific model/effort/speed controls where supported. See the [official model guide](https://learn.chatgpt.com/docs/models).

Give the reviewer the completed source:

- **Local coding client with folder access:** open the same project, after Claude has stopped editing.
- **Chat without your Windows folder access:** attach a complete source ZIP with code, dependency manifest/lockfile, migrations, tests, docs, handoff, test evidence and recorded source revision/baseline. Typing a D: path does not grant access. Ask Claude to prepare the review ZIP if needed; exclude credentials, real databases, dependency/build caches and private signature images. The original documentation ZIP or a handoff alone is insufficient.

Send:

~~~text
Read AGENTS.md, handoff/delivery/WP1_HANDOFF.md and handoff/prompts/WP1_REVIEW.md.
Independently review WP1 against the named English specifications.
Inspect the supplied source and run required checks where execution is
available. Distinguish executed results from blocked or unrun checks.
Save handoff/delivery/WP1_REVIEW.md and handoff/delivery/WP1_REVIEW.vi.md using the REVIEW
template. Communicate in Vietnamese. Do not implement WP2.
~~~

- **PASS:** proceed to WP2.
- **FIX REQUIRED:** give Claude the review and [FIX_FINDINGS](prompts/FIX_FINDINGS.md), then have the reviewer recheck the fixes.
- **NOT VERIFIED:** resolve missing source, environment or evidence first. A reviewer without execution access cannot certify unrun tests.

If review ran in a separate chat environment, download its review files into the local project's `handoff/delivery/` folder before asking Claude to fix findings. Files created there do not automatically appear on your Windows computer.

## 6. Repeat for later stages

| Package | Main work | Claude | ChatGPT Work/Codex |
|---|---|---|---|
| WP1 | Foundation, ownership, time/OT engine | Sonnet 5.5 / High | GPT-6.1 Sol / High / Standard |
| WP2 | Calendar UI, settings, OT ledger | Sonnet 5.5 / Medium | GPT-6.1 Sol / Medium / Standard |
| WP3 | PDF, sign-off, scheduled notification/email | Sonnet 5.5 / High | GPT-6.1 Sol / High / Standard |
| WP4 | Docker/NAS readiness, import, backup/restore | Sonnet 5.5 / Medium | GPT-6.1 Sol / High / Standard |
| WP5 | Acceptance, targeted fixes, owner pilot | Sonnet 5.5 / Medium for fixes | GPT-6.1 Sol / High / Standard; review first |

Use the matching handoff/prompts/WPn_IMPLEMENT.md and handoff/prompts/WPn_REVIEW.md. WP5 starts with review, as specified in the [roadmap](../docs/09_IMPLEMENTATION_ROADMAP.md). Start a new stage after the previous required gate passes; a stage may take several sessions. Record actual settings if client labels differ.

Max 20x does not require Opus for every task. Keep one active coding task, inspect remaining usage and save checkpoints. Prompt instructions do not turn paid overage on or off; billing controls remain in account/workspace settings.

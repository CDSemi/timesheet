---
name: "commit-message"
description: "Write a commit description for any repo from the actual diff: plain imperative subject, then one type(scope) bullet per logical change; commit only when asked. Use for commit message, commit description, git commit, or when summarizing file changes."
---

# Commit description

Produce the commit description for a change set in whatever repo is at hand. The description is always English. Default deliverable is the text block — never create, amend or push a commit unless the user explicitly asks in the current turn.

**Project conventions win.** If the repo's `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, commit template or recent history defines its own format (pure Conventional Commits subject, issue-key prefix, sign-offs, a required follow-up such as a changelog or release entry), follow that and use this skill only for the procedure. Otherwise use the format below.

## Default format

```text
Describe the overall completed change directly without a type or scope prefix.

- type(scope): Describe the first material logical change.
- type(scope): Describe each additional logical change when applicable.
```

- **Subject**: one plain-language imperative sentence, no type or scope prefix, no trailing period. It names the outcome of the whole change set, leading with the most important effect; two or three major outcomes may be joined with "and". Not a list of files.
- **Blank line**, then one bullet per material logical change. A single-change commit still gets one bullet.
- **Bullets**: `- type(scope): Sentence.` — type lowercase, scope lowercase kebab-case, sentence starts with a capital and ends with a period. Audience is developers: naming identifiers, files and configs is fine. Add the reason after a comma or "so" only when it helps a reviewer ("...so a refused request can no longer hold the lock forever"). Call out safety-, data- or compatibility-relevant behaviour explicitly.
- Enclose the whole description in one standalone fenced `text` block.

### Types (most specific wins)

| Type | Use for |
| --- | --- |
| `feat` | New or extended behaviour or capability |
| `fix` | Corrected behaviour or defect — name the symptom, not just the code |
| `refactor` | Internal restructuring with no intended behaviour change |
| `perf` | Speed or resource improvement with no functional change |
| `docs` | Documentation, comments, translations |
| `test` | Tests only |
| `build` | Build system, project files, dependencies, packaging |
| `ci` | Pipeline and automation config |
| `chore` | Housekeeping: configuration data, generated files, version bumps, vendored binaries |
| `revert` | Reverting an earlier change |

If a refactor changes behaviour, the bullet is `feat` or `fix` and describes the behaviour. Mixed hunks in one file split into separate bullets by intent.

### Scopes

Scope is the area of behaviour or the component, not the folder or project name. Reuse scopes already in history rather than inventing new ones: `git log --format=%B -50 | grep -oE '\b[a-z]+\(([^)]+)\)' | sort | uniq -c | sort -rn`. Omit the scope when the change is repo-wide (`docs:`, `chore:`).

## Procedure

1. **Read the real change set** — never from memory of the session alone. Working tree: `git status --short`, then `git diff HEAD --stat` and `git diff HEAD` (covers staged and unstaged). A named range or commit: `git show` / `git diff <range>`. Ignore build output, caches and local settings unless the user asks. Do not claim a build or test result that was not actually run.
2. **Group hunks into logical changes** by intent and ownership, not by file: one bullet may span several files; one file may feed several bullets. Order bullets by importance, or by flow (behaviour, then configuration, then docs/chores).
3. **Classify** each change with the type table and a reused scope.
4. **Exclude what was not completed.** No bullet for planned or half-done work. Code present but not yet wired in is stated as such ("(not yet referenced)").
5. **Write the subject last**, from the bullets, so it reflects the actual outcome.
6. **Output** the description in one fenced `text` block, preceded by whatever summary the project's instructions require (e.g. a short list of changed files and what was verified). Then do any follow-up the project mandates for a change set (changelog or release-note entry, docs translation) or state in one line that none is needed.

## When asked to commit

Only on an explicit request in the current turn.

- Stage the files of this change set by path (`git add <paths>`), not `git add -A`; confirm with `git status --short` that nothing generated, local or unrelated is staged.
- Use the approved description verbatim: subject as the first line, blank line, bullets as the body (`git commit -F <file>` or several `-m`; LF line endings in the message).
- Never `--amend`, rebase, force-push or push unless that exact action was requested. Report `git log -1 --stat`.

## Checklist before output

- [ ] Project's own convention checked and applied if one exists.
- [ ] Subject: imperative, no prefix, no period, describes the outcome of the whole set.
- [ ] Every bullet maps to hunks actually in the diff; nothing planned or unverified is claimed.
- [ ] Types follow the table; behaviour-changing refactors are `feat`/`fix`.
- [ ] Scopes lowercase kebab-case, reused from history where one exists.
- [ ] One standalone fenced `text` block; commit not created unless asked.
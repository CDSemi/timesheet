# AI workflow and usage budget

## Subscription-first policy

User context: **Claude Max 20x**, confirmed by the user-provided plan screenshot on **2026-09-30**, with no purchased extra usage; ChatGPT Business **standard seat**, with **2,500 reserve credits**. The confirmed tier replaces the earlier conservative 5x assumption. This is a work estimate, not a quota guarantee or credit quote.

Use existing subscription authentication in Claude Code and ChatGPT Work/Codex. API billing is separate. Do not attach an API key or enable paid overage to solve a usage limit. Planned reserve-credit consumption is **zero**.

Check the actual client's model/effort/speed and usage dashboard before each bounded session. A prompt cannot switch the model or control billing. Purchased credits may be consumed according to workspace controls; inspect them rather than assuming a prompt prevents charges. Save a recoverable checkpoint and wait for reset when allowance is insufficient. The owner may explicitly authorize one bounded reserve-credit exception.

## Model allocation

Official names/controls rechecked on **2026-09-30**; account/client availability is not guaranteed.

| Work | Model | Effort / speed |
|---|---|---|
| Claude implementation WP1, WP3 | Sonnet 5.5 | High |
| Claude implementation WP2, WP4; WP5 targeted fixes | Sonnet 5.5 | Medium; High only for a concrete integrity/recovery defect |
| ChatGPT review WP1, WP3, WP4, WP5 | GPT-6.1 Sol | High, Standard |
| ChatGPT review WP2 | GPT-6.1 Sol | Medium, Standard |

Claude Code: select the model using /model and the supported effort control (/effort where available). Identifier: claude-sonnet-5-5. For Work/Codex choose the visible model/reasoning control; gpt-6.1-sol names the recommendation, not an API instruction. Record actual settings if labels differ.

Fallback: the available preceding Sonnet release and GPT-6 Sol with comparable supported effort. Verify the picker/client; update an outdated client if needed. If neither family is available, agree on a supported coding model without silently changing billing.

After two bounded attempts fail on the same reproducible hard issue, prepare a small reproducer for **one** escalation: Claude Opus 5.5 Medium or GPT-6 Astra Medium, chosen by the owner according to remaining usage. No default parallel agents, accelerated speed, Max/Ultra effort or both escalations. Vendor effort labels do not measure equivalent compute.

## Workload estimate

| Package | Claude sessions | ChatGPT sessions | Owner attention |
|---|---:|---:|---:|
| WP1 | 2 | 1 | 1–2 hours |
| WP2 | 2–3 | 1 | 1–2 hours |
| WP3 | 2–3 | 1 | 1–2 hours |
| WP4 | 1–2 | 1 | 2–3 hours |
| WP5 | 1–2 | 1–2 | 1–2 hours |
| Base total | **8–12** | **5–6** | **6–11 hours** |

Allow 3–5 targeted fix/recheck sessions: **16–23 bounded sessions total**, roughly **2–4 weeks of evenings**, including usage-reset pauses and owner checks. A session means a coherent request ending in inspectable code/tests/handoff, not one chat message or a fixed token/five-hour allocation. Hardware/email setup or environment faults can extend this. Calibrate remaining estimates after WP1 using actual observed usage; do not invent tokens/credits if the client does not expose them.

Max 20x provides more scheduling headroom, not a reason to spend more per task. Context, model, tools and output affect usage; advertised message ranges cannot guarantee a coding phase fits a window. Standard speed is the default; accelerated modes can consume more allowance.

The five packages and session estimate remain unchanged after confirming Max 20x. Actual reset waits may be shorter; do not infer a fixed completion date or unused allowance from the plan label. For folder setup, manual model selection and the first copyable prompt, follow [NEXT_ACTION](../handoff/NEXT_ACTION.md).

## Working loop

Read only the active prompt's canonical files and necessary source. Keep one coding agent. Save intermediate decisions and execution logs; load translations/Excel only when needed.

Claude hands over complete source or a complete archive plus baseline/commit, migrations, tests and HANDOFF. A patch without its base is insufficient. ChatGPT traces behavior, runs meaningful checks and gives reproducible findings instead of rebuilding/redesigning. Claude fixes accepted findings; ChatGPT rechecks affected behavior and the required gate. Do not reopen accepted architecture in every session.

Near a limit, finish a safe coherent change, run focused checks and save CHECKPOINT; resume after reset using RESUME. Never turn an interruption into a false “passed.” Sources are in document 10; recheck dated model information when starting substantially later.

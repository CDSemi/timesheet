"""WF-AUDIT independent probes on synthetic in-memory boards (auditor-authored).

Usage: python wf_audit_probes.py <repo-root>
Imports the validator from <repo-root>, never writes the real board. Each probe states the
expected outcome; "GAP" probes document behaviour the auditor judges as a finding.
"""
import copy
import importlib.util
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(sys.argv[1]).resolve()
spec = importlib.util.spec_from_file_location("workflow", ROOT / "handoff/delivery/validate_orchestration.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
real_board = json.loads((ROOT / "handoff/delivery/ORCHESTRATION.json").read_text(encoding="utf-8"))
state = json.loads((ROOT / "handoff/delivery/STATE.json").read_text(encoding="utf-8"))
configured = module.profiles()
REPORT = "handoff/delivery/WP1_HANDOFF.md"
EVIDENCE = "handoff/delivery/evidence/WP1-review-codex/typecheck.txt"
SHA = "d" * 40
DIGEST_A, DIGEST_B = "a" * 64, "b" * 64
results = []


def task(name, kind, profile, depends_on, status="pending"):
    p = configured[profile]
    return {"id": name, "package": "WP1", "kind": kind, "status": status, "depends_on": depends_on,
            "profile": profile, "requested_model": p["model"], "requested_effort": p["effort"],
            "model_override_reason": None, "actual_model": None, "actual_source": None,
            "agent_id": None, "attempt": 0, "owned_paths": [REPORT], "prompt": "handoff/prompts/ORCHESTRATE.md",
            "report": REPORT, "evidence": [], "next_action": "synthetic"}


def base(tasks, next_id):
    value = copy.deepcopy(real_board)
    value.update(tasks=tasks, auxiliary_lookups=[], next_task_id=next_id, current_source_digest=DIGEST_A,
                 git={"branch": "main", "release_declared": False, "last_commit": SHA, "unpushed": []})
    return value


def run(name, value, expect_error=None, gap=False, configured_override=None):
    try:
        module.validate(value, state, configured_override or configured)
        outcome = "accepted"
        error = None
    except ValueError as exc:
        outcome = "rejected"
        error = str(exc)
    if expect_error is None:
        ok = outcome == "accepted"
    else:
        ok = outcome == "rejected" and expect_error in error
    results.append({"probe": name, "outcome": outcome, "error": error,
                    "expected": "accepted" if expect_error is None else f"rejected: {expect_error}",
                    "as_expected": ok, "documents_gap": gap})


def done_chain(author_kind="fix", author_profile="timesheet-worker-high"):
    """author -> gate -> audit (done PASS) -> next plan (pending)."""
    author = task("P-AUTHOR", author_kind, author_profile, [], "done")
    author.update(attempt=1, agent_id="agent-author")
    gate = task("P-GATE", "gate", "timesheet-verifier", ["P-AUTHOR"], "done")
    gate.update(attempt=1, agent_id="agent-gate", source_digest=DIGEST_A, decision="PASS", evidence=[EVIDENCE])
    audit = task("P-AUDIT", "audit", "timesheet-auditor", ["P-GATE"], "done")
    audit.update(attempt=1, agent_id="agent-audit", source_digest=DIGEST_A, reviewed_digest=DIGEST_A,
                 decision="PASS", evidence=[EVIDENCE], author_agent_ids=[])
    nxt = task("P-NEXT", "plan", "timesheet-planner", ["P-AUDIT"])
    return base([author, gate, audit, nxt], "P-NEXT")


def of(value, name):
    return next(item for item in value["tasks"] if item["id"] == name)


# 1. Override without reason on a RUNNING light task (model differs from profile).
v = base([task("P-LIGHT", "documentation", "timesheet-light", [], "running")], "P-LIGHT")
of(v, "P-LIGHT").update(requested_model="opus", attempt=1, agent_id="agent-light")
run("1 running override without reason", v, "needs a permitted model and a reason")

# 2. Excluded aliases on a pending task even with an owner reason.
for alias in ("opusplan", "best", "fable", "default"):
    v = base([task("P-W", "implement", "timesheet-worker", [])], "P-W")
    of(v, "P-W").update(requested_model=alias, model_override_reason="owner")
    run(f"2 excluded alias '{alias}' with reason", v, "needs a permitted model and a reason")

# 3. Running commit beside a running audit (different paths).
v = done_chain()
commit = task("P-COMMIT", "commit", "timesheet-committer", [], "running")
commit.update(attempt=1, agent_id="agent-commit", report="handoff/delivery/WP1_REVIEW.md",
              owned_paths=["handoff/delivery/WP1_REVIEW.md"])  # existing file: running tasks need a durable report
audit2 = task("P-AUDIT2", "audit", "timesheet-auditor", ["P-GATE"], "running")
audit2.update(attempt=1, agent_id="agent-audit2", report="handoff/delivery/WP1_REVIEW.vi.md",
              owned_paths=["handoff/delivery/WP1_REVIEW.vi.md"])
v["tasks"] += [commit, audit2]
run("3 commit beside running audit", v, "Commit task must run alone")

# 4. Weaker audit (sonnet) after an opus fix author, done PASS.
v = done_chain()
of(v, "P-AUTHOR").update(actual_model="claude-opus-5-5", actual_source="self_reported")
of(v, "P-AUDIT").update(actual_model="claude-sonnet-5-5", actual_source="self_reported")
run("4 weaker done audit vs opus fix author", v, "Audit model weaker than author model")

# 5. Weaker RUNNING audit by requested model vs documentation author listed in author_agent_ids.
v = done_chain(author_kind="documentation", author_profile="timesheet-worker")
of(v, "P-AUTHOR").update(actual_model="claude-opus-5-5", actual_source="self_reported")
aud = of(v, "P-AUDIT")
aud.update(status="running", decision=None, requested_model="sonnet", model_override_reason="size_risk",
           author_agent_ids=["agent-author"])
for key in ("source_digest", "reviewed_digest"):
    aud.pop(key)
of(v, "P-NEXT")["depends_on"] = []
run("5 weaker running audit vs listed documentation author", v, "Audit model weaker than author model")

# 6. Self-audit by a documentation author NOT listed in author_agent_ids (auditor identity check).
v = done_chain(author_kind="documentation", author_profile="timesheet-worker")
of(v, "P-AUDIT")["agent_id"] = "agent-author"
run("6 GAP: documentation author audits own change when author_agent_ids omits it", v, gap=True)

# 7. Same with the author listed: rejected.
of(v, "P-AUDIT")["author_agent_ids"] = ["agent-author"]
run("7 documentation author listed in author_agent_ids", v, "Auditor is author")

# 8. Workflow audit in package WP1 becomes stale once the WP1 source digest changes.
v = done_chain(author_kind="implement")
v["current_source_digest"] = DIGEST_B
run("8 workflow PASS in active package after WP1 digest change", v, "Stale PASS")

# 9. Vendor-neutral author (Codex/GPT) in the package of a running audit.
v = done_chain(author_kind="fix")
of(v, "P-AUTHOR").update(actual_model="gpt-6.1-sol", actual_source="self_reported")
aud = of(v, "P-AUDIT")
aud.update(status="running", decision=None)
of(v, "P-NEXT")["depends_on"] = []
run("9 non-Claude author actual model falls back to its requested Claude alias for rank", v)

# 10. Profile set with effort 'max' (doc 08: needs an owner decision) passes the constants check.
patched = copy.deepcopy(configured)
patched["timesheet-worker"]["effort"] = "max"
v = base([task("P-MAX", "implement", "timesheet-worker", [])], "P-MAX")
of(v, "P-MAX")["requested_effort"] = "max"
run("10 GAP: worker profile effort 'max' accepted by validate()", v, gap=True, configured_override=patched)
run("10b validator EFFORTS constant contains 'max'", base([task("P-X", "plan", "timesheet-planner", [])], "P-X"))
results[-1]["note"] = f"EFFORTS={sorted(module.EFFORTS)}"

# 11. Done non-author task recorded with an excluded alias is not re-checked (model fields are
#     validated only while pending/running); an author with such an alias fails rank lookup.
v = done_chain()
plan = task("P-PLAN", "plan", "timesheet-planner", [], "done")
plan.update(attempt=1, agent_id="agent-plan", requested_model="fable", model_override_reason="owner")
v["tasks"].append(plan)
run("11 GAP(info): done plan task with requested_model 'fable' accepted", v, gap=True)
v = done_chain()
of(v, "P-AUTHOR").update(requested_model="fable", model_override_reason="owner")
run("11b done author with requested_model 'fable' fails rank lookup", v, "Unknown model family")

# 12. Audit PASS on a digest that differs from its gate.
v = done_chain()
of(v, "P-GATE")["source_digest"] = DIGEST_B
run("12 gate/audit snapshot mismatch", v, "Gate/audit snapshot mismatch")

# 13. Coordinator profile used for a task.
v = base([task("P-COORD", "plan", "timesheet-planner", [])], "P-COORD")
of(v, "P-COORD")["profile"] = "timesheet-coordinator"
run("13 task assigned to coordinator profile", v, "Invalid task profile")

# 14. Commit task done on main after release_declared, plus commit with non-committer profile.
v = done_chain()
c = task("P-C", "commit", "timesheet-committer", ["P-AUDIT"], "done")
c.update(attempt=1, agent_id="agent-c", commit_sha=SHA, pushed=True, branch="main")
v["tasks"].append(c)
v["git"]["release_declared"] = True
run("14 direct main commit after release", v, "Direct commit to main after release")

print(json.dumps({"validator": str(ROOT / "handoff/delivery/validate_orchestration.py").replace(str(ROOT), "<root>"),
                  "probes": results,
                  "all_as_expected": all(r["as_expected"] for r in results),
                  "real_board_modified": False}, indent=2))

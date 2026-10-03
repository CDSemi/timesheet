"""Synthetic in-memory workflow checks; no Claude dispatch, git write or real board change.

Usage: python handoff/delivery/check_recovery.py
Derived from the historical probe handoff/delivery/evidence/orchestration/check-recovery.py (kept untouched).
"""
import copy
import importlib.util
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("workflow", ROOT / "handoff/delivery/validate_orchestration.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
real_board = json.loads((ROOT / "handoff/delivery/ORCHESTRATION.json").read_text(encoding="utf-8"))
state = json.loads((ROOT / "handoff/delivery/STATE.json").read_text(encoding="utf-8"))
configured = module.profiles()
passed = []

REPORT = "handoff/delivery/WP1_HANDOFF.md"
EVIDENCE = "handoff/delivery/evidence/WP1-review-codex/typecheck.txt"
PROFILE_OF = {"plan": "timesheet-planner", "implement": "timesheet-worker-high", "gate": "timesheet-verifier",
              "documentation": "timesheet-worker", "audit": "timesheet-auditor", "commit": "timesheet-committer"}
SHA = "c" * 40


def accepts(name, value, expected_state=None):
    module.validate(value, expected_state or state, configured)
    passed.append(name)


def rejects(name, value, expected):
    try:
        module.validate(value, state, configured)
    except ValueError as error:
        if expected not in str(error):
            raise AssertionError(f"{name}: unexpected failure: {error}") from error
        passed.append(name)
        return
    raise AssertionError(f"{name}: invalid workflow accepted")


def make_task(name, kind, depends_on, report=REPORT, package="WP1"):
    profile = configured[PROFILE_OF[kind]]
    return {"id": name, "package": package, "kind": kind, "status": "pending", "depends_on": depends_on,
            "profile": profile["name"], "requested_model": profile["model"],
            "requested_effort": profile["effort"], "model_override_reason": None,
            "actual_model": None, "actual_source": None, "actual_effort": None, "agent_id": None,
            "attempt": 0, "owned_paths": [report], "prompt": "handoff/prompts/ORCHESTRATE.md",
            "report": report, "evidence": [], "next_action": "synthetic"}


def synthetic():
    value = copy.deepcopy(real_board)
    value.update(tasks=[make_task("S-PLAN", "plan", []), make_task("S-IMPL", "implement", ["S-PLAN"]),
                        make_task("S-GATE", "gate", ["S-IMPL"]), make_task("S-AUDIT", "audit", ["S-GATE"]),
                        make_task("S-COMMIT", "commit", ["S-AUDIT"]), make_task("S-NEXT", "plan", ["S-COMMIT"])],
                 auxiliary_lookups=[], next_task_id="S-PLAN", current_source_digest="a" * 64,
                 git={"branch": "main", "release_declared": False, "last_commit": None, "unpushed": []})
    value["git"]["last_commit"] = SHA
    return value


def task_of(value, name):
    return next(task for task in value["tasks"] if task["id"] == name)


def finished():
    value = synthetic()
    for task in value["tasks"][:-1]:
        task.update(status="done", attempt=1, agent_id=f"synthetic-{task['kind']}")
    for task in value["tasks"][2:4]:
        task.update(source_digest="a" * 64, decision="PASS", evidence=[EVIDENCE])
    task_of(value, "S-AUDIT").update(reviewed_digest="a" * 64, author_agent_ids=["synthetic-plan"])
    task_of(value, "S-COMMIT").update(commit_sha=SHA, pushed=True, branch="main")
    value["next_task_id"] = "S-NEXT"
    return value


# Historical probes (adapted to the synthetic board).
accepts("current board is valid", real_board)
accepts("synthetic pending board", synthetic())
value = synthetic()
task_of(value, "S-PLAN").update(status="interrupted", attempt=1, agent_id="synthetic-old-agent")
accepts("hard-stop recovery preserves interrupted task identity", value)
task_of(value, "S-PLAN").update(status="running", attempt=2, agent_id="synthetic-replacement-agent")
accepts("replacement attempt keeps same task ID", value)
try:
    json.loads('{"tasks":[')
except json.JSONDecodeError:
    passed.append("truncated board detected before recovery from the last committed board")
else:
    raise AssertionError("truncated state accepted")

value = synthetic()
task_of(value, "S-IMPL")["depends_on"] = ["MISSING"]
rejects("unknown dependency", value, "Unknown/self dependency")
value = synthetic()
task_of(value, "S-PLAN")["depends_on"] = ["S-IMPL"]
rejects("dependency cycle", value, "Dependency cycle")
value = synthetic()
task_of(value, "S-PLAN")["owned_paths"].append("../outside")
rejects("path traversal", value, "Unsafe path")
value = synthetic()
task_of(value, "S-PLAN")["owned_paths"].append("handoff/delivery/STATE.json")
rejects("worker writes shared state", value, "Task owns shared state")
value = synthetic()
task_of(value, "S-PLAN")["requested_effort"] = "max"
rejects("unconfigured effort", value, "Requested profile settings differ")

value = synthetic()
task_of(value, "S-IMPL")["status"] = "running"
rejects("dispatch before dependency completion", value, "Unfinished dependency")
value = synthetic()
task_of(value, "S-PLAN")["status"] = "done"
task_of(value, "S-IMPL").update(status="running", depends_on=[])
extra = copy.deepcopy(task_of(value, "S-IMPL"))
extra.update(id="S-SECOND-WRITER", depends_on=[])
value["tasks"].append(extra)
rejects("two source writers", value, "More than one source writer")
value = synthetic()
task_of(value, "S-IMPL").update(status="running", depends_on=[])
task_of(value, "S-GATE").update(status="running", depends_on=[])
rejects("source changes during gate", value, "Source writer overlaps")
value = synthetic()
task_of(value, "S-PLAN").update(status="running", depends_on=[])
extra = copy.deepcopy(task_of(value, "S-PLAN"))
extra.update(id="S-SECOND-PLAN", depends_on=[])
value["tasks"].append(extra)
rejects("colliding parallel report ownership", value, "Concurrent ownership conflict")

value = finished()
extra = make_task("S-NEXT-2", "plan", ["S-COMMIT"])
value["tasks"].append(extra)
accepts("synthetic separate author/auditor and matching evidence identity", value)
invalid = copy.deepcopy(value)
task_of(invalid, "S-AUDIT")["agent_id"] = "synthetic-plan"
rejects("self audit", invalid, "Auditor is author")
invalid = copy.deepcopy(value)
invalid["current_source_digest"] = "b" * 64
rejects("stale audit PASS", invalid, "Stale PASS")
invalid = copy.deepcopy(value)
task_of(invalid, "S-GATE")["decision"] = "FAIL"
rejects("failed gate cannot unlock audit", invalid, "Dependency gate not PASS")
invalid = copy.deepcopy(value)
task_of(invalid, "S-GATE")["source_digest"] = "b" * 64
rejects("gate and audit on different snapshots", invalid, "Gate/audit snapshot mismatch")
invalid = copy.deepcopy(value)
task_of(invalid, "S-AUDIT")["evidence"] = []
rejects("audit PASS without execution evidence", invalid, "lacks digest/execution evidence")
invalid = copy.deepcopy(value)
task_of(invalid, "S-AUDIT")["decision"] = "NOT VERIFIED"
rejects("unverified audit cannot unlock dependent task", invalid, "Dependency audit not PASS")
invalid = copy.deepcopy(real_board)
invalid.update(active_package="WP2")
invalid_state = copy.deepcopy(state)
invalid_state["active_work_package"] = "WP2"
try:
    module.validate(invalid, invalid_state, configured)
except ValueError as error:
    assert "Prior package not independently passed" in str(error)
    passed.append("WP2 blocked by unresolved WP1")
else:
    raise AssertionError("WP2 advanced past failed WP1")

# Routing, override and audit-strength probes.
value = synthetic()
task_of(value, "S-IMPL").update(requested_model="opus", model_override_reason="novelty",
                                routing={"size": "L", "risk": "H", "novelty": True})
accepts("valid override with reason accepted", value)
value = synthetic()
task_of(value, "S-IMPL")["requested_model"] = "opus"
rejects("override without reason rejected", value, "needs a permitted model and a reason")
value = synthetic()
task_of(value, "S-IMPL").update(requested_model="fable", model_override_reason="owner")
rejects("fable model rejected", value, "needs a permitted model and a reason")
value = synthetic()
task_of(value, "S-IMPL")["model_override_reason"] = "novelty"
rejects("reason without override rejected", value, "Override reason without override")
value = synthetic()
task_of(value, "S-IMPL")["requested_effort"] = "xhigh"
rejects("effort differing from profile rejected", value, "Requested profile settings differ")
value = synthetic()
task_of(value, "S-IMPL")["routing"] = {"size": "XXL", "risk": "H", "novelty": False}
rejects("invalid routing rejected", value, "Invalid routing")
value = synthetic()
task_of(value, "S-IMPL")["actual_model"] = "claude-sonnet-5-5"
rejects("actual model without source rejected", value, "Actual model needs a source")

weaker = finished()
task_of(weaker, "S-IMPL").update(actual_model="claude-opus-5-5", actual_source="self_reported")
task_of(weaker, "S-AUDIT").update(actual_model="claude-sonnet-5-5", actual_source="self_reported")
rejects("audit weaker than author rejected", weaker, "Audit model weaker than author model")
task_of(weaker, "S-AUDIT")["model_override_reason"] = "fallback_unavailable"
rejects("fallback_unavailable cannot bypass audit strength for an Opus author", weaker,
        "Audit model weaker than author model")
sonnet_audit = finished()
task_of(sonnet_audit, "S-IMPL").update(actual_model="claude-sonnet-5-5", actual_source="self_reported")
task_of(sonnet_audit, "S-AUDIT").update(requested_model="sonnet", model_override_reason="fallback_unavailable",
                                        actual_model="claude-sonnet-5-5", actual_source="self_reported")
accepts("Sonnet fallback audit accepted when no author used Opus", sonnet_audit)
doc_opus = finished()
task_of(doc_opus, "S-PLAN").update(requested_model="opus", model_override_reason="novelty")
task_of(doc_opus, "S-AUDIT").update(requested_model="sonnet", model_override_reason="fallback_unavailable",
                                    actual_model="claude-sonnet-5-5", actual_source="self_reported")
rejects("Opus planner/documentation author also protects audit strength", doc_opus,
        "Audit model weaker than author model")
value = finished()
task_of(value, "S-IMPL").update(requested_model="opus", model_override_reason="novelty")
task_of(value, "S-AUDIT").update(requested_model="sonnet", model_override_reason="size_risk")
rejects("requested-model rank also protects audit strength", value, "Audit model weaker than author model")

value = finished()
task_of(value, "S-AUDIT")["depends_on"] = ["S-IMPL"]
rejects("audit without gate dependency or gate_included rejected", value, "needs a gate dependency or gate_included")
task_of(value, "S-AUDIT")["gate_included"] = True
accepts("audit with gate_included accepted", value)
value = finished()
task_of(value, "S-AUDIT")["reviewed_commit"] = "not-a-sha"
rejects("malformed reviewed_commit rejected", value, "Invalid reviewed_commit")

# Author detection: documentation authors and previous attempts count for separation and strength.
value = finished()
extra = make_task("S-DOC", "documentation", ["S-COMMIT"])
extra.update(status="done", attempt=1, agent_id="synthetic-doc")
value["tasks"].insert(1, extra)
task_of(value, "S-DOC")["depends_on"] = []
value["next_task_id"] = "S-NEXT"
accepts("documentation author distinct from the auditor accepted", value)
invalid = copy.deepcopy(value)
task_of(invalid, "S-AUDIT")["agent_id"] = "synthetic-doc"
rejects("documentation author auditing its own change rejected without author_agent_ids", invalid,
        "Auditor is author")
invalid = copy.deepcopy(value)
task_of(invalid, "S-IMPL")["previous_agent_ids"] = ["synthetic-audit"]
rejects("previous-attempt author auditing the package rejected", invalid, "Auditor is author")
invalid = copy.deepcopy(value)
task_of(invalid, "S-DOC").update(requested_model="opus", model_override_reason="novelty")
task_of(invalid, "S-AUDIT").update(requested_model="sonnet", model_override_reason="fallback_unavailable")
rejects("Opus documentation author raises the audit strength floor", invalid,
        "Audit model weaker than author model")

# Governance package GOV (outside authorized_scope).
value = synthetic()
task_of(value, "S-PLAN").update(package="GOV", status="running", attempt=1, agent_id="synthetic-gov")
accepts("running GOV task beside a different active package accepted", value)
value = synthetic()
task_of(value, "S-PLAN").update(package="WP2", status="running", attempt=1, agent_id="synthetic-wp2")
rejects("running task of a non-active WP package rejected", value, "Running task outside active package")
value = synthetic()
value["authorized_scope"] = module.PACKAGES + ["GOV"]
rejects("GOV is not part of authorized_scope", value, "Mission scope must preserve WP1")
value = synthetic()
task_of(value, "S-PLAN")["package"] = "GOVX"
rejects("unknown package rejected", value, "Invalid package")
gov = finished()
for task in gov["tasks"]:
    task["package"] = "GOV"
task_of(gov, "S-AUDIT")["reviewed_commit"] = SHA
accepts("done GOV audit with reviewed_commit accepted", gov)
invalid = copy.deepcopy(gov)
invalid["current_source_digest"] = "b" * 64
accepts("GOV PASS is not invalidated by a changed source digest", invalid)
missing = copy.deepcopy(gov)
task_of(missing, "S-AUDIT").pop("reviewed_commit")
rejects("done GOV audit without reviewed_commit rejected", missing, "Governance audit needs reviewed_commit")
cross = synthetic()
task_of(cross, "S-IMPL").update(package="GOV")
accepts("dependencies may cross between GOV and a work package", cross)

# Profile validation: effort max needs an owner decision; nested delegation prohibited.
profile_text = (ROOT / ".claude/agents/timesheet-worker.md").read_text(encoding="utf-8")
module.parse_profile(profile_text, "timesheet-worker.md")
passed.append("unmodified worker profile parses")
for name, edited, expected in [
        ("profile effort max rejected", profile_text.replace("effort: medium", "effort: max"), "Unexpected effort"),
        ("profile effort ultracode rejected", profile_text.replace("effort: medium", "effort: ultracode"),
         "Unexpected effort"),
        ("profile model opusplan rejected", profile_text.replace("model: sonnet", "model: opusplan"),
         "Unexpected model alias"),
        ("worker profile with Agent rejected", profile_text.replace("tools: Read", "tools: Agent, Read"),
         "Nested delegation prohibited")]:
    assert edited != profile_text, name
    try:
        module.parse_profile(edited, "synthetic.md")
    except ValueError as error:
        assert expected in str(error), f"{name}: unexpected failure: {error}"
        passed.append(name)
    else:
        raise AssertionError(f"{name}: invalid profile accepted")

# Commit-task, git and concurrency probes.
value = finished()
task_of(value, "S-COMMIT")["status"] = "running"
task_of(value, "S-NEXT").update(status="running", depends_on=[], report="handoff/delivery/WP1_REVIEW.md",
                                owned_paths=["handoff/delivery/WP1_REVIEW.md"])
rejects("running commit beside another running task rejected", value, "Commit task must run alone")
value = finished()
task_of(value, "S-COMMIT")["status"] = "running"
value["auxiliary_lookups"] = [{"id": "S-LOOKUP", "status": "running"}]
rejects("running commit beside a running lookup rejected", value, "Commit task must run alone")
value = finished()
task_of(value, "S-COMMIT")["status"] = "running"
accepts("running commit alone accepted", value)
value = finished()
task_of(value, "S-COMMIT")["commit_sha"] = "abc123"
rejects("done commit without 40-hex SHA rejected", value, "Commit result incomplete")
value = finished()
task_of(value, "S-COMMIT").pop("pushed")
rejects("done commit without pushed flag rejected", value, "Commit result incomplete")
value = finished()
value["git"]["release_declared"] = True
rejects("commit on main after release_declared rejected", value, "Direct commit to main after release")
task_of(value, "S-COMMIT")["branch"] = "fix/s-next-example"
accepts("side-branch commit after release_declared accepted", value)
value = finished()
task_of(value, "S-COMMIT")["profile"] = "timesheet-worker"
rejects("commit task with a non-committer profile rejected", value, "Commit requires committer profile")
value = finished()
value["git"]["unpushed"] = ["short"]
rejects("malformed board git state rejected", value, "Board git unpushed list invalid")

value = synthetic()
task_of(value, "S-PLAN").update(status="running", attempt=1, agent_id="synthetic-agent")
value["auxiliary_lookups"] = [{"id": "L1", "status": "running"}]
accepts("one running task plus one running lookup is within the limit", value)
value["auxiliary_lookups"].append({"id": "L2", "status": "running"})
rejects("running lookups exceeding the limit rejected", value, "Too many active subagents")
value = synthetic()
del value["coordinator_runtime"]["actual_model"]
rejects("coordinator runtime without actual model rejected", value, "Coordinator runtime needs requested/actual model")

value = synthetic()
task_of(value, "S-PLAN").update(status="done", attempt=1, agent_id="synthetic-plan", report=EVIDENCE,
                                owned_paths=[EVIDENCE])
value["next_task_id"] = "S-IMPL"
accepts("English-only report without a Vietnamese pair accepted", value)

print(json.dumps({"status": "PASS", "synthetic_checks": passed, "count": len(passed),
                  "actual_board_modified": False, "claude_dispatch_executed": False}, indent=2))

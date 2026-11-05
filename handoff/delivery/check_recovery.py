"""Synthetic in-memory workflow checks; no Claude dispatch, git write or real board change.

Usage: python handoff/delivery/check_recovery.py
Derived from the historical probe handoff/delivery/evidence/orchestration/check-recovery.py (kept untouched).
"""
import copy
import importlib.util
import json
import os
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("workflow", ROOT / "handoff/delivery/validate_orchestration.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
# Optional overrides point the live-board probe at a copy (e.g. a software_ready rehearsal); defaults stay real.
BOARD_PATH = Path(os.environ.get("CHECK_RECOVERY_BOARD") or ROOT / "handoff/delivery/ORCHESTRATION.json")
STATE_PATH = Path(os.environ.get("CHECK_RECOVERY_STATE") or ROOT / "handoff/delivery/STATE.json")
real_board = json.loads(BOARD_PATH.read_text(encoding="utf-8"))
live_state = json.loads(STATE_PATH.read_text(encoding="utf-8"))
configured = module.profiles()
passed = []
PACKAGES = module.PACKAGES
BASE = "WP1"  # active package of the synthetic board; the regression probe reruns the suite with WP3
NEXT_PACKAGE = "WP2"  # a work package that is not the synthetic active package
state = None  # synthetic state matching the synthetic board; set by use_base()


def synthetic_state(active):
    """Synthetic STATE consistent with a synthetic board: packages before `active` passed, the rest not started."""
    value = copy.deepcopy(live_state)
    value["active_work_package"] = active
    value["phases"] = [{"id": name, "independent_review":
                        "passed" if PACKAGES.index(name) < PACKAGES.index(active) else "not_started"}
                       for name in PACKAGES]
    return value


def use_base(base):
    global BASE, NEXT_PACKAGE, state
    BASE = base
    NEXT_PACKAGE = PACKAGES[PACKAGES.index(base) + 1]
    state = synthetic_state(base)

REPORT = "handoff/delivery/WP1_HANDOFF.md"
EVIDENCE = "handoff/delivery/evidence/WP1-review-codex/typecheck.txt"
PROFILE_OF = {"plan": "timesheet-planner", "implement": "timesheet-worker-high", "gate": "timesheet-verifier",
              "documentation": "timesheet-worker", "audit": "timesheet-auditor", "commit": "timesheet-committer"}
SHA = "c" * 40


def accepts(name, value, expected_state=None):
    module.validate(value, expected_state or state, configured)
    passed.append(name)


def rejects(name, value, expected, expected_state=None):
    try:
        module.validate(value, expected_state or state, configured)
    except ValueError as error:
        if expected not in str(error):
            raise AssertionError(f"{name}: unexpected failure: {error}") from error
        passed.append(name)
        return
    raise AssertionError(f"{name}: invalid workflow accepted")


def make_task(name, kind, depends_on, report=REPORT, package=None):
    profile = configured[PROFILE_OF[kind]]
    return {"id": name, "package": package or BASE, "kind": kind, "status": "pending", "depends_on": depends_on,
            "profile": profile["name"], "requested_model": profile["model"],
            "requested_effort": profile["effort"], "model_override_reason": None,
            "actual_model": None, "actual_source": None, "actual_effort": None, "agent_id": None,
            "attempt": 0, "owned_paths": [report], "prompt": "handoff/prompts/ORCHESTRATE.md",
            "report": report, "evidence": [], "next_action": "synthetic"}


def synthetic():
    value = copy.deepcopy(real_board)
    value.update(status="running",  # explicit: never inherited from the live board
                 tasks=[make_task("S-PLAN", "plan", []), make_task("S-IMPL", "implement", ["S-PLAN"]),
                        make_task("S-GATE", "gate", ["S-IMPL"]), make_task("S-AUDIT", "audit", ["S-GATE"]),
                        make_task("S-COMMIT", "commit", ["S-AUDIT"]), make_task("S-NEXT", "plan", ["S-COMMIT"])],
                 auxiliary_lookups=[], active_package=BASE, next_task_id="S-PLAN", current_source_digest="a" * 64,
                 git={"branch": "main", "release_declared": False, "last_commit": None, "unpushed": []})
    value["git"]["last_commit"] = SHA
    value.pop("non_product_since_acceptance", None)  # a live record never leaks in; probes add their own
    value.pop("change_policy", None)  # the live board is "direct"; the gated probes test the old mode, direct() opts in
    return value


def direct(value):
    """Opt a synthetic board into the direct change policy (owner decision 2026-11-04)."""
    value["change_policy"] = "direct"
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


def suite():
    # Historical probes (adapted to the synthetic board).
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
    invalid = synthetic()
    invalid.update(active_package=NEXT_PACKAGE)
    invalid_state = synthetic_state(NEXT_PACKAGE)
    invalid_state["phases"][PACKAGES.index(BASE)]["independent_review"] = "failed"
    try:
        module.validate(invalid, invalid_state, configured)
    except ValueError as error:
        assert "Prior package not independently passed" in str(error)
        passed.append("next package blocked by unresolved base package")
    else:
        raise AssertionError("next package advanced past failed base package")

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
    task_of(value, "S-PLAN").update(package=NEXT_PACKAGE, status="running", attempt=1, agent_id="synthetic-wp2")
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
    task_of(gov, "S-GATE")["freeze_commit"] = SHA
    accepts("done GOV audit with reviewed_commit equal to its gate freeze_commit accepted", gov)
    invalid = copy.deepcopy(gov)
    invalid["current_source_digest"] = "b" * 64
    accepts("GOV PASS is not invalidated by a changed source digest", invalid)
    missing = copy.deepcopy(gov)
    task_of(missing, "S-AUDIT").pop("reviewed_commit")
    rejects("done GOV audit without reviewed_commit rejected", missing, "Governance audit needs reviewed_commit")
    cross = synthetic()
    task_of(cross, "S-IMPL").update(package="GOV")
    accepts("dependencies may cross between GOV and a work package", cross)

    # Gate/audit commit binding (WF-R-01): the source digest excludes handoff/, so GOV binds by commit.
    invalid = copy.deepcopy(gov)
    task_of(invalid, "S-GATE")["freeze_commit"] = "d" * 40
    rejects("done GOV audit whose gate freeze_commit differs (same digest) rejected", invalid,
            "Gate freeze_commit differs from audit reviewed_commit")
    invalid = copy.deepcopy(gov)
    task_of(invalid, "S-GATE").pop("freeze_commit")
    rejects("done GOV audit whose gate lacks freeze_commit rejected", invalid,
            "Governance audit needs a gate dependency whose freeze_commit equals reviewed_commit")
    invalid = copy.deepcopy(gov)
    task_of(invalid, "S-AUDIT").update(depends_on=["S-IMPL"], gate_included=True)
    rejects("done GOV audit with gate_included and no gate dependency rejected", invalid,
            "Governance audit needs a gate dependency whose freeze_commit equals reviewed_commit")
    value = finished()
    task_of(value, "S-GATE")["freeze_commit"] = SHA
    task_of(value, "S-AUDIT")["reviewed_commit"] = "d" * 40
    rejects("work-package audit and gate with different commits rejected", value,
            "Gate freeze_commit differs from audit reviewed_commit")
    task_of(value, "S-AUDIT")["reviewed_commit"] = SHA
    accepts("work-package audit and gate with equal commits accepted", value)
    task_of(value, "S-AUDIT").pop("reviewed_commit")
    accepts("work-package audit without reviewed_commit keeps the digest binding", value)

    # addresses_audit (optional, fix tasks only): names a done FIX REQUIRED / NOT VERIFIED audit, not a dependency.
    fixed = finished()
    task_of(fixed, "S-AUDIT")["decision"] = "FIX REQUIRED"
    task_of(fixed, "S-COMMIT").update(status="pending", attempt=0, agent_id=None)
    fix = make_task("S-FIX", "implement", [])
    fix.update(kind="fix", addresses_audit="S-AUDIT")
    fixed["tasks"].append(fix)
    fixed["next_task_id"] = "S-FIX"
    accepts("fix addressing a done FIX REQUIRED audit accepted", fixed)
    value = copy.deepcopy(fixed)
    task_of(value, "S-AUDIT")["decision"] = "NOT VERIFIED"
    accepts("fix addressing a done NOT VERIFIED audit accepted", value)
    for label, target in [("dangling", "S-MISSING"), ("gate", "S-GATE")]:
        value = copy.deepcopy(fixed)
        task_of(value, "S-FIX")["addresses_audit"] = target
        rejects(f"addresses_audit naming a {label} task rejected", value, "addresses_audit must name an existing audit task")
    value = copy.deepcopy(fixed)
    task_of(value, "S-AUDIT")["decision"] = "PASS"
    rejects("addresses_audit naming a PASS audit rejected", value, "must name a done FIX REQUIRED or NOT VERIFIED audit")
    value = copy.deepcopy(fixed)
    task_of(value, "S-AUDIT").update(status="interrupted")
    task_of(value, "S-AUDIT").pop("decision")
    rejects("addresses_audit naming an unfinished audit rejected", value,
            "must name a done FIX REQUIRED or NOT VERIFIED audit")
    value = copy.deepcopy(fixed)
    task_of(value, "S-FIX")["depends_on"] = ["S-AUDIT"]
    rejects("fix depending on the audit it addresses rejected", value, "Fix must not depend on its addresses_audit")
    value = copy.deepcopy(fixed)
    task_of(value, "S-NEXT")["addresses_audit"] = "S-AUDIT"
    rejects("addresses_audit on a non-fix task rejected", value, "addresses_audit is only for fix tasks")

    # superseded_by (optional, done PASS audits only): the old PASS stays as history beside a later audit.
    def superseded():
        board = finished()
        gate = make_task("S-GATE2", "gate", ["S-IMPL"])
        later = make_task("S-AUDIT2", "audit", ["S-GATE2"])
        for item in (gate, later):
            item.update(status="done", attempt=1, agent_id=f"synthetic-{item['id'].lower()}", evidence=[EVIDENCE])
        gate.update(source_digest="b" * 64, decision="PASS")
        later.update(source_digest="b" * 64, reviewed_digest="b" * 64, decision="PASS")
        board["tasks"].extend([gate, later])
        board["current_source_digest"] = "b" * 64
        task_of(board, "S-AUDIT")["superseded_by"] = "S-AUDIT2"
        return board

    def old_audit(board):  # an unreferenced second old PASS audit, so its own status can change freely
        extra = copy.deepcopy(task_of(board, "S-AUDIT"))
        extra.update(id="S-OLD-AUDIT", agent_id="synthetic-old-audit", superseded_by="S-AUDIT2")
        board["tasks"].append(extra)
        return extra

    value = superseded()
    accepts("superseded done PASS audit with a stale digest beside a current PASS audit accepted", value)
    invalid = copy.deepcopy(value)
    task_of(invalid, "S-AUDIT").pop("superseded_by")
    rejects("stale PASS without superseded_by still rejected", invalid, "Stale PASS: S-AUDIT")
    invalid = copy.deepcopy(value)
    task_of(invalid, "S-AUDIT2")["reviewed_digest"] = "c" * 64
    task_of(invalid, "S-AUDIT2")["source_digest"] = "c" * 64
    task_of(invalid, "S-GATE2")["source_digest"] = "c" * 64
    rejects("current PASS target stale against the current digest rejected", invalid, "Stale PASS: S-AUDIT2")
    assert "S-AUDIT" in task_of(value, "S-COMMIT")["depends_on"]  # the done dependent stays valid (accepted above)
    value2 = copy.deepcopy(value)
    task_of(value2, "S-AUDIT2").update(status="pending", agent_id=None, attempt=0)
    accepts("superseded_by naming a pending audit accepted before software_ready", value2)
    value2 = copy.deepcopy(value)
    task_of(value2, "S-AUDIT2")["decision"] = "FIX REQUIRED"
    accepts("superseded_by naming a non-PASS audit accepted before software_ready", value2)

    invalid = copy.deepcopy(value)
    task_of(invalid, "S-PLAN")["superseded_by"] = "S-AUDIT2"
    rejects("superseded_by on a non-audit task rejected", invalid, "superseded_by is only for audit tasks")
    invalid = copy.deepcopy(value)
    task_of(invalid, "S-GATE")["superseded_by"] = "S-AUDIT2"
    rejects("superseded_by on a gate rejected", invalid, "superseded_by is only for audit tasks")
    invalid = copy.deepcopy(value)
    extra = old_audit(invalid)
    extra["decision"] = "FIX REQUIRED"
    rejects("superseded_by on a non-PASS audit rejected", invalid, "superseded_by is only for done PASS audits")
    invalid = copy.deepcopy(value)
    extra = old_audit(invalid)
    extra["status"] = "interrupted"
    rejects("superseded_by on an unfinished audit rejected", invalid, "superseded_by is only for done PASS audits")
    for label, target in [("unknown", "S-MISSING"), ("gate", "S-GATE2"), ("non-string", ["S-AUDIT2"]),
                          ("self", "S-AUDIT")]:
        invalid = copy.deepcopy(value)
        task_of(invalid, "S-AUDIT")["superseded_by"] = target
        rejects(f"superseded_by naming a {label} target rejected", invalid,
                "superseded_by must name another existing audit of the same package")
    invalid = copy.deepcopy(value)
    task_of(invalid, "S-AUDIT2")["package"] = NEXT_PACKAGE
    rejects("superseded_by naming an audit of another package rejected", invalid,
            "superseded_by must name another existing audit of the same package")
    invalid = copy.deepcopy(value)
    third = copy.deepcopy(task_of(invalid, "S-AUDIT2"))
    third.update(id="S-AUDIT3", gate_included=True, depends_on=["S-IMPL"], agent_id="synthetic-audit3",
                 source_digest="c" * 64, reviewed_digest="c" * 64)
    invalid["tasks"].append(third)
    invalid["current_source_digest"] = "c" * 64
    task_of(invalid, "S-AUDIT2")["superseded_by"] = "S-AUDIT3"
    rejects("superseded_by chain rejected", invalid, "superseded_by must not chain: S-AUDIT")
    invalid = copy.deepcopy(value)
    task_of(invalid, "S-AUDIT")["reviewed_digest"] = "b" * 64
    task_of(invalid, "S-AUDIT")["source_digest"] = "b" * 64
    task_of(invalid, "S-GATE")["source_digest"] = "b" * 64
    rejects("superseded_by target with the same reviewed digest rejected", invalid,
            "superseded_by target must review a different digest")

    ready = superseded()
    task_of(ready, "S-NEXT").update(status="cancelled")
    ready.update(status="software_ready", next_task_id=None)
    ready_passed = synthetic_state(BASE)
    for phase in ready_passed["phases"]:
        phase["independent_review"] = "passed"
    accepts("software_ready with a superseded audit and a done PASS target accepted", ready, ready_passed)
    for label, update in [("pending", {"status": "pending", "agent_id": None, "attempt": 0}),
                          ("non-PASS", {"decision": "FIX REQUIRED"})]:
        invalid = copy.deepcopy(ready)
        task_of(invalid, "S-AUDIT2").update(update)
        rejects(f"software_ready with a {label} superseded_by target rejected", invalid,
                "superseded_by target must be a done PASS audit when software_ready", ready_passed)

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

    # software_ready completion rules; the synthetic board states its own mission status.
    ready_state = synthetic_state(BASE)
    for phase in ready_state["phases"]:
        phase["independent_review"] = "passed"

    def ready_board():
        board = finished()
        task_of(board, "S-NEXT").update(status="cancelled")
        board.update(status="software_ready", next_task_id=None)
        return board

    accepts("software_ready with all tasks closed, no next task and every package passed accepted",
            ready_board(), ready_state)
    value = ready_board()
    task_of(value, "S-NEXT").update(status="running", attempt=1, agent_id="synthetic-late")
    rejects("software_ready with a running task rejected", value, "Ready mission still has active work", ready_state)
    value = ready_board()
    task_of(value, "S-NEXT").update(status="pending")
    rejects("software_ready with a pending required task rejected", value, "Required tasks remain", ready_state)
    unaudited = copy.deepcopy(ready_state)
    unaudited["phases"][-1]["independent_review"] = "not_started"
    rejects("software_ready with a package lacking its independent audit rejected", ready_board(),
            "Software readiness requires every package audit", unaudited)
    value = ready_board()
    value["next_task_id"] = "S-NEXT"
    rejects("software_ready with next_task_id set rejected", value, "Ready mission still has active work",
            ready_state)

    # Non-product (documentation and workflow tooling) changes after an acceptance: is_non_product, non_product_since_acceptance (V1-V6).
    non_product_suite()

    # Direct change policy: the acceptance checks are off, everything else stays (old mode proven above).
    direct_suite()


def direct_suite():
    leaked = synthetic()
    assert "change_policy" not in leaked
    accepts("a live change_policy does not leak into the synthetic board", leaked)
    value = direct(finished())
    accepts("direct policy accepts a finished board", value)
    invalid = copy.deepcopy(value)
    invalid["change_policy"] = "gated"
    rejects("unknown change_policy rejected", invalid, "Unknown change_policy")

    # Relaxed under direct, still rejected without the field.
    relaxed = [
        ("stale audit PASS", lambda board: board.update(current_source_digest="b" * 64), "Stale PASS"),
        ("audit without gate dependency or gate_included",
         lambda board: task_of(board, "S-AUDIT").update(depends_on=["S-IMPL"]), "needs a gate dependency"),
        ("self audit", lambda board: task_of(board, "S-AUDIT").update(agent_id="synthetic-plan"),
         "Auditor is author"),
        ("audit PASS without digest or evidence",
         lambda board: task_of(board, "S-AUDIT").update(evidence=[]), "lacks digest/execution evidence"),
        ("gate and audit on different snapshots",
         lambda board: task_of(board, "S-GATE").update(source_digest="b" * 64), "Gate/audit snapshot mismatch"),
        ("audit PASS with a reviewed digest differing from its source digest",
         lambda board: task_of(board, "S-AUDIT").update(reviewed_digest="b" * 64), "PASS digest mismatch"),
        ("gate freeze_commit differing from audit reviewed_commit",
         lambda board: (task_of(board, "S-GATE").update(freeze_commit=SHA),
                        task_of(board, "S-AUDIT").update(reviewed_commit="d" * 40)),
         "Gate freeze_commit differs"),
        ("GOV audit without reviewed_commit",
         lambda board: [task.update(package="GOV") for task in board["tasks"]],
         "Governance audit needs reviewed_commit"),
        ("audit weaker than its author model",
         lambda board: (task_of(board, "S-IMPL").update(actual_model="claude-opus-5-5", actual_source="self_reported"),
                        task_of(board, "S-AUDIT").update(actual_model="claude-sonnet-5-5",
                                                         actual_source="self_reported")),
         "Audit model weaker than author model"),
        ("malformed non_product_since_acceptance record",
         lambda board: board.update(non_product_since_acceptance={"base_commit": "abc"}), "base_commit invalid"),
    ]
    for label, edit, expected in relaxed:
        base = finished()
        edit(base)
        rejects(f"gated mode rejects: {label}", base, expected)
        direct(base)
        accepts(f"direct policy accepts: {label}", base)

    # Kept under direct.
    def kept(label, make, expected, expected_state=None):
        board = direct(make())
        rejects(f"direct policy still rejects: {label}", board, expected, expected_state)

    def edited(edit, base=synthetic):
        board = base()
        edit(board)
        return board

    kept("unknown dependency", lambda: edited(lambda b: task_of(b, "S-IMPL").update(depends_on=["MISSING"])),
         "Unknown/self dependency")
    kept("dependency cycle", lambda: edited(lambda b: task_of(b, "S-PLAN").update(depends_on=["S-IMPL"])),
         "Dependency cycle")
    kept("path traversal", lambda: edited(lambda b: task_of(b, "S-PLAN")["owned_paths"].append("../outside")),
         "Unsafe path")
    kept("task owning shared state",
         lambda: edited(lambda b: task_of(b, "S-PLAN")["owned_paths"].append("handoff/delivery/STATE.json")),
         "Task owns shared state")
    kept("profile effort differing from the profile",
         lambda: edited(lambda b: task_of(b, "S-IMPL").update(requested_effort="xhigh")),
         "Requested profile settings differ")
    kept("invalid task status", lambda: edited(lambda b: task_of(b, "S-PLAN").update(status="verified")),
         "Invalid status/kind")
    kept("running task before its dependency",
         lambda: edited(lambda b: task_of(b, "S-IMPL").update(status="running")), "Unfinished dependency")
    kept("failed gate unlocking its dependent",
         lambda: edited(lambda b: task_of(b, "S-GATE").update(decision="FAIL"), finished), "Dependency gate not PASS")
    kept("dependency on an audit that is not PASS",
         lambda: edited(lambda b: task_of(b, "S-AUDIT").update(decision="NOT VERIFIED"), finished),
         "Dependency audit not PASS")
    kept("malformed reviewed_commit",
         lambda: edited(lambda b: task_of(b, "S-AUDIT").update(reviewed_commit="not-a-sha"), finished),
         "Invalid reviewed_commit")
    kept("missing evidence file",
         lambda: edited(lambda b: task_of(b, "S-AUDIT").update(evidence=["handoff/delivery/missing-evidence.txt"]),
                        finished), "Evidence file missing")
    kept("missing prompt file",
         lambda: edited(lambda b: task_of(b, "S-PLAN").update(prompt="handoff/prompts/MISSING.md")), "Prompt missing")
    kept("missing durable report",
         lambda: edited(lambda b: task_of(b, "S-PLAN").update(status="done", attempt=1, agent_id="x",
                                                              report="handoff/delivery/MISSING.md",
                                                              owned_paths=["handoff/delivery/MISSING.md"])),
         "Durable English brief/result missing")

    def two_writers(board):
        task_of(board, "S-PLAN").update(status="done")
        task_of(board, "S-IMPL").update(status="running", depends_on=[])
        extra = copy.deepcopy(task_of(board, "S-IMPL"))
        extra.update(id="S-SECOND-WRITER", depends_on=[])
        board["tasks"].append(extra)
    kept("two source writers", lambda: edited(two_writers), "More than one source writer")
    kept("source writer beside a gate",
         lambda: edited(lambda b: (task_of(b, "S-IMPL").update(status="running", depends_on=[]),
                                   task_of(b, "S-GATE").update(status="running", depends_on=[]))),
         "Source writer overlaps")
    kept("colliding report ownership",
         lambda: edited(lambda b: (task_of(b, "S-PLAN").update(status="running", depends_on=[]),
                                   b["tasks"].append({**copy.deepcopy(task_of(b, "S-PLAN")), "id": "S-SECOND-PLAN"}))),
         "Concurrent ownership conflict")
    kept("running task outside the active package",
         lambda: edited(lambda b: task_of(b, "S-PLAN").update(package=NEXT_PACKAGE, status="running")),
         "Running task outside active package")
    kept("too many active subagents",
         lambda: edited(lambda b: (task_of(b, "S-PLAN").update(status="running", attempt=1, agent_id="x"),
                                   b.update(auxiliary_lookups=[{"id": "L1", "status": "running"},
                                                               {"id": "L2", "status": "running"}]))),
         "Too many active subagents")
    kept("running commit beside another running task",
         lambda: edited(lambda b: (task_of(b, "S-COMMIT").update(status="running", depends_on=[]),
                                   task_of(b, "S-PLAN").update(status="running"))),
         "Commit task must run alone")
    kept("commit task with a non-committer profile",
         lambda: edited(lambda b: task_of(b, "S-COMMIT").update(profile="timesheet-worker"), finished),
         "Commit requires committer profile")
    kept("done commit without a 40-hex SHA",
         lambda: edited(lambda b: task_of(b, "S-COMMIT").update(commit_sha="abc123"), finished),
         "Commit result incomplete")

    def after_release(board):
        board["git"]["release_declared"] = True
    kept("commit on main after release_declared", lambda: edited(after_release, finished),
         "Direct commit to main after release")
    kept("stop_before changed", lambda: edited(lambda b: b.update(stop_before=["real_sending"])),
         "Owner activation boundary missing")
    kept("changed concurrency policy", lambda: edited(lambda b: b.update(max_active_subagents=3)),
         "Concurrency policy changed")
    kept("invalid next_task_id", lambda: edited(lambda b: b.update(next_task_id="S-MISSING")), "Next task invalid")

    prior = synthetic_state(NEXT_PACKAGE)
    prior["phases"][PACKAGES.index(BASE)]["independent_review"] = "failed"
    kept("next package past an unpassed prior package",
         lambda: edited(lambda b: b.update(active_package=NEXT_PACKAGE)), "Prior package not independently passed",
         prior)
    ready_state = synthetic_state(BASE)
    for phase in ready_state["phases"]:
        phase["independent_review"] = "passed"

    def software_ready(board):
        task_of(board, "S-NEXT").update(status="cancelled")
        board.update(status="software_ready", next_task_id=None)
    accepts("direct software_ready with every package passed accepted",
            direct(edited(software_ready, finished)), ready_state)
    unaudited = copy.deepcopy(ready_state)
    unaudited["phases"][-1]["independent_review"] = "not_started"
    kept("software_ready with a package lacking its audit in STATE", lambda: edited(software_ready, finished),
         "Software readiness requires every package audit", unaudited)
    kept("software_ready with a pending task",
         lambda: edited(lambda b: (software_ready(b), task_of(b, "S-NEXT").update(status="pending")), finished),
         "Required tasks remain", ready_state)


def doc_board():
    """A finished board whose source moved from "a" to "b" by non-product changes, with a valid record and review."""
    value = finished()
    value["current_source_digest"] = "b" * 64
    for name, agent, depends in [("S-DOC", "synthetic-doc", []), ("S-DOC-REVIEW", "synthetic-doc-reviewer", ["S-DOC"])]:
        item = make_task(name, "documentation", depends)
        item.update(status="done", attempt=1, agent_id=agent)
        value["tasks"].insert(-1, item)
    value["non_product_since_acceptance"] = {
        "base_commit": "c" * 40, "base_digest": "a" * 64, "head_digest": "b" * 64,
        "paths": ["README.md", "docs/12_RELEASE_NOTES.md"],
        "reviews": [{"author_task": "S-DOC", "review_task": "S-DOC-REVIEW"}]}
    return value


def non_product_suite():
    global real_board
    live = real_board
    real_board = copy.deepcopy(live)
    real_board["non_product_since_acceptance"] = {"base_commit": "c" * 40}  # a live record, however malformed
    try:
        leaked = synthetic()
    finally:
        real_board = live
    assert "non_product_since_acceptance" not in leaked
    accepts("a live non_product_since_acceptance record does not leak into the synthetic board", leaked)
    is_doc = module.is_non_product
    yes = ["README.md", "README.vi.md", "AGENTS.md", "DEVELOPMENT.md", "docs/12_RELEASE_NOTES.md",
           "docs/adr/0001-x.vi.md", "docs/agents/domain.md", "reference/inputs/README.md",
           "scripts/x.mjs", "scripts/ghcr-cleanup.ts", ".claude/agents/x.md", ".claude/skills/x/SKILL.md",
           ".agents/skills/x/SKILL.md", "skills-lock.json"]
    assert all(is_doc(path) for path in yes), [path for path in yes if not is_doc(path)]
    passed.append("is_non_product accepts documentation and workflow tooling")
    no = ["assets/pdf-fonts/README.md", "src/x.md", "src/x.ts", "tests/e2e/x.md", "handoff/x.md",
          "handoff/delivery/validate_orchestration.py", "package.json", "package-lock.json", "tsconfig.json",
          "vite.config.ts", "Dockerfile", "compose.example.yaml", ".env.example", ".github/workflows/image.yml",
          ".claude/settings.json", "docs/x.txt", "ingat.toml", "/abs.md", "../x.md", "docs/../x.md",
          "scripts/../src/x.ts", ".claude/agents/../settings.json", "docs\\x.md", "skills-lock.json.bak", "", None]
    assert not any(is_doc(path) for path in no), [path for path in no if is_doc(path)]
    passed.append("is_non_product rejects product, handoff, non-Markdown and unsafe paths")
    assert module.non_product_offenders(["README.md", "src/a.ts", "", "docs/x.md", "package.json"]) == [
        "src/a.ts", "package.json"]
    passed.append("non_product_offenders returns exactly the product paths")
    report = module.non_product_report(["README.md", "handoff/x.md", "src/a.ts"])
    assert report == {"status": "FAIL", "changed": ["README.md", "src/a.ts"], "product": ["src/a.ts"]}
    assert module.non_product_report(["handoff/x.md", "docs/a.md"])["status"] == "PASS"
    passed.append("non-product report drops handoff paths and fails on product paths")

    value = doc_board()
    accepts("stale PASS kept by a documentation record accepted", value)
    invalid = copy.deepcopy(value)
    del invalid["non_product_since_acceptance"]
    rejects("same board without a record still rejects the stale PASS", invalid, "Stale PASS")
    invalid = copy.deepcopy(value)
    task_of(invalid, "S-AUDIT")["reviewed_digest"] = "d" * 64
    task_of(invalid, "S-AUDIT")["source_digest"] = "d" * 64
    task_of(invalid, "S-GATE")["source_digest"] = "d" * 64
    rejects("record does not keep a PASS of a third digest", invalid, "Stale PASS")
    invalid = copy.deepcopy(value)
    invalid["non_product_since_acceptance"]["head_digest"] = "c" * 64
    rejects("record head_digest that is not the current digest leaves the PASS stale", invalid, "Stale PASS")
    invalid = finished()  # current digest still "a": a leftover record whose head was never reached
    invalid["non_product_since_acceptance"] = copy.deepcopy(value["non_product_since_acceptance"])
    invalid["tasks"][-1:-1] = [copy.deepcopy(task_of(value, "S-DOC")), copy.deepcopy(task_of(value, "S-DOC-REVIEW"))]
    rejects("record head_digest differing from current_source_digest rejected", invalid,
            "head_digest differs from current_source_digest")

    two = copy.deepcopy(value)
    extra = make_task("S-DOC-2", "documentation", [])
    extra_review = make_task("S-DOC-REVIEW-2", "documentation", [])
    extra.update(status="done", attempt=1, agent_id="synthetic-doc-2")
    extra_review.update(status="done", attempt=1, agent_id="synthetic-doc-reviewer-2")
    two["tasks"][-1:-1] = [extra, extra_review]
    two["non_product_since_acceptance"]["reviews"].append({"author_task": "S-DOC-2",
                                                             "review_task": "S-DOC-REVIEW-2"})
    accepts("record with two reviews accepted", two)
    fixer = copy.deepcopy(value)
    fixer["non_product_since_acceptance"]["reviews"][0]["author_task"] = "S-IMPL"
    accepts("record whose author_task is an implement task accepted", fixer)

    invalid = copy.deepcopy(value)
    invalid["non_product_since_acceptance"]["paths"].append("src/client/notes.md")
    rejects("record naming a product path rejected", invalid, "not a non-product path")
    tooling = copy.deepcopy(value)
    tooling["non_product_since_acceptance"]["paths"] += ["scripts/x.mjs", ".claude/agents/timesheet-worker.md"]
    accepts("record naming workflow tooling paths accepted", tooling)
    invalid = copy.deepcopy(value)
    invalid["non_product_since_acceptance"]["paths"].append(".claude/settings.json")
    rejects("record naming .claude/settings.json rejected", invalid, "not a non-product path")
    invalid = copy.deepcopy(value)
    invalid["non_product_since_acceptance"].update(base_digest="d" * 64)
    invalid["current_source_digest"] = "a" * 64
    invalid["non_product_since_acceptance"]["head_digest"] = "a" * 64
    rejects("record whose base_digest matches no current PASS audit rejected", invalid, "hang on a current")
    invalid = copy.deepcopy(value)
    task_of(invalid, "S-AUDIT")["superseded_by"] = "S-AUDIT-LATER"
    later = make_task("S-AUDIT-LATER", "audit", ["S-IMPL"])
    later.update(status="done", attempt=1, agent_id="synthetic-later", evidence=[EVIDENCE], decision="PASS",
                 source_digest="b" * 64, reviewed_digest="b" * 64, gate_included=True)
    invalid["tasks"].insert(-1, later)
    rejects("record hanging on a superseded PASS audit rejected", invalid, "hang on a current")
    invalid = copy.deepcopy(value)
    invalid["non_product_since_acceptance"]["reviews"] = []
    rejects("record with no reviews rejected", invalid, "at least one review")

    invalid = copy.deepcopy(value)
    task_of(invalid, "S-DOC-REVIEW")["agent_id"] = "synthetic-doc"
    rejects("review by the author's agent rejected", invalid, "reviewer is also the author")
    invalid = copy.deepcopy(value)
    task_of(invalid, "S-DOC-REVIEW")["previous_agent_ids"] = ["synthetic-doc"]
    rejects("review by an agent that earlier authored rejected", invalid, "reviewer is also the author")
    invalid = copy.deepcopy(value)
    invalid["non_product_since_acceptance"]["reviews"][0]["review_task"] = "S-DOC"
    rejects("review_task equal to author_task rejected", invalid, "review_task")

    unfinished = copy.deepcopy(value)
    task_of(unfinished, "S-DOC-REVIEW").update(status="pending", attempt=0, agent_id=None)
    rejects("review task unfinished rejected", unfinished, "review_task must be a done documentation task")
    unknown = copy.deepcopy(value)
    unknown["non_product_since_acceptance"]["reviews"][0]["review_task"] = "S-MISSING"
    rejects("review task unknown rejected", unknown, "review_task must be a done documentation task")
    for kind, name in [("implement", "S-IMPL"), ("audit", "S-AUDIT"), ("plan", "S-PLAN")]:
        invalid = copy.deepcopy(value)
        invalid["non_product_since_acceptance"]["reviews"][0]["review_task"] = name
        rejects(f"review_task of kind {kind} rejected", invalid, "review_task must be a done documentation task")
    invalid = copy.deepcopy(value)
    invalid["non_product_since_acceptance"]["reviews"][0]["author_task"] = "S-GATE"
    rejects("author_task of kind gate rejected", invalid, "author_task must be a done documentation")

    # The current digest equals the audited one here, so the shape checks are reached before the stale-PASS check.
    for label, key, bad, expected in [
            ("base_commit not 40 hex", "base_commit", "abc123", "base_commit invalid"),
            ("base_digest not 64 hex", "base_digest", "a" * 63, "two different 64-hex"),
            ("head_digest not 64 hex", "head_digest", "B" * 64, "two different 64-hex"),
            ("head_digest equal to base_digest", "head_digest", "a" * 64, "two different 64-hex"),
            ("empty paths", "paths", [], "paths missing or duplicated"),
            ("duplicate paths", "paths", ["README.md", "README.md"], "paths missing or duplicated"),
            ("paths not a list", "paths", "README.md", "paths missing or duplicated"),
            ("record not an object", None, ["README.md"], "must be an object")]:
        invalid = copy.deepcopy(value)
        invalid["current_source_digest"] = "a" * 64
        if key is None:
            invalid["non_product_since_acceptance"] = bad
        else:
            invalid["non_product_since_acceptance"][key] = bad
        rejects(f"malformed record rejected: {label}", invalid, expected)


# One acceptance probe validates the live board and STATE exactly as they are.
module.validate(real_board, live_state, configured)
passed.append("current board is valid")
use_base("WP1")
suite()
baseline = list(passed)
passed.clear()
use_base("WP3")
suite()
assert passed == baseline[1:], "suite results depend on the base active package"
passed[:0] = baseline[:1]
use_base("WP1")
passed.append("suite gives the same results when the base active package is WP3")

print(json.dumps({"status": "PASS", "synthetic_checks": passed, "count": len(passed),
                  "actual_board_modified": False, "claude_dispatch_executed": False}, indent=2))

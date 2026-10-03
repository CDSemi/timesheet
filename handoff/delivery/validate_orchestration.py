#!/usr/bin/env python3
"""Read-only workflow/configuration validation; not application acceptance.

Usage: python handoff/delivery/validate_orchestration.py [--board relative-path]
Requires Python 3.9+. Does not run Claude, change state or inspect billing.
"""
import argparse
import json
import re
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[2]
STATUSES = {"pending", "running", "interrupted", "blocked", "done", "cancelled"}
KINDS = {"plan", "diagnose", "implement", "fix", "gate", "audit", "documentation", "commit"}
PACKAGES = [f"WP{index}" for index in range(1, 6)]
GOVERNANCE = "GOV"  # governance tasks; not part of authorized_scope
TASK_PACKAGES = PACKAGES + [GOVERNANCE]
NON_AUTHOR_KINDS = {"gate", "audit", "commit"}
WRITERS = {"implement", "fix"}
MODELS = {"sonnet", "opus", "haiku", "inherit"}
TASK_MODELS = {"haiku", "sonnet", "opus"}
EFFORTS = {"low", "medium", "high", "xhigh"}  # max needs an owner decision
OVERRIDE_REASONS = {"size_risk", "novelty", "escalation", "fallback_unavailable", "owner"}
ACTUAL_SOURCES = {"self_reported", "tool_result", "unobserved"}
RANK = {"haiku": 1, "sonnet": 2, "opus": 3}
HEX40 = r"[a-f0-9]{40}"
SHARED = {"handoff/delivery/STATE.json", "handoff/delivery/ORCHESTRATION.json",
          "handoff/delivery/ORCHESTRATION.previous.json", "handoff/NEXT_ACTION.md",
          "handoff/NEXT_ACTION.vi.md"}


def check(ok, message):
    if not ok:
        raise ValueError(message)


def local_path(value):
    check(isinstance(value, str) and value != "", "Path must be a nonempty string")
    path = PurePosixPath(value)
    check(not path.is_absolute() and not set(path.parts) & {"..", ".git"}
          and not any(char in value for char in "\\:*?[]"), f"Unsafe path: {value}")
    target = (ROOT / value).resolve()
    check(target != ROOT and ROOT in target.parents, f"Path escapes project: {value}")
    return target


def overlaps(left, right):
    return left == right or left.startswith(right + "/") or right.startswith(left + "/")


def family(value):
    text = str(value or "").lower()
    return next((name for name in RANK if name in text), None)


def model_rank(task):
    name = family(task.get("actual_model")) or family(task.get("requested_model"))
    check(name, f"Unknown model family: {task['id']}")
    return RANK[name]


def is_sha(value):
    return isinstance(value, str) and re.fullmatch(HEX40, value) is not None


def parse_profile(text, filename):
    front = re.match(r"\A---\n(.*?)\n---\n", text, re.S)
    check(front is not None, f"Invalid frontmatter: {filename}")
    fields = dict(line.split(": ", 1) for line in front[1].splitlines())
    name = fields.get("name")
    check(name, f"Missing profile name: {filename}")
    check(fields.get("description"), f"Description missing: {name}")
    check(fields.get("model") in MODELS, f"Unexpected model alias: {name}")
    check(fields.get("effort") in EFFORTS, f"Unexpected effort: {name}")
    tools = {tool.strip() for tool in fields.get("tools", "").split(",")}
    if name == "timesheet-coordinator":
        check("Agent" in tools and "Bash" not in tools, "Coordinator must delegate shell work")
    elif name == "timesheet-committer":
        check("Bash" in tools and "Agent" not in tools, "Committer needs shell and no delegation")
    else:
        check("Agent" not in tools, f"Nested delegation prohibited: {name}")
    return fields


def profiles():
    settings = json.loads((ROOT / ".claude/settings.json").read_text(encoding="utf-8"))
    check(settings.get("agent") == "timesheet-coordinator", "Default coordinator missing")
    result = {}
    for path in sorted((ROOT / ".claude/agents").glob("timesheet-*.md")):
        fields = parse_profile(path.read_text(encoding="utf-8"), path.name)
        check(fields["name"] not in result, "Duplicate profile name")
        result[fields["name"]] = fields
    check(len(result) == 9, "Expected nine project profiles")
    return result


def validate_git(board):
    git = board.get("git")
    if git is None:
        return False
    check(isinstance(git, dict) and isinstance(git.get("branch"), str) and git["branch"],
          "Board git branch missing")
    check(isinstance(git.get("release_declared"), bool), "Board git release_declared must be boolean")
    check(git.get("last_commit") is None or is_sha(git["last_commit"]), "Board git last_commit invalid")
    check(isinstance(git.get("unpushed"), list) and all(is_sha(item) for item in git["unpushed"]),
          "Board git unpushed list invalid")
    return git["release_declared"]


def validate_model_fields(task, profile):
    name = task["id"]
    reason = task.get("model_override_reason")
    check(reason is None or reason in OVERRIDE_REASONS, f"Invalid override reason: {name}")
    routing = task.get("routing")
    if routing is not None:
        check(isinstance(routing, dict) and routing.get("size") in {"S", "M", "L", "XL"} and
              routing.get("risk") in {"L", "M", "H"} and isinstance(routing.get("novelty"), bool),
              f"Invalid routing: {name}")
    check(task.get("actual_source") is None or task["actual_source"] in ACTUAL_SOURCES,
          f"Invalid actual_source: {name}")
    if task.get("actual_model") is not None:
        check(task.get("actual_source") is not None, f"Actual model needs a source: {name}")
    if task["status"] in {"pending", "running"}:
        check(task.get("requested_effort") == profile["effort"], f"Requested profile settings differ: {name}")
        requested = task.get("requested_model")
        if requested == profile["model"]:
            check(reason is None, f"Override reason without override: {name}")
        else:
            check(requested in TASK_MODELS and reason is not None,
                  f"Model override needs a permitted model and a reason: {name}")


def task_agent_ids(task):
    return {value for value in [task.get("agent_id"), *task.get("previous_agent_ids", [])] if value}


def audit_authors(audit, tasks):
    """Authors of an audit's snapshot: every task of the package that is not a gate, audit or
    commit (by agent_id and previous_agent_ids), plus the audit's author_agent_ids."""
    listed = set(audit.get("author_agent_ids", []))
    members = [item for item in tasks if item["package"] == audit["package"] and item["id"] != audit["id"]
               and (item["kind"] not in NON_AUTHOR_KINDS or task_agent_ids(item) & listed)]
    ids = set(listed)
    for item in members:
        if item["kind"] not in NON_AUTHOR_KINDS:
            ids |= task_agent_ids(item)
    return members, ids


def validate_audits(tasks, by_id):
    for task in tasks:
        if task["kind"] != "audit":
            continue
        name = task["id"]
        gated = any(by_id[item]["kind"] == "gate" for item in task["depends_on"])
        check(gated or task.get("gate_included") is True,
              f"Audit needs a gate dependency or gate_included: {name}")
        if task["status"] not in {"running", "done"}:
            continue
        members, _ = audit_authors(task, tasks)
        authors = [item for item in members if item["status"] not in {"pending", "cancelled"}]
        if authors:  # one rule, no bypass: never weaker than the strongest author model
            check(model_rank(task) >= max(model_rank(item) for item in authors),
                  f"Audit model weaker than author model: {name}")


def validate_commits(tasks, lookups, release_declared):
    running = [task for task in tasks if task["status"] == "running"]
    for task in tasks:
        check((task["kind"] == "commit") == (task["profile"] == "timesheet-committer"),
              f"Commit kind and committer profile must match: {task['id']}")
    for task in running:
        if task["kind"] == "commit":
            check(len(running) == 1 and not any(item.get("status") == "running" for item in lookups),
                  f"Commit task must run alone: {task['id']}")
    for task in tasks:
        if task["kind"] == "commit" and task["status"] == "done":
            check(is_sha(task.get("commit_sha")) and isinstance(task.get("pushed"), bool) and
                  isinstance(task.get("branch"), str) and task["branch"],
                  f"Commit result incomplete: {task['id']}")
            check(not (release_declared and task["branch"] == "main"),
                  f"Direct commit to main after release: {task['id']}")


def validate(board, state, configured):
    check(board.get("schema_version") == 1, "Unsupported board schema")
    check(board.get("mission_id"), "Mission ID missing")
    check(board.get("authorized_scope") == PACKAGES, "Mission scope must preserve WP1–WP5")
    check(board.get("status") in {"ready", "running", "paused_usage", "blocked", "software_ready"},
          "Invalid mission status")
    check(board.get("max_active_subagents") == 2 and board.get("max_source_writers") == 1,
          "Concurrency policy changed")
    check(board.get("stop_before") == ["real_sending", "production_activation"],
          "Owner activation boundary missing")
    active = board.get("active_package")
    check(active in PACKAGES and state.get("active_work_package") == active,
          "Board/package summary disagree")
    check(state.get("next_prompt") == "handoff/prompts/ORCHESTRATE.md",
          "Entry prompt must be orchestration")
    phases = {phase["id"]: phase for phase in state["phases"]}
    for previous in PACKAGES[:PACKAGES.index(active)]:
        check(phases[previous].get("independent_review") == "passed",
              f"Prior package not independently passed: {previous}")
    check(local_path(board["checkpoint"]).is_file(), "Workflow checkpoint/handoff missing")
    release_declared = validate_git(board)
    runtime = board.get("coordinator_runtime")
    check(runtime is None or (isinstance(runtime, dict) and "requested_model" in runtime and
                              "actual_model" in runtime), "Coordinator runtime needs requested/actual model")
    lookups = board.get("auxiliary_lookups", [])
    check(isinstance(lookups, list) and all(isinstance(item, dict) for item in lookups),
          "Invalid auxiliary lookups")
    tasks = board.get("tasks")
    check(isinstance(tasks, list) and tasks, "Task list missing")
    by_id = {}
    for task in tasks:
        name = task.get("id")
        check(isinstance(name, str) and re.fullmatch(r"[A-Z0-9-]+", name), "Invalid task ID")
        check(name not in by_id, f"Duplicate task: {name}")
        by_id[name] = task
        check(task.get("package") in TASK_PACKAGES, f"Invalid package: {name}")
        check(task.get("status") in STATUSES and task.get("kind") in KINDS,
              f"Invalid status/kind: {name}")
        check(type(task.get("attempt")) is int and task["attempt"] >= 0, f"Invalid attempt: {name}")
        profile = configured.get(task.get("profile"))
        check(profile and profile["name"] != "timesheet-coordinator", f"Invalid task profile: {name}")
        validate_model_fields(task, profile)
        if task["kind"] == "audit":
            check(task["profile"] == "timesheet-auditor", f"Audit requires audit profile: {name}")
        if task["kind"] == "gate":
            check(task["profile"] == "timesheet-verifier", f"Gate requires verifier profile: {name}")
        if task["kind"] == "commit":
            check(task["profile"] == "timesheet-committer", f"Commit requires committer profile: {name}")
        if task["kind"] in WRITERS:
            check(task["profile"] in {"timesheet-worker", "timesheet-worker-high", "timesheet-expert"},
                  f"Source task requires worker profile: {name}")
        check(task.get("next_action"), f"Next action missing: {name}")
        check(local_path(task["prompt"]).is_file(), f"Prompt missing: {name}")
        report = local_path(task["report"])
        if task["status"] not in {"pending", "cancelled"}:
            check(report.is_file(), f"Durable English brief/result missing: {name}")
        paths = task.get("owned_paths")
        check(isinstance(paths, list) and paths and len(paths) == len(set(paths)), f"Owned paths missing/duplicated: {name}")
        check(any(overlaps(task["report"], value) for value in paths), f"Report outside owned paths: {name}")
        for value in paths:
            local_path(value)
            check(not any(overlaps(value, shared) for shared in SHARED), f"Task owns shared state: {name}")
        evidence = task.get("evidence")
        check(isinstance(evidence, list), f"Evidence must be a list: {name}")
        for value in evidence:
            check(local_path(value).is_file(), f"Evidence file missing: {name}: {value}")
        check(isinstance(task.get("depends_on"), list), f"Dependencies missing: {name}")
        if task["kind"] in {"gate", "audit"}:
            for key in ("freeze_commit", "reviewed_commit"):
                check(task.get(key) is None or is_sha(task[key]), f"Invalid {key}: {name}")
            check(task.get("gate_included") in (None, True, False), f"Invalid gate_included: {name}")
        if task["status"] == "done" and task["kind"] in {"gate", "audit"}:
            check(evidence and re.fullmatch(r"[a-f0-9]{64}", task.get("source_digest") or ""),
                  f"Gate/audit lacks digest/execution evidence: {name}")
        if task["status"] == "done" and task["kind"] == "gate":
            check(task.get("decision") in {"PASS", "FAIL", "NOT VERIFIED"}, f"Gate verdict missing: {name}")
        if task["kind"] == "audit" and task["status"] == "done":
            check(task.get("decision") in {"PASS", "FIX REQUIRED", "NOT VERIFIED"}, f"Audit verdict missing: {name}")
            authors = audit_authors(task, tasks)[1]
            if task["package"] == GOVERNANCE:
                check(is_sha(task.get("reviewed_commit")), f"Governance audit needs reviewed_commit: {name}")
            check(task.get("agent_id") and task["agent_id"] not in authors, f"Auditor is author or identity unknown: {name}")
            if task["decision"] == "PASS":
                check(task.get("reviewed_digest") == task["source_digest"], f"PASS digest mismatch: {name}")
                if task["package"] == active:
                    check(task["reviewed_digest"] == board.get("current_source_digest"), f"Stale PASS: {name}")
    visited, visiting = set(), set()

    def visit(name):
        check(name not in visiting, f"Dependency cycle: {name}")
        if name in visited:
            return
        visiting.add(name)
        task = by_id[name]
        check(len(task["depends_on"]) == len(set(task["depends_on"])), f"Duplicate dependencies: {name}")
        for dependency in task["depends_on"]:
            check(dependency in by_id and dependency != name, f"Unknown/self dependency: {name}")
            visit(dependency)
            if task["status"] in {"running", "done"}:
                check(by_id[dependency]["status"] == "done", f"Unfinished dependency: {name}")
                if by_id[dependency]["kind"] == "audit":
                    check(by_id[dependency].get("decision") == "PASS", f"Dependency audit not PASS: {name}")
                if by_id[dependency]["kind"] == "gate":
                    check(by_id[dependency].get("decision") == "PASS", f"Dependency gate not PASS: {name}")
                    if task["kind"] == "audit" and task["status"] == "done" and task.get("decision") == "PASS":
                        check(by_id[dependency]["source_digest"] == task["reviewed_digest"],
                              f"Gate/audit snapshot mismatch: {name}")
        visiting.remove(name)
        visited.add(name)

    for name in by_id:
        visit(name)
    validate_audits(tasks, by_id)
    running = [task for task in tasks if task["status"] == "running"]
    validate_commits(tasks, lookups, release_declared)
    active_lookups = sum(1 for item in lookups if item.get("status") == "running")
    check(len(running) + active_lookups <= 2, "Too many active subagents")
    writers = [task for task in running if task["kind"] in WRITERS or
               any(not value.startswith("handoff/delivery/") for value in task["owned_paths"])]
    check(len(writers) <= 1, "More than one source writer")
    check(not writers or not any(task["kind"] in {"gate", "audit"} for task in running),
          "Source writer overlaps verification/audit")
    for index, left in enumerate(running):
        check(left["package"] in {active, GOVERNANCE}, "Running task outside active package")
        for right in running[index + 1:]:
            check(not any(overlaps(a, b) for a in left["owned_paths"] for b in right["owned_paths"]),
                  f"Concurrent ownership conflict: {left['id']} / {right['id']}")
    next_id = board.get("next_task_id")
    if board["status"] == "software_ready":
        check(next_id is None and not running, "Ready mission still has active work")
        check(all(phases[item].get("independent_review") == "passed" for item in PACKAGES),
              "Software readiness requires every package audit")
        check(all(task["status"] in {"done", "cancelled"} for task in tasks), "Required tasks remain")
    else:
        check(next_id in by_id and by_id[next_id]["status"] not in {"done", "cancelled"}, "Next task invalid")
    return {"status": "PASS", "profiles": len(configured), "tasks": len(tasks),
            "active_tasks": len(running), "application_acceptance_verified": False,
            "claude_runtime_verified": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--board", default="handoff/delivery/ORCHESTRATION.json")
    args = parser.parse_args()
    board = json.loads(local_path(args.board).read_text(encoding="utf-8"))
    state = json.loads((ROOT / "handoff/delivery/STATE.json").read_text(encoding="utf-8"))
    print(json.dumps(validate(board, state, profiles()), indent=2))


if __name__ == "__main__":
    main()

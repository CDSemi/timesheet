#!/usr/bin/env python3
"""Read-only documentation checks, not application acceptance.
Python 3.9+ and an installed IANA zone database are required (on Windows: pip install tzdata).
--preflight checks the current repository; normal mode also compares the historical r1.1 manifests.
"""
import argparse
import hashlib
import json
import math
import re
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[2]  # handoff/delivery/ -> repository root
# Outside the bilingual documentation set: tooling, dependencies, build output and agent skill packs.
SKIPPED = {".git", "node_modules", "dist", "coverage", ".agents", ".claude", ".idea"}
SKIPPED_PATHS = {("docs", "agents")}

def project_files(pattern):
    for path in ROOT.rglob(pattern):
        parts = path.relative_to(ROOT).parts
        if not SKIPPED.intersection(parts) and parts[:2] not in SKIPPED_PATHS:
            yield path

def check(ok, message):
    if not ok:
        raise ValueError(message)

def read(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def instant(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))

def utc(value):
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

def ot(r, o, p):
    excess = max(0, r - p["required_minutes"])
    eligible = (excess if excess > p["threshold_minutes"] else 0) + o
    step = p["rounding_step_minutes"]
    low = eligible // step * step
    credit = min((low, low + step), key=lambda x: (abs(x - eligible), x))
    return excess, eligible, credit

def overtime():
    f = read("reference/fixtures/overtime_cases.json")
    for c in f["cases"]:
        i, e = c["input"], c["expected"]
        p = {**f["default_policy"], **i.get("policy_override", {})}
        check(ot(i["regular_minutes"], i["nonworking_minutes"], p) ==
              (e["normal_excess_minutes"], e["eligible_minutes"], e["credited_minutes"]), c["id"])
    for c in f["daily_separation_cases"]:
        values = [ot(d["regular_minutes"], d["nonworking_minutes"], f["default_policy"])[2] for d in c["days"]]
        check(values == c["expected"]["daily_credited_minutes"] and sum(values) == c["expected"]["period_credited_minutes"], c["id"])
    for c in f["invalid_policy_cases"]:
        p = c["input"]
        valid = all(type(p[k]) is int for k in ("required_minutes", "threshold_minutes", "rounding_step_minutes"))
        valid = valid and p["required_minutes"] > 0 and p["threshold_minutes"] >= 0 and p["rounding_step_minutes"] >= 1
        check(not valid, c["id"])
    return 33

def interval_error(i):
    records = i.get("records", i.get("sessions", []))
    spans = sorted((instant(s["start_utc"]), instant(s["end_utc"])) for s in records)
    if any(b <= a for a, b in spans):
        return "end_not_after_start"
    if any(a[1] > b[0] for a, b in zip(spans, spans[1:])):
        return "overlapping_user_intervals"
    for s in records:
        start, end = instant(s["start_utc"]), instant(s["end_utc"])
        breaks = sorted((instant(b["start_utc"]), instant(b["end_utc"])) for b in s["breaks"])
        if any(a < start or b > end or b <= a for a, b in breaks):
            return "break_outside_session"
        if any(a[1] > b[0] for a, b in zip(breaks, breaks[1:])):
            return "overlapping_breaks"
    return None

def net(sessions, defaults):
    zone = ZoneInfo(defaults["reporting_zone"])
    seconds = [0, 0]
    for s in sessions:
        start, end = instant(s["start_utc"]), instant(s["end_utc"])
        breaks = [(instant(b["start_utc"]), instant(b["end_utc"])) for b in s["breaks"] if b["confirmed"] and not b["counts_as_work"]]
        boundaries = {start, end}
        for a, b in breaks:
            boundaries.update((a, b))
        day = start.astimezone(zone).date() + timedelta(days=1)
        while True:
            midnight = datetime.combine(day, time(), zone).astimezone(timezone.utc)
            if midnight >= end:
                break
            boundaries.add(midnight)
            day += timedelta(days=1)
        points = sorted(boundaries)
        for a, b in zip(points, points[1:]):
            midpoint = a + (b - a) / 2
            if any(x <= midpoint < y for x, y in breaks):
                continue
            local = midpoint.astimezone(zone).date()
            regular = local.isoweekday() in defaults["normal_weekdays_iso"] and local.isoformat() not in defaults["holidays"]
            seconds[0 if regular else 1] += int((b - a).total_seconds())
    return seconds[0] // 60, seconds[1] // 60

def times():
    f = read("reference/fixtures/time_cases.json")
    d = f["defaults"]
    zone = ZoneInfo(d["reporting_zone"])
    for c in f["cases"]:
        kind, i, e = c["kind"], c["input"], c.get("expected", {})
        if kind == "interval_calculation":
            check(interval_error(i) is None, c["id"] + ": invalid source")
            r, o = net(i["sessions"], d)
            _, eligible, credited = ot(r, o, d)
            check((r, o, eligible, credited) == (e["regular_minutes"], e["nonworking_minutes"], e["eligible_minutes"], e["credited_minutes"]), c["id"])
            if "start_local" in i:
                check(instant(i["start_local"]) == instant(i["sessions"][0]["start_utc"]) and instant(i["end_local"]) == instant(i["sessions"][-1]["end_utc"]), c["id"] + ": local input")
        elif kind == "validation":
            check(interval_error(i) == c["expected_error"], c["id"])
        elif kind in ("incomplete", "incomplete_breaks"):
            incomplete = any(s["end_utc"] is None for s in i["sessions"]) if kind == "incomplete" else not i["breaks_confirmed"]
            check(incomplete and e["credited_minutes"] is None and e["ledger_events"] == 0, c["id"])
        elif kind == "local_time_resolution":
            naive = datetime.fromisoformat(i["local"])
            z = ZoneInfo(i["zone"])
            candidates = [naive.replace(tzinfo=z, fold=n) for n in (0, 1)]
            valid = [v for v in candidates if v.astimezone(timezone.utc).astimezone(z).replace(tzinfo=None) == naive]
            unique = {utc(v) for v in valid}
            error = "nonexistent_local_time" if not unique else "ambiguous_local_time" if len(unique) > 1 and i["fold"] is None else None
            if error:
                check(error == c["expected_error"], c["id"])
            else:
                chosen = candidates[i["fold"] or 0]
                off = chosen.strftime("%z")
                check(utc(chosen) == e["utc"] and off[:3] + ":" + off[3:] == e["offset"], c["id"])
        elif kind == "display":
            actual = {z: instant(i["instant_utc"]).astimezone(ZoneInfo(z)).isoformat() for z in i["zones"]}
            check(actual == e["local_by_zone"] and i["work_date"] == e["work_date"], c["id"])
        elif kind == "pay_period":
            p = date.fromisoformat(i["payroll_date"])
            due_date = p - timedelta(days=3)
            due = datetime.combine(due_date, time.fromisoformat(i["due_local_time"]), zone)
            check((p - timedelta(days=18)).isoformat() == e["period_start"] and (p - timedelta(days=5)).isoformat() == e["period_end"] and due_date.isoformat() == e["due_local_date"] and utc(due) == e["due_at_utc"], c["id"])
        elif kind == "edit_reason":
            today = instant(i["now_utc"]).astimezone(zone).date()
            anchor = date.fromisoformat(i["anchor_payroll_date"])
            current = anchor + timedelta(days=math.ceil((today - anchor).days / i["cycle_days"]) * i["cycle_days"])
            reason = i["finalized"] or date.fromisoformat(i["target_payroll_date"]) < current
            check(current.isoformat() == e["current_payroll_date"] and reason == e["reason_required"], c["id"])
        else:
            raise ValueError("Unknown fixture kind: " + kind)
    return len(f["cases"])

def ledger():
    f = read("reference/fixtures/ledger_cases.json")
    for c in f["deficit_cases"]:
        i, e = {**f["deficit_defaults"], **c["input"]}, c["expected"]
        debit = 0
        if not i["records_complete"]:
            deficit, decision = None, "incomplete"
        else:
            deficit = max(0, i["required_minutes"] - min(i["required_minutes"], i["leave_minutes"]) - i["regular_minutes"] - i["nonworking_minutes"]) if i["normal_work_date"] and i["attendance_expected"] else 0
            if not deficit:
                decision = "not_applicable"
            elif i["mode"] == "ignore":
                decision = "ignored"
            elif i["mode"] == "choose_at_signoff" and (i["finalization_origin"] == "automatic" or "manual_choice" not in i):
                decision = "pending"
            elif i["mode"] == "choose_at_signoff" and i["manual_choice"] == "ignore":
                decision = "declined"
            elif deficit > i["available_minutes"]:
                decision = "insufficient_balance"
            else:
                debit, decision = deficit, "authorized"
        check((deficit, debit, decision) == (e["deficit_minutes"], e["debit_minutes"], e["decision"]), c["id"])
    for c in f["ledger_scenarios"]:
        e = c["expected"]
        check(c["opening_balance_minutes"] + sum(e["new_deltas"]) == e["balance_minutes"], c["id"])
        if "available_minutes" in e:
            check(e["balance_minutes"] - e["reserved_minutes"] == e["available_minutes"], c["id"])
    # Expected ledger accounting only: no real DB/concurrency tests occur here.
    return len(f["deficit_cases"]), len(f["ledger_scenarios"])

def files(preflight):
    pairs, links = 0, 0
    ids = re.compile(r"\b(?:R-\d{2}|FR-\d{2}|AC-\d{2}|D-\d{2}|WP[1-5]|TM-\d{2}|OT-\d{2}|DF-\d{2}|LG-\d{2})\b")
    for p in sorted(project_files("*.md")):
        body = p.read_text(encoding="utf-8")
        check("\ufffd" not in body, "Invalid text: " + str(p))
        for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", body):
            if re.match(r"[a-z]+://", target) or target.startswith(("#", "mailto:")):
                continue
            check((p.parent / target.split("#", 1)[0]).resolve().is_file(), "Broken link: " + str(p) + " -> " + target)
            links += 1
        if p.relative_to(ROOT).parts[:3] == ("handoff", "delivery", "tasks"):
            continue  # task records are English only; historical pairs there stay valid
        if not p.name.endswith(".vi.md"):
            vi = p.with_name(p.stem + ".vi.md")
            check(vi.is_file(), "Missing translation: " + str(p))
            check(set(ids.findall(body)) == set(ids.findall(vi.read_text(encoding="utf-8"))), "Different IDs: " + str(p))
            pairs += 1
        else:
            check(p.with_name(p.name.replace(".vi.md", ".md")).is_file(), "Orphan translation: " + str(p))
    for p in project_files("*.json"):
        json.loads(p.read_text(encoding="utf-8"))
    # The tracked workbook is the sanitized public template (reference/inputs/README.md); the r1.1
    # manifests still list the personal original (94537 bytes, SHA-256 477984c3…a877f33).
    original = ROOT / "reference/inputs/Timesheet_Rev8_2026.xlsx"
    check(original.stat().st_size == 25878 and sha(original) == "47ef42d5e4a9b7aea0be545ed563d3d22987609b59bd846c1c08dec2d29c6331", "Workbook changed")
    if not preflight:
        mapping = read("handoff/delivery/translation-map.json")["pairs"]
        check(len(mapping) == pairs, "Translation count mismatch")
        for m in mapping:
            check(sha(ROOT / m["source"]) == m["source_sha256"] and sha(ROOT / m["translation"]) == m["translation_sha256"], "Translation hash changed")
        manifest = read("handoff/delivery/package-manifest.json")["files"]
        actual = {p.relative_to(ROOT).as_posix() for p in project_files("*") if p.is_file() and p.name != "package-manifest.json"}
        check(actual == {m["path"] for m in manifest}, "Manifest member mismatch")
        for m in manifest:
            p = ROOT / m["path"]
            check(p.stat().st_size == m["bytes"] and sha(p) == m["sha256"], "Hash mismatch: " + m["path"])
    return pairs, links

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--preflight", action="store_true")
    args = parser.parse_args()
    pairs, links = files(args.preflight)
    a, b = overtime(), times()
    c, d = ledger()
    ids = []
    for name in ("overtime_cases", "time_cases", "ledger_cases"):
        data = read("reference/fixtures/" + name + ".json")
        for value in data.values():
            if isinstance(value, list):
                ids.extend(x["id"] for x in value if isinstance(x, dict) and "id" in x)
    check(len(ids) == len(set(ids)) == a + b + c + d == 91, "Scenario IDs/count mismatch")
    print(json.dumps({"status":"PASS","mode":"preflight" if args.preflight else "complete",
        "translation_pairs":pairs,"local_links":links,"ot_scenarios":a,"time_scenarios":b,
        "deficit_scenarios":c,"ledger_accounting_scenarios":d,"scenario_total":91,
        "application_tests_executed":False}, indent=2))

if __name__ == "__main__":
    main()

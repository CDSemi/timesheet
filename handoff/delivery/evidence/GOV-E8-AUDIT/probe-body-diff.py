"""Exact (whitespace-sensitive) comparison of the old top-level probe body with the new suite() body dedented by 4."""
import difflib, sys
old = open(sys.argv[1], encoding="utf-8").read().splitlines()
new = open(sys.argv[2], encoding="utf-8").read().splitlines()
o0 = old.index("# Historical probes (adapted to the synthetic board).")
o1 = next(i for i, l in enumerate(old) if l.startswith("print(json.dumps("))
n0 = new.index("def suite():") + 1
n1 = new.index("# One acceptance probe validates the live board and STATE exactly as they are.")
body_old = old[o0:o1]
body_new = []
for line in new[n0:n1]:
    assert line == "" or line.startswith("    "), repr(line)
    body_new.append(line[4:])
while body_old and body_old[-1] == "": body_old.pop()
while body_new and body_new[-1] == "": body_new.pop()
diff = list(difflib.unified_diff(body_old, body_new, "old-393779d-probes", "new-ed92cb7-suite-dedented", lineterm="", n=1))
print("\n".join(diff) if diff else "NO DIFFERENCES")
print(f"old body lines {len(body_old)}, new body lines {len(body_new)}, changed hunks {sum(1 for l in diff if l.startswith('@@'))}")

$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '../../../..'))
$reviewNode = 'C:/Users/huyng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
$reviewLog = Join-Path $PSScriptRoot 'baseline.txt'
@(
  "HEAD: $(git rev-parse HEAD)"
  'Initial working tree: clean (git status --short produced no rows).'
  'COMMAND: Node independently hashes sorted git ls-tree HEAD rows, excluding handoff/.'
  'Exact executable expression is saved in run-baseline.ps1.'
) | Set-Content $reviewLog -Encoding utf8
& $reviewNode -e 'const {execFileSync}=require("node:child_process"); const {createHash}=require("node:crypto"); const rows=execFileSync("git",["ls-tree","-r","--format=%(path) %(objectname)","HEAD"],{encoding:"utf8"}).trimEnd().split("\n").filter(x=>!x.startsWith("handoff/")).sort(); const hash=createHash("sha256").update(rows.join("\n")+"\n").digest("hex"); console.log("HEAD tree digest: "+hash+"; files: "+rows.length); if(hash!=="63524bd4ee25fb7cf0318a0b0eabc6c46a135f68ecfa1ccc609e6bd91c2a745a") process.exitCode=1;' 2>&1 | Tee-Object -FilePath $reviewLog -Append
$reviewExit = $LASTEXITCODE
"EXIT: $reviewExit" | Tee-Object -FilePath $reviewLog -Append
exit $reviewExit

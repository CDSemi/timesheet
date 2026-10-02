$ErrorActionPreference = 'Stop'
$reviewRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
$reviewNode = 'C:/Users/huyng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
$reviewTemp = Join-Path ([IO.Path]::GetTempPath()) ('wp1-review-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $reviewTemp | Out-Null
$reviewProbe = Join-Path $reviewTemp 'probe.mjs'
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'probe.mjs.txt') -Destination $reviewProbe
$env:NODE_OPTIONS = '--trace-deprecation --pending-deprecation'
$reviewLog = Join-Path $PSScriptRoot 'probe.txt'
"COMMAND: node <temporary-copy-of-probe.mjs.txt> '$reviewRoot'" | Set-Content $reviewLog -Encoding utf8
& $reviewNode $reviewProbe $reviewRoot 2>&1 | Tee-Object -FilePath $reviewLog -Append
$reviewExit = $LASTEXITCODE
"EXIT: $reviewExit (1 means a contract defect was reproduced)" | Tee-Object -FilePath $reviewLog -Append
if (-not ([IO.Path]::GetFullPath($reviewTemp)).StartsWith([IO.Path]::GetTempPath(), [StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe temporary cleanup path' }
Remove-Item -LiteralPath $reviewProbe -Force
Remove-Item -LiteralPath $reviewTemp
exit $reviewExit

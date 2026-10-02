$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '../../../..'))
$reviewNode = 'C:/Users/huyng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
$reviewNpm = 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js'
$env:PATH = (Split-Path $reviewNode) + ';' + $env:PATH
$env:NODE_OPTIONS = '--trace-deprecation --pending-deprecation'
@(
  "Review UTC: $([DateTime]::UtcNow.ToString('o'))"
  "HEAD: $(git rev-parse HEAD)"
  "Node path: $reviewNode"
  "npm CLI: $reviewNpm"
  "Node: $(& $reviewNode --version)"
  "npm: $(& $reviewNode $reviewNpm --version)"
  "Runtime: $(& $reviewNode -p 'JSON.stringify(process.versions)')"
  "NODE_OPTIONS: $env:NODE_OPTIONS"
  'Existing node_modules; no npm ci performed by this runner.'
) | Set-Content (Join-Path $PSScriptRoot 'environment.txt') -Encoding utf8
$failed = $false
foreach ($reviewScript in @('typecheck', 'lint', 'test', 'build:server', 'build:client', 'smoke', 'digest')) {
  $reviewArgs = if ($reviewScript -eq 'test') { @('test', '--', '--reporter=verbose') } else { @('run', $reviewScript) }
  $reviewLog = Join-Path $PSScriptRoot ($reviewScript.Replace(':', '-') + '.txt')
  "COMMAND: node npm-cli.js $($reviewArgs -join ' ')" | Set-Content $reviewLog -Encoding utf8
  & $reviewNode $reviewNpm @reviewArgs 2>&1 | Tee-Object -FilePath $reviewLog -Append
  $reviewExit = $LASTEXITCODE
  "EXIT: $reviewExit" | Tee-Object -FilePath $reviewLog -Append
  if ($reviewExit -ne 0) { $failed = $true }
}
if ($failed) { exit 1 }
exit 0

$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '../../../..'))
$workflowPython = 'C:/Users/huyng/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
$env:PYTHONDONTWRITEBYTECODE = '1'
$workflowChecks = @(
  @{ Name = 'documentation'; Args = @('handoff/delivery/validate_package.py', '--preflight') },
  @{ Name = 'workflow'; Args = @('handoff/delivery/validate_orchestration.py') },
  @{ Name = 'recovery'; Args = @('handoff/delivery/evidence/orchestration/check-recovery.py') }
)
$workflowFailed = $false
foreach ($workflowCheck in $workflowChecks) {
  $workflowLog = Join-Path $PSScriptRoot ($workflowCheck.Name + '.txt')
  $workflowArgs = $workflowCheck.Args
  "COMMAND: $workflowPython $($workflowArgs -join ' ')" | Set-Content $workflowLog -Encoding utf8
  & $workflowPython @workflowArgs 2>&1 | Tee-Object -FilePath $workflowLog -Append
  $workflowExit = $LASTEXITCODE
  "EXIT: $workflowExit" | Tee-Object -FilePath $workflowLog -Append
  if ($workflowExit -ne 0) { $workflowFailed = $true }
}
if ($workflowFailed) { exit 1 }
exit 0

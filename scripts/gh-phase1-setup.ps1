#Requires -Version 5.1
<#
.SYNOPSIS
  Create GitHub labels and Phase 1 agent-harness issues for ManintheCrowds/OpenGrimoire.

.DESCRIPTION
  Prerequisites: GitHub CLI (`gh`) installed; run `gh auth login` once.
  Idempotent: skips label creation errors if labels exist; always creates new issues (re-run only if you delete issues first).

.PARAMETER Repo
  owner/repo (default: detected from `git remote` in this repo, or ManintheCrowds/OpenGrimoire).

.PARAMETER DryRun
  Print commands only; do not call gh.
#>
param(
  [string] $Repo = "",
  [switch] $DryRun
)

$ErrorActionPreference = "Stop"

function Get-IssueNumberFromUrl {
  param([string] $Url)
  if ($Url -match '/issues/(\d+)') { return $Matches[1] }
  throw "Could not parse issue number from: $Url"
}

$root = Split-Path -Parent $PSScriptRoot
if (-not $Repo) {
  Push-Location $root
  try {
    $remote = (git remote get-url origin 2>$null) -replace '\.git$','' -replace '.*github\.com[:/]',''
    if ($remote) { $Repo = $remote -replace '^https://','' }
  } finally { Pop-Location }
}
if (-not $Repo) { $Repo = "ManintheCrowds/OpenGrimoire" }

$bodiesDir = Join-Path $PSScriptRoot "gh-phase1-bodies"

if (-not $DryRun) {
  $ghUser = & gh api user -q .login 2>$null
  if (-not $ghUser) {
    throw "Not authenticated. Run: gh auth login. Then re-run: .\scripts\gh-phase1-setup.ps1"
  }
}

$labels = @(
  @{ n = "agent-harness"; c = "C2E0C6"; d = "Agent harness improvement program" }
  @{ n = "P1"; c = "D4C5F9"; d = "Harness primitive P1" }
  @{ n = "P2"; c = "D4C5F9"; d = "Harness primitive P2" }
  @{ n = "P4"; c = "D4C5F9"; d = "Harness primitive P4" }
  @{ n = "P12"; c = "D4C5F9"; d = "Harness primitive P12" }
  @{ n = "ci"; c = "F9C513"; d = "CI / hosting verification" }
  @{ n = "documentation"; c = "0075CA"; d = "Documentation" }
)

Write-Host "Repo: $Repo"
if ($DryRun) { Write-Host "[DRY RUN]" }

$prevEap = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
foreach ($lb in $labels) {
  $cmd = "gh label create `"$($lb.n)`" --color `"$($lb.c)`" --description `"$($lb.d)`" -R $Repo 2>`$null"
  if ($DryRun) { Write-Host $cmd }
  else {
    $null = & gh label create $lb.n --color $lb.c --description $lb.d -R $Repo 2>&1
    if ($LASTEXITCODE -ne 0) { Write-Host "Label $($lb.n): already exists or skipped (OK)" }
  }
}
$ErrorActionPreference = $prevEap

function Invoke-CreateIssue {
  param([string]$Title, [string]$BodyFile, [string[]]$LabelNames)
  $ghArgs = @("issue", "create", "-R", $Repo, "-t", $Title, "-F", $BodyFile)
  foreach ($l in $LabelNames) { $ghArgs += "-l"; $ghArgs += $l }
  if ($DryRun) {
    Write-Host ("gh " + ($ghArgs -join ' '))
    return "https://github.com/$Repo/issues/0"
  }
  $out = & gh @ghArgs 2>&1
  if ($LASTEXITCODE -ne 0) { throw "gh issue create failed: $out" }
  return ($out | Out-String).Trim()
}

function Invoke-CreateIssueBody {
  param([string]$Title, [string]$Body, [string[]]$LabelNames)
  $tmp = [System.IO.Path]::GetTempFileName() + ".md"
  try {
    [System.IO.File]::WriteAllText($tmp, $Body, [System.Text.UTF8Encoding]::new($false))
    $ghArgs = @("issue", "create", "-R", $Repo, "-t", $Title, "-F", $tmp)
    foreach ($l in $LabelNames) { $ghArgs += "-l"; $ghArgs += $l }
    if ($DryRun) {
      Write-Host ("gh " + ($ghArgs -join ' '))
      return "https://github.com/$Repo/issues/0"
    }
    $out = & gh @ghArgs 2>&1
    if ($LASTEXITCODE -ne 0) { throw "gh issue create failed: $out" }
    return ($out | Out-String).Trim()
  } finally {
    if (Test-Path $tmp) { Remove-Item $tmp -Force }
  }
}

Write-Host "`n=== Wave A (parallel starters) ==="
$urlP11 = Invoke-CreateIssue -Title "[agent-harness] P1.1 Unified tool manifest (HTTP + MCP tools)" -BodyFile (Join-Path $bodiesDir "p1-1.md") -LabelNames @("agent-harness","P1","documentation")
$urlP21 = Invoke-CreateIssue -Title "[agent-harness] P2.1 Harness action tiers doc + curl examples" -BodyFile (Join-Path $bodiesDir "p2-1.md") -LabelNames @("agent-harness","P2","documentation")
$urlP41 = Invoke-CreateIssue -Title "[agent-harness] P4.1 ADR - idempotent vs non-idempotent agent flows" -BodyFile (Join-Path $bodiesDir "p4-1.md") -LabelNames @("agent-harness","P4","documentation")
$urlP121 = Invoke-CreateIssue -Title "[agent-harness] P12.1 CONTRIBUTING - change log line for contract + capabilities" -BodyFile (Join-Path $bodiesDir "p12-1.md") -LabelNames @("agent-harness","P12","documentation")

$numP11 = Get-IssueNumberFromUrl $urlP11
$numP21 = Get-IssueNumberFromUrl $urlP21
$numP41 = Get-IssueNumberFromUrl $urlP41
$numP121 = Get-IssueNumberFromUrl $urlP121

Write-Host "P1.1 -> #$numP11 $urlP11"
Write-Host "P2.1 -> #$numP21 $urlP21"
Write-Host "P4.1 -> #$numP41 $urlP41"
Write-Host "P12.1 -> #$numP121 $urlP121"

$base = "https://github.com/$Repo/blob/master"

$bodyP12 = @"
## Phase 1 - P1.2

**Depends on:** #$numP11

**Outcome:** Short note (Arc_Forge docs/ or .cursor/) listing enabled MCP servers and linking to MiscRepos MCP_CAPABILITY_MAP (or sibling path).

**Seed:** [Improvement program - P1.2]($base/docs/research/AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md)

## Acceptance criteria

- [ ] Issue #$numP11 (P1.1) completed; this doc links to unified manifest and external map.
- [ ] Path is valid for sibling-repo layout (GitHub/MiscRepos or documented alternative).
"@

$bodyP42 = @"
## Phase 1 - P4.2

**Depends on:** #$numP41

**Outcome:** Document .cursor/plans as **task** state vs conversational transcript; link OpenHarness handoff docs where applicable.

## Acceptance criteria

- [ ] P4.1 (#$numP41) merged.
- [ ] Harness or MiscRepos doc cross-link (path documented for sibling clone).
"@

$bodyP122 = @"
## Phase 1 - P12.2

**Depends on:** #$numP121

**Outcome:** Document or configure npm run verify (or subset) on the deployment pipeline so OpenGrimoire **P** on P12 moves toward **G** where hosting allows.

## Acceptance criteria

- [ ] Documented in README or ops runbook **or** CI config updated with owner approval.
- [ ] No false green: if only partial verify in CI, state which scripts run.
"@

$bodyP22 = @"
## Phase 1 - P2.2

**Outcome:** Short note under Arc_Forge (or portfolio doc) that Cursor user rules and agent-intent **do not** replace automated policy; link to MiscRepos rules as needed.

**Seed:** P2 delta in [Improvement program]($base/docs/research/AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md)

## Acceptance criteria

- [ ] One page or section; no false claim of automated enforcement in empty workspace repos.

**Optional:** link PRs to unified manifest from #$numP11 when relevant.
"@

Write-Host "`n=== Wave B (dependencies) ==="
$urlP12 = Invoke-CreateIssueBody -Title "[agent-harness] P1.2 Workspace MCP registry stub + link to capability map" -Body $bodyP12 -LabelNames @("agent-harness","P1","documentation")
$urlP42 = Invoke-CreateIssueBody -Title "[agent-harness] P4.2 Document .cursor/plans as task state vs chat" -Body $bodyP42 -LabelNames @("agent-harness","P4","documentation")
$urlP122 = Invoke-CreateIssueBody -Title "[agent-harness] P12.2 Verify CI runs verify on deploy path (hosting)" -Body $bodyP122 -LabelNames @("agent-harness","P12","ci")
$urlP22 = Invoke-CreateIssueBody -Title "[agent-harness] P2.2 Workspace note - user rules vs policy engine" -Body $bodyP22 -LabelNames @("agent-harness","P2","documentation")

Write-Host "P1.2 -> $(Get-IssueNumberFromUrl $urlP12) $urlP12"
Write-Host "P4.2 -> $(Get-IssueNumberFromUrl $urlP42) $urlP42"
Write-Host "P12.2 -> $(Get-IssueNumberFromUrl $urlP122) $urlP122"
Write-Host "P2.2 -> $(Get-IssueNumberFromUrl $urlP22) $urlP22"

Write-Host ""
Write-Host "Done. Set default repo: gh repo set-default $Repo"

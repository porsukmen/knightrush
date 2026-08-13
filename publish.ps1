param(
  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$Message
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourcePath = Join-Path $repoRoot 'KnightRush.html'
$validatorPath = Join-Path $repoRoot 'tools\validate-html.cjs'

if (!(Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
  throw 'KnightRush.html is missing. It is the only editable game source.'
}
if (!(Test-Path -LiteralPath $validatorPath -PathType Leaf)) {
  throw 'tools\validate-html.cjs is missing.'
}

$branch = (git -C $repoRoot branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $branch -ne 'main') {
  throw "Publishing is allowed only from main; current branch is '$branch'."
}

$unmerged = @(git -C $repoRoot diff --name-only --diff-filter=U)
if ($LASTEXITCODE -ne 0 -or $unmerged.Count -gt 0) {
  throw 'Resolve all merge conflicts before publishing.'
}

node $validatorPath $sourcePath
if ($LASTEXITCODE -ne 0) {
  throw 'KnightRush.html syntax validation failed.'
}

git -C $repoRoot fetch origin main
if ($LASTEXITCODE -ne 0) {
  throw 'Could not fetch origin/main.'
}
git -C $repoRoot merge-base --is-ancestor origin/main HEAD
if ($LASTEXITCODE -ne 0) {
  throw 'origin/main is not an ancestor of local main. Pull/reconcile before publishing; force push is forbidden.'
}

git -C $repoRoot diff --check
if ($LASTEXITCODE -ne 0) {
  throw 'Git whitespace validation failed.'
}

git -C $repoRoot add -A
if ($LASTEXITCODE -ne 0) {
  throw 'Could not stage the project update.'
}

git -C $repoRoot diff --cached --quiet
$stagedExit = $LASTEXITCODE
if ($stagedExit -eq 1) {
  git -C $repoRoot commit -m $Message
  if ($LASTEXITCODE -ne 0) {
    throw 'Commit failed.'
  }
} elseif ($stagedExit -ne 0) {
  throw 'Could not inspect the staged publish changes.'
} else {
  Write-Host 'The canonical source is already committed; checking unpublished commits.'
}

git -C $repoRoot push origin main
if ($LASTEXITCODE -ne 0) {
  throw 'Push failed.'
}

$published = (git -C $repoRoot log -1 --oneline).Trim()
Write-Host "Pushed: $published"
Write-Host 'GitHub Actions will validate KnightRush.html, generate index.html only inside the Pages artifact, and deploy it.'

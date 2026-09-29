#Requires -Version 5.1
<#
.SYNOPSIS
  Locate or install a portable ffmpeg. Prints ffmpeg.exe path to stdout.
#>
$ErrorActionPreference = "Stop"

function Find-Ffmpeg {
  $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($cmd -and $cmd.Source -and (Test-Path $cmd.Source) -and $cmd.Source -notmatch "WindowsApps") {
    return $cmd.Source
  }
  $roots = @(
    (Join-Path $env:LOCALAPPDATA "photo-reel\ffmpeg"),
    (Join-Path $PSScriptRoot "..\bin")
  )
  foreach ($root in $roots) {
    if (-not (Test-Path $root)) { continue }
    $hit = Get-ChildItem $root -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue |
      Select-Object -First 1 -ExpandProperty FullName
    if ($hit) { return $hit }
  }
  $tempHit = Get-ChildItem (Join-Path $env:TEMP "blazers-vb-reel\ffmpeg") -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName
  if ($tempHit) { return $tempHit }
  return $null
}

$existing = Find-Ffmpeg
if ($existing) {
  Write-Output $existing
  return
}

$destRoot = Join-Path $env:LOCALAPPDATA "photo-reel\ffmpeg"
New-Item -ItemType Directory -Force -Path $destRoot | Out-Null
$zip = Join-Path $destRoot "ffmpeg.zip"
$url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
Write-Host "Downloading portable ffmpeg..."
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
Expand-Archive -Path $zip -DestinationPath $destRoot -Force
Remove-Item $zip -Force -ErrorAction SilentlyContinue

$found = Find-Ffmpeg
if (-not $found) { throw "ffmpeg download succeeded but ffmpeg.exe was not found under $destRoot" }
Write-Output $found

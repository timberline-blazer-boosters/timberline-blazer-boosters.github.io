#Requires -Version 5.1
<#
.SYNOPSIS
  Ken Burns 9:16 reel from still JPEGs. No color grading.
.PARAMETER Instagram
  Export without music so the track can be added in Instagram (High Hopes).
#>
[CmdletBinding()]
param(
  [string]$ImageFolder,
  [string[]]$Images,
  [string]$OutDir = (Join-Path $env:USERPROFILE "OneDrive\Pictures\Temp\Reel"),
  [string]$OutName,
  [string]$Audio,
  [switch]$Instagram,
  [double]$ClipSeconds = 2.05,
  [double]$Xfade = 0.40,
  [int]$Width = 1080,
  [int]$Height = 1920,
  [int]$Fps = 30,
  [int[]]$JumpShots = @(1, 3, 4, 5, 8, 10, 17, 19),
  [int[]]$WideShots = @(2, 6, 9, 16)
)

$ErrorActionPreference = "Stop"

if ($Instagram) { $Audio = $null }

$ensure = Join-Path $PSScriptRoot "Ensure-Ffmpeg.ps1"
$ffmpeg = (& $ensure).Trim()
if (-not (Test-Path $ffmpeg)) { throw "ffmpeg not found" }
$ffprobe = Join-Path (Split-Path $ffmpeg -Parent) "ffprobe.exe"

$work = Join-Path $env:TEMP ("photo-reel-" + [guid]::NewGuid().ToString("n").Substring(0, 8))
$frames = Join-Path $work "frames"
$clips = Join-Path $work "clips"
New-Item -ItemType Directory -Force -Path $frames, $clips, $OutDir | Out-Null

try {
  $src = @()
  if ($Images) {
    $src = $Images
  } elseif ($ImageFolder) {
    $src = @(Get-ChildItem $ImageFolder -File |
      Where-Object { $_.Extension -match '\.jpe?g$' } |
      Sort-Object Name |
      Select-Object -ExpandProperty FullName)
  }
  if ($src.Count -lt 2) { throw "Need at least 2 JPEG stills (got $($src.Count))" }

  $i = 1
  foreach ($path in $src) {
    if (-not (Test-Path $path)) { throw "Missing image: $path" }
    Copy-Item $path (Join-Path $frames ("{0:D2}.jpg" -f $i)) -Force
    $i++
  }
  $n = $src.Count
  Write-Host "Staged $n stills"

  $nFrames = [int][math]::Round($ClipSeconds * $Fps)
  $scaleW = [int]($Width * 1.2)
  $scaleH = [int]($Height * 1.2)

  function Get-ZoomPan([int]$idx) {
    $d = $nFrames
    $s = "${Width}x${Height}"
    if ($JumpShots -contains $idx) {
      return "zoompan=z='min(zoom+0.0018,1.14)':d=${d}:x='iw/2-(iw/zoom/2)':y='max(0,ih/2-(ih/zoom/2)-(ih*0.05)*on/${d})':s=${s}:fps=${Fps}"
    }
    if ($WideShots -contains $idx) {
      return "zoompan=z='if(eq(on,0),1.12,max(1.0,zoom-0.0016))':d=${d}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${s}:fps=${Fps}"
    }
    if (($idx % 2) -eq 0) {
      return "zoompan=z='if(eq(on,0),1.10,max(1.0,zoom-0.0014))':d=${d}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${s}:fps=${Fps}"
    }
    return "zoompan=z='min(zoom+0.0015,1.10)':d=${d}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${s}:fps=${Fps}"
  }

  Write-Host "Rendering Ken Burns clips"
  for ($i = 1; $i -le $n; $i++) {
    $jpg = Join-Path $frames ("{0:D2}.jpg" -f $i)
    $mp4 = Join-Path $clips ("{0:D2}.mp4" -f $i)
    $zp = Get-ZoomPan $i
    $vf = "scale=${scaleW}:${scaleH}:force_original_aspect_ratio=increase:flags=lanczos,crop=${scaleW}:${scaleH},$zp,format=yuv420p"
    Write-Host ("  {0:D2}/$n" -f $i)
    & $ffmpeg -y -hide_banner -loglevel error -loop 1 -framerate $Fps -i $jpg `
      -vf $vf -t $ClipSeconds -r $Fps -c:v libx264 -preset veryfast -crf 17 `
      -pix_fmt yuv420p -an $mp4
    if ($LASTEXITCODE -ne 0) { throw "clip $i failed" }
  }

  $probeDur = [double](& $ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 (Join-Path $clips "01.mp4"))
  $step = $probeDur - $Xfade
  $cycle = @("fade", "zoomin", "slideup", "fade", "zoomin", "fade", "zoomin", "slideup", "dissolve")
  $parts = New-Object System.Collections.Generic.List[string]
  for ($i = 0; $i -lt ($n - 1); $i++) {
    $offset = [math]::Round(($i + 1) * $step, 4)
    $t = $cycle[$i % $cycle.Count]
    $left = if ($i -eq 0) { "[0:v]" } else { "[x$i]" }
    $right = "[$($i + 1):v]"
    $out = if ($i -eq ($n - 2)) { "[vout]" } else { "[x$($i + 1)]" }
    $parts.Add("${left}${right}xfade=transition=${t}:duration=${Xfade}:offset=${offset}${out}")
  }
  $fc = ($parts -join ";")

  $silent = Join-Path $work "video-silent.mp4"
  Write-Host "Crossfading"
  $ffArgs = @("-y", "-hide_banner", "-loglevel", "error")
  for ($i = 1; $i -le $n; $i++) {
    $ffArgs += "-i"
    $ffArgs += (Join-Path $clips ("{0:D2}.mp4" -f $i))
  }
  $ffArgs += "-filter_complex", $fc, "-map", "[vout]", "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-an"
  $ffArgs += $silent
  & $ffmpeg @ffArgs
  if ($LASTEXITCODE -ne 0) { throw "xfade failed" }

  $dur = [double](& $ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $silent)
  $fadeOutStart = [math]::Max(0, [math]::Round($dur - 0.85, 3))
  $audioOutStart = [math]::Max(0, [math]::Round($dur - 1.2, 3))
  $vfFinal = "fade=t=in:st=0:d=0.28,fade=t=out:st=${fadeOutStart}:d=0.85"

  if (-not $OutName) {
    $OutName = "reel-{0:yyyy-MM-dd}.mp4" -f (Get-Date)
  }
  $final = Join-Path $OutDir $OutName

  Write-Host "Writing $final"
  if ($Audio -and (Test-Path $Audio)) {
    $mix = "[0:v]${vfFinal}[v];[1:a]atrim=0:${dur},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.4,afade=t=out:st=${audioOutStart}:d=1.2,volume=0.70[a]"
    & $ffmpeg -y -hide_banner -loglevel error -i $silent -i $Audio -filter_complex $mix `
      -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p `
      -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart $final
  } else {
    # Silent stereo AAC so Instagram/players accept the file; add High Hopes in the app.
    $mix = "[0:v]${vfFinal}[v];[1:a]atrim=0:${dur},asetpts=PTS-STARTPTS,volume=0[a]"
    & $ffmpeg -y -hide_banner -loglevel error -i $silent -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=48000" `
      -filter_complex $mix -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p `
      -c:a aac -b:a 128k -ar 48000 -shortest -movflags +faststart $final
  }
  if ($LASTEXITCODE -ne 0) { throw "final encode failed" }

  $item = Get-Item $final
  Write-Host ("DONE {0} ({1:N1} MB, {2:N1} s)" -f $item.FullName, ($item.Length / 1MB), $dur)

  $note = @"
Instagram audio
===============
Upload this mp4 as a Reel, then add:

  High Hopes — Panic! At The Disco

Search: High Hopes Panic
Start near the chorus (~0:48) so the clip stays upbeat.
Leave original audio off (this file has no music on purpose).
"@
  [IO.File]::WriteAllText((Join-Path $OutDir "INSTAGRAM-MUSIC.txt"), $note)
}
finally {
  if (Test-Path $work) { Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue }
}

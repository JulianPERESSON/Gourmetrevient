$lines = Get-Content 'index.html' -Encoding UTF8
$newLines = $lines[0..2270] + $lines[2408..($lines.count - 1)]
[IO.File]::WriteAllLines((Convert-Path 'index.html'), $newLines, [Text.Encoding]::UTF8)

$src = Get-Content 'app.js'
$matrix = Get-Content 'scratch\clean_matrix.js'

# Lines are 1-indexed for the user, 0-indexed for PowerShell array
$startRow = 6720 - 1
$endRow = 6862 - 1

$head = $src[0..($startRow - 1)]
$tail = $src[($endRow + 1)..($src.Length - 1)]

$newLines = $head + $matrix + $tail
Set-Content -Path 'app.js' -Value $newLines -Encoding UTF8
Write-Host "Site Rescued"

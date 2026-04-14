$files = Get-ChildItem -Path . -Include *.js, *.html -Recurse
foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        Write-Host "Cleaned: $($file.Name)"
    } catch {
        Write-Warning "Failed to clean: $($file.Name)"
    }
}

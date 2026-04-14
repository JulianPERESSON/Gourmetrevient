try {
    $bytes = [System.IO.File]::ReadAllBytes("app.js")
    $text = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($bytes)
    # If it was double encoded, this might fix it. 
    # But often it is just misrepresented.
    # We will try to detect triple encoding
    if ($text -match "ÃƒÂ©") {
        $text = $text -replace "ÃƒÂ©", "é"
        $text = $text -replace "ÃƒÂ", "à"
        $text = $text -replace "ÃƒÂ¨", "è"
        $text = $text -replace "ÃƒÂ¢", "â"
        $text = $text -replace "ÃƒÂ´", "ô"
        $text = $text -replace "ÃƒÂ»", "û"
        $text = $text -replace "Ãƒâ€¹", "Ë"
    }
    
    [System.IO.File]::WriteAllText("app.js", $text, [System.Text.Encoding]::UTF8)
    Write-Host "Encoding Repair Attempted"
} catch {
    Write-Host "Error during repair: $_"
}

$ErrorActionPreference = "Stop"

$content = Get-Content 'temp_docx\prompt5\word\document.xml' -Raw
$matches = [regex]::Matches($content, '<w:t.*?>(.*?)</w:t>')
$text = $matches | ForEach-Object { $_.Groups[1].Value }
$text -join ' ' | Out-File -Encoding utf8 extracted_prompt.txt

$content = Get-Content 'temp_docx\referencias\word\document.xml' -Raw
$matches = [regex]::Matches($content, '<w:t.*?>(.*?)</w:t>')
$text = $matches | ForEach-Object { $_.Groups[1].Value }
$text -join ' ' | Out-File -Encoding utf8 extracted_ref.txt

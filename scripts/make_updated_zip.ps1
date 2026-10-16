$src = 'C:\Users\OEM\.gemini\antigravity\scratch\artesano-digital'
$dest = 'C:\Users\OEM\Downloads\Artesano_Digital_Actualizado.zip'
$tempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Get-ChildItem -Path $src -Exclude 'node_modules', '.git', 'dist' | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $tempDir -Recurse -Force
}

if (Test-Path $dest) { Remove-Item -Path $dest -Force }
Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $dest -Force
Remove-Item -Path $tempDir -Recurse -Force
Write-Host "✅ Zip actualizado con éxito en: $dest"

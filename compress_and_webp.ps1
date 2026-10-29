# compress_and_webp.ps1
# -------------------------------------------------
# 1. Redimensiona imágenes a máx 1200px y calidad 85%
# 2. Genera versiones WebP (calidad 80)
# -------------------------------------------------

$srcRoot = 'C:/Users/OEM/Documents/paginaartesano digital/01_SITIO_WEB_OFICIAL/public'
$destRoot = "$srcRoot/optimized"

# Crear carpeta destino
New-Item -ItemType Directory -Force -Path $destRoot | Out-Null

Get-ChildItem -Path $srcRoot -Recurse -Include *.jpg,*.jpeg,*.png | ForEach-Object {
    $rel = $_.FullName.Substring($srcRoot.Length + 1)
    $outDir = Join-Path $destRoot (Split-Path $rel -Parent)
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null

    # Imagen comprimida (JPG/PNG)
    magick $_.FullName -resize 1200x -quality 85 (Join-Path $outDir $_.Name)

    # Versión WebP
    $webpName = [IO.Path]::ChangeExtension($_.Name, '.webp')
    cwebp -q 80 $_.FullName -o (Join-Path $outDir $webpName)
}

@echo off
chcp 65001 > nul
echo ========================================================
echo   SINCRONIZAR ARTESANO DIGITAL CON GITHUB Y RENDER
echo ========================================================
echo.
echo Este script subirá la última versión con adaptación dual
echo (Móvil y Computadora), Catálogo PDF 9:16 y mejoras de taller.
echo.
set /p REPO_URL="Ingresa la URL de tu repositorio en GitHub (o presiona Enter si ya está configurado): "
if not "%REPO_URL%"=="" (
    git remote remove origin 2>nul
    git remote add origin %REPO_URL%
)
echo.
echo Subiendo cambios a la rama principal (main)...
git push origin main
git push artesano main
git push artesano main:master
if %ERRORLEVEL% equ 0 (
    echo.
    echo [ÉXITO] Cambios subidos a GitHub en ambos repositorios.
    echo Notificando y forzando despliegue en Render...
    curl -s -X POST "https://api.render.com/deploy/srv-db8lvr6q1p3s73bk1660?key=gYGPX7kR1QQ" > nul
    echo Despliegue en curso en:
    echo https://artesano-digital.onrender.com/
) else (
    echo.
    echo [AVISO] Si te solicitó credenciales o falló la subida por Git,
    echo puedes usar el archivo comprimido listo en tu carpeta Descargas:
    echo Artesano_Digital_Actualizado.zip
)
pause

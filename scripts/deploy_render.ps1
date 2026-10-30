# Script para forzar despliegue en Render usando el Deploy Hook
$deployHook = "https://api.render.com/deploy/srv-db8lvr6q1p3s73bk1660?key=gYGPX7kR1QQ"
Write-Host "Disparando despliegue en Render..." -ForegroundColor Cyan
try {
    $res = Invoke-RestMethod -Uri $deployHook -Method Post
    Write-Host "✓ Despliegue iniciado con éxito. Deploy ID: $($res.deploy.id)" -ForegroundColor Green
    Write-Host "Verificando estado en https://artesano-digital.vercel.app/" -ForegroundColor Yellow
} catch {
    Write-Host "Error al disparar despliegue: $_" -ForegroundColor Red
}

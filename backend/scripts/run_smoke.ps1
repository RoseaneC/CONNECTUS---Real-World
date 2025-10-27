# ConnectUS Backend Smoke Test Runner
# Windows PowerShell

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ConnectUS Backend Smoke Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o backend está rodando
$response = $null
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/public/feature-flags" -TimeoutSec 3 -ErrorAction SilentlyContinue
} catch {
    Write-Host "[ERRO] Backend não está rodando em http://127.0.0.1:8000" -ForegroundColor Red
    Write-Host " Execute: cd backend && python -m uvicorn app.main:app" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Executar smoke tests
python "./scripts/smoke_backend.py"

$status = $LASTEXITCODE

Write-Host ""

if ($status -eq 0) {
    Write-Host "[SUCESSO] Todos os testes passaram!" -ForegroundColor Green
} else {
    Write-Host "[FALHA] Alguns testes falharam" -ForegroundColor Red
}

exit $status


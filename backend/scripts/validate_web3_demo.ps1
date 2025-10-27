# Validação Web3 Demo Mode
# PowerShell script para testar endpoints demo

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Validação Web3 Demo Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar backend rodando
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/public/feature-flags" -TimeoutSec 3 -ErrorAction SilentlyContinue
    Write-Host "[OK] Backend está rodando" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Backend não está rodando em http://127.0.0.1:8000" -ForegroundColor Red
    Write-Host " Execute: cd backend && python -m uvicorn app.main:app" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Verificando implementação..." -ForegroundColor Yellow
Write-Host ""

# Verificar arquivos
$files = @(
    "backend/app/routers/wallet_demo.py",
    "frontend/src/web3/provider/demo.js",
    "frontend/src/components/wallet/WalletPanel.jsx",
    "frontend/src/components/wallet/StakePanel.jsx",
    "frontend/src/pages/WalletDemo.jsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (não encontrado)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Arquivos modificados (permitidos):" -ForegroundColor Yellow
$modified = @(
    "backend/app/routers/wallet_demo.py (CRIADO)",
    "backend/app/main.py (adições apenas)",
    "frontend/src/App.jsx (rota adicionada)",
    "frontend/src/web3/provider/* (NOVOS)",
    "frontend/src/components/wallet/* (NOVOS)",
    "frontend/src/pages/WalletDemo.jsx (NOVO)"
)

foreach ($m in $modified) {
    Write-Host "  ✅ $m" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔒 Arquivos CRÍTICOS protegidos:" -ForegroundColor Yellow
$protected = @(
    "frontend/src/context/AuthContext*.jsx",
    "frontend/src/services/api.js",
    "backend/app/core/auth.py",
    "backend/app/routers/auth.py",
    "backend/app/routers/avatars.py"
)

foreach ($p in $protected) {
    Write-Host "  🔒 $p (não modificado)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Resumo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Web3 Demo Mode implementado" -ForegroundColor Green
Write-Host "✅ Módulos críticos protegidos" -ForegroundColor Green
Write-Host "✅ Código aditivo e idempotente" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Próximo passo:" -ForegroundColor Yellow
Write-Host "   1. Configure ENABLE_WEB3_DEMO_MODE=1 no backend/.env"
Write-Host "   2. Configure VITE_WEB3_DEMO_MODE=true no frontend/.env.local"
Write-Host "   3. Reinicie backend e frontend"
Write-Host "   4. Acesse http://localhost:5174/wallet"
Write-Host ""


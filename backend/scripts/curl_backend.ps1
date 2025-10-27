# ConnectUS Backend - Exemplos de Curl (PowerShell)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Backend API Examples (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. LOGIN
# ============================================
Write-Host "[1] Fazendo login..." -ForegroundColor Yellow

$loginBody = @{
    nickname = "roseane"
    password = "123456"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/auth/login" -Body $loginBody -ContentType "application/json"
    $token = $login.access_token
    Write-Host "Token obtido: $($token.Substring(0, 20))..." -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERRO] Login falhou: $_" -ForegroundColor Red
    exit 1
}

# ============================================
# 2. GET /avatars
# ============================================
Write-Host "[2] Buscando avatar..." -ForegroundColor Yellow

try {
    $avatar = Invoke-RestMethod -Headers @{ Authorization = "Bearer $token" } -Uri "http://127.0.0.1:8000/avatars"
    Write-Host "Avatar atual:" -ForegroundColor Green
    $avatar.current | ConvertTo-Json
    Write-Host ""
} catch {
    Write-Host "[ERRO] /avatars falhou: $_" -ForegroundColor Red
    Write-Host ""
}

# ============================================
# 3. GET /auth/me
# ============================================
Write-Host "[3] Buscando perfil..." -ForegroundColor Yellow

try {
    $me = Invoke-RestMethod -Headers @{ Authorization = "Bearer $token" } -Uri "http://127.0.0.1:8000/auth/me"
    Write-Host "Perfil:" -ForegroundColor Green
    Write-Host "  - ID: $($me.id)"
    Write-Host "  - Nickname: $($me.nickname)"
    Write-Host "  - XP: $($me.xp)"
    Write-Host ""
} catch {
    Write-Host "[ERRO] /auth/me falhou: $_" -ForegroundColor Red
    Write-Host ""
}

# ============================================
# 4. GET /missions
# ============================================
Write-Host "[4] Buscando missões..." -ForegroundColor Yellow

try {
    $missions = Invoke-RestMethod -Uri "http://127.0.0.1:8000/missions"
    Write-Host "Missões disponíveis: $($missions.Count)" -ForegroundColor Green
    if ($missions.Count -gt 0) {
        Write-Host "  Primeira: $($missions[0].title)"
    }
    Write-Host ""
} catch {
    Write-Host "[ERRO] /missions falhou: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Teste concluído!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan


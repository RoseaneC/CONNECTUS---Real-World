#!/usr/bin/env python3
"""
ConnectUS Safety Guard
Bloqueia alterações em arquivos protegidos
"""
import sys
import subprocess
import re

# Glob patterns de arquivos protegidos
PROTECTED_PATTERNS = [
    r'frontend/src/context/AuthContext.*\.jsx',
    r'frontend/src/components/ProtectedRoute\.jsx',
    r'frontend/src/services/api\.js',
    r'frontend/src/components/avatar/.*',
    r'frontend/src/pages/ProfilePage\.jsx',
    r'frontend/src/hooks/useFeatureFlags\.js',
    r'frontend/src/services/avatarService\.js',
    r'backend/app/routers/auth\.py',
    r'backend/app/core/auth\.py',
    r'backend/app/routers/avatars\.py',
    r'backend/app/main\.py',
]

def get_staged_files():
    """Obtém lista de arquivos staged"""
    try:
        result = subprocess.run(
            ['git', 'diff', '--name-only', '--cached'],
            capture_output=True,
            text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip().split('\n')
        
        # Fallback: git status --porcelain
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            files = []
            for line in result.stdout.strip().split('\n'):
                if line and line[1] == ' ':  # Não staged
                    continue
                if line.startswith('??'):
                    continue  # Untracked
                # Arquivos modified, added, etc.
                filename = line[3:].strip()
                if filename:
                    files.append(filename)
            return files
        
        return []
    except Exception as e:
        print(f"[WARN] Erro ao verificar git: {e}")
        return []

def check_file(filepath, patterns):
    """Verifica se arquivo bate com algum padrão protegido"""
    for pattern in patterns:
        if re.search(pattern, filepath):
            return True
    return False

def main():
    # Verificar se é --pre-commit
    is_precommit = '--pre-commit' in sys.argv
    
    # Obter arquivos staged/modified
    files = get_staged_files()
    
    if not files:
        print("[GUARD] Nenhum arquivo modificado detectado.")
        sys.exit(0)
    
    # Verificar arquivos protegidos
    violations = []
    for filepath in files:
        if check_file(filepath, PROTECTED_PATTERNS):
            violations.append(filepath)
    
    if violations:
        print("=" * 60, file=sys.stderr)
        print(" ⚠️  BLOQUEADO PELO GUARDRAIL", file=sys.stderr)
        print("=" * 60, file=sys.stderr)
        print(file=sys.stderr)
        
        if is_precommit:
            print("O GuardRail detectou alterações em caminhos críticos:", file=sys.stderr)
        else:
            print("Caminhos críticos alterados:", file=sys.stderr)
        
        print(file=sys.stderr)
        for v in violations:
            print(f"  🔒 {v}", file=sys.stderr)
        print(file=sys.stderr)
        print("Regras:", file=sys.stderr)
        print("  → NÃO modificar módulos de autenticação (AuthContext, auth.py)");
        print("  → NÃO modificar módulos de avatar (avatar/, avatars.py)")
        print("  → NÃO modificar api.js e ProtectedRoute")
        print("  → NÃO modificar ProfilePage e useFeatureFlags")
        print("  → NÃO modificar app/main.py (exceto adições não invasivas)")
        print(file=sys.stderr)
        print("Para contornar:", file=sys.stderr)
        print("  1. Reverter: git restore <arquivo>", file=sys.stderr)
        print("  2. Ou adicione exceção consciente em safety_guard.py", file=sys.stderr)
        print("=" * 60, file=sys.stderr)
        
        sys.exit(2)
    else:
        print("[GUARD] ✅ Arquivos permitidos. Prosseguindo...")
        sys.exit(0)

if __name__ == "__main__":
    main()


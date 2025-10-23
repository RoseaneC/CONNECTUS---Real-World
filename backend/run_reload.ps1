# [CONNECTUS HOTFIX] Script de execução com reload-exclude para evitar loops
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --reload-exclude "scripts/*" --reload-exclude "*.db*"

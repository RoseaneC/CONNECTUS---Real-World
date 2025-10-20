#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.abspath('.'))

try:
    print("Testando importações...")
    
    from app.core.config import settings
    print("✅ Config importado")
    
    from app.core.database import engine, Base
    print("✅ Database importado")
    
    from app.core.security import verify_token, create_access_token
    print("✅ Security importado")
    
    from app.routers import auth_router
    print("✅ Auth router importado")
    
    from app.routers import users_router
    print("✅ Users router importado")
    
    from app.routers import missions_router
    print("✅ Missions router importado")
    
    from app.routers import posts_router
    print("✅ Posts router importado")
    
    from app.routers import chat_router
    print("✅ Chat router importado")
    
    from app.routers import ranking_router
    print("✅ Ranking router importado")
    
    print("\n✅ Todas as importações funcionaram!")
    
except Exception as e:
    print(f"❌ Erro na importação: {e}")
    import traceback
    traceback.print_exc()






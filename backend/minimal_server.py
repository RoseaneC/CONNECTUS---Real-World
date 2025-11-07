#!/usr/bin/env python3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Criar app minimal
app = FastAPI(title="Connectus Minimal", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend Connectus funcionando!", "status": "ok"}

@app.get("/test")
async def test():
    return {"test": "success"}

if __name__ == "__main__":
    print("🚀 Iniciando servidor minimal...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
















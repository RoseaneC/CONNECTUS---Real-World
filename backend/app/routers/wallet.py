from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from datetime import datetime
import secrets

try:
    from eth_account.messages import encode_defunct
    from eth_account import Account
    ETH_ACCOUNT_AVAILABLE = True
except Exception:
    ETH_ACCOUNT_AVAILABLE = False

from ..core.database import get_db, flag_value
from ..core.auth import get_current_active_user

router = APIRouter(prefix="/wallet", tags=["wallet"])

from sqlalchemy.exc import OperationalError
from sqlalchemy.sql import text

def _ensure_wallet_core_schema(db: Session):
    # Cria tabelas se não existirem (SQLite)
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS wallet_addresses (
            user_id INTEGER PRIMARY KEY,
            address TEXT,
            verified_at DATETIME
        )
    """))
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS token_transfers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            amount NUMERIC NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'pending',
            tx_hash TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """))
    db.commit()

def safe_fetchone(db, sql, params=None):
    try:
        return db.execute(text(sql), params or {}).fetchone()
    except OperationalError:
        return None

def safe_fetchall(db, sql, params=None):
    try:
        return db.execute(text(sql), params or {}).fetchall()
    except OperationalError:
        return []

def _get_flag(db, key: str) -> bool:
    """Helper function to get feature flag value"""
    return flag_value(db, key)

@router.get("/status")
def wallet_status(db: Session = Depends(get_db), user: dict = Depends(get_current_active_user)):
    """Get wallet status and feature flags"""
    try:
        _ensure_wallet_core_schema(db)
        onchain = _get_flag(db, "ONCHAIN_TESTNET")
        withdrawals = _get_flag(db, "WITHDRAWALS_ENABLED")
        
        row = safe_fetchone(db, "SELECT address, verified_at FROM wallet_addresses WHERE user_id=:uid", {"uid": user.id})
        if not row:
            return {"connected": False, "address": None, "verified": False, "onchain_enabled": onchain, "withdrawals_enabled": withdrawals}
        
        address, verified_at = row[0], row[1]
        return {
            "connected": bool(address),
            "address": address,
            "verified": bool(verified_at),
            "onchain_enabled": onchain,
            "withdrawals_enabled": withdrawals
        }
    except Exception:
        return {"connected": False, "address": None, "verified": False, "onchain_enabled": False, "withdrawals_enabled": False}

@router.post("/address/request-message")
def wallet_request_message(db: Session = Depends(get_db), user: dict = Depends(get_current_active_user)):
    """Request message for wallet signature verification"""
    if not ETH_ACCOUNT_AVAILABLE:
        raise HTTPException(status_code=503, detail="eth_account_not_available")
    
    # cria/atualiza nonce para desafio de assinatura
    nonce = secrets.token_hex(16)
    message = f"ConnectUS: prove address ownership. user_id={user.id} nonce={nonce}"
    # upsert simples
    db.execute(text("""
        INSERT INTO wallet_addresses(user_id,address,verified_at,nonce)
        VALUES(:uid,'',NULL,:nonce)
        ON CONFLICT(user_id) DO UPDATE SET nonce=:nonce, verified_at=NULL
    """), {"uid": user.id, "nonce": nonce})
    db.commit()
    return {"message": message, "nonce": nonce}

class VerifyBody(BaseModel):
    address: str
    signature: str
    nonce: str

@router.post("/address/verify")
def wallet_verify_signature(body: VerifyBody, db: Session = Depends(get_db), user: dict = Depends(get_current_active_user)):
    """Verify wallet signature and save address"""
    if not ETH_ACCOUNT_AVAILABLE:
        raise HTTPException(status_code=503, detail="eth_account_not_available")
    
    # reconstrói a mensagem idêntica à enviada
    message = f"ConnectUS: prove address ownership. user_id={user['id']} nonce={body.nonce}"
    eth_msg = encode_defunct(text=message)
    try:
        recovered = Account.recover_message(eth_msg, signature=bytes.fromhex(body.signature.replace("0x","")))
    except Exception:
        # alguns providers retornam assinatura como string "0x..."
        try:
            recovered = Account.recover_message(eth_msg, signature=body.signature)
        except Exception:
            raise HTTPException(status_code=400, detail="invalid_signature")

    if recovered.lower() != body.address.lower():
        raise HTTPException(status_code=400, detail="address_mismatch")

    # salva como verificado
    db.execute(text("""
        UPDATE wallet_addresses
        SET address=:addr, verified_at=:ts
        WHERE user_id=:uid AND nonce=:nonce
    """), {"addr": body.address, "ts": datetime.utcnow().isoformat(), "uid": user.id, "nonce": body.nonce})
    db.commit()

    row = db.execute(text("SELECT changes()")).fetchone()  # SQLite
    if not row or row[0] == 0:
        raise HTTPException(status_code=400, detail="nonce_not_found")

    return {"ok": True, "address": body.address}

class WithdrawBody(BaseModel):
    amount: int

@router.post("/withdraw-intent")
def withdraw_intent(body: WithdrawBody, db: Session = Depends(get_db), user: dict = Depends(get_current_active_user)):
    """Create withdrawal intent (stub - no blockchain interaction)"""
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="invalid_amount")

    if not _get_flag(db, "WITHDRAWALS_ENABLED"):
        raise HTTPException(status_code=403, detail="withdrawals_disabled")

    # opcional: checar saldo interno suficiente
    bal_row = db.execute(text("SELECT balance FROM v_wallet_balance WHERE user_id=:uid"), {"uid": user.id}).fetchone()
    bal = int(bal_row[0]) if bal_row else 0
    if body.amount > bal:
        raise HTTPException(status_code=400, detail="insufficient_balance")

    db.execute(text("""
        INSERT INTO token_transfers(user_id, amount, status) VALUES(:uid,:amt,'pending')
    """), {"uid": user.id, "amt": body.amount})
    db.commit()

    return {"ok": True, "status": "pending"}

class TransfersPage(BaseModel):
    items: list[dict]
    total: int
    limit: int
    offset: int

@router.get("/transfers", response_model=TransfersPage)
def list_transfers(
    db: Session = Depends(get_db), 
    user: dict = Depends(get_current_active_user),
    limit: int = Query(20, ge=1, le=100), 
    offset: int = Query(0, ge=0)
):
    """List user's token transfers"""
    try:
        _ensure_wallet_core_schema(db)
        rows = safe_fetchall(db, """
            SELECT id, amount, status, tx_hash, created_at
            FROM token_transfers WHERE user_id=:uid
            ORDER BY created_at DESC, id DESC
            LIMIT :limit OFFSET :offset
        """, {"uid": user.id, "limit": limit, "offset": offset})
        
        items = [{"id": r[0], "amount": int(r[1]), "status": r[2], "tx_hash": r[3], "created_at": r[4]} for r in rows]
        return {"items": items, "total": len(items), "limit": limit, "offset": offset}
    except Exception:
        return {"items": [], "total": 0, "limit": limit, "offset": offset}

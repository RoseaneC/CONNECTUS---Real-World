# backend/app/routers/staking.py
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.auth import get_current_user

router = APIRouter(prefix="/staking", tags=["staking"])

def utcnow():
    return datetime.now(timezone.utc)

def get_flag(db, key: str) -> bool:
    try:
        row = db.execute(text("SELECT enabled FROM feature_flags WHERE key=:k"), {"k": key}).fetchone()
        return bool(row[0]) if row else False
    except OperationalError:
        # tabela/coluna ainda não existe neste DB → tratar como flag desativada
        return False

class TierOut(BaseModel):
    id: int
    name: str
    apy_bps: int
    lock_days: int
    min_amount: int

@router.get("/tiers", response_model=List[TierOut])
def list_tiers(db=Depends(get_db), user=Depends(get_current_user)):
    if not get_flag(db, "STAKING_ENABLED"):
        return []
    rows = db.execute(text("""
        SELECT id, name, apy_bps, lock_days, min_amount
        FROM staking_tiers ORDER BY lock_days ASC
    """)).fetchall()
    return [{"id":r[0], "name":r[1], "apy_bps":r[2], "lock_days":r[3], "min_amount":r[4]} for r in rows]

class OpenBody(BaseModel):
    tier_id: int
    amount: int

@router.post("/open")
def staking_open(body: OpenBody, db=Depends(get_db), user=Depends(get_current_user)):
    if not get_flag(db, "STAKING_ENABLED"):
        raise HTTPException(status_code=403, detail="staking_disabled")
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="invalid_amount")

    tier = db.execute(text("SELECT id, apy_bps, lock_days, min_amount FROM staking_tiers WHERE id=:id"),
                      {"id": body.tier_id}).fetchone()
    if not tier:
        raise HTTPException(status_code=404, detail="tier_not_found")

    if body.amount < int(tier[3]):
        raise HTTPException(status_code=400, detail="below_min_amount")

    # verifica saldo disponível
    bal_row = db.execute(text("SELECT balance FROM v_wallet_balance WHERE user_id=:uid"),
                         {"uid": user.id}).fetchone()
    bal = int(bal_row[0]) if bal_row else 0
    if body.amount > bal:
        raise HTTPException(status_code=400, detail="insufficient_balance")

    now = utcnow()
    ends = now + timedelta(days=int(tier[2]))

    # cria posição
    db.execute(text("""
        INSERT INTO staking_positions(user_id, tier_id, principal, apy_bps, lock_days, started_at, ends_at, last_accrued_at, status)
        VALUES (:uid, :tid, :p, :apy, :ld, :st, :en, :st, 'open')
    """), {"uid": user.id, "tid": tier[0], "p": body.amount, "apy": int(tier[1]), "ld": int(tier[2]),
           "st": now.isoformat(), "en": ends.isoformat()})

    # debita no ledger (trava o principal)
    db.execute(text("""
        INSERT INTO token_ledger(user_id, type, amount, meta_json)
        VALUES(:uid, 'stake', :amt, '{"action":"open"}')
    """), {"uid": user.id, "amt": -abs(int(body.amount))})

    return {"ok": True}

class PositionOut(BaseModel):
    id: int
    tier_name: Optional[str]
    principal: int
    apy_bps: int
    lock_days: int
    started_at: datetime
    ends_at: datetime
    last_accrued_at: datetime
    status: str

@router.get("/positions", response_model=List[PositionOut])
def list_positions(db=Depends(get_db), user=Depends(get_current_user)):
    try:
        rows = db.execute(text("""
            SELECT p.id, t.name, p.principal, p.apy_bps, p.lock_days, p.started_at, p.ends_at, p.last_accrued_at, p.status
            FROM staking_positions p
            LEFT JOIN staking_tiers t ON t.id=p.tier_id
            WHERE p.user_id=:uid
            ORDER BY p.created_at DESC, p.id DESC
        """), {"uid": user.id}).fetchall()

        out = []
        for r in rows:
            out.append({
                "id": r[0], "tier_name": r[1], "principal": int(r[2]), "apy_bps": int(r[3]), "lock_days": int(r[4]),
                "started_at": datetime.fromisoformat(r[5]) if isinstance(r[5], str) else r[5],
                "ends_at": datetime.fromisoformat(r[6]) if isinstance(r[6], str) else r[6],
                "last_accrued_at": datetime.fromisoformat(r[7]) if isinstance(r[7], str) else r[7],
                "status": r[8]
            })
        return out
    except OperationalError:
        # tabela ainda não existe neste DB → retornar lista vazia
        return []

def _calc_reward_since(principal: int, apy_bps: int, last_dt: datetime, now: datetime) -> int:
    # cálculo simples: base dias/365; truncamos para inteiro
    elapsed_days = max((now - last_dt).total_seconds() / 86400.0, 0.0)
    yearly = principal * (apy_bps / 10000.0)
    reward = int(yearly * (elapsed_days / 365.0))
    return max(reward, 0)

class ClaimBody(BaseModel):
    position_id: int

@router.post("/claim")
def staking_claim(body: ClaimBody, db=Depends(get_db), user=Depends(get_current_user)):
    if not get_flag(db, "STAKING_ENABLED"):
        raise HTTPException(status_code=403, detail="staking_disabled")

    try:
        row = db.execute(text("""
            SELECT id, principal, apy_bps, last_accrued_at, status
            FROM staking_positions WHERE id=:pid AND user_id=:uid
        """), {"pid": body.position_id, "uid": user.id}).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="position_not_found")
        if row[4] != "open":
            raise HTTPException(status_code=400, detail="position_closed")

        now = utcnow()
        last = datetime.fromisoformat(row[3]) if isinstance(row[3], str) else row[3]
        reward = _calc_reward_since(int(row[1]), int(row[2]), last, now)
        if reward <= 0:
            return {"ok": True, "reward": 0}

        # credita recompensa e avança last_accrued_at
        db.execute(text("""
            INSERT INTO token_ledger(user_id, type, amount, meta_json)
            VALUES(:uid, 'stake_reward', :amt, '{"action":"claim"}')
        """), {"uid": user.id, "amt": reward})
        db.execute(text("UPDATE staking_positions SET last_accrued_at=:now WHERE id=:pid"),
                   {"now": now.isoformat(), "pid": row[0]})
        return {"ok": True, "reward": reward}
    except OperationalError:
        raise HTTPException(status_code=400, detail="staking_not_initialized")

@router.post("/close")
def staking_close(body: ClaimBody, db=Depends(get_db), user=Depends(get_current_user)):
    if not get_flag(db, "STAKING_ENABLED"):
        raise HTTPException(status_code=403, detail="staking_disabled")

    try:
        row = db.execute(text("""
            SELECT id, principal, apy_bps, last_accrued_at, status
            FROM staking_positions WHERE id=:pid AND user_id=:uid
        """), {"pid": body.position_id, "uid": user.id}).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="position_not_found")
        if row[4] != "open":
            raise HTTPException(status_code=400, detail="position_already_closed")

        now = utcnow()
        last = datetime.fromisoformat(row[3]) if isinstance(row[3], str) else row[3]
        reward = _calc_reward_since(int(row[1]), int(row[2]), last, now)

        # 1) recompensa final (se houver)
        if reward > 0:
            db.execute(text("""
                INSERT INTO token_ledger(user_id, type, amount, meta_json)
                VALUES(:uid, 'stake_reward', :amt, '{"action":"close"}')
            """), {"uid": user.id, "amt": reward})

        # 2) devolução do principal
        db.execute(text("""
            INSERT INTO token_ledger(user_id, type, amount, meta_json)
            VALUES(:uid, 'stake_return', :amt, '{"action":"close"}')
        """), {"uid": user.id, "amt": int(row[1])})

        # 3) encerra posição
        db.execute(text("UPDATE staking_positions SET status='closed', last_accrued_at=:now WHERE id=:pid"),
                   {"now": now.isoformat(), "pid": row[0]})

        return {"ok": True, "reward": reward, "returned": int(row[1])}
    except OperationalError:
        raise HTTPException(status_code=400, detail="staking_not_initialized")

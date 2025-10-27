"""
Demo Wallet API (Off-chain simulation)
Permite demonstrar carteira e staking sem deploy on-chain
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.auth import get_current_user

router = APIRouter(prefix="/wallet/demo", tags=["wallet-demo"])

class MintRequest(BaseModel):
    amount: float = 100.0

class StakeRequest(BaseModel):
    amount: float
    days: int

class UnstakeRequest(BaseModel):
    position_id: int

@router.get("/status")
def get_wallet_status(db: Session = Depends(get_db), user = Depends(get_current_user)):
    """Get demo wallet status"""
    row = db.execute(text("""
        SELECT balance FROM demo_wallets WHERE user_id=:uid
    """), {"uid": user.id}).first()
    
    balance = row[0] if row else 0.0
    
    positions = db.execute(text("""
        SELECT id, amount, days, status, unlock_at, created_at
        FROM demo_stakes 
        WHERE user_id=:uid
        ORDER BY created_at DESC
    """), {"uid": user.id}).fetchall()
    
    return {
        "address": f"demo:{user.id}",
        "balance": balance,
        "positions": [
            {
                "id": p[0],
                "amount": p[1],
                "days": p[2],
                "status": p[3],
                "unlock_at": p[4],
                "created_at": p[5],
            }
            for p in positions
        ]
    }

@router.post("/mint")
def mint_demo_tokens(
    request: MintRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Mint demo tokens (add to balance)"""
    # Initialize wallet if not exists
    db.execute(text("""
        INSERT OR IGNORE INTO demo_wallets (user_id, balance)
        VALUES (:uid, 0.0)
    """), {"uid": user.id})
    
    # Add tokens
    db.execute(text("""
        UPDATE demo_wallets 
        SET balance = balance + :amount
        WHERE user_id=:uid
    """), {"uid": user.id, "amount": request.amount})
    
    # Get new balance
    row = db.execute(text("""
        SELECT balance FROM demo_wallets WHERE user_id=:uid
    """), {"uid": user.id}).first()
    
    db.commit()
    
    return {
        "ok": True,
        "minted": request.amount,
        "new_balance": row[0] if row else 0.0
    }

@router.post("/stake")
def create_stake(
    request: StakeRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Create a stake position"""
    # Check balance
    row = db.execute(text("""
        SELECT balance FROM demo_wallets WHERE user_id=:uid
    """), {"uid": user.id}).first()
    
    balance = row[0] if row else 0.0
    
    if balance < request.amount:
        raise HTTPException(400, f"Insufficient balance. You have {balance} tokens")
    
    # Deduct from balance
    db.execute(text("""
        UPDATE demo_wallets 
        SET balance = balance - :amount
        WHERE user_id=:uid
    """), {"uid": user.id, "amount": request.amount})
    
    # Create stake
    unlock_at = datetime.now() + timedelta(days=request.days)
    apr = 10.0  # Demo APR
    
    cursor = db.execute(text("""
        INSERT INTO demo_stakes (user_id, amount, apr, days, status, created_at, unlock_at)
        VALUES (:uid, :amount, :apr, :days, 'locked', CURRENT_TIMESTAMP, :unlock)
        RETURNING id
    """), {
        "uid": user.id,
        "amount": request.amount,
        "apr": apr,
        "days": request.days,
        "unlock": unlock_at.isoformat()
    })
    
    position_id = cursor.first()[0]
    db.commit()
    
    return {
        "ok": True,
        "position_id": position_id,
        "amount": request.amount,
        "days": request.days,
        "apr": apr,
        "unlock_at": unlock_at.isoformat()
    }

@router.post("/unstake")
def unstake_position(
    request: UnstakeRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Unstake a position and return tokens"""
    # Get position
    row = db.execute(text("""
        SELECT amount, unlock_at, status FROM demo_stakes
        WHERE id=:pid AND user_id=:uid
    """), {"pid": request.position_id, "uid": user.id}).first()
    
    if not row:
        raise HTTPException(404, "Position not found")
    
    amount, unlock_at, status = row
    
    # Check if locked
    if status == "locked" and unlock_at:
        unlock = datetime.fromisoformat(unlock_at)
        if datetime.now() < unlock:
            raise HTTPException(400, f"Position locked until {unlock_at}")
    
    # Update position status
    db.execute(text("""
        UPDATE demo_stakes 
        SET status='unlocked'
        WHERE id=:pid AND user_id=:uid
    """), {"pid": request.position_id, "uid": user.id})
    
    # Return tokens to balance
    db.execute(text("""
        UPDATE demo_wallets 
        SET balance = balance + :amount
        WHERE user_id=:uid
    """), {"uid": user.id, "amount": amount})
    
    db.commit()
    
    return {
        "ok": True,
        "position_id": request.position_id,
        "returned": amount
    }


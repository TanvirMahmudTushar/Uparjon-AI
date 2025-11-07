from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Payment, FraudLog, Task, User
from database import get_db
from groq import Groq
import os
import json

router = APIRouter(prefix="/fraud", tags=["fraud"])

# Initialize Groq client with graceful fallback
def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if api_key:
        return Groq(api_key=api_key)
    return None

groq_client = get_groq_client()

@router.post("/detect/{user_id}")
async def detect_fraud(user_id: int, db: Session = Depends(get_db)):
    """Run fraud detection on user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    payments = db.query(Payment).filter(Payment.user_id == user_id).order_by(Payment.created_at.desc()).limit(20).all()
    
    if not payments:
        return {"user_id": user_id, "fraud_risk": 0.0, "red_flags": []}
    
    payment_data = json.dumps([{
        "amount": p.amount,
        "status": p.status,
        "method": p.method,
        "created_at": p.created_at.isoformat()
    } for p in payments], default=str)
    
    message = groq_client.messages.create(
        model="mixtral-8x7b-32768",
        max_tokens=500,
        temperature=0.1,
        messages=[
            {
                "role": "user",
                "content": f"""Analyze for fraud patterns. Return JSON with:
- fraud_risk (0-1)
- red_flags: []
- anomalies: []

Payments: {payment_data}

Respond ONLY with JSON."""
            }
        ]
    )
    
    result = json.loads(message.content[0].text)
    fraud_risk = result.get("fraud_risk", 0.0)
    
    fraud_log = FraudLog(
        user_id=user_id,
        event_type="fraud_scan",
        confidence=fraud_risk,
        details=result
    )
    db.add(fraud_log)
    db.commit()
    
    return result

@router.get("/logs/{user_id}")
async def get_fraud_logs(user_id: int, limit: int = 50, db: Session = Depends(get_db)):
    """Get fraud detection logs"""
    logs = db.query(FraudLog).filter(FraudLog.user_id == user_id).order_by(FraudLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "event_type": log.event_type,
            "confidence": log.confidence,
            "details": log.details,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]

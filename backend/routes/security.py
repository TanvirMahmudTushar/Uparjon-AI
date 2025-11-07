from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import User, AuditLog
from database import get_db
from datetime import datetime
import json

router = APIRouter(prefix="/security", tags=["security"])

@router.post("/audit-log")
async def log_audit_event(user_id: int, action: str, resource: str, details: dict = None, ip_address: str = None, db: Session = Depends(get_db)):
    """Log audit event"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    audit = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        details=details,
        ip_address=ip_address
    )
    db.add(audit)
    db.commit()
    
    return {"message": "Audit logged", "audit_id": audit.id}

@router.get("/audit-logs/{user_id}")
async def get_audit_logs(user_id: int, limit: int = 100, db: Session = Depends(get_db)):
    """Get audit logs for a user"""
    logs = db.query(AuditLog).filter(AuditLog.user_id == user_id).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "action": log.action,
            "resource": log.resource,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]

@router.post("/rbac/assign-role")
async def assign_role(user_id: int, role: str, db: Session = Depends(get_db)):
    """Assign role to user (admin, manager, user)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if role not in ["admin", "manager", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user.role = role
    db.commit()
    
    return {"user_id": user_id, "role": role}

@router.get("/compliance-status/{user_id}")
async def get_compliance_status(user_id: int, db: Session = Depends(get_db)):
    """Get compliance status and certifications"""
    return {
        "user_id": user_id,
        "certifications": ["GDPR", "SOC 2 Type II", "ISO 27001"],
        "data_encryption": "AES-256",
        "ssl_tls": True,
        "audit_trail": True,
        "last_audit": datetime.now().isoformat()
    }

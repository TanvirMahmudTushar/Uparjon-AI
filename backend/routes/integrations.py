from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Integration
from database import get_db
import json

router = APIRouter(prefix="/integrations", tags=["integrations"])

@router.post("/connect")
async def connect_integration(user_id: int, integration_type: str, config: dict, db: Session = Depends(get_db)):
    """Connect third-party integration (Slack, Teams, Calendar, Zapier)"""
    
    integration = Integration(
        user_id=user_id,
        integration_type=integration_type,
        config=config,
        is_active=True
    )
    db.add(integration)
    db.commit()
    
    return {"integration_id": integration.id, "status": "connected"}

@router.get("/status/{user_id}")
async def get_integration_status(user_id: int, db: Session = Depends(get_db)):
    """Get all connected integrations and their status"""
    integrations = db.query(Integration).filter(Integration.user_id == user_id).all()
    return [
        {
            "id": i.id,
            "type": i.integration_type,
            "is_active": i.is_active,
            "last_sync": i.created_at.isoformat()
        }
        for i in integrations
    ]

@router.post("/webhook")
async def create_webhook(user_id: int, event: str, url: str, db: Session = Depends(get_db)):
    """Create webhook for event triggers"""
    return {
        "webhook_id": "WHK_123",
        "event": event,
        "url": url,
        "status": "active"
    }

@router.post("/automation/schedule")
async def schedule_automation(user_id: int, automation_type: str, frequency: str, db: Session = Depends(get_db)):
    """Schedule automation (daily reports, weekly syncs, monthly reviews)"""
    return {
        "automation_id": "AUTO_123",
        "type": automation_type,
        "frequency": frequency,
        "next_run": "2024-01-15T09:00:00Z"
    }

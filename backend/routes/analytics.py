from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from models import Task, Payment, User, Report
from database import get_db
from groq import Groq
import os
import json
from datetime import datetime, timedelta

router = APIRouter(prefix="/analytics", tags=["analytics"])

# Initialize Groq client with graceful fallback
def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if api_key:
        return Groq(api_key=api_key)
    return None

groq_client = get_groq_client()

@router.post("/report/generate")
async def generate_report(user_id: int, report_type: str, date_from: str = None, date_to: str = None, db: Session = Depends(get_db)):
    """Generate custom report (performance, compliance, roi)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    payments = db.query(Payment).filter(Payment.user_id == user_id).all()
    
    report_data = {
        "total_tasks": len(tasks),
        "verified_tasks": len([t for t in tasks if t.verification_status == "verified"]),
        "total_earnings": sum([p.amount for p in payments]),
        "avg_task_score": sum([t.ai_score for t in tasks]) / len(tasks) if tasks else 0
    }
    
    report = Report(
        user_id=user_id,
        title=f"{report_type.capitalize()} Report - {datetime.now().strftime('%Y-%m-%d')}",
        report_type=report_type,
        data=report_data
    )
    db.add(report)
    db.commit()
    
    return report_data

@router.post("/report/export/{report_id}")
async def export_report(report_id: int, db: Session = Depends(get_db)):
    """Export report as CSV"""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    csv_content = "Metric,Value\n"
    for key, value in report.data.items():
        csv_content += f"{key},{value}\n"
    
    return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=report.csv"})

@router.post("/roi-calculator")
async def calculate_roi(user_id: int, initial_investment: float, db: Session = Depends(get_db)):
    """Calculate ROI with projections"""
    payments = db.query(Payment).filter(Payment.user_id == user_id).all()
    total_earnings = sum([p.amount for p in payments])
    
    roi = ((total_earnings - initial_investment) / initial_investment * 100) if initial_investment > 0 else 0
    
    return {
        "initial_investment": initial_investment,
        "total_earnings": total_earnings,
        "roi_percentage": roi,
        "profit": total_earnings - initial_investment,
        "projected_monthly": total_earnings / max(1, len(payments) // 30)
    }

@router.get("/metrics/{user_id}")
async def get_analytics_metrics(user_id: int, db: Session = Depends(get_db)):
    """Get comprehensive analytics metrics"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    payments = db.query(Payment).filter(Payment.user_id == user_id).all()
    
    return {
        "user_id": user_id,
        "credit_score": user.credit_score,
        "points": user.points,
        "total_tasks": len(tasks),
        "verified_tasks": len([t for t in tasks if t.verification_status == "verified"]),
        "paid_tasks": len([t for t in tasks if t.payment_status == "paid"]),
        "total_earnings": sum([p.amount for p in payments]),
        "average_task_score": sum([t.ai_score for t in tasks]) / len(tasks) if tasks else 0,
        "completion_rate": len([t for t in tasks if t.verification_status == "verified"]) / len(tasks) * 100 if tasks else 0
    }

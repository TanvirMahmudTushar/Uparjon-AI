from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Payment, Task, User
from schemas import PaymentCreate, Payment as PaymentSchema
from database import get_db

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/process")
async def process_payment(payment_data: PaymentCreate, db: Session = Depends(get_db)):
    """Process a payment"""
    payment = db.query(Payment).filter(Payment.task_id == payment_data.task_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = "completed"
    task = db.query(Task).filter(Task.id == payment.task_id).first()
    if task:
        task.payment_status = "paid"
    
    db.commit()
    
    return {"payment_id": payment.id, "status": "completed", "amount": payment.amount}

@router.get("/{user_id}")
async def get_user_payments(user_id: int, db: Session = Depends(get_db)):
    """Get all payments for a user"""
    payments = db.query(Payment).filter(Payment.user_id == user_id).order_by(Payment.created_at.desc()).all()
    return [PaymentSchema.from_orm(p) for p in payments]

@router.get("/credit-score/{user_id}")
async def get_credit_score(user_id: int, db: Session = Depends(get_db)):
    """Get user credit score"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"user_id": user_id, "credit_score": user.credit_score}

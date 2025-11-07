from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Task, User, Payment
from schemas import TaskCreate, TaskUpdate, Task as TaskSchema
from database import get_db
import json
from groq import Groq
import os

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Initialize Groq client with graceful fallback
def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if api_key:
        return Groq(api_key=api_key)
    return None

groq_client = get_groq_client()

@router.post("/submit")
async def submit_task(user_id: int, task_data: TaskCreate, db: Session = Depends(get_db)):
    """Submit a new task"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_task = Task(
        user_id=user_id,
        description=task_data.description,
        category=task_data.category,
        amount=task_data.amount
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Create payment record
    payment = Payment(
        user_id=user_id,
        task_id=db_task.id,
        amount=task_data.amount
    )
    db.add(payment)
    db.commit()
    
    return {"task_id": db_task.id, "status": "submitted"}

@router.get("/{user_id}")
async def get_user_tasks(user_id: int, db: Session = Depends(get_db)):
    """Get all tasks for a user"""
    tasks = db.query(Task).filter(Task.user_id == user_id).order_by(Task.created_at.desc()).all()
    return [TaskSchema.from_orm(t) for t in tasks]

@router.post("/verify/{task_id}")
async def verify_task(task_id: int, db: Session = Depends(get_db)):
    """Verify task with AI"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    message = groq_client.messages.create(
        model="mixtral-8x7b-32768",
        max_tokens=500,
        temperature=0.1,
        messages=[
            {
                "role": "user",
                "content": f"""Analyze this task for authenticity. Return JSON with:
- authenticity_score (0-1)
- red_flags: []
- recommendation: 'approve' or 'review'

Task: {task.description}

Respond ONLY with JSON."""
            }
        ]
    )
    
    result = json.loads(message.content[0].text)
    ai_score = result.get("authenticity_score", 0.5)
    
    task.ai_score = ai_score
    task.verification_status = "verified" if ai_score > 0.7 else "review_needed"
    db.commit()
    
    return {"task_id": task_id, "verification_result": result, "status": task.verification_status}

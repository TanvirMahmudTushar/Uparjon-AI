from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Task, User, AIInsight, ChatMessage
from database import get_db
from groq import Groq
import os
import json
from datetime import datetime, timedelta

router = APIRouter(prefix="/ai", tags=["ai"])

# Initialize Groq client with graceful fallback
def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if api_key:
        return Groq(api_key=api_key)
    return None

groq_client = get_groq_client()

@router.post("/predict/{user_id}")
async def predict_completion(user_id: int, db: Session = Depends(get_db)):
    """Predict task completion rates and trends"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    task_data = json.dumps([{"status": t.verification_status, "score": t.ai_score} for t in tasks[-10:]], default=str)
    
    message = groq_client.messages.create(
        model="mixtral-8x7b-32768",
        max_tokens=500,
        temperature=0.5,
        messages=[
            {
                "role": "user",
                "content": f"""Analyze task completion trends. Return JSON with:
- completion_rate: float (0-1)
- predicted_revenue: float
- trend: 'improving' | 'stable' | 'declining'
- forecast_next_7days: list of predicted daily completions

Task history: {task_data}

Respond ONLY with JSON."""
            }
        ]
    )
    
    result = json.loads(message.content[0].text)
    insight = AIInsight(user_id=user_id, insight_type="prediction", data=result, confidence=0.85)
    db.add(insight)
    db.commit()
    
    return result

@router.post("/anomalies/{user_id}")
async def detect_anomalies(user_id: int, db: Session = Depends(get_db)):
    """Detect unusual work patterns and anomalies"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    tasks = db.query(Task).filter(Task.user_id == user_id).order_by(Task.created_at.desc()).limit(20).all()
    
    # Convert to timeline data
    timeline = []
    for task in reversed(tasks):
        timeline.append({
            "created_at": task.created_at.isoformat(),
            "score": task.ai_score,
            "status": task.verification_status
        })
    
    message = groq_client.messages.create(
        model="mixtral-8x7b-32768",
        max_tokens=500,
        temperature=0.5,
        messages=[
            {
                "role": "user",
                "content": f"""Detect anomalies in this work pattern. Return JSON with:
- anomalies: list of {{"type": str, "severity": 0-1}}
- normal_pattern: description
- unusual_activity: bool
- recommendations: list of str

Timeline: {json.dumps(timeline)}

Respond ONLY with JSON."""
            }
        ]
    )
    
    result = json.loads(message.content[0].text)
    insight = AIInsight(user_id=user_id, insight_type="anomaly", data=result, confidence=0.8)
    db.add(insight)
    db.commit()
    
    return result

@router.post("/sentiment/{user_id}")
async def analyze_sentiment(user_id: int, db: Session = Depends(get_db)):
    """Analyze sentiment from chat conversations"""
    messages = db.query(ChatMessage).filter(ChatMessage.user_id == user_id).order_by(ChatMessage.created_at.desc()).limit(10).all()
    
    chat_data = json.dumps([{"content": m.content, "sender": m.sender} for m in messages], default=str)
    
    message = groq_client.messages.create(
        model="mixtral-8x7b-32768",
        max_tokens=500,
        temperature=0.5,
        messages=[
            {
                "role": "user",
                "content": f"""Analyze sentiment and team morale. Return JSON with:
- overall_sentiment: 'positive' | 'neutral' | 'negative'
- morale_score: float (0-1)
- key_concerns: list of str
- suggestions: list of str

Chat history: {chat_data}

Respond ONLY with JSON."""
            }
        ]
    )
    
    result = json.loads(message.content[0].text)
    
    for msg in messages:
        msg.sentiment = result.get("overall_sentiment")
    
    insight = AIInsight(user_id=user_id, insight_type="sentiment", data=result, confidence=0.85)
    db.add(insight)
    db.commit()
    
    return result

@router.post("/chat/send")
async def send_chat_message(user_id: int, content: str, analysis_mode: str = "general", db: Session = Depends(get_db)):
    """Send message to AI chat and get response"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Save user message
    user_msg = ChatMessage(user_id=user_id, content=content, sender="user", analysis_mode=analysis_mode)
    db.add(user_msg)
    db.commit()
    
    # Get AI response based on mode
    system_prompts = {
        "general": "You are a helpful workplace AI assistant.",
        "performance": "You are a performance analytics expert analyzing task completion and productivity.",
        "team": "You are a team dynamics expert providing insights on team collaboration.",
        "strategy": "You are a strategic advisor helping with business and work strategy.",
        "conflict": "You are a conflict resolution specialist helping resolve workplace issues."
    }
    
    response = groq_client.messages.create(
        model="mixtral-8x7b-32768",
        max_tokens=500,
        temperature=0.7,
        system=system_prompts.get(analysis_mode, system_prompts["general"]),
        messages=[
            {
                "role": "user",
                "content": content
            }
        ]
    )
    
    response_text = response.content[0].text
    
    # Save AI response
    ai_msg = ChatMessage(user_id=user_id, content=response_text, sender="assistant", analysis_mode=analysis_mode)
    db.add(ai_msg)
    db.commit()
    
    return {"user_message": user_msg.id, "ai_response": response_text}

@router.get("/chat/history/{user_id}")
async def get_chat_history(user_id: int, limit: int = 50, db: Session = Depends(get_db)):
    """Get chat message history"""
    messages = db.query(ChatMessage).filter(ChatMessage.user_id == user_id).order_by(ChatMessage.created_at.desc()).limit(limit).all()
    return [{"id": m.id, "content": m.content, "sender": m.sender, "analysis_mode": m.analysis_mode, "created_at": m.created_at.isoformat()} for m in reversed(messages)]

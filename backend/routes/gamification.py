from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import User, Achievement, Task
from database import get_db

router = APIRouter(prefix="/gamification", tags=["gamification"])

BADGE_THRESHOLDS = {
    "Task Master": {"tasks": 50, "points": 100},
    "Speed Demon": {"avg_time": 1, "tasks": 20},
    "Perfect Score": {"perfect_tasks": 10, "points": 50},
    "Leadership": {"points": 500}
}

@router.get("/leaderboard")
async def get_leaderboard(limit: int = 50, db: Session = Depends(get_db)):
    """Get global leaderboard ranked by points"""
    users = db.query(User).order_by(User.points.desc()).limit(limit).all()
    return [
        {
            "rank": idx + 1,
            "user_id": u.id,
            "name": u.name,
            "points": u.points,
            "credit_score": u.credit_score
        }
        for idx, u in enumerate(users)
    ]

@router.get("/achievements/{user_id}")
async def get_achievements(user_id: int, db: Session = Depends(get_db)):
    """Get all achievements for a user"""
    achievements = db.query(Achievement).filter(Achievement.user_id == user_id).all()
    return [
        {
            "id": a.id,
            "badge_name": a.badge_name,
            "points_earned": a.points_earned,
            "unlocked_at": a.unlocked_at.isoformat()
        }
        for a in achievements
    ]

@router.post("/check-achievements/{user_id}")
async def check_and_award_achievements(user_id: int, db: Session = Depends(get_db)):
    """Check if user qualifies for new achievements"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    verified_tasks = len([t for t in tasks if t.verification_status == "verified"])
    perfect_tasks = len([t for t in tasks if t.ai_score >= 0.9])
    
    new_achievements = []
    
    # Check Task Master
    if verified_tasks >= 50:
        existing = db.query(Achievement).filter(
            Achievement.user_id == user_id,
            Achievement.badge_name == "Task Master"
        ).first()
        if not existing:
            achievement = Achievement(
                user_id=user_id,
                badge_name="Task Master",
                points_earned=100
            )
            db.add(achievement)
            user.points += 100
            new_achievements.append("Task Master")
    
    # Check Perfect Score
    if perfect_tasks >= 10:
        existing = db.query(Achievement).filter(
            Achievement.user_id == user_id,
            Achievement.badge_name == "Perfect Score"
        ).first()
        if not existing:
            achievement = Achievement(
                user_id=user_id,
                badge_name="Perfect Score",
                points_earned=50
            )
            db.add(achievement)
            user.points += 50
            new_achievements.append("Perfect Score")
    
    # Check Leadership
    if user.points >= 500:
        existing = db.query(Achievement).filter(
            Achievement.user_id == user_id,
            Achievement.badge_name == "Leadership"
        ).first()
        if not existing:
            achievement = Achievement(
                user_id=user_id,
                badge_name="Leadership",
                points_earned=0
            )
            db.add(achievement)
            new_achievements.append("Leadership")
    
    db.commit()
    
    return {"new_achievements": new_achievements, "total_points": user.points}

@router.get("/stats/{user_id}")
async def get_gamification_stats(user_id: int, db: Session = Depends(get_db)):
    """Get user gamification stats"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    achievements = db.query(Achievement).filter(Achievement.user_id == user_id).count()
    
    return {
        "user_id": user_id,
        "points": user.points,
        "credit_score": user.credit_score,
        "achievements_count": achievements,
        "rank": db.query(User).filter(User.points > user.points).count() + 1
    }

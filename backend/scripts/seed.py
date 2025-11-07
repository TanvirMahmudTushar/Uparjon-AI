from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User, Task, Payment, Achievement, ChatMessage
from routes.auth import hash_password
from datetime import datetime, timedelta
import random

def seed_database():
    """Seed database with sample data"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(User).delete()
        db.query(Task).delete()
        db.query(Payment).delete()
        db.query(Achievement).delete()
        db.query(ChatMessage).delete()
        
        # Create sample users
        users = [
            User(
                name="Ahmed Khan",
                email="ahmed@example.com",
                hashed_password=hash_password("password123"),
                wallet_id="WALLET_001",
                credit_score=750,
                points=250,
                role="user"
            ),
            User(
                name="Fatima Ali",
                email="fatima@example.com",
                hashed_password=hash_password("password123"),
                wallet_id="WALLET_002",
                credit_score=680,
                points=150,
                role="user"
            ),
            User(
                name="Hassan Reza",
                email="hassan@example.com",
                hashed_password=hash_password("password123"),
                wallet_id="WALLET_003",
                credit_score=620,
                points=100,
                role="manager"
            ),
            User(
                name="Admin User",
                email="admin@example.com",
                hashed_password=hash_password("admin123"),
                wallet_id="WALLET_ADMIN",
                credit_score=900,
                points=1000,
                role="admin"
            ),
        ]
        
        for user in users:
            db.add(user)
        
        db.commit()
        
        # Create sample tasks and payments
        for user in users:
            for i in range(5):
                task = Task(
                    user_id=user.id,
                    description=f"Sample task {i+1} for {user.name}",
                    category=random.choice(["general", "research", "analysis", "report"]),
                    ai_score=random.uniform(0.6, 1.0),
                    verification_status=random.choice(["verified", "pending", "review_needed"]),
                    payment_status=random.choice(["paid", "unpaid"]),
                    amount=random.uniform(30, 150),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
                )
                db.add(task)
                db.commit()
                
                # Create payment for task
                payment = Payment(
                    user_id=user.id,
                    task_id=task.id,
                    amount=task.amount,
                    method=random.choice(["bKash", "Nagad", "card"]),
                    status=task.payment_status,
                    risk_score=random.uniform(0, 0.3)
                )
                db.add(payment)
        
        db.commit()
        
        # Create sample achievements
        achievements = [
            Achievement(user_id=users[0].id, badge_name="Task Master", points_earned=100),
            Achievement(user_id=users[0].id, badge_name="Perfect Score", points_earned=50),
            Achievement(user_id=users[1].id, badge_name="Speed Demon", points_earned=75),
            Achievement(user_id=users[2].id, badge_name="Leadership", points_earned=0),
        ]
        
        for achievement in achievements:
            db.add(achievement)
        
        db.commit()
        
        print("Database seeded successfully!")
        print(f"Created {len(users)} users")
        print(f"Created {sum(5 for u in users)} tasks and payments")
        print(f"Created {len(achievements)} achievements")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

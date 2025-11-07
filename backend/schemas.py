from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    wallet_id: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    credit_score: Optional[float] = None
    two_factor_enabled: Optional[bool] = None

class User(UserBase):
    id: int
    wallet_id: str
    credit_score: float
    points: int
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    description: str
    category: Optional[str] = "general"
    amount: Optional[float] = 50.0

class TaskUpdate(BaseModel):
    verification_status: Optional[str] = None
    payment_status: Optional[str] = None
    ai_score: Optional[float] = None

class Task(BaseModel):
    id: int
    user_id: int
    description: str
    category: str
    ai_score: float
    verification_status: str
    payment_status: str
    amount: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    task_id: int
    method: Optional[str] = "bKash"

class Payment(BaseModel):
    id: int
    user_id: int
    task_id: int
    amount: float
    method: str
    status: str
    risk_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    content: str
    analysis_mode: Optional[str] = "general"

class ChatMessage(BaseModel):
    id: int
    user_id: int
    content: str
    sender: str
    sentiment: Optional[str]
    analysis_mode: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AchievementCreate(BaseModel):
    badge_name: str
    points_earned: Optional[int] = 0

class Achievement(BaseModel):
    id: int
    user_id: int
    badge_name: str
    points_earned: int
    unlocked_at: datetime
    
    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    title: str
    report_type: str  # performance, compliance, roi
    data: dict

class Report(BaseModel):
    id: int
    user_id: int
    title: str
    report_type: str
    data: dict
    created_at: datetime
    
    class Config:
        from_attributes = True

class IntegrationCreate(BaseModel):
    integration_type: str
    config: dict

class Integration(BaseModel):
    id: int
    user_id: int
    integration_type: str
    config: dict
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

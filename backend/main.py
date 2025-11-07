from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, init_db, Base
from models import User, Task, Payment, FraudLog, ChatMessage, Achievement, AIInsight, Report, AuditLog, Integration, CryptoWallet, NFTBadge
from routes.auth import router as auth_router
from routes.tasks import router as tasks_router
from routes.payments import router as payments_router
from routes.ai_intelligence import router as ai_router
from routes.analytics import router as analytics_router
from routes.gamification import router as gamification_router
from routes.security import router as security_router
from routes.integrations import router as integrations_router
from routes.web3 import router as web3_router
from routes.fraud import router as fraud_router
from contextlib import asynccontextmanager

# Initialize database
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown

app = FastAPI(title="WorkPayAI", version="2.0.0", description="Comprehensive fintech platform with AI intelligence")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(payments_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(gamification_router, prefix="/api")
app.include_router(security_router, prefix="/api")
app.include_router(integrations_router, prefix="/api")
app.include_router(web3_router, prefix="/api")
app.include_router(fraud_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "WorkPayAI", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

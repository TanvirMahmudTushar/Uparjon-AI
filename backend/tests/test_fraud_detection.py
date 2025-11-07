import pytest
import json
from main import app, init_db, get_db
from fastapi.testclient import TestClient

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    """Setup test database"""
    init_db()
    yield
    # Cleanup would go here

def test_fraud_detection_low_risk():
    """Test fraud detection with low-risk transactions"""
    # Create a test user
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (name, email, wallet_id) VALUES (?, ?, ?)",
        ("Test User", "test@example.com", "TEST_WALLET")
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Run fraud detection
    response = client.post("/fraud-detect", json={"user_id": user_id})
    assert response.status_code == 200
    data = response.json()
    assert "fraud_analysis" in data
    assert "fraud_risk" in data["fraud_analysis"]
    assert 0 <= data["fraud_analysis"]["fraud_risk"] <= 1

def test_task_verification():
    """Test task verification with AI"""
    # Create user
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (name, email, wallet_id) VALUES (?, ?, ?)",
        ("Test User", "test2@example.com", "TEST_WALLET_2")
    )
    user_id = cursor.lastrowid
    conn.commit()
    
    # Submit task
    cursor.execute(
        "INSERT INTO tasks (user_id, description) VALUES (?, ?)",
        (user_id, "Completed data entry task")
    )
    task_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Verify task
    response = client.post("/verify", json={"task_id": task_id})
    assert response.status_code == 200
    data = response.json()
    assert "verification_result" in data
    assert "authenticity_score" in data["verification_result"]

def test_payment_processing():
    """Test payment processing"""
    # Create user and task
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (name, email, wallet_id) VALUES (?, ?, ?)",
        ("Test User", "test3@example.com", "TEST_WALLET_3")
    )
    user_id = cursor.lastrowid
    
    cursor.execute(
        "INSERT INTO tasks (user_id, description, verification_status) VALUES (?, ?, ?)",
        (user_id, "Test task", "verified")
    )
    task_id = cursor.lastrowid
    
    cursor.execute(
        "INSERT INTO payments (user_id, task_id, amount) VALUES (?, ?, ?)",
        (user_id, task_id, 50.0)
    )
    conn.commit()
    conn.close()
    
    # Process payment
    response = client.post("/payment", json={"task_id": task_id})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["amount"] == 50.0

def test_credit_score_calculation():
    """Test credit score retrieval"""
    # Create user
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (name, email, wallet_id, credit_score) VALUES (?, ?, ?, ?)",
        ("Test User", "test4@example.com", "TEST_WALLET_4", 650)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Get credit score
    response = client.get(f"/credit-score/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["credit_score"] == 650
    assert "stats" in data

def test_task_submission():
    """Test task submission endpoint"""
    # Create user
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (name, email, wallet_id) VALUES (?, ?, ?)",
        ("Test User", "test5@example.com", "TEST_WALLET_5")
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Submit task
    response = client.post(
        "/tasks/submit",
        json={"user_id": user_id, "description": "Test task", "amount": 50.0}
    )
    assert response.status_code == 200
    data = response.json()
    assert "task_id" in data
    assert data["status"] == "submitted"

def test_user_retrieval():
    """Test user profile retrieval"""
    # Create user
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (name, email, wallet_id) VALUES (?, ?, ?)",
        ("Test User", "test6@example.com", "TEST_WALLET_6")
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Get user
    response = client.get(f"/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test User"
    assert data["email"] == "test6@example.com"

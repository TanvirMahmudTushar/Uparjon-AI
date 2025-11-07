# WorkPayAI API Documentation

## Base URL
\`\`\`
http://localhost:8000/api
\`\`\`

## Authentication Routes

### Register
\`\`\`
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "wallet_id": "WALLET_001"
}
\`\`\`

### Login
\`\`\`
POST /auth/login?email=john@example.com&password=password123
\`\`\`

### Get Current User
\`\`\`
GET /auth/me?token=ACCESS_TOKEN
\`\`\`

## Task Routes

### Submit Task
\`\`\`
POST /tasks/submit?user_id=1&description=...&amount=50
\`\`\`

### Get User Tasks
\`\`\`
GET /tasks/1
\`\`\`

### Verify Task
\`\`\`
POST /tasks/verify/1
\`\`\`

## Payment Routes

### Process Payment
\`\`\`
POST /payments/process
{
  "task_id": 1,
  "method": "bKash"
}
\`\`\`

### Get User Payments
\`\`\`
GET /payments/1
\`\`\`

### Get Credit Score
\`\`\`
GET /payments/credit-score/1
\`\`\`

## AI Intelligence Routes

### Predict Completion
\`\`\`
POST /ai/predict/1
\`\`\`

### Detect Anomalies
\`\`\`
POST /ai/anomalies/1
\`\`\`

### Analyze Sentiment
\`\`\`
POST /ai/sentiment/1
\`\`\`

### Send Chat Message
\`\`\`
POST /ai/chat/send?user_id=1&content=...&analysis_mode=general
\`\`\`

## Analytics Routes

### Generate Report
\`\`\`
POST /analytics/report/generate?user_id=1&report_type=performance
\`\`\`

### Export Report
\`\`\`
POST /analytics/report/export/1
\`\`\`

### Calculate ROI
\`\`\`
POST /analytics/roi-calculator?user_id=1&initial_investment=1000
\`\`\`

### Get Metrics
\`\`\`
GET /analytics/metrics/1
\`\`\`

## Gamification Routes

### Get Leaderboard
\`\`\`
GET /gamification/leaderboard?limit=50
\`\`\`

### Get Achievements
\`\`\`
GET /gamification/achievements/1
\`\`\`

### Check Achievements
\`\`\`
POST /gamification/check-achievements/1
\`\`\`

## Security Routes

### Log Audit Event
\`\`\`
POST /security/audit-log?user_id=1&action=login&resource=user
\`\`\`

### Get Audit Logs
\`\`\`
GET /security/audit-logs/1
\`\`\`

### Assign Role
\`\`\`
POST /security/rbac/assign-role?user_id=1&role=manager
\`\`\`

## Integrations Routes

### Connect Integration
\`\`\`
POST /integrations/connect?user_id=1&integration_type=slack
{
  "config": {"webhook": "..."}
}
\`\`\`

### Get Integration Status
\`\`\`
GET /integrations/status/1
\`\`\`

## Web3 Routes

### Connect Wallet
\`\`\`
POST /web3/wallet/connect?user_id=1&wallet_address=0x...&wallet_type=metamask
\`\`\`

### Get Wallet
\`\`\`
GET /web3/wallet/1
\`\`\`

### Mint NFT Badge
\`\`\`
POST /web3/nft/mint?user_id=1&badge_name=Task Master
\`\`\`

## Fraud Detection Routes

### Detect Fraud
\`\`\`
POST /fraud/detect/1
\`\`\`

### Get Fraud Logs
\`\`\`
GET /fraud/logs/1

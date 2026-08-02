# REPUTATION SYSTEM - PRODUCTION SETUP

## Architecture

```
API Request
  ↓
Express Middleware (auth, rate limit)
  ↓
PostgreSQL (users, violations, history)
  ↓
Redis (cache, rate limits, sessions)
  ↓
BullMQ Event Queue
  ├→ Spam Worker
  ├→ Fraud Worker
  ├→ Reputation Worker
  └→ Appeal Worker
```

## Setup

### 1. Prerequisites

```bash
# PostgreSQL 13+
# Redis 6+
# Node 18+
```

### 2. Environment Variables

```bash
# Copy to .env
cp .env.production .env

# Set your values:
DATABASE_URL=postgresql://user:password@localhost:5432/lokalnie
REDIS_URL=redis://localhost:6379
ADMIN_TOKEN=your-very-secret-token
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Initialize Database

```bash
node server.js
# Tables will auto-create on first run
```

### 5. Start Server

```bash
npm run server
```

---

## REPUTATION LEVELS (6 levels)

### BANNED (Level 0)
- Permanently blocked
- No messaging, no listings
- Cannot appeal after 30 days

### RESTRICTED (Level 1) 
- 5s cooldown between messages
- No links allowed
- Max 2 listings/day
- Requires moderation

### MONITORED (Level 2)
- 3s cooldown
- Max 3 links/message
- Full access to listings
- Default for new accounts

### NORMAL (Level 3)
- 1s cooldown
- Full link access
- Default after 40+ trust score

### VERIFIED (Level 4)
- 500ms cooldown
- Email verified
- 70+ trust score

### TRUSTED (Level 5)
- No cooldown
- Full access
- 85+ trust score

---

## TRUST SCORE CALCULATION

### Positive Factors
- Account age: +0.5/day (max 20 points)
- Email verified: +15 points
- Phone verified: +10 points
- Time without violations: +3/week (max 20)

### Negative Factors
- Recent violations: -5 points each
- **With decay**:
  - < 30 days old: 100% penalty
  - 30-60 days: 70% penalty
  - 60-90 days: 40% penalty
  - > 90 days: 10% penalty

Example:
```
User had 10 violations 45 days ago
Penalty: 10 × -5 × 0.4 = -20 points
Result: Can recover gradually
```

---

## SPAM DETECTION (3 layers)

### Layer 1: Regex
- Bad words (viagra, casino, etc.)
- Suspicious URLs
- Repeating characters

### Layer 2: Behavior
- Message flood (>30/min)
- Link flood
- New account + many actions

### Layer 3: AI (Mock/OpenAI ready)
- Obfuscated spam (k u p, v1agra)
- Context analysis
- Intent detection

---

## MULTI-ACCOUNT DETECTION

Tracked via:
1. **Device Fingerprint** (SHA256 of user-agent + IP + headers)
2. **IP Address** (last 24h connections)
3. **Payment Method** (when available)

Risk scores added (+20 for detected multi-account).

---

## EVENT QUEUE WORKERS

### Spam Worker
- Detects spam violations
- Queues reputation update
- Logs to DB

### Fraud Worker
- Detects listing floods
- Detects payment anomalies
- Queues reputation update

### Reputation Worker
- Recalculates trust score
- Updates reputation level
- Checks auto-ban thresholds

### Appeal Worker
- Resolves appeals
- Resets violations if approved
- Updates reputation

---

## API ENDPOINTS

### Public

#### POST /api/messages/check
```json
{
  "userId": "uuid",
  "text": "message content"
}
```
Response:
```json
{
  "allowed": true,
  "reputation": "NORMAL",
  "trustScore": 45,
  "violations": ["suspicious_url"]
}
```

#### GET /api/user/:userId
Response includes trust score, reputation, restrictions, violations.

#### POST /api/appeal
```json
{
  "userId": "uuid",
  "reason": "I believe this is unfair because..."
}
```

### Admin (Require X-Admin-Token header)

#### POST /api/admin/resolve-appeal/:appealId
```json
{
  "approved": true,
  "resolution": "Violation was incorrectly flagged"
}
```

#### GET /api/admin/stats
Overall reputation distribution, queue status, violations.

---

## TESTING

### New Account Flow
1. POST /api/messages/check (trust: 0, reputation: MONITORED)
2. Spam detected → add violation
3. Queue processes → trust score drops
4. GET /api/user/:userId → check reputation

### Appeal Flow
1. User restricted (violations > 15)
2. POST /api/appeal with reason
3. Admin reviews
4. POST /api/admin/resolve-appeal → APPROVED
5. Recent violations cleared
6. Reputation recalculated

### Multi-Account Detection
1. New account from same IP/fingerprint
2. Risk score +20
3. Flagged in violations log

---

## MONITORING

### Queue Status
```bash
redis-cli
> LLEN bull:spam-detection:wait
> LLEN bull:reputation-update:wait
```

### DB Queries
```sql
-- Users by reputation
SELECT reputation, COUNT(*) FROM users GROUP BY reputation;

-- Recent violations
SELECT * FROM violations ORDER BY created_at DESC LIMIT 20;

-- Decay effect
SELECT u.id, u.trust_score, COUNT(v.id) FROM users u
LEFT JOIN violations v ON u.id = v.user_id
WHERE v.created_at > NOW() - INTERVAL '90 days'
GROUP BY u.id ORDER BY u.trust_score DESC;
```

---

## PERFORMANCE NOTES

- PostgreSQL: Indexed on user_id, created_at
- Redis: TTL on rate limit keys (60s)
- BullMQ: Workers process 10 jobs/second
- Violation decay: Calculated once per reputation update
- Fingerprinting: SHA256 hash (fast)

---

## Future Enhancements

1. **ML Model** instead of mock AI
2. **Payment fingerprinting** for fraud detection
3. **Feedback loop** for appeal decisions
4. **Reputation marketplace** (sell/buy accounts)
5. **Webhook** for third-party integrations

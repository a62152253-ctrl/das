# NSFW/ADULT CONTENT BLOCKER

## ZERO TOLERANCE POLICY

**Any adult content detection = PERMANENT BAN**

```
User sends porn link / keyword
  ↓
NSFW Queue triggers
  ↓
Detection layer 1-3 (keywords, links, AI)
  ↓
NSFW violation recorded
  ↓
Reputation = BANNED (forever)
  ↓
porn_blocked = TRUE
```

---

## DETECTION LAYERS

### Layer 1: Porn Domain Blacklist (45+ domains)

Hardcoded block for:
- `pornhub`, `xvideos`, `xnxx`, `redtube`, `youporn`, `spankbang`
- `onlyfans`, `chaturbate`, `cam4`, `stripchat`, `camsoda`
- `myfreecams`, `livejas`, `cam.com`, `webcamrips`

**Detection:** Instant URL scan, CRITICAL severity

### Layer 2: Porn Keywords (50+ variants)

Blocked words:
- Direct: `porn`, `xxx`, `sex`, `nude`, `horny`, `masturbat`
- Explicit: `blowjob`, `cumshot`, `creampie`, `gangbang`
- Implicit: `escort`, `prostitut`, `cam girl`, `sugar daddy`

**Variations blocked:**
- Spacing: `s e x`, `p o r n`
- Numbers: `p0rn`, `s3x`, `n1de`
- Leetspeak: `p0rn`, `s3x`, `x33`

**Detection:** 0.5s, CRITICAL severity

### Layer 3: Suspicious Patterns

Blocks:
- URL shorteners (bitly, tinyurl) → hide real destination
- Tor sites (`.onion`)
- NSFW communities (Discord NSFW servers, Patreon adult)
- Media files (`.mp4`, `.avi`, `.jpg` on suspicious domains)

**Detection:** Pattern matching, HIGH severity

### Layer 4: AI/Context Detection (Mock)

Detects:
- Obfuscated spam: `k u p` (buy), `v1agra`
- Payment + adult keywords: `$50 for nudes`
- Solicitation patterns: `meet me`, `hook up` + porn keywords
- Short text + link (typical porn spam)

**Detection:** Semantic analysis, CRITICAL severity

### Layer 5: Image Upload (Mock)

In production uses:
- Google Vision API (safeSearchAnnotation.adult)
- AWS Rekognition
- Clarifai NSFW model

Checks:
- File name patterns
- Buffer analysis (in production)
- Metadata

---

## DATABASE SCHEMA

```sql
-- New table for NSFW violations
CREATE TABLE nsfw_violations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  violation_type VARCHAR(100), -- porn_keywords, porn_link, ai_nsfw_detected, nsfw_image
  content_preview VARCHAR(255), -- First 100 chars
  detected_keywords TEXT, -- What was detected
  detected_links TEXT,
  severity VARCHAR(20), -- CRITICAL, HIGH, MEDIUM
  created_at TIMESTAMP
);

-- Updated users table
ALTER TABLE users ADD COLUMN nsfw_violations INT DEFAULT 0;
ALTER TABLE users ADD COLUMN porn_blocked BOOLEAN DEFAULT FALSE;
```

---

## BLOCKING MECHANICS

### Immediate (On Detection)

```
POST /api/messages/check
  → Keyword check: BLOCKED
  → Response: NSFW_CONTENT_DETECTED
  → Queue: nsfwQueue.add()
```

### Queue Processing

```
nsfwQueue worker
  → Record nsfw_violation
  → Add high-point spam violation (100 points)
  → Queue reputation update
  → reputationQueue: AUTOMATIC BAN
```

### Final State

```
users.porn_blocked = TRUE
users.reputation = 'BANNED'
users.trust_score = 0

User cannot:
- Send messages
- Post listings
- Appeal (optional: disable appeals for NSFW)
```

---

## API ENDPOINTS

### Public

#### POST /api/messages/check
```json
{
  "userId": "uuid",
  "text": "watch porn at example.com"
}
```

Response if NSFW detected:
```json
{
  "allowed": false,
  "reason": "NSFW_CONTENT_DETECTED",
  "message": "Adult content is not allowed. Your account will be reviewed and permanently banned.",
  "violation": {
    "detected": true,
    "keyword": "porn",
    "severity": "CRITICAL"
  },
  "severity": "CRITICAL"
}
```

### Admin Only (X-Admin-Token header)

#### POST /api/admin/check-nsfw
Check any content for NSFW:
```json
{
  "text": "some content",
  "userId": "uuid"
}
```

Response:
```json
{
  "keywordDetection": { detected: true, keyword: "..." },
  "linkDetection": { detected: false },
  "aiAnalysis": { nsfwRisk: "LOW", factors: [] },
  "overallRisk": "CRITICAL"
}
```

#### GET /api/admin/nsfw-violations
List all NSFW violations:
```json
{
  "total": 42,
  "violations": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "email": "user@example.com",
      "violation_type": "porn_keywords",
      "detected_keywords": "porn",
      "severity": "CRITICAL",
      "created_at": "2024-08-01T..."
    }
  ]
}
```

---

## CONFIGURATION

### Edit Blacklist (server.js)

```javascript
const PORN_DOMAINS = [
  'pornhub', 'xvideos', // Add your own
];

const PORN_KEYWORDS = [
  'porn', 'xxx', // Add variations
];
```

### Severity Levels

- `CRITICAL`: Instant ban
- `HIGH`: 20+ violation points
- `MEDIUM`: 5+ violation points

---

## TESTING

### Test 1: Porn keyword

```bash
curl -X POST http://localhost:5000/api/messages/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "text": "check this porn site"
  }'
```

Expected: `allowed: false, reason: NSFW_CONTENT_DETECTED`

### Test 2: Porn link

```bash
curl -X POST http://localhost:5000/api/messages/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "text": "visit https://pornhub.com"
  }'
```

Expected: `allowed: false, reason: NSFW_CONTENT_DETECTED`

### Test 3: Obfuscated

```bash
curl -X POST http://localhost:5000/api/messages/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "text": "p o r n site here"
  }'
```

Expected: `allowed: false` (variation detected)

### Test 4: Normal message

```bash
curl -X POST http://localhost:5000/api/messages/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "text": "selling used laptop, good condition"
  }'
```

Expected: `allowed: true`

---

## INTEGRATION WITH REPUTATION SYSTEM

```
NSFW detected
  ↓
violations table: +100 points
nsfw_violations table: record for admin review
  ↓
reputationQueue processes
  ↓
Check: nsfw_violations.count > 0 ?
  ↓
YES → reputation = BANNED
     → porn_blocked = TRUE
     → trust_score = 0
     → No appeals allowed
  ↓
NO → Normal reputation update
```

---

## MONITORING

### Admin Dashboard Query

```sql
-- Recent NSFW violations
SELECT u.email, u.reputation, nv.violation_type, nv.created_at
FROM nsfw_violations nv
JOIN users u ON nv.user_id = u.id
WHERE nv.created_at > NOW() - INTERVAL '24 hours'
ORDER BY nv.created_at DESC;

-- Porn-blocked users count
SELECT COUNT(*) FROM users WHERE porn_blocked = TRUE;

-- Most common NSFW violations
SELECT violation_type, COUNT(*) as count
FROM nsfw_violations
GROUP BY violation_type
ORDER BY count DESC;
```

---

## FUTURE ENHANCEMENTS

1. **ML Model** instead of mock AI
   - Train on flagged content
   - Context-aware detection

2. **Image Fingerprinting**
   - Hash NSFW images (block duplicates)
   - Compare against known adult content DB

3. **Payment Method Verification**
   - Block payment methods used for adult services

4. **Appeal Review** (Disabled for NSFW)
   - Manual review only
   - Stricter admins reviewing NSFW appeals

5. **API Integration**
   - Google Vision API for images
   - OpenAI for context analysis

# LISTINGS MODERATION SYSTEM

## OVERVIEW

Automatic detection of suspicious business listings (sex, escort, etc.) with GUS verification.

**Flow:**
```
Company posts listing
  ↓
AI detects suspicious keywords/patterns
  ↓
If suspicious: Auto-queue for review
  ↓
GUS verification check (company exists?)
  ↓
Admin reviews comparison
  ↓
Approve / Reject / Ban
```

---

## SUSPICIOUS DETECTION LAYERS

### Layer 1: HIGH Priority Keywords (Auto-Flag)
```
sex, porn, xxx, adult, escort, prostitut, call girl, cam girl,
webcam, masaż erotyczny, modelka, towarzyskie, intymne
```

When detected: **Confidence +30%**

### Layer 2: MEDIUM Keywords
```
massage, dating, lonely, meet, handsome, beautiful, young,
available, incall, outcall, hotel, visit, massage parlor, spa
```

When detected: **Confidence +15%**

### Layer 3: HIGH Patterns (Price Indicators)
```
$50/hour, €200/hr, contact: +1234567890
WhatsApp: +48...
Telegram: @handle
incall/outcall mentions
```

When detected: **Confidence +25%**

### Layer 4: MEDIUM Patterns
```
discreet, professional, independent, private
```

When detected: **Confidence +10%**

---

## SUSPICION LEVELS

| Level | Confidence | Action |
|-------|-----------|--------|
| NORMAL | < 15% | Auto-approve |
| MEDIUM | 15-30% | Manual review |
| HIGH | 30-50% | Queue for review + notify admin |
| CRITICAL | > 50% | Immediate queue + high priority |

---

## GUS VERIFICATION

### What is GUS?
Polish Central Register of Businesses (Główny Urząd Statystyczny)
- Official company database
- Public API access
- Verify: NIP, REGON, company name, status

### Integration

**Mock Implementation (ready for real API):**
```typescript
await verifyCompanyWithGUS(nip, regon, companyName)
→ Returns:
  {
    verified: boolean,
    data: {
      name: string,
      status: 'ACTIVE' | 'INACTIVE' | 'LIQUIDATION',
      businessType: string,
      registrationDate: string
    },
    message: string
  }
```

**To activate real GUS API:**
1. Register at https://wyszukiwarkaregon.stat.gov.pl
2. Get API credentials
3. Replace mock with actual axios call

---

## DATA COMPARISON

After GUS verification, system compares:

| Field | Weight | Check |
|-------|--------|-------|
| Company Name | 30% | Exact/partial match |
| NIP | 25% | Exact match |
| Status | 25% | Must be ACTIVE |
| Category | 20% | Business type matches listing category |

**Verdict:**
- **VERIFIED** (70%+): Legitimate company
- **PARTIAL** (50-70%): Some mismatches but generally valid
- **UNVERIFIED** (<50%): High risk, reject or ban

---

## API ENDPOINTS

### Check Listing

**POST** `/admin/api/listing/check`
```json
{
  "title": "Premium massage",
  "description": "Call me +1234567890",
  "category": "massage",
  "companyName": "Spa Ltd",
  "nip": "1234567890",
  "regon": "12345678901234",
  "city": "warsaw"
}
```

Response:
```json
{
  "suspicion": {
    "suspicionLevel": "HIGH",
    "confidence": 65,
    "suspiciousFactors": ["keyword: massage", "pattern: phone_number"],
    "needsReview": true
  },
  "gusVerification": {
    "verified": true,
    "data": { "name": "Spa Ltd", "status": "ACTIVE", ... }
  },
  "comparison": {
    "matchScore": 85,
    "verdict": "VERIFIED",
    "matches": ["company_name", "company_active"],
    "mismatches": []
  },
  "recommendedAction": "APPROVE",
  "riskScore": 65
}
```

### Queue for Review

**POST** `/admin/api/listing/:listingId/queue-for-review`
```json
{
  "reason": "Contains suspicious keywords",
  "suspicionLevel": "HIGH",
  "riskScore": 65
}
```

### Moderation Queue

**GET** `/admin/api/listings/moderation-queue?priority=1`

Returns pending listings sorted by priority

### Actions

**POST** `/admin/api/listing/:listingId/approve`
```json
{ "reason": "Manual review passed" }
```

**POST** `/admin/api/listing/:listingId/reject`
```json
{ "reason": "Suspicious content detected" }
```

**POST** `/admin/api/company/:companyId/ban-listings`
```json
{ "reason": "Multiple policy violations" }
```

---

## ADMIN DASHBOARD

### Listings Moderation Panel

**Tabs:**
1. **All Pending** — All listings to review
2. **Critical** — Highest priority (CRITICAL suspicion)
3. **Suspicious** — Medium/High suspicion

**Details View (3 columns):**

Left:
- Listing list with priority badges
- Click to select

Center:
- Listing info: title, company, category, description
- Content analysis: keywords, patterns, confidence
- Recommended action

Right:
- GUS verification status
- Data comparison (match %)
- Mismatches highlighted
- Action buttons: Approve, Reject, Ban Company

**Workflow:**
1. Admin sees critical listings automatically flagged
2. Reviews content analysis + GUS check
3. Compares data
4. Clicks: Approve (real company) or Reject/Ban (suspicious)

---

## COMMON SCENARIOS

### Scenario 1: Real Company
```
Title: "Professional IT Services"
Description: "Web development, hosting, support"
NIP: 1234567890 (VERIFIED in GUS)
Status: ACTIVE
Business Type: IT Services

Suspicion: NORMAL (0%)
GUS: VERIFIED (100%)
Recommendation: APPROVE ✓
```

### Scenario 2: Adult Services (Disguised)
```
Title: "Premium Massage & Spa"
Description: "Call for rates +1234567890, very discreet, incall available"
NIP: 9999999999 (NOT in GUS)
Business Type: Spa

Suspicion: HIGH (65%)
Keywords: massage, discreet, incall, phone
Patterns: price/phone/contact
GUS: NOT FOUND
Recommendation: REJECT + REVIEW ⚠️
```

### Scenario 3: Real Company, Borderline Category
```
Title: "Dating Matchmaker Services"
Description: "Professional dating consultants"
NIP: 5555555555 (VERIFIED)
Status: ACTIVE
Business Type: Consulting

Suspicion: MEDIUM (25%)
Keywords: dating (medium keyword)
GUS: VERIFIED (95%)
Recommendation: APPROVE (GUS confirms legitimacy) ✓
```

---

## IMPLEMENTATION NOTES

### False Positive Protection
- If GUS verification PASSES: Lower suspicion score by 20%
- Real companies won't be rejected just for category name
- Example: "Dating" = medium keyword, but GUS ACTIVE = APPROVE

### Whitelist Handling
- Legitimate categories that might trigger: massage, dating, spa
- Protected by GUS verification
- Only ban if BOTH suspicious content + no GUS verification

### Bulk Moderation
- Critical items (>70% suspicion) auto-queue
- Manual review for 30-70% range
- Daily admin digest of pending reviews

---

## TESTING

### Test Case 1: Obviously Spam
```bash
curl -X POST http://localhost:5000/admin/api/listing/check \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sexy girls escort service",
    "description": "Call +1234567890 now",
    "category": "other",
    "companyName": "Unknown",
    "nip": ""
  }'
```

Expected: `suspicionLevel: CRITICAL, recommendedAction: REJECT`

### Test Case 2: Real Company
```bash
curl -X POST http://localhost:5000/admin/api/listing/check \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Design Agency",
    "description": "Professional web development services",
    "category": "IT",
    "companyName": "TechCorp Sp. z o.o.",
    "nip": "1234567890"
  }'
```

Expected: `suspicionLevel: NORMAL, recommendedAction: APPROVE`

---

## FUTURE ENHANCEMENTS

1. **Real GUS API Integration**
   - Actual GUS REST API calls
   - Cache results (GUS doesn't change often)

2. **Image Analysis**
   - Scan listing images for NSFW
   - OCR for phone numbers in images

3. **Behavior Scoring**
   - Company reposting rejected listings
   - Multiple email accounts from same IP
   - Payment method patterns

4. **ML Classification**
   - Train model on approved/rejected listings
   - Semantic analysis instead of keywords
   - Language model scoring

5. **Notification System**
   - Email admins on critical flags
   - Auto-alert if >5 rejections from same company

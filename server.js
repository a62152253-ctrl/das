import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import Redis from 'ioredis';
import Queue from 'bull';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:[REDACTED]@localhost/lokalnie',
  max: 20,
});

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
redis.on('error', err => {
  console.error('Redis error:', err);
});
const listingModerationQueue = new Queue('listing-moderation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379)
  }
});

app.use(express.json({ limit: '50kb' }));

// NOTE: Fast login endpoint removed (critical security vulnerability).

// ============================================
// SUSPICIOUS LISTING DETECTION
// ============================================

const SUSPICIOUS_KEYWORDS = {
  HIGH: [
    'sex', 'sekس', 'porn', 'xxx', 'adult', 'escort', 'prostitut',
    'call girl', 'cam girl', 'webcam', 'naughty', 'horny',
    'masaż erotyczny', 'modelka', 'towarzyskie', 'dziewczyna na noc',
    'czarne usługi', 'dorosłe usługi', 'intymne'
  ],
  MEDIUM: [
    'massage', 'dating', 'lonely', 'meet', 'handsome', 'beautiful',
    'young', 'available', 'incall', 'outcall', 'hotel', 'visit',
    'massage parlor', 'spa', 'rubdown'
  ]
};

const SUSPICIOUS_PATTERNS = {
  HIGH: [
    /(\$|€|zł)\d+.*?(hour|h|hr)/i,
    /call.*?(\d{3}[\s-]?\d{3}[\s-]?\d{4}|\+\d+)/i,
    /whatsapp.*?(\+?\d{10,})/i,
    /telegram.*?(@\w+)/i,
    /incall|outcall/i,
    /rates?.*?\d+/i,
  ],
  MEDIUM: [
    /discreet/i,
    /professional/i,
    /independent/i,
    /private/i
  ]
};

const CITY_KEYWORDS = {
  'warsaw': ['warsaw', 'warszawa', 'wwa', 'mazovia', 'mazowieckie'],
  'krakow': ['krakow', 'kraków', 'kra', 'lesser poland', 'małopolskie'],
  'wroclaw': ['wroclaw', 'wrocław', 'wro', 'lower silesia', 'dolnośląskie'],
  'poznan': ['poznan', 'poznań', 'poz', 'greater poland', 'wielkopolskie'],
  'gdansk': ['gdansk', 'gdańsk', 'gdl', 'pomerania', 'pomorskie'],
  'szczecin': ['szczecin', 'szcze', 'west pomerania', 'zachodniopomorskie'],
  'lodz': ['lodz', 'łódź', 'łod', 'łódź province', 'łódzkie'],
  'walbrzych': ['walbrzych', 'wałbrzych', 'lower silesia'],
  'bydgoszcz': ['bydgoszcz', 'bydy', 'kuyavia-pomerania', 'kujawsko-pomorskie'],
};

function detectSuspiciousListing(listing) {
  const { title = '', description = '', category = '' } = listing;
  const text = `${title} ${description} ${category}`.toLowerCase();

  let suspicionLevel = 'NORMAL';
  let suspiciousFactors = [];
  let confidence = 0;

  // Check HIGH keywords
  for (const keyword of SUSPICIOUS_KEYWORDS.HIGH) {
    if (text.includes(keyword.toLowerCase())) {
      suspiciousFactors.push(`keyword: ${keyword}`);
      confidence += 0.3;
    }
  }

  // Check MEDIUM keywords
  for (const keyword of SUSPICIOUS_KEYWORDS.MEDIUM) {
    if (text.includes(keyword.toLowerCase())) {
      suspiciousFactors.push(`pattern: ${keyword}`);
      confidence += 0.15;
    }
  }

  // Check HIGH patterns
  for (const pattern of SUSPICIOUS_PATTERNS.HIGH) {
    if (pattern.test(text)) {
      suspiciousFactors.push(`high_pattern: ${pattern.source}`);
      confidence += 0.25;
    }
  }

  // Check MEDIUM patterns
  for (const pattern of SUSPICIOUS_PATTERNS.MEDIUM) {
    if (pattern.test(text)) {
      suspiciousFactors.push(`medium_pattern: ${pattern.source}`);
      confidence += 0.1;
    }
  }

  // Determine level
  if (confidence >= 0.5) {
    suspicionLevel = 'CRITICAL';
  } else if (confidence >= 0.3) {
    suspicionLevel = 'HIGH';
  } else if (confidence >= 0.15) {
    suspicionLevel = 'MEDIUM';
  }

  return {
    suspicionLevel,
    suspiciousFactors,
    confidence: Math.round(confidence * 100),
    needsReview: suspicionLevel !== 'NORMAL'
  };
}

// ============================================
// GUS (CENTRAL REGISTER OF BUSINESSES) VERIFICATION
// ============================================

async function verifyCompanyWithGUS(nip, regon, companyName) {
  try {
    // GUS API endpoints (public)
    // Mock implementation - in production use actual GUS API
    // GUS API docs: https://dane.gov.pl/dataset/central-register-of-businesses

    const gusData = {
      nip,
      regon,
      name: companyName,
      verified: false,
      data: null,
      message: 'Verification pending'
    };

    // TODO: Implement real GUS API call
    // Example with axios:
    // const response = await axios.post(
    //   'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UiSearchParameter',
    //   { Nip: nip, Regon: regon },
    //   { headers: { 'Content-Type': 'application/json' } }
    // );

    // For now, mock GUS verification
    if (nip && nip.length === 10) {
      gusData.verified = true;
      gusData.message = 'Company found in GUS register';
      gusData.data = {
        nip,
        regon,
        name: companyName,
        status: 'ACTIVE',
        registrationDate: '2020-01-15',
        businessType: 'LIMITED LIABILITY COMPANY'
      };
    } else {
      gusData.verified = false;
      gusData.message = 'Company NOT found in GUS register or invalid NIP';
    }

    return gusData;
  } catch (err) {
    console.error('[GUS] Verification error:', err.message);
    return {
      nip,
      regon,
      name: companyName,
      verified: false,
      data: null,
      message: `Verification error: ${err.message}`,
      error: true
    };
  }
}

function compareListingWithGUS(listing, gusData) {
  if (!gusData.verified || !gusData.data) {
    return {
      matchScore: 0,
      matches: [],
      mismatches: ['Company not verified in GUS'],
      verdict: 'UNVERIFIED'
    };
  }

  const matches = [];
  const mismatches = [];
  let matchScore = 0;

  // Compare names
  const listingName = listing.companyName?.toLowerCase() || '';
  const gusName = gusData.data.name?.toLowerCase() || '';

  if (listingName && gusName) {
    const nameMatch = listingName === gusName || gusName.includes(listingName) || listingName.includes(gusName);
    if (nameMatch) {
      matches.push('company_name');
      matchScore += 30;
    } else {
      mismatches.push(`Name mismatch: "${listing.companyName}" vs "${gusData.data.name}"`);
    }
  }

  // Compare NIP
  if (listing.nip === gusData.nip) {
    matches.push('nip');
    matchScore += 25;
  } else if (listing.nip) {
    mismatches.push(`NIP mismatch: "${listing.nip}" vs "${gusData.nip}"`);
  }

  // Check GUS status
  if (gusData.data.status === 'ACTIVE') {
    matches.push('company_active');
    matchScore += 25;
  } else {
    mismatches.push(`Company status: ${gusData.data.status}`);
  }

  // Check business type matches category
  if (listing.category && gusData.data.businessType) {
    const categoryMatch = gusData.data.businessType.toLowerCase().includes(
      listing.category.toLowerCase()
    );
    if (categoryMatch) {
      matches.push('category_match');
      matchScore += 20;
    } else {
      mismatches.push(
        `Category mismatch: Listed as "${listing.category}" but registered as "${gusData.data.businessType}"`
      );
    }
  }

  const verdict = matchScore >= 70 ? 'VERIFIED' : matchScore >= 50 ? 'PARTIAL' : 'UNVERIFIED';

  return {
    matchScore,
    matches,
    mismatches,
    verdict
  };
}

// ============================================
// LISTING MODERATION ENDPOINTS
// ============================================

/**
 * POST /admin/api/listing/check
 * Check listing for suspicious content
 */
app.post('/admin/api/listing/check', async (req, res) => {
  try {
    const { title, description, category, companyName, nip, regon, city } = req.body;

    // Step 1: Detect suspicious content
    const suspicion = detectSuspiciousListing({ title, description, category });

    // Step 2: Verify with GUS if NIP provided
    let gusVerification = null;
    let comparison = null;

    if (nip || regon) {
      gusVerification = await verifyCompanyWithGUS(nip, regon, companyName);
      comparison = compareListingWithGUS({ companyName, nip, category }, gusVerification);
    }

    // Step 3: Determine action
    let recommendedAction = 'APPROVE';
    let riskScore = suspicion.confidence;

    if (suspicion.suspicionLevel === 'CRITICAL') {
      recommendedAction = 'REJECT';
      riskScore += 50;
    } else if (suspicion.suspicionLevel === 'HIGH') {
      recommendedAction = 'REVIEW';
      riskScore += 30;
    }

    // If GUS verification fails or mismatches
    if (gusVerification && !gusVerification.verified) {
      recommendedAction = 'REVIEW';
      riskScore += 20;
    } else if (comparison && comparison.verdict === 'UNVERIFIED') {
      recommendedAction = 'REVIEW';
      riskScore += 15;
    } else if (comparison && comparison.verdict === 'PARTIAL') {
      recommendedAction = 'REVIEW';
      riskScore += 10;
    }

    res.json({
      suspicion,
      gusVerification,
      comparison,
      recommendedAction,
      riskScore: Math.min(100, riskScore),
      needsAdminReview: recommendedAction !== 'APPROVE'
    });
  } catch (err) {
    console.error('[LISTING] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/api/listing/:listingId/queue-for-review
 * Add listing to moderation queue
 */
app.post('/admin/api/listing/:listingId/queue-for-review', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { reason, suspicionLevel, riskScore } = req.body;

    await pgPool.query(
      `INSERT INTO listing_moderation_queue (listing_id, reason, status, priority, created_at)
       VALUES ($1, $2, 'PENDING', $3, NOW())`,
      [
        listingId,
        reason,
        suspicionLevel === 'CRITICAL' ? 2 : suspicionLevel === 'HIGH' ? 1 : 0
      ]
    );

    res.json({ success: true, queued: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/api/listings/moderation-queue
 * Get pending listings for review
 */
app.get('/admin/api/listings/moderation-queue', async (req, res) => {
  try {
    const { priority, limit = 50, offset = 0 } = req.query;

    let query = `SELECT lmq.*, l.title, l.description, l.category, c.id as company_id, c.name as company_name
                 FROM listing_moderation_queue lmq
                 LEFT JOIN listings l ON lmq.listing_id = l.id
                 LEFT JOIN companies c ON l.company_id = c.id
                 WHERE lmq.status = 'PENDING'`;
    const params = [];

    if (priority !== undefined) {
      query += ` AND lmq.priority >= $${params.length + 1}`;
      params.push(parseInt(priority));
    }

    query += ` ORDER BY lmq.priority DESC, lmq.created_at ASC
              LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const result = await pgPool.query(query, params);

    res.json({
      items: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/api/listing/:listingId/approve
 * Approve listing
 */
app.post('/admin/api/listing/:listingId/approve', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { reason } = req.body;

    await pgPool.query(
      `UPDATE listing_moderation_queue SET status = 'APPROVED', action_taken = $1, resolved_at = NOW()
       WHERE listing_id = $2`,
      [reason, listingId]
    );

    // Mark listing as published/verified
    await pgPool.query(
      'UPDATE listings SET moderation_status = \'APPROVED\', moderation_reviewed_at = NOW() WHERE id = $1',
      [listingId]
    );

    res.json({ success: true, action: 'APPROVED' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/api/listing/:listingId/reject
 * Reject listing
 */
app.post('/admin/api/listing/:listingId/reject', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { reason } = req.body;

    await pgPool.query(
      `UPDATE listing_moderation_queue SET status = 'REJECTED', action_taken = $1, resolved_at = NOW()
       WHERE listing_id = $2`,
      [reason, listingId]
    );

    // Mark listing as rejected
    await pgPool.query(
      'UPDATE listings SET moderation_status = \'REJECTED\', moderation_reviewed_at = NOW() WHERE id = $1',
      [listingId]
    );

    res.json({ success: true, action: 'REJECTED' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/api/company/:companyId/ban-listing
 * Ban all listings from company
 */
app.post('/admin/api/company/:companyId/ban-listings', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { reason } = req.body;

    // Ban all listings
    await pgPool.query(
      'UPDATE listings SET moderation_status = \'BANNED\' WHERE company_id = $1',
      [companyId]
    );

    // Ban company
    await pgPool.query(
      'UPDATE companies SET banned = TRUE, ban_reason = $1 WHERE id = $2',
      [reason, companyId]
    );

    // Log action
    await pgPool.query(
      `INSERT INTO admin_audit_log (admin_token, action, target_company_id, details, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      ['system', 'BAN_COMPANY_LISTINGS', companyId, JSON.stringify({ reason })]
    );

    res.json({ success: true, action: 'BANNED' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/api/company/:companyId/gus-check
 * Get GUS verification for company
 */
app.get('/admin/api/company/:companyId/gus-check', async (req, res) => {
  try {
    const { companyId } = req.params;

    const companyResult = await pgPool.query(
      'SELECT * FROM companies WHERE id = $1',
      [companyId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companyResult.rows[0];

    // Check GUS
    const gusData = await verifyCompanyWithGUS(company.nip, company.regon, company.name);

    res.json({
      company: {
        id: company.id,
        name: company.name,
        nip: company.nip,
        regon: company.regon,
        category: company.category
      },
      gusVerification: gusData,
      comparison: compareListingWithGUS(company, gusData)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/api/listings/suspicious
 * Get all suspicious listings
 */
app.get('/admin/api/listings/suspicious', async (req, res) => {
  try {
    const { suspicionLevel, limit = 50, offset = 0 } = req.query;

    let query = `SELECT l.*, lmq.reason, lmq.priority
                 FROM listings l
                 LEFT JOIN listing_moderation_queue lmq ON l.id = lmq.listing_id
                 WHERE l.moderation_status = 'PENDING'`;
    const params = [];

    if (suspicionLevel) {
      query += ` AND lmq.priority >= $${params.length + 1}`;
      params.push(suspicionLevel === 'CRITICAL' ? 2 : 1);
    }

    query += ` ORDER BY lmq.priority DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const result = await pgPool.query(query, params);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// DATABASE SETUP
// ============================================

async function initializeDatabase() {
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS listing_moderation_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'PENDING',
        priority INT DEFAULT 0,
        action_taken TEXT,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id UUID PRIMARY KEY,
        company_id UUID,
        title VARCHAR(255),
        description TEXT,
        category VARCHAR(100),
        moderation_status VARCHAR(50) DEFAULT 'PENDING',
        moderation_reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY,
        name VARCHAR(255),
        nip VARCHAR(10),
        regon VARCHAR(14),
        category VARCHAR(100),
        banned BOOLEAN DEFAULT FALSE,
        ban_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('[DB] Listing moderation tables ready');
  } catch (err) {
    console.error('[DB] Error:', err);
    process.exit(1);
  }
}

// ============================================
// MYSQL 8.0 INTEGRATION (DATABASE: 41958036_fdes)
// ============================================

import { getMysqlPool, initMysqlSchema } from './src/lib/mysqlDb.js';

// Define allowed columns per collection for INSERT operations
const allowedColumns = {
  users: ['id', 'email', 'name', 'role', 'created_at'],
  companies: ['id', 'name', 'nip', 'regon', 'category', 'created_at'],
  ads: ['id', 'company_id', 'title', 'description', 'category', 'created_at'],
  // add other tables as needed
};

initMysqlSchema();

app.get('/api/mysql/:collection', async (req, res) => {
  const { collection } = req.params;
  const pool = getMysqlPool();
  try {
    const validTables = ['users', 'companies', 'ads', 'promotions', 'categories', 'reviews', 'reports', 'audit_logs'];
    if (!validTables.includes(collection)) {
      return res.status(400).json({ error: 'Invalid table' });
    }
    const [rows] = await pool.query(`SELECT * FROM ${collection}`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mysql/:collection/:action', async (req, res) => {
  const { collection, action } = req.params;
  const pool = getMysqlPool();
  try {
    const validTables = ['users', 'companies', 'ads', 'promotions', 'categories', 'reviews', 'reports', 'audit_logs'];
    if (!validTables.includes(collection)) {
      return res.status(400).json({ error: 'Invalid table' });
    }

    if (action === 'insert') {
      const keys = Object.keys(req.body);
      // Validate keys against whitelist
      const invalid = keys.filter(k => !allowedColumns[collection]?.includes(k));
      if (invalid.length) {
        return res.status(400).json({ error: `Invalid columns: ${invalid.join(', ')}` });
      }
      const values = keys.map(k => req.body[k]);
      const placeholders = keys.map(() => '?').join(', ');
      const sql = `INSERT INTO ${collection} (${keys.join(', ')}) VALUES (${placeholders})`;
      await pool.query(sql, values);
      return res.json({ success: true });
    } else if (action === 'delete') {
      const idKey = collection === 'companies' ? 'uid' : 'id';
      const sql = `DELETE FROM ${collection} WHERE ${idKey} = ?`;
      await pool.query(sql, [req.body[idKey] || req.body.id]);
      return res.json({ success: true });
    }
    res.status(400).json({ error: 'Unsupported action' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Static
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
    console.log(`[Listings] Moderation system active`);
    console.log(`[MySQL 8.0] Database 41958036_fdes active`);
    console.log(`[GUS] Verification ready`);
  });
});


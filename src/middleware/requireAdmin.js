// src/middleware/requireAdmin.js
import jwt from 'jsonwebtoken';
import pg from 'pg';

// Assuming pgPool is exported from a central db module
import { pgPool } from '../../src/lib/db.js'; // adjust path if needed

export default async function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    await pgPool.query(
      `INSERT INTO admin_audit_log (admin_token, action, target_company_id, details, created_at) VALUES ($1, $2, $3, $4, NOW())`,
      ['unknown', 'ADMIN_AUTH_FAILED', null, JSON.stringify({ reason: 'Missing Authorization header' })]
    ).catch(() => {});
    return res.status(403).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      await pgPool.query(
        `INSERT INTO admin_audit_log (admin_token, action, target_company_id, details, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [payload.sub || 'unknown', 'ADMIN_AUTH_FAILED', null, JSON.stringify({ reason: 'Non-admin role', role: payload.role })]
      ).catch(() => {});
      return res.status(403).json({ error: 'Insufficient privileges' });
    }
    req.admin = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    await pgPool.query(
      `INSERT INTO admin_audit_log (admin_token, action, target_company_id, details, created_at) VALUES ($1, $2, $3, $4, NOW())`,
      ['unknown', 'ADMIN_AUTH_FAILED', null, JSON.stringify({ reason: err.message })]
    ).catch(() => {});
    return res.status(403).json({ error: 'Invalid token' });
  }
}

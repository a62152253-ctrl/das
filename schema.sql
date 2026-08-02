-- PostgreSQL Schema for Reputation System
-- Run this to initialize database if auto-init doesn't work

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  trust_score INT DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  reputation VARCHAR(50) DEFAULT 'MONITORED',
  total_violations INT DEFAULT 0,
  total_appeals INT DEFAULT 0,
  last_activity TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Violations table
CREATE TABLE IF NOT EXISTS violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50),
  type VARCHAR(100),
  points INT DEFAULT 1,
  severity VARCHAR(20) DEFAULT 'medium',
  reason TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP
);

-- Device fingerprints
CREATE TABLE IF NOT EXISTS device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fingerprint VARCHAR(255) UNIQUE,
  user_agent TEXT,
  ip_address VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  other_users_count INT DEFAULT 0
);

-- Trust score history/log
CREATE TABLE IF NOT EXISTS trust_score_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_score INT,
  new_score INT,
  reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Appeals table
CREATE TABLE IF NOT EXISTS appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolution TEXT
);

-- User behavior tracking
CREATE TABLE IF NOT EXISTS user_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  messages_last_hour INT DEFAULT 0,
  messages_last_day INT DEFAULT 0,
  links_last_hour INT DEFAULT 0,
  listings_last_day INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_reputation ON users(reputation);
CREATE INDEX IF NOT EXISTS idx_users_trust_score ON users(trust_score);

CREATE INDEX IF NOT EXISTS idx_violations_user_id ON violations(user_id);
CREATE INDEX IF NOT EXISTS idx_violations_created_at ON violations(created_at);
CREATE INDEX IF NOT EXISTS idx_violations_category ON violations(category);

CREATE INDEX IF NOT EXISTS idx_device_fingerprints_fingerprint ON device_fingerprints(fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_user_id ON device_fingerprints(user_id);

CREATE INDEX IF NOT EXISTS idx_appeals_user_id ON appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON appeals(status);

CREATE INDEX IF NOT EXISTS idx_trust_score_log_user_id ON trust_score_log(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_score_log_created_at ON trust_score_log(created_at);

CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON user_behavior(user_id);

-- View: Recent violations with user info
CREATE OR REPLACE VIEW recent_violations AS
SELECT 
  u.id,
  u.email,
  u.reputation,
  u.trust_score,
  COUNT(v.id) as violations_30d,
  MAX(v.created_at) as last_violation
FROM users u
LEFT JOIN violations v ON u.id = v.user_id 
  AND v.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, u.reputation, u.trust_score
ORDER BY violations_30d DESC;

-- View: Multi-account suspects
CREATE OR REPLACE VIEW multi_account_suspects AS
SELECT 
  df.fingerprint,
  COUNT(DISTINCT df.user_id) as account_count,
  STRING_AGG(u.email::text, ', ') as emails,
  MAX(df.last_seen) as last_seen
FROM device_fingerprints df
JOIN users u ON df.user_id = u.id
GROUP BY df.fingerprint
HAVING COUNT(DISTINCT df.user_id) > 1
ORDER BY account_count DESC;

-- ============================================================
-- Enterprise Reputation + Location System PostgreSQL Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255)
        UNIQUE NOT NULL,

    password_hash TEXT,

    name VARCHAR(255),

    role VARCHAR(30)
        DEFAULT 'client'
        CHECK(role IN ('client','firma','admin')),


    status VARCHAR(30)
        DEFAULT 'active'
        CHECK(status IN ('active','blocked','suspended')),


    trust_score INT
        DEFAULT 50
        CHECK(trust_score BETWEEN 0 AND 100),


    reputation VARCHAR(50)
        DEFAULT 'MONITORED',


    total_violations INT
        DEFAULT 0,


    total_appeals INT
        DEFAULT 0,


    email_verified BOOLEAN
        DEFAULT FALSE,


    phone_verified BOOLEAN
        DEFAULT FALSE,


    last_activity TIMESTAMP
        DEFAULT NOW(),



    -- LOCATION CONSENT SYSTEM

    location_consent BOOLEAN
        NOT NULL DEFAULT FALSE,


    last_known_lat DOUBLE PRECISION
        CHECK(
            last_known_lat BETWEEN -90 AND 90
            OR last_known_lat IS NULL
        ),


    last_known_lng DOUBLE PRECISION
        CHECK(
            last_known_lng BETWEEN -180 AND 180
            OR last_known_lng IS NULL
        ),


    location_accuracy DOUBLE PRECISION,


    location_updated_at TIMESTAMP,


    created_at TIMESTAMP
        DEFAULT NOW(),


    updated_at TIMESTAMP
        DEFAULT NOW()

);



-- ============================================================
-- COMPANIES
-- ============================================================

CREATE TABLE IF NOT EXISTS companies (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),


    owner_id UUID
        REFERENCES users(id)
        ON DELETE CASCADE,


    company_name VARCHAR(255)
        NOT NULL,


    nip VARCHAR(30),


    description TEXT,


    address TEXT,


    city VARCHAR(100),


    phone VARCHAR(50),


    email VARCHAR(255),


    website VARCHAR(255),



    visibility_package VARCHAR(30)
        DEFAULT 'free'
        CHECK(
            visibility_package IN
            ('free','silver','gold','platinum')
        ),



    rating_avg DECIMAL(3,2)
        DEFAULT 5.00,


    reviews_count INT
        DEFAULT 0,


    views_count INT
        DEFAULT 0,



    -- LOCATION

    location_consent BOOLEAN
        DEFAULT FALSE,


    last_known_lat DOUBLE PRECISION
        CHECK(
            last_known_lat BETWEEN -90 AND 90
            OR last_known_lat IS NULL
        ),


    last_known_lng DOUBLE PRECISION
        CHECK(
            last_known_lng BETWEEN -180 AND 180
            OR last_known_lng IS NULL
        ),


    location_updated_at TIMESTAMP,


    created_at TIMESTAMP
        DEFAULT NOW(),


    updated_at TIMESTAMP
        DEFAULT NOW()

);



-- ============================================================
-- LOCATION CONSENT HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS location_consent_logs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),


    user_id UUID
        REFERENCES users(id)
        ON DELETE CASCADE,


    company_id UUID
        REFERENCES companies(id)
        ON DELETE CASCADE,


    consent BOOLEAN
        NOT NULL,


    latitude DOUBLE PRECISION,


    longitude DOUBLE PRECISION,


    accuracy DOUBLE PRECISION,


    ip_address VARCHAR(50),


    created_at TIMESTAMP
        DEFAULT NOW()

);



-- ============================================================
-- VIOLATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS violations (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),


    user_id UUID
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,


    category VARCHAR(100),


    type VARCHAR(100),


    severity VARCHAR(30)
        DEFAULT 'medium',


    points INT
        DEFAULT 1,


    reason TEXT,


    resolved BOOLEAN
        DEFAULT FALSE,


    created_at TIMESTAMP
        DEFAULT NOW(),


    resolved_at TIMESTAMP

);



-- ============================================================
-- APPEALS
-- ============================================================

CREATE TABLE IF NOT EXISTS appeals (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),


    user_id UUID
        REFERENCES users(id)
        ON DELETE CASCADE,


    reason TEXT NOT NULL,


    status VARCHAR(30)
        DEFAULT 'PENDING',


    resolution TEXT,


    created_at TIMESTAMP
        DEFAULT NOW(),


    resolved_at TIMESTAMP

);



-- ============================================================
-- DEVICE SECURITY
-- ============================================================

CREATE TABLE IF NOT EXISTS device_fingerprints (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),


    user_id UUID
        REFERENCES users(id)
        ON DELETE CASCADE,


    fingerprint VARCHAR(255)
        UNIQUE,


    user_agent TEXT,


    ip_address VARCHAR(50),


    browser VARCHAR(100),


    os VARCHAR(100),


    last_seen TIMESTAMP
        DEFAULT NOW(),


    created_at TIMESTAMP
        DEFAULT NOW()

);



-- ============================================================
-- TRUST HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS trust_score_history (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),


    user_id UUID
        REFERENCES users(id)
        ON DELETE CASCADE,


    old_score INT,


    new_score INT,


    reason TEXT,


    created_at TIMESTAMP
        DEFAULT NOW()

);



-- ============================================================
-- INDEXES
-- ============================================================


CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);


CREATE INDEX IF NOT EXISTS idx_users_reputation
ON users(reputation);


CREATE INDEX IF NOT EXISTS idx_users_location
ON users(
    location_consent,
    last_known_lat,
    last_known_lng
);



CREATE INDEX IF NOT EXISTS idx_company_location
ON companies(
    location_consent,
    last_known_lat,
    last_known_lng
);



CREATE INDEX IF NOT EXISTS idx_company_city
ON companies(city);



CREATE INDEX IF NOT EXISTS idx_violations_user
ON violations(user_id);



CREATE INDEX IF NOT EXISTS idx_device_fingerprint
ON device_fingerprints(fingerprint);



CREATE INDEX IF NOT EXISTS idx_location_logs_user
ON location_consent_logs(user_id);



-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================


CREATE OR REPLACE FUNCTION update_modified_time()
RETURNS TRIGGER AS $$

BEGIN

NEW.updated_at = NOW();

RETURN NEW;

END;

$$ LANGUAGE plpgsql;



CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_time();



CREATE TRIGGER companies_updated_at_trigger
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_modified_time();



-- ============================================================
-- VIEWS
-- ============================================================


CREATE OR REPLACE VIEW reputation_overview AS

SELECT

u.id,

u.email,

u.reputation,

u.trust_score,

COUNT(v.id) AS violations

FROM users u

LEFT JOIN violations v
ON v.user_id = u.id

GROUP BY
u.id,
u.email,
u.reputation,
u.trust_score;



CREATE OR REPLACE VIEW nearby_enabled_companies AS

SELECT

id,

company_name,

city,

last_known_lat,

last_known_lng,

rating_avg

FROM companies

WHERE location_consent = TRUE;



-- ============================================================
-- FINISHED
-- ============================================================

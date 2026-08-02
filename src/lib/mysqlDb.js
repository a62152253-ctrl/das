import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || '41958036_fdes',
  password: process.env.MYSQL_PASSWORD || 'CFDRwp5R',
  database: process.env.MYSQL_DATABASE || '41958036_fdes',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
};

let pool = null;

export function getMysqlPool() {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);
  }
  return pool;
}

export async function initMysqlSchema() {
  const p = getMysqlPool();
  
  try {
    // 1. Users Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) DEFAULT NULL,
        name VARCHAR(255) DEFAULT NULL,
        role ENUM('client', 'firma', 'admin') DEFAULT 'client',
        status ENUM('active', 'blocked', 'suspended') DEFAULT 'active',
        trust_score INT DEFAULT 100,
        violations_count INT DEFAULT 0,
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        reputation_level VARCHAR(50) DEFAULT 'NORMAL',
        last_login DATETIME DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_users_email (email),
        INDEX idx_users_role (role),
        INDEX idx_users_status (status),
        INDEX idx_users_trust_score (trust_score)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Companies Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS companies (
        uid VARCHAR(128) PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        nip VARCHAR(20) DEFAULT NULL,
        nip_verified_gus BOOLEAN DEFAULT FALSE,
        address TEXT DEFAULT NULL,
        city VARCHAR(100) DEFAULT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        email VARCHAR(255) DEFAULT NULL,
        website VARCHAR(255) DEFAULT NULL,
        visibility_package ENUM('free', 'silver', 'gold', 'platinum') DEFAULT 'free',
        is_promoted BOOLEAN DEFAULT FALSE,
        rating_avg DECIMAL(3,2) DEFAULT 5.00,
        reviews_count INT DEFAULT 0,
        views_count INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_companies_city (city),
        INDEX idx_companies_nip (nip),
        INDEX idx_companies_package (visibility_package),
        INDEX idx_companies_rating (rating_avg)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Ads Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        category VARCHAR(100) DEFAULT 'Ogólne',
        price DECIMAL(10,2) DEFAULT 0.00,
        status ENUM('ACTIVE', 'PENDING', 'EXPIRED', 'SPAM') DEFAULT 'ACTIVE',
        views_count INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ads_category (category),
        INDEX idx_ads_user (user_id),
        INDEX idx_ads_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Promotions Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id VARCHAR(128) PRIMARY KEY,
        company_id VARCHAR(128) NOT NULL,
        title VARCHAR(255) NOT NULL,
        discount_value VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_promotions_company (company_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Categories Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Reviews Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(128) PRIMARY KEY,
        company_id VARCHAR(128) NOT NULL,
        client_id VARCHAR(128) DEFAULT NULL,
        client_name VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        comment TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_reviews_company (company_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Reports Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(128) PRIMARY KEY,
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(128) NOT NULL,
        target_title VARCHAR(255) DEFAULT NULL,
        reason TEXT NOT NULL,
        reporter VARCHAR(255) DEFAULT NULL,
        status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_reports_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Audit Logs Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_email VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        target VARCHAR(255) DEFAULT NULL,
        ip VARCHAR(45) DEFAULT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_timestamp (timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Analytics Views
    await p.query(`
      CREATE OR REPLACE VIEW vw_company_rankings AS
      SELECT 
        c.uid,
        c.company_name,
        c.city,
        c.visibility_package,
        c.rating_avg,
        c.reviews_count,
        c.views_count,
        (c.rating_avg * 20 + c.reviews_count * 2 + IF(c.visibility_package = 'platinum', 50, 0)) AS total_rank_score
      FROM companies c
      ORDER BY total_rank_score DESC;
    `);

    console.log("Successfully initialized upgraded Enterprise MySQL 8.0 schema for database 41958036_fdes");
  } catch (err) {
    console.error("MySQL 8.0 schema upgrade warning:", err.message);
  }
}

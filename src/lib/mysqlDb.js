import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  charset: 'utf8mb4'
};

let pool = null;


export function getMysqlPool() {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);

    pool.on('connection', () => {
      console.log('MySQL connection established');
    });
  }

  return pool;
}


export async function initMysqlSchema() {

  const db = getMysqlPool();

  try {

    // USERS
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) PRIMARY KEY,

        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),

        name VARCHAR(255),

        role ENUM(
          'client',
          'firma',
          'admin'
        ) DEFAULT 'client',

        status ENUM(
          'active',
          'blocked',
          'suspended'
        ) DEFAULT 'active',

        trust_score INT DEFAULT 100,
        violations_count INT DEFAULT 0,

        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,

        reputation_level VARCHAR(50)
        DEFAULT 'NORMAL',

        last_login DATETIME NULL,
        ip_address VARCHAR(45),

        location_consent BOOLEAN
        NOT NULL DEFAULT FALSE,

        last_known_lat DOUBLE NULL,
        last_known_lng DOUBLE NULL,

        location_updated_at TIMESTAMP NULL,

        created_at DATETIME
        DEFAULT CURRENT_TIMESTAMP,


        INDEX idx_users_email(email),
        INDEX idx_users_role(role),
        INDEX idx_users_location(
          location_consent,
          last_known_lat,
          last_known_lng
        )

      )
      ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4;
    `);



    // COMPANIES
    await db.query(`
      CREATE TABLE IF NOT EXISTS companies (

        uid VARCHAR(128) PRIMARY KEY,

        company_name VARCHAR(255)
        NOT NULL,

        nip VARCHAR(20),

        address TEXT,

        city VARCHAR(100),

        phone VARCHAR(50),

        email VARCHAR(255),

        website VARCHAR(255),


        visibility_package ENUM(
          'free',
          'silver',
          'gold',
          'platinum'
        )
        DEFAULT 'free',


        rating_avg DECIMAL(3,2)
        DEFAULT 5.00,

        reviews_count INT DEFAULT 0,

        views_count INT DEFAULT 0,


        location_consent BOOLEAN
        NOT NULL DEFAULT FALSE,

        last_known_lat DOUBLE NULL,
        last_known_lng DOUBLE NULL,

        location_updated_at TIMESTAMP NULL,


        created_at DATETIME
        DEFAULT CURRENT_TIMESTAMP,


        INDEX idx_company_city(city),

        INDEX idx_company_location(
          location_consent,
          last_known_lat,
          last_known_lng
        )

      )
      ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4;
    `);



    /*
      MIGRACJA DLA ISTNIEJĄCYCH BAZ
    */

    await db.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS location_consent BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS last_known_lat DOUBLE NULL,
      ADD COLUMN IF NOT EXISTS last_known_lng DOUBLE NULL,
      ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP NULL
    `);


    await db.query(`
      ALTER TABLE companies
      ADD COLUMN IF NOT EXISTS location_consent BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS last_known_lat DOUBLE NULL,
      ADD COLUMN IF NOT EXISTS last_known_lng DOUBLE NULL,
      ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP NULL
    `);



    /*
      SYSTEM VERSION
    */

    await db.query(`
      CREATE TABLE IF NOT EXISTS system_versions (

        id INT AUTO_INCREMENT PRIMARY KEY,

        version VARCHAR(50)
        NOT NULL,

        installed_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP

      )
    `);



    console.log(
      "✅ MySQL schema initialized successfully"
    );


  } catch (error: any) {

    console.error(
      "❌ MySQL schema error:",
      error.message
    );

    throw error;
  }
}
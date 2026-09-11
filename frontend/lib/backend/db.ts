import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.bdrakgmrqholeqrywfig:7EZYmHlfdyA7IdA1@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

/**
 * Initializes the required PostgreSQL tables if they don't exist yet.
 */
export async function initDbSchema(): Promise<void> {
  const p = getDbPool();
  const sql = `
    CREATE TABLE IF NOT EXISTS user_hairstyle_customizations (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(100),
      gender VARCHAR(20) DEFAULT 'girl',
      face_shape VARCHAR(50) DEFAULT 'Oval',
      hair_type VARCHAR(50) DEFAULT 'Wavy',
      hair_density VARCHAR(50) DEFAULT 'Medium',
      hairstyle_id VARCHAR(50) NOT NULL,
      hairstyle_name VARCHAR(100) NOT NULL,
      hair_color VARCHAR(50) DEFAULT 'Natural',
      hair_top INT DEFAULT 0,
      hair_scale INT DEFAULT 100,
      match_score INT DEFAULT 95,
      original_image TEXT,
      customized_image TEXT NOT NULL,
      processing_time_ms INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_uhc_created_at 
    ON user_hairstyle_customizations(created_at DESC);
  `;

  try {
    await p.query(sql);
    console.log('[Database] user_hairstyle_customizations table initialized successfully in Supabase PostgreSQL.');
  } catch (err: any) {
    console.error('[Database] Error initializing database schema:', err.message);
  }
}

export interface CustomizationRecord {
  id?: number;
  sessionId?: string;
  gender: 'boy' | 'girl';
  faceShape: string;
  hairType: string;
  hairDensity: string;
  hairstyleId: string;
  hairstyleName: string;
  hairColor: string;
  hairTop: number;
  hairScale: number;
  matchScore?: number;
  originalImage?: string;
  customizedImage: string;
  processingTimeMs: number;
  createdAt?: string;
}

/**
 * Inserts a new customization record into PostgreSQL
 */
export async function saveCustomizationRecord(rec: CustomizationRecord): Promise<number> {
  const p = getDbPool();
  // Ensure schema is created
  await initDbSchema();

  const insertSql = `
    INSERT INTO user_hairstyle_customizations (
      session_id, gender, face_shape, hair_type, hair_density,
      hairstyle_id, hairstyle_name, hair_color, hair_top, hair_scale,
      match_score, original_image, customized_image, processing_time_ms
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14
    ) RETURNING id;
  `;

  const values = [
    rec.sessionId || 'session_' + Date.now(),
    rec.gender,
    rec.faceShape,
    rec.hairType,
    rec.hairDensity,
    rec.hairstyleId,
    rec.hairstyleName,
    rec.hairColor,
    rec.hairTop,
    rec.hairScale,
    rec.matchScore || 95,
    rec.originalImage || '',
    rec.customizedImage,
    rec.processingTimeMs,
  ];

  const res = await p.query(insertSql, values);
  return res.rows[0].id;
}

/**
 * Retrieves the most recent customizations from the database
 */
export async function getRecentCustomizations(limit: number = 8): Promise<any[]> {
  const p = getDbPool();
  await initDbSchema();

  const sql = `
    SELECT id, session_id, gender, face_shape, hair_type, hair_density,
           hairstyle_id, hairstyle_name, hair_color, hair_top, hair_scale,
           match_score, customized_image, processing_time_ms, created_at
    FROM user_hairstyle_customizations
    ORDER BY created_at DESC
    LIMIT $1;
  `;

  const res = await p.query(sql, [limit]);
  return res.rows;
}

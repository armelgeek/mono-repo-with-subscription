import { sql } from 'drizzle-orm'
import { db } from '../src/infrastructure/database/db'

async function addBlogFields() {
  try {
    console.log('🔄 Adding new blog fields...')

    const queries = [
      sql`ALTER TABLE blog ADD COLUMN IF NOT EXISTS meta_title varchar(255)`,
      sql`ALTER TABLE blog ADD COLUMN IF NOT EXISTS meta_description text`,
      sql`ALTER TABLE blog ADD COLUMN IF NOT EXISTS meta_keywords varchar(255)[]`,
      sql`ALTER TABLE blog ADD COLUMN IF NOT EXISTS og_image text`,
      sql`ALTER TABLE blog ADD COLUMN IF NOT EXISTS og_description text`,
      sql`ALTER TABLE blog ADD COLUMN IF NOT EXISTS content_type varchar(50) DEFAULT 'rich-text'`,
      sql`ALTER TABLE blog ADD COLUMN IF NOT EXISTS is_draft boolean DEFAULT true`,
      sql`ALTER TABLE blog ADD COLUMN IF NOT EXISTS scheduled_at timestamp`,
      sql`ALTER TABLE blog ADD COLUMN IF NOT EXISTS gallery_images jsonb`,
      sql`ALTER TABLE blog ADD COLUMN IF NOT EXISTS video_url text`,
      sql`ALTER TABLE blog ADD COLUMN IF NOT EXISTS audio_url text`
    ]

    for (const query of queries) {
      await db.execute(query)
    }

    console.log('✅ Blog fields added successfully!')
  } catch (error) {
    console.error('❌ Error adding blog fields:', error)
  }
}

addBlogFields()

import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  original_name: text('original_name').notNull(),
  mime_type: text('mime_type').notNull(),
  file_size: integer('file_size').notNull(),
  file_path: text('file_path').notNull(),
  alt_text: text('alt_text'),
  caption: text('caption'),
  uploaded_by: integer('uploaded_by').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
})

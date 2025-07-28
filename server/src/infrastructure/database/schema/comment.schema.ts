import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const comment = pgTable('comment', {
  id: serial('id').primaryKey(),
  post_id: integer('post_id').notNull(),
  author_id: integer('author_id'),
  author_name: text('author_name'),
  author_email: text('author_email'),
  content: text('content').notNull(),
  status: text('status').notNull().default('pending'),
  parent_id: integer('parent_id'),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const tag = pgTable('tag', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull()
})

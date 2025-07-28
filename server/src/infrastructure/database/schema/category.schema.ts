import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
export const category = pgTable('category', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

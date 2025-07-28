import { sql } from 'drizzle-orm'
import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  color: varchar('color', { length: 7 }),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
  deletedAt: timestamp('deleted_at')
})

export const blogCategories = pgTable('blog_categories', {
  id: serial('id').primaryKey(),
  blogId: text('blog_id').notNull(),
  categoryId: text('category_id').notNull(),
  createdAt: timestamp('created_at').default(sql`now()`)
})

import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const post = pgTable('post', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featured_image: text('featured_image'),
  status: text('status').notNull().default('draft'),
  is_featured: boolean('is_featured').default(false),
  view_count: integer('view_count').default(0),
  author_id: integer('author_id').notNull(),
  category_id: integer('category_id'),
  meta_title: text('meta_title'),
  meta_description: text('meta_description'),
  published_at: timestamp('published_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

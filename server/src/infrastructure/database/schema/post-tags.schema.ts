import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core'

export const postTags = pgTable(
  'post_tags',
  {
    post_id: integer('post_id').notNull(),
    tag_id: integer('tag_id').notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.post_id, table.tag_id] })
  })
)

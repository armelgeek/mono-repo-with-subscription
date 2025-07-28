import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core'

export const postMedia = pgTable(
  'post_media',
  {
    post_id: integer('post_id').notNull(),
    media_id: integer('media_id').notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.post_id, table.media_id] })
  })
)

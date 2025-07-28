import { relations } from 'drizzle-orm'
import { postTags } from './post-tags.schema'
import { tag } from './tag.schema'

export const tagRelations = relations(tag, ({ many }) => ({
  posts: many(postTags)
}))

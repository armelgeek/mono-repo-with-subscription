import { relations } from 'drizzle-orm'
import { media } from './media.schema'
import { postMedia } from './post-media.schema'

export const mediaRelations = relations(media, ({ many }) => ({
  posts: many(postMedia)
}))

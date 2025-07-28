import { relations } from 'drizzle-orm'
import { category } from './category.schema'
import { comment } from './comment.schema'
import { media } from './media.schema'
import { postMedia } from './post-media.schema'
import { postTags } from './post-tags.schema'
import { post } from './post.schema'
import { tag } from './tag.schema'

export const postRelations = relations(post, ({ one, many }) => ({
  category: one(category, {
    fields: [post.category_id],
    references: [category.id]
  }),
  tags: many(postTags),
  media: many(postMedia),
  comments: many(comment, {
    relationName: 'postToComments'
  })
}))

import { relations } from 'drizzle-orm'
import { comment } from './comment.schema'

export const commentRelations = relations(comment, ({ one, many }) => ({
  post: one(comment, {
    fields: [comment.post_id],
    references: [comment.id]
  }),
  parent: one(comment, {
    fields: [comment.parent_id],
    references: [comment.id]
  }),
  children: many(comment, {
    relationName: 'parentToChildren'
  })
}))

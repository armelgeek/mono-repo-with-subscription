import { relations } from 'drizzle-orm'
import { category } from './category.schema'
import { post } from './post.schema'

export const categoryRelations = relations(category, ({ many }) => ({
  posts: many(post)
}))

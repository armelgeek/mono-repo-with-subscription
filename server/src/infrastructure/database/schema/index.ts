import { relations, type InferModel } from 'drizzle-orm'
import { roles, userRoles } from './auth'

export {
  accounts,
  activityLogs,
  roleResources,
  roles,
  sessions,
  subscriptionHistory,
  userRoles,
  users,
  verifications
} from './auth'
export * from './subscription-plan.schema'
export { tag } from './tag.schema'
export { post } from './post.schema'
export { comment } from './comment.schema'
export { media } from './media.schema'
export { postMedia } from './post-media.schema'
export { postTags } from './post-tags.schema'
export { category } from './category.schema'
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(roles, {
    fields: [userRoles.userId],
    references: [roles.id]
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id]
  })
}))

export type Role = InferModel<typeof roles>
export type UserRole = InferModel<typeof userRoles>

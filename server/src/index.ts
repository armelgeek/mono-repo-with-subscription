import process from 'node:process'
import { App } from './app'
import {
  PermissionController,
  SubscriptionController,
  SubscriptionPlanController,
  UserController
} from './infrastructure/controllers'
import { ActivityLogController } from './infrastructure/controllers/activity-log.controller'
import { CategoryController } from './infrastructure/controllers/category.controller'
import { PostController } from './infrastructure/controllers/post.controller'
import '@/infrastructure/schedulers'
const app = new App([
  new UserController(),
  new PermissionController(),
  new PostController(),
  new CategoryController(),
  new ActivityLogController(),
  new SubscriptionController(),
  new SubscriptionPlanController()
]).getApp()

const port = Number(process.env.PORT) || 3000

console.info(`🚀 Server is running on port ${port}`)
console.info(`📚 API Documentation: http://localhost:${port}/docs`)
console.info(`🔍 OpenAPI Schema: http://localhost:${port}/swagger`)

export default {
  port,
  fetch: app.fetch
}

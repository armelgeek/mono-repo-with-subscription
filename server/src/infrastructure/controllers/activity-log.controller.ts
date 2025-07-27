import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { GetUserActivityLogsUseCase } from '@/application/use-cases/activity-log/get-user-activity-logs.use-case'
import { ActivityLogRepository } from '../repositories/activity-log.repository'

export class ActivityLogController {
  public controller: OpenAPIHono
  private repository: ActivityLogRepository
  private getUserLogs: GetUserActivityLogsUseCase

  constructor() {
    this.controller = new OpenAPIHono()
    this.repository = new ActivityLogRepository()
    this.getUserLogs = new GetUserActivityLogsUseCase(this.repository)
    this.initRoutes()
  }

  public initRoutes() {
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/users/{userId}/activity-logs',
        tags: ['ActivityLog'],
        summary: 'Get user activity logs',
        request: {
          params: z.object({ userId: z.string().uuid() }),
          query: z.object({ limit: z.string().optional(), skip: z.string().optional() })
        },
        responses: {
          200: {
            description: 'User activity logs',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z.array(z.any()),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c) => {
        const { userId } = c.req.valid('param')
        const { limit, skip } = c.req.valid('query')
        const result = await this.getUserLogs.execute({
          userId,
          limit: limit ? Number(limit) : undefined,
          skip: skip ? Number(skip) : undefined
        })
        return c.json(result)
      }
    )
  }
}

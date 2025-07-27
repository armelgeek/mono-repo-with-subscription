import { randomUUID } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import type { ActivityLog } from '@/domain/models/activity-log.model'
import type { ActivityLogRepositoryInterface } from '@/domain/repositories/activity-log.repository.interface'
import { db } from '../database/db'
import { activityLogs } from '../database/schema/activity-log.schema'

export class ActivityLogRepository implements ActivityLogRepositoryInterface {
  async findByUserId(userId: string, options?: { limit?: number; skip?: number }): Promise<ActivityLog[]> {
    const { limit = 20, skip = 0 } = options || {}
    const results = await db.query.activityLogs.findMany({
      where: eq(activityLogs.userId, userId),
      orderBy: desc(activityLogs.createdAt),
      limit,
      offset: skip
    })
    return results.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      action: r.action,
      metadata: r.metadata || undefined,
      createdAt: r.createdAt
    }))
  }

  async create(data: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog> {
    const id = randomUUID()
    const createdAt = new Date()
    await db.insert(activityLogs).values({ ...data, id, createdAt })
    return { ...data, id, createdAt }
  }
}

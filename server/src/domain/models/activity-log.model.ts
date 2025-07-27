import { z } from 'zod'

export const ActivityLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date()
})

export type ActivityLog = z.infer<typeof ActivityLogSchema>

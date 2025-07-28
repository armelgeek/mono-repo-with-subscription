import { z } from 'zod'

export const TagSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
  description: z.string().nullable().optional(),
  created_at: z.date()
})

export type Tag = z.infer<typeof TagSchema>

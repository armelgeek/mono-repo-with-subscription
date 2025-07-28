import { z } from 'zod'

export const CommentSchema = z.object({
  id: z.number().int(),
  post_id: z.number().int(),
  author_id: z.number().int().nullable().optional(),
  author_name: z.string().nullable().optional(),
  author_email: z.string().nullable().optional(),
  content: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected', 'spam']).default('pending'),
  parent_id: z.number().int().nullable().optional(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  created_at: z.date(),
  updated_at: z.date()
})

export type Comment = z.infer<typeof CommentSchema>

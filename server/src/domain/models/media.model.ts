import { z } from 'zod'

export const MediaSchema = z.object({
  id: z.number().int(),
  filename: z.string().min(1).max(255),
  original_name: z.string().min(1).max(255),
  mime_type: z.string().min(1).max(100),
  file_size: z.number().int(),
  file_path: z.string().min(1).max(500),
  alt_text: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  uploaded_by: z.number().int(),
  created_at: z.date()
})

export type Media = z.infer<typeof MediaSchema>

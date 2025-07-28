import { z } from 'zod'

export const PostSchema = z.object({
  id: z.number().int(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1),
  featured_image: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  is_featured: z.boolean().default(false),
  view_count: z.number().int().default(0),
  author_id: z.number().int(),
  category_id: z.number().int().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  published_at: z.date().nullable().optional(),
  created_at: z.date(),
  updated_at: z.date()
})

export type Post = z.infer<typeof PostSchema>

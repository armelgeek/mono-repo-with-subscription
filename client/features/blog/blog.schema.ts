import { z } from 'zod'

export const postSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Le titre est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  excerpt: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  is_featured: z.boolean().default(false),
  view_count: z.number().default(0),
  author_id: z.number(),
  category_id: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
  // published_at, cover_url, etc. peuvent être ajoutés ici si présents côté backend
})

export type Post = z.infer<typeof postSchema>

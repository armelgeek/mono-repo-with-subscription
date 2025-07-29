import { useQuery } from '@tanstack/react-query'
import { postService } from '../blog.service'
import type { Post } from '../blog.schema'

export function usePosts(params?: Record<string, string | number | boolean>) {
  return useQuery<Post[]>({
    queryKey: ['posts', params],
    queryFn: async () => {
      const res = await postService.list(params)
      return res.data as Post[]
    },
  })
}

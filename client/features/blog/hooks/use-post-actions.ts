import { API_ENDPOINTS } from '@/shared/config/api'
import { useMutation } from '@tanstack/react-query'
import { postService } from '../blog.service'
import type { Post } from '../blog.schema'

export function useCreatePost() {
  return useMutation({
    mutationFn: async (data: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
      const res = await postService.post(API_ENDPOINTS.blog.create, data)
      return res.data as Post
    },
  })
}

export function useUpdatePost() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>> }) => {
      const res = await postService.put(API_ENDPOINTS.blog.update(String(id)), data)
      return res.data as Post
    },
  })
}

export function useDeletePost() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await postService.delete(API_ENDPOINTS.blog.delete(String(id)))
      return res.data as { success: boolean }
    },
  })
}

"use client"

import PostCreateForm from '@/features/blog/components/post-create-form'

export default function BlogCreatePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto">
        <PostCreateForm />
      </div>
    </div>
  )
}

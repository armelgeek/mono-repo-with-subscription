"use client"


import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { postSchema, type Post } from '../blog.schema'
import { useUpdatePost } from '../hooks/use-post-actions'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface PostEditFormProps {
  post: Post
}

export default function PostEditForm({ post }: PostEditFormProps) {
  const { mutate, isPending, isSuccess, isError, error } = useUpdatePost()
  const [successMsg, setSuccessMsg] = useState('')

  const form = useForm<Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>>({
    resolver: zodResolver(postSchema.omit({ id: true, created_at: true, updated_at: true })),
    defaultValues: {
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      status: post.status,
      is_featured: post.is_featured,
      view_count: post.view_count,
      author_id: post.author_id,
      category_id: post.category_id,
    },
    mode: 'onChange',
  })

  const onSubmit = (data: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>) => {
    mutate({ id: post.id, data }, {
      onSuccess: () => {
        setSuccessMsg('Article mis à jour avec succès !')
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{"Éditer l'article"}</h2>
      <div>
        <label className="block font-medium mb-1">Titre</label>
        <input {...form.register('title')} className="input input-bordered w-full" />
        {form.formState.errors.title && <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>}
      </div>
      <div>
        <label className="block font-medium mb-1">Slug</label>
        <input {...form.register('slug')} className="input input-bordered w-full" />
        {form.formState.errors.slug && <p className="text-red-500 text-sm mt-1">{form.formState.errors.slug.message}</p>}
      </div>
      <div>
        <label className="block font-medium mb-1">Contenu</label>
        <Controller
          name="content"
          control={form.control}
          render={({ field }) => (
            <div data-color-mode="light">
              <MDEditor
                value={field.value}
                onChange={field.onChange}
                height={300}
                preview="edit"
                textareaProps={{
                  placeholder: "Rédigez votre article en markdown..."
                }}
              />
            </div>
          )}
        />
        {form.formState.errors.content && <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>}
      </div>
      <div>
        <label className="block font-medium mb-1">Extrait</label>
        <input {...form.register('excerpt')} className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block font-medium mb-1">Statut</label>
        <select {...form.register('status')} className="input input-bordered w-full">
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" {...form.register('is_featured')} id="is_featured" />
        <label htmlFor="is_featured">Mettre en avant</label>
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
        {isPending ? 'Mise à jour en cours...' : 'Mettre à jour'}
      </button>
      {isSuccess && <p className="text-green-600 text-center">{successMsg}</p>}
      {isError && <p className="text-red-500 text-center">Erreur : {error?.message}</p>}
    </form>
  )
}

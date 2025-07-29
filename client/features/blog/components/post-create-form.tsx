"use client"


import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { postSchema, type Post } from '../blog.schema'
import { useCreatePost } from '../hooks/use-post-actions'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false })

export default function PostCreateForm() {
  // Gestion du mode preview
  const [showPreview, setShowPreview] = useState(false)
  const { mutate, isPending, isSuccess, isError, error } = useCreatePost()
  const [successMsg, setSuccessMsg] = useState('')

  // Auto-save du brouillon dans localStorage
  const DRAFT_KEY = 'blog_post_draft'
  const form = useForm<Omit<Post, 'id' | 'created_at' | 'updated_at'>>({
    resolver: zodResolver(postSchema.omit({ id: true, created_at: true, updated_at: true })),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      status: 'draft',
      is_featured: false,
      view_count: 0,
      author_id: 1,
      category_id: 1,
    },
    mode: 'onChange',
  })

  // Générer le slug automatiquement à partir du titre
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === 'title' && values.title) {
        const slug = values.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
        form.setValue('slug', slug, { shouldValidate: false })
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Charger le brouillon au montage
  useEffect(() => {
    const draft = typeof window !== 'undefined' ? localStorage.getItem(DRAFT_KEY) : null
    if (draft) {
      try {
        form.reset(JSON.parse(draft))
      } catch {}
    }
  }, [form])

  // Sauvegarder le brouillon à chaque changement
  useEffect(() => {
    const sub = form.watch((values) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values))
      }
    })
    return () => sub.unsubscribe()
  }, [form])

  const onSubmit = (data: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    // Le slug est déjà généré dans le form state
    mutate({ ...data, slug: form.getValues('slug') }, {
      onSuccess: () => {
        setSuccessMsg('Article créé avec succès !')
        form.reset()
        if (typeof window !== 'undefined') {
          localStorage.removeItem(DRAFT_KEY)
        }
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Créer un nouvel article</h2>
      <div>
        <label className="block font-medium mb-1">Titre</label>
        <input {...form.register('title')} className="input input-bordered w-full" />
        {form.formState.errors.title && <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>}
      </div>

      <div>
        <label className="block font-medium mb-1">Contenu</label>
        <div className="flex items-center gap-2 mb-2">
          <button type="button" className="btn btn-secondary btn-xs" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? 'Édition' : 'Prévisualiser'}
          </button>
          <span className="text-xs text-gray-400">(auto-save local)</span>
        </div>
        {showPreview ? (
          <div className="border rounded bg-gray-50 p-4 min-h-[200px]">
            <MarkdownPreview source={form.getValues('content') || ''} />
          </div>
        ) : (
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
        )}
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
        {isPending ? 'Création en cours...' : 'Créer'}
      </button>
      {isSuccess && <p className="text-green-600 text-center">{successMsg}</p>}
      {isError && <p className="text-red-500 text-center">Erreur : {error?.message}</p>}
    </form>
  )
}

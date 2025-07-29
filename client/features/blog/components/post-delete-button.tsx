"use client"

import { useDeletePost } from '../hooks/use-post-actions'
import { useState } from 'react'

interface PostDeleteButtonProps {
  id: number
  onDeleted?: () => void
}

export default function PostDeleteButton({ id, onDeleted }: PostDeleteButtonProps) {
  const { mutate, isPending, isSuccess, isError, error } = useDeletePost()
  const [confirm, setConfirm] = useState(false)

  const handleDelete = () => {
    mutate(id, {
      onSuccess: () => {
        setConfirm(false)
        if (onDeleted) onDeleted()
      },
    })
  }

  return (
    <div className="mt-4">
      {!confirm ? (
        <button className="btn btn-error" onClick={() => setConfirm(true)} disabled={isPending}>
          Supprimer l&apos;article
        </button>
      ) : (
        <div className="flex gap-2 items-center">
          <span>Confirmer la suppression ?</span>
          <button className="btn btn-error" onClick={handleDelete} disabled={isPending}>
            Oui, supprimer
          </button>
          <button className="btn btn-ghost" onClick={() => setConfirm(false)} disabled={isPending}>
            Annuler
          </button>
        </div>
      )}
      {isSuccess && <p className="text-green-600 mt-2">Article supprimé.</p>}
      {isError && <p className="text-red-500 mt-2">Erreur : {error?.message}</p>}
    </div>
  )
}

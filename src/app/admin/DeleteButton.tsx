'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { adminDeleteRecord } from '@/lib/actions'

export function DeleteButton({ table, id, redirect }: { table: string; id: number | string; redirect: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this item? This cannot be undone.')) return
    setLoading(true)
    try {
      await adminDeleteRecord(table, id)
      router.push(redirect)
      router.refresh()
    } catch {
      alert('Failed to delete. Check console for details.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:underline text-xs disabled:opacity-50"
    >
      {loading ? '...' : 'Delete'}
    </button>
  )
}

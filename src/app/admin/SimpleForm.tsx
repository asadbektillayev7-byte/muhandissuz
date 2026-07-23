'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminSaveRecord } from '@/lib/actions'

type Field = {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'select'
  required?: boolean
  options?: string[]
}

export function SimpleForm({
  table,
  redirect,
  item,
  fields,
}: {
  table: string
  redirect: string
  item?: any
  fields: Field[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => {
    const initial: Record<string, any> = {}
    fields.forEach((f) => {
      initial[f.name] = item?.[f.name] ?? ''
    })
    return initial
  })

  function handleChange(name: string, value: any) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function getEmptyBilingualFields(): string[] {
    const warnings: string[] = []
    const pairs = new Map<string, string[]>()
    for (const f of fields) {
      const base = f.name.replace(/_(uz|en)$/i, '')
      if (base !== f.name) {
        if (!pairs.has(base)) pairs.set(base, [])
        pairs.get(base)!.push(f.name)
      }
    }
    for (const [, pair] of pairs) {
      if (pair.length !== 2) continue
      const [a, b] = pair
      const aFilled = !!form[a]?.toString().trim()
      const bFilled = !!form[b]?.toString().trim()
      if (aFilled && !bFilled) warnings.push(b)
      if (bFilled && !aFilled) warnings.push(a)
    }
    return warnings
  }

  async function handleSave() {
    setError('')
    const empty = getEmptyBilingualFields()
    if (empty.length > 0) {
      const names = empty.map(n => fields.find(f => f.name === n)?.label || n).join(', ')
      if (!confirm(`Warning: these fields are empty: ${names}. Save anyway?`)) return
    }

    setSaving(true)
    try {
      const data: Record<string, any> = {}
      fields.forEach((f) => {
        let val = form[f.name]
        if (f.type === 'number' || f.name.endsWith('_id')) {
          val = val ? Number(val) : null
        }
        if (f.type === 'date' && val) {
          val = new Date(val).toISOString()
        }
        data[f.name] = val
      })
      await adminSaveRecord(table, data, item?.id)
      router.push(redirect)
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Save failed')
      setSaving(false)
    }
  }

  const emptyBilingual = getEmptyBilingualFields()
  const emptyNames = emptyBilingual.map(n => fields.find(f => f.name === n)?.label || n)

  return (
    <div className="space-y-4">
      {emptyBilingual.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 text-sm p-3 rounded">
          ⚠ Missing translations: {emptyNames.join(', ')}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded">
          {error}
        </div>
      )}

      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              value={form[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              rows={3}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2 resize-none"
              style={{ borderRadius: 'var(--radius)' }}
              required={field.required}
            />
          ) : field.type === 'select' ? (
            <select
              value={form[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
              style={{ borderRadius: 'var(--radius)' }}
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
              value={form[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
              style={{ borderRadius: 'var(--radius)' }}
              required={field.required}
            />
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => router.push(redirect)}
          className="border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground text-background px-6 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {saving ? 'Saving...' : item?.id ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )
}

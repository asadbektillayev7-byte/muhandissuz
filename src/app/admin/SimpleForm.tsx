'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
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

    if (item?.id) {
      await supabase.from(table).update(data).eq('id', item.id)
    } else {
      await supabase.from(table).insert(data)
    }

    setSaving(false)
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="space-y-4">
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

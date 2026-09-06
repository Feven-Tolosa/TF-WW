'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageUp, X } from 'lucide-react'
import AdminShell from '@/components/AdminShell'
import { api, getToken, clearToken, uploadImage } from '@/lib/api'
import { useRouter } from 'next/navigation'

type Furniture = {
  id: number
  name: string
  description: string
  price: string | number
  imageUrl?: string | null
  available?: boolean
  categoryId?: number | null
  category?: { id: number; name: string } | null
}

type Category = { id: number; name: string }

const emptyForm = {
  name: '',
  price: '',
  description: '',
  imageUrl: '',
  categoryId: '',
  available: true,
}

const PAGE_SIZE = 6

export default function FurniturePage() {
  const router = useRouter()
  const [items, setItems] = useState<Furniture[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search / filter / pagination
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!getToken()) {
      clearToken()
      router.push('/admin/login')
    }
  }, [router])

  const load = useCallback(() => {
    api<Furniture[]>('/furniture').then(setItems).catch(console.error)
    api<Category[]>('/categories').then(setCategories).catch(console.error)
  }, [])

  useEffect(load, [load])

  const filtered = items.filter((item) => {
    const matchesSearch =
      search.trim() === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' ||
      String(item.categoryId) === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  const guard = () => {
    if (!getToken()) {
      clearToken()
      router.push('/admin/login')
      return false
    }
    return true
  }

  const openAddModal = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setError('')
    setPreview(null)
    setIsOpen(true)
  }

  const openEditModal = (item: Furniture) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      price: String(item.price),
      description: item.description ?? '',
      imageUrl: item.imageUrl ?? '',
      categoryId: item.categoryId ? String(item.categoryId) : '',
      available: item.available ?? true,
    })
    setError('')
    setPreview(item.imageUrl ?? null)
    setIsOpen(true)
  }

  const uploadFile = async (file: File) => {
    if (!guard()) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadImage(file)
      setFormData((prev) => ({ ...prev, imageUrl: url }))
      setPreview(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // allow re-selecting the same file
    e.target.value = ''
    if (!file) return
    await uploadFile(file)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await uploadFile(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guard()) return
    setSaving(true)
    setError('')

    try {
      const body = JSON.stringify({
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        imageUrl: formData.imageUrl || undefined,
        categoryId: formData.categoryId || undefined,
        availability: formData.available,
      })

      if (editingId) {
        await api<Furniture>(`/furniture/${editingId}`, {
          method: 'PUT',
          body,
        })
      } else {
        await api<Furniture>('/furniture', { method: 'POST', body })
      }
      setIsOpen(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!guard()) return
    if (!confirm('Delete this furniture item?')) return

    try {
      await api(`/furniture/${id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <AdminShell>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8'>
        <div>
          <p className='mb-1 text-xs font-medium uppercase tracking-[0.3em] text-wood-700'>
            Catalog
          </p>
          <h1 className='admin-page-title'>Furniture Management</h1>
        </div>
        <button onClick={openAddModal} className='admin-btn w-full sm:w-auto'>
          + Add Furniture
        </button>
      </div>

      {/* Search & Filter */}
      <div className='mb-6 flex flex-col gap-3 sm:flex-row'>
        <input
          type='text'
          placeholder='Search by name or description…'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className='admin-input sm:max-w-xs'
        />
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setPage(1)
          }}
          className='admin-input sm:w-auto'
        >
          <option value='all'>All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className='admin-card overflow-hidden'>
        {pageItems.length > 0 && (
          <>
            {/* Mobile product cards */}
            <div className='space-y-3 p-4 sm:hidden sm:p-0'>
              {pageItems.map((item) => (
                <div
                  key={item.id}
                  className='rounded-lg border border-stone-200 bg-stone-50 p-4'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='font-medium text-stone-900'>{item.name}</p>
                      <p className='mt-0.5 text-xs text-stone-500'>
                        {item.category?.name ?? 'No category'} · ETB{' '}
                        {Number(item.price).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
                        item.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className='mt-3 flex items-center gap-3'>
                    <button
                      onClick={() => openEditModal(item)}
                      className='rounded border border-stone-300 bg-white px-4 py-2 text-sm text-wood-700 active:bg-stone-100'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className='rounded border border-red-200 bg-white px-4 py-2 text-sm text-red-600 active:bg-red-50'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop product table */}
            <div className='hidden overflow-x-auto sm:block'>
              <table className='w-full text-left'>
                <thead>
                  <tr>
                    <th className='admin-th'>Name</th>
                    <th className='admin-th'>Category</th>
                    <th className='admin-th'>Price (ETB)</th>
                    <th className='admin-th'>Availability</th>
                    <th className='admin-th text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-stone-200'>
                  {pageItems.map((item) => (
                    <tr key={item.id} className='hover:bg-stone-50'>
                      <td className='admin-td font-medium'>{item.name}</td>
                      <td className='admin-td'>{item.category?.name ?? '—'}</td>
                      <td className='admin-td'>
                        {Number(item.price).toLocaleString()}
                      </td>
                      <td className='admin-td'>
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs ${
                            item.available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className='admin-td text-right'>
                        <div className='inline-flex gap-4'>
                          <button
                            onClick={() => openEditModal(item)}
                            className='text-sm text-wood-700 hover:underline'
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className='text-sm text-red-600 hover:underline'
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {filtered.length === 0 && (
          <p className='p-12 text-center text-sm text-stone-500'>
            No furniture found.
          </p>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 p-4 text-sm text-stone-500'>
            <span>
              {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length}
            </span>
            <div className='inline-flex items-center gap-2'>
              <button
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                className='admin-btn-ghost px-4 py-2 disabled:opacity-40'
              >
                Prev
              </button>
              <span>
                Page {safePage} of {totalPages}
              </span>
              <button
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
                className='admin-btn-ghost px-4 py-2 disabled:opacity-40'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className='fixed inset-0 z-50'>
          <div
            className='absolute inset-0 bg-black/50'
            onClick={() => setIsOpen(false)}
          />
          <div className='absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center'>
            <form
              onSubmit={handleSave}
              className='max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-lg sm:p-7'
            >
              <div className='mb-4 flex items-start justify-between gap-3'>
                <div>
                  <h2 className='text-xl font-light tracking-tight text-stone-900'>
                    {editingId ? 'Edit Furniture' : 'Add Furniture'}
                  </h2>
                  <p className='mt-1 text-xs uppercase tracking-[0.3em] text-wood-700'>
                    {editingId
                      ? 'Update your catalog item'
                      : 'Create a new catalog item'}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => setIsOpen(false)}
                  aria-label='Close'
                  className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700'
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <p className='mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600'>
                  {error}
                </p>
              )}

              <div className='mb-3'>
                <label className='admin-label'>Furniture Name</label>
                <input
                  type='text'
                  required
                  className='admin-input'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='mb-3'>
                  <label className='admin-label'>Price (ETB)</label>
                  <input
                    type='number'
                    required
                    min={0}
                    inputMode='decimal'
                    className='admin-input'
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>

                <div className='mb-3'>
                  <label className='admin-label'>Category</label>
                  <select
                    className='admin-input'
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                  >
                    <option value=''>General</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='mb-3'>
                <label className='admin-label'>Product Image</label>

                {/* Preview */}
                {preview ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragActive(true)
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className='mb-2 cursor-pointer overflow-hidden rounded border border-stone-200'
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt='Product preview'
                      className='h-44 w-full object-cover'
                    />
                  </div>
                ) : (
                  <div
                    role='button'
                    tabIndex={0}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        inputRef.current?.click()
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragActive(true)
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`mb-2 flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed px-4 text-center transition-colors ${
                      dragActive
                        ? 'border-wood-600 bg-wood-50 text-wood-700'
                        : 'border-stone-300 bg-stone-50 text-stone-400 hover:border-wood-600 hover:text-wood-700'
                    }`}
                  >
                    {uploading ? (
                      <div className='flex flex-col items-center gap-2'>
                        <span className='h-6 w-6 animate-spin rounded-full border-2 border-wood-600 border-t-transparent' />
                        <p className='text-sm'>Uploading…</p>
                      </div>
                    ) : (
                      <>
                        <ImageUp size={30} strokeWidth={1.5} />
                        <p className='text-sm font-medium text-stone-600'>
                          Drag &amp; drop an image here
                        </p>
                        <p className='text-xs'>or click to browse your device</p>
                      </>
                    )}
                  </div>
                )}

                <div className='flex flex-wrap gap-2'>
                  <label className='cursor-pointer rounded border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition-colors hover:border-wood-600 hover:text-wood-700'>
                    {uploading ? 'Uploading…' : 'Upload image'}
                    <input
                      ref={inputRef}
                      type='file'
                      accept='image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml'
                      className='hidden'
                      disabled={uploading}
                      onChange={handleImageUpload}
                    />
                  </label>
                  {preview && (
                    <button
                      type='button'
                      onClick={() => {
                        setPreview(null)
                        setFormData((prev) => ({ ...prev, imageUrl: '' }))
                      }}
                      className='rounded border border-red-200 bg-white px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50'
                    >
                      Remove
                    </button>
                  )}
                </div>

                <p className='mt-1.5 text-xs text-stone-400'>
                  PNG, JPG, WebP, AVIF, GIF or SVG · max 4 MB · stored in
                  Supabase Storage
                </p>

                {/* Optional: paste a URL directly instead */}
                <input
                  type='text'
                  placeholder='…or paste an image URL'
                  className='admin-input mt-2'
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value })
                    if (e.target.value) setPreview(e.target.value)
                  }}
                />
              </div>

              <div className='mb-3'>
                <label className='admin-label'>Description</label>
                <textarea
                  rows={3}
                  className='admin-input'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <label className='mb-5 flex items-center gap-2 text-sm text-stone-600'>
                <input
                  type='checkbox'
                  checked={formData.available}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.checked })
                  }
                />
                Available for ordering
              </label>

              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => setIsOpen(false)}
                  className='admin-btn-ghost flex-1'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={saving}
                  className='admin-btn flex-[2]'
                >
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Add Furniture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
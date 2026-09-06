'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import AdminShell from '@/components/AdminShell'
import { api, getToken, clearToken } from '@/lib/api'

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
type Order = {
  id: number
  customerName: string
  customerPhone: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  furniture: { name: string }
  createdAt: string
}

const emptyForm = {
  name: '',
  price: '',
  description: '',
  imageUrl: '',
  categoryId: '',
  available: true,
}

export default function AdminDashboard() {
  const router = useRouter()
  const [furnitureCount, setFurnitureCount] = useState<number | null>(null)
  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [unreadCount, setUnreadCount] = useState<number | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  // Product management
  const [items, setItems] = useState<Furniture[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')

  const loadCategories = useCallback(() => {
    api<Category[]>('/categories').then(setCategories).catch(() => setCategories([]))
  }, [])

  const loadProducts = useCallback(() => {
    api<Furniture[]>('/furniture')
      .then((items) => {
        setItems(items)
        setFurnitureCount(items.length)
      })
      .catch(() => {
        setItems([])
        setFurnitureCount(0)
      })
  }, [])

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [loadCategories, loadProducts])

  useEffect(() => {
    if (!getToken()) {
      clearToken()
      router.push('/admin/login')
      return
    }

    api<Order[]>('/orders')
      .then((orders) => {
        setPendingCount(orders.filter((o) => o.status === 'PENDING').length)
        setRecentOrders(orders.slice(0, 5))
      })
      .catch((err) => {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          clearToken()
          router.push('/admin/login')
          return
        }
        setPendingCount(0)
        setRecentOrders([])
      })

    api<{ isRead: boolean }[]>('/notifications')
      .then((notifs) => setUnreadCount(notifs.filter((n) => !n.isRead).length))
      .catch(() => setUnreadCount(0))
  }, [router])

  const guard = () => {
    if (!getToken()) {
      clearToken()
      router.push('/admin/login')
      return false
    }
    return true
  }

  const openAddModal = () => {
    if (!guard()) return
    setEditingId(null)
    setFormData(emptyForm)
    setError('')
    setFlash('')
    setIsOpen(true)
  }

  const openEditModal = (item: Furniture) => {
    if (!guard()) return
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
    setFlash('')
    setIsOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guard()) return
    if (!formData.name.trim() || !formData.price) return
    setSaving(true)
    setError('')
    setFlash('')

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
      setFlash(editingId ? 'Product updated.' : 'Product added.')
      loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!guard()) return
    if (!confirm('Delete this product?')) return

    try {
      await api(`/furniture/${id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((i) => i.id !== id))
      setFurnitureCount((prev) => (prev === null ? 0 : prev - 1))
      setFlash('Product deleted.')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <AdminShell>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8'>
        <div>
          <p className='mb-1 text-xs font-medium uppercase tracking-[0.3em] text-wood-700'>
            Management
          </p>
          <h1 className='admin-page-title'>Dashboard Overview</h1>
        </div>
        <button onClick={openAddModal} className='admin-btn w-full sm:w-auto'>
          + Add Product
        </button>
      </div>

      {flash && (
        <p className='mb-6 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700'>
          {flash}
        </p>
      )}

      <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6'>
        <StatCard
          title='Total Furniture'
          value={furnitureCount === null ? '…' : String(furnitureCount)}
        />
        <StatCard
          title='Pending Orders'
          value={pendingCount === null ? '…' : String(pendingCount)}
        />
        <StatCard
          title='Unread Notifications'
          value={unreadCount === null ? '…' : String(unreadCount)}
        />
      </div>

      {/* Product management */}
      <section className='admin-card mb-8 p-4 sm:p-6'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p className='mb-1 text-xs font-medium uppercase tracking-[0.3em] text-wood-700'>
              Catalog
            </p>
            <h2 className='text-lg font-light tracking-tight text-stone-900'>
              Products
            </h2>
          </div>
          <Link
            href='/admin/dashboard/furniture'
            className='text-sm text-wood-700 underline-offset-4 hover:underline'
          >
            Advanced management →
          </Link>
        </div>

        {items.length === 0 ? (
          <div className='rounded border border-dashed border-stone-300 bg-stone-50 py-10 text-center'>
            <p className='text-sm text-stone-500'>
              No products yet. Tap “+ Add Product” to create your first piece.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile product cards */}
            <div className='space-y-3 sm:hidden'>
              {items.map((item) => (
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
                  {items.map((item) => (
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
      </section>

      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='mb-1 text-xs font-medium uppercase tracking-[0.3em] text-wood-700'>
            Activity
          </p>
          <h2 className='text-lg font-light tracking-tight text-stone-900'>
            Recent Orders
          </h2>
        </div>
        <Link
          href='/admin/dashboard/notifications'
          className='text-sm text-wood-700 underline-offset-4 hover:underline'
        >
          View notifications →
        </Link>
      </div>

      <section className='admin-card p-4 sm:p-6'>
        {recentOrders.length === 0 ? (
          <p className='py-8 text-center text-sm text-stone-500'>No orders yet.</p>
        ) : (
          <>
            {/* Mobile order cards */}
            <div className='space-y-3 sm:hidden'>
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className='rounded-lg border border-stone-200 bg-stone-50 p-4'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='font-medium text-stone-900'>
                        {o.customerName}
                      </p>
                      <p className='mt-0.5 text-xs text-stone-500'>
                        {o.furniture.name}
                      </p>
                      <a
                        href={`tel:${o.customerPhone}`}
                        className='mt-0.5 block text-xs text-wood-700 hover:underline'
                      >
                        {o.customerPhone}
                      </a>
                    </div>
                    <OrderBadge status={o.status} />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop order table */}
            <div className='hidden overflow-x-auto sm:block'>
              <table className='w-full text-left'>
                <thead>
                  <tr>
                    <th className='admin-th'>Customer</th>
                    <th className='admin-th'>Phone</th>
                    <th className='admin-th'>Product</th>
                    <th className='admin-th'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-stone-200'>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className='hover:bg-stone-50'>
                      <td className='admin-td font-medium'>{o.customerName}</td>
                      <td className='admin-td'>{o.customerPhone}</td>
                      <td className='admin-td'>{o.furniture.name}</td>
                      <td className='admin-td'>
                        <OrderBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Link
          href='/admin/dashboard/orders'
          className='mt-4 inline-block text-sm text-wood-700 underline-offset-4 hover:underline'
        >
          View all orders →
        </Link>
      </section>

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
                    {editingId ? 'Edit Product' : 'Add Product'}
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
                <label className='admin-label'>Product Name</label>
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
                <label className='admin-label'>Image URL</label>
                <input
                  type='text'
                  placeholder='/images/1.png'
                  className='admin-input'
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
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
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className='admin-card p-5 sm:p-6'>
      <p className='mb-1 text-xs font-medium uppercase tracking-widest text-stone-500'>
        {title}
      </p>
      <p className='text-3xl font-light text-stone-900'>{value}</p>
    </div>
  )
}

function OrderBadge({ status }: { status: Order['status'] }) {
  const styles: Record<Order['status'], string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs ${styles[status]}`}
    >
      {status.toLowerCase()}
    </span>
  )
}
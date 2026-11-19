'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/AdminShell'
import { api, getToken, clearToken } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Localized, T, useLanguage } from '@/lib/i18n'

type Order = {
  id: number
  customerName: string
  customerPhone: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  furniture: { name: string; price: string | number }
}

const PAGE_SIZE = 6

const statusStyles: Record<Order['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])

  // Search / filter / pagination
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const { t } = useLanguage()

  useEffect(() => {
    if (!getToken()) {
      clearToken()
      router.push('/admin/login')
      return
    }

    api<Order[]>('/orders')
      .then(setOrders)
      .catch((err) => {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          clearToken()
          router.push('/admin/login')
        }
      })
  }, [router])

  const filtered = orders.filter((order) => {
    const matchesSearch =
      search.trim() === '' ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone.includes(search) ||
      order.furniture.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'ALL' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageOrders = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  const updateStatus = async (id: number, status: Order['status']) => {
    try {
      const updated = await api<Order>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    }
  }

  return (
    <AdminShell>
      <div className='mb-6 sm:mb-8'>
        <p className='mb-1 text-xs font-medium uppercase tracking-[0.3em] text-wood-700'>
          <T k='admin.orders' />
        </p>
        <h1 className='admin-page-title'>
          <T k='admin.clientOrders' />
        </h1>
      </div>

      {/* Search & Filter */}
      <div className='mb-6 flex flex-col gap-3 sm:flex-row'>
        <input
          type='text'
          placeholder={t('admin.searchOrders')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className='admin-input sm:max-w-xs'
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className='admin-input sm:w-auto'
        >
          <option value='ALL'>
            <T k='admin.allStatuses' />
          </option>
          <option value='PENDING'>
            <T k='status.pending' />
          </option>
          <option value='COMPLETED'>
            <T k='status.completed' />
          </option>
          <option value='CANCELLED'>
            <T k='status.cancelled' />
          </option>
        </select>
      </div>

      <div className='admin-card overflow-hidden'>
        {pageOrders.length > 0 && (
          <>
            {/* Mobile order cards */}
            <div className='space-y-3 p-4 sm:hidden sm:p-0'>
              {pageOrders.map((order) => (
                <div
                  key={order.id}
                  className='rounded-lg border border-stone-200 bg-stone-50 p-4'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='font-medium text-stone-900'>
                        {order.customerName}
                      </p>
                      <p className='mt-0.5 text-xs text-stone-500'>
                        <Localized text={order.furniture.name} />
                      </p>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className='mt-0.5 block text-xs text-wood-700 hover:underline'
                      >
                        {order.customerPhone}
                      </a>
                      <p className='mt-0.5 text-xs text-stone-500'>
                        ETB {Number(order.furniture.price).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${statusStyles[order.status]}`}
                    >
                      {t(
                        order.status === 'PENDING'
                          ? 'status.pending'
                          : order.status === 'COMPLETED'
                            ? 'status.completed'
                            : 'status.cancelled',
                      )}
                    </span>
                  </div>

                  {order.status === 'PENDING' && (
                    <div className='mt-3 flex gap-3'>
                      <button
                        onClick={() => updateStatus(order.id, 'COMPLETED')}
                        className='flex-1 rounded border border-wood-300 bg-white px-4 py-2 text-sm text-wood-700 active:bg-wood-50'
                      >
                        <T k='admin.markCompleted' />
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, 'CANCELLED')}
                        className='rounded border border-red-200 bg-white px-4 py-2 text-sm text-red-600 active:bg-red-50'
                      >
                        <T k='admin.cancel' />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop orders table */}
            <div className='hidden overflow-x-auto sm:block'>
              <table className='w-full text-left'>
                <thead>
                  <tr>
                    <th className='admin-th'>
                      <T k='admin.client' />
                    </th>
                    <th className='admin-th'>
                      <T k='admin.phone' />
                    </th>
                    <th className='admin-th'>
                      <T k='admin.products' />
                    </th>
                    <th className='admin-th'>
                      <T k='order.total' />
                    </th>
                    <th className='admin-th'>
                      <T k='admin.status' />
                    </th>
                    <th className='admin-th'>
                      <T k='admin.action' />
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-stone-200'>
                  {pageOrders.map((order) => (
                    <tr key={order.id} className='hover:bg-stone-50'>
                      <td className='admin-td font-medium'>
                        {order.customerName}
                      </td>
                      <td className='admin-td'>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className='text-wood-700 hover:underline'
                        >
                          {order.customerPhone}
                        </a>
                      </td>
                      <td className='admin-td'>
                        <Localized text={order.furniture.name} />
                      </td>
                      <td className='admin-td'>
                        {Number(order.furniture.price).toLocaleString()} ETB
                      </td>
                      <td className='admin-td'>
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs ${statusStyles[order.status]}`}
                        >
                          {t(
                        order.status === 'PENDING'
                          ? 'status.pending'
                          : order.status === 'COMPLETED'
                            ? 'status.completed'
                            : 'status.cancelled',
                      )}
                        </span>
                      </td>
                      <td className='admin-td'>
                        <div className='inline-flex gap-4'>
                          {order.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() =>
                                  updateStatus(order.id, 'COMPLETED')
                                }
                                className='text-sm text-wood-700 hover:underline'
                              >
                                <T k='admin.markCompleted' />
                              </button>
                              <button
                                onClick={() =>
                                  updateStatus(order.id, 'CANCELLED')
                                }
                                className='text-sm text-red-600 hover:underline'
                              >
                                <T k='admin.cancel' />
                              </button>
                            </>
                          )}
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
            <T k='admin.noOrdersFound' />
          </p>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 p-4 text-sm text-stone-500'>
            <span>
              {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)}{' '}
              <T k='admin.of' /> {filtered.length}
            </span>
            <div className='inline-flex items-center gap-2'>
              <button
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                className='admin-btn-ghost px-4 py-2 disabled:opacity-40'
              >
                <T k='admin.prev' />
              </button>
              <span>
                <T k='admin.page' values={{ n: safePage, total: totalPages }} />
              </span>
              <button
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
                className='admin-btn-ghost px-4 py-2 disabled:opacity-40'
              >
                <T k='admin.next' />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
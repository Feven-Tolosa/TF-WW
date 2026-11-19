'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/AdminShell'
import { api, getToken, clearToken } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { T, useLanguage } from '@/lib/i18n'

type Notification = {
  id: number
  message: string
  isRead: boolean
  createdAt: string
  order?: {
    id: number
    customerName: string
    customerPhone: string
    createdAt: string
    furniture: { name: string }
  } | null
}

export default function NotificationsPage() {
  const router = useRouter()
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { language } = useLanguage()

  useEffect(() => {
    if (!getToken()) {
      clearToken()
      router.push('/admin/login')
      return
    }

    api<Notification[]>('/notifications')
      .then(setItems)
      .catch((err) => {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          clearToken()
          router.push('/admin/login')
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  const markRead = async (id: number) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PATCH' })
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed')
    }
  }

  const markAllRead = async () => {
    try {
      await api('/notifications/read-all', { method: 'POST' })
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed')
    }
  }

return (
    <AdminShell>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8'>
        <div>
          <p className='mb-1 text-xs font-medium uppercase tracking-[0.3em] text-wood-700'>
            <T k='admin.inbox' />
          </p>
          <h1 className='admin-page-title'>
            <T k='admin.orderNotifications' />
          </h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={markAllRead}
            className='text-sm text-wood-700 underline-offset-4 hover:underline'
          >
            <T k='admin.markAllRead' />
          </button>
        )}
      </div>

      <div className='space-y-3'>
        {loading && (
          <p className='admin-card p-8 text-center text-sm text-stone-500'>
            <T k='common.loading' />
          </p>
        )}

        {!loading && items.length === 0 && (
          <p className='admin-card p-8 text-center text-sm text-stone-500'>
            <T k='admin.noNotifications' />
          </p>
        )}

        {items.map((n) => (
          <div
            key={n.id}
            className={`admin-card border-l-4 p-4 sm:p-5 ${
              n.isRead ? 'border-l-stone-200 opacity-70' : 'border-l-wood-500'
            }`}
          >
            <div className='flex items-start justify-between gap-4'>
              <p className='font-medium text-stone-800'>
                {!n.isRead && (
                  <span className='mr-2 inline-block h-2 w-2 rounded-full bg-wood-600 align-middle' />
                )}
                {n.message}
              </p>

              {!n.isRead && (
                <button
                  onClick={() => markRead(n.id)}
                  className='shrink-0 text-sm text-stone-500 underline-offset-4 hover:text-stone-800 hover:underline'
                >
                  <T k='admin.markRead' />
                </button>
              )}
            </div>

            {n.order && (
              <p className='mt-1 text-sm text-stone-500'>
                <T k='admin.selectedFurniture' />{' '}
                <span className='text-stone-800'>
                  {n.order.furniture.name}
                </span>{' '}
                · <T k='admin.orderDate' />{' '}
                <span className='text-stone-800'>
                  {new Date(n.order.createdAt).toLocaleDateString(
                    language === 'am' ? 'am-ET' : undefined,
                  )}
                </span>{' '}
                · <T k='admin.client' />{' '}
                <a
                  href={`tel:${n.order.customerPhone}`}
                  className='text-wood-700 hover:underline'
                >
                  {n.order.customerName} ({n.order.customerPhone})
                </a>
              </p>
            )}
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
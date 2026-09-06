'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PackageSearch, Search } from 'lucide-react'
import Container from '@/components/Container'
import { api } from '@/lib/api'

type Order = {
  id: number
  customerName: string
  customerPhone: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  furniture: { name: string; price: string | number }
}

const statusStyles: Record<Order['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function OrderHistoryPage() {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return

    setLoading(true)
    setSearched(true)
    setError('')
    setOrders(null)

    try {
      const data = await api<Order[]>(`/orders/lookup?phone=${encodeURIComponent(phone)}`)
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='pt-32 pb-24'>
      <Container>
        <div className='mx-auto max-w-2xl text-center'>
          <PackageSearch size={40} className='mx-auto text-stone-300' />
          <h1 className='mt-4 text-3xl font-light tracking-wide'>
            Track Your Orders
          </h1>
          <p className='mt-2 text-sm text-gray-500'>
            Enter the phone number you used when placing your order to see
            its current status.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row'
        >
          <input
            type='tel'
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder='09XXXXXXXX'
            className='flex-1 border border-gray-300 px-4 py-3 focus:outline-none focus:border-black'
          />
          <button
            type='submit'
            disabled={loading}
            className='flex items-center justify-center gap-2 bg-stone-900 px-6 py-3 text-sm tracking-wide text-white transition-colors hover:bg-stone-700 disabled:opacity-50'
          >
            <Search size={16} />
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        {error && (
          <p className='mx-auto mt-6 max-w-md rounded border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600'>
            {error}
          </p>
        )}

        {searched && !loading && !error && (
          <div className='mx-auto mt-12 max-w-3xl'>
            {orders === null ? (
              <p className='text-center text-gray-500'>Loading…</p>
            ) : orders.length === 0 ? (
              <div className='py-12 text-center'>
                <p className='text-gray-500'>
                  No orders found for this phone number.
                </p>
                <Link
                  href='/order'
                  className='mt-6 inline-block bg-stone-900 px-8 py-3 text-sm tracking-wide text-white transition-colors hover:bg-stone-700'
                >
                  Place an Order
                </Link>
              </div>
            ) : (
              <ul className='divide-y divide-gray-200 border border-gray-200 bg-white shadow-sm'>
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className='flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div>
                      <p className='text-sm font-medium'>
                        Order #{order.id}
                        <span className='ml-2 text-gray-400'>
                          {formatDate(order.createdAt)}
                        </span>
                      </p>
                      <p className='text-sm text-gray-600'>
                        {order.furniture.name} ·{' '}
                        {Number(order.furniture.price).toLocaleString()} ETB
                      </p>
                    </div>
                    <span
                      className={`self-start px-2 py-1 rounded text-xs sm:self-auto ${statusStyles[order.status]}`}
                    >
                      {order.status.toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Container>
    </section>
  )
}

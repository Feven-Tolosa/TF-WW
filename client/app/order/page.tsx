'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import { Check, Minus, PackageSearch, Plus } from 'lucide-react'
import Container from '@/components/Container'
import { furnitures } from '@/data/furnitures'
import { api } from '@/lib/api'
import { Localized, T, useLanguage } from '@/lib/i18n'

type CatalogItem = {
  id: string | number
  name: string
  price: string | number
  imageUrl?: string | null
}

type Product = {
  id: number
  name: string
  price: string | number
  imageUrl?: string | null
}

function OrderPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = searchParams.get('productId')

  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  // Load the catalog so the customer can choose any product
  useEffect(() => {
    api<CatalogItem[]>('/furniture')
      .then(setCatalog)
      .catch(() => setCatalog(furnitures))
      .finally(() => setCatalogLoading(false))
  }, [])

  const catalogList = useMemo<CatalogItem[]>(
    () => (catalog.length > 0 ? catalog : (furnitures as unknown as CatalogItem[])),
    [catalog],
  )

  // Resolve the selected product from the URI, or fall back to the first item
  useEffect(() => {
    if (catalogList.length === 0) return

    const match = productId
      ? catalogList.find((item) => String(item.id) === String(productId))
      : undefined

    const target = match ?? catalogList[0]
    setProduct({
      id: Number(target.id),
      name: target.name,
      price: target.price,
      imageUrl: target.imageUrl,
    })
    setLoading(false)
  }, [catalogList, productId])

  const selectProduct = (id: string | number) => {
    const item = catalogList.find((c) => String(c.id) === String(id))
    if (!item) return
    setProduct({
      id: Number(item.id),
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    })
    setOrderId(null)
    setError('')
    router.replace(`/order?productId=${item.id}`, { scroll: false })
  }

  const clampQty = (value: number) =>
    Math.max(1, Math.min(Math.round(value) || 1, 100))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    setSubmitting(true)
    setError('')

    try {
      const order = await api<{ id: number; quantity?: number }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          customerPhone,
          furnitureId: product.id,
          quantity: clampQty(quantity),
        }),
      })
      setOrderId(order.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || catalogLoading && catalogList.length === 0) {
    return (
      <div className='pt-40 text-center text-gray-500'>
        <T k='order.loading' />
      </div>
    )
  }

  if (!product) {
    return (
      <div className='pt-40 text-center'>
        <p>
          <T k='order.noProducts' />
        </p>
        <Link
          href='/collections'
          className='mt-6 inline-block bg-stone-900 px-8 py-3 text-sm tracking-wide text-white hover:bg-stone-700'
        >
          <T k='order.browse' />
        </Link>
      </div>
    )
  }

  const total = Number(product.price) * clampQty(quantity)

  let content

  if (orderId) {
    content = (
      <div className='mx-auto max-w-md text-center'>
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-wood-100 text-wood-700'>
          <Check size={32} />
        </div>
        <h1 className='mt-6 text-3xl font-light tracking-wide'>
          <T k='order.success' values={{ id: orderId }} />
        </h1>
        <p className='mt-2 text-gray-600'>
          <T
            k='order.thanks'
            values={{
              name: customerName || t('order.friend'),
              phone: customerPhone,
              items:
                clampQty(quantity) > 1
                  ? t('order.items', { n: clampQty(quantity) })
                  : t('order.yourOrder'),
            }}
          />
        </p>
        <div className='mt-8 space-x-4'>
          <Link
            href='/order-history'
            className='inline-block bg-stone-900 px-8 py-3 text-sm tracking-wide text-white transition-colors hover:bg-stone-700'
          >
            <T k='order.track' />
          </Link>
          <Link
            href={'/'}
            className='inline-block border border-stone-300 px-8 py-3 text-sm tracking-wide text-stone-900 transition-colors hover:border-stone-900'
          >
            <T k='order.continue' />
          </Link>
        </div>
      </div>
    )
  } else {
    content = (
      <>
        {/* Product selector */}
        <div className='mx-auto mb-16 max-w-2xl text-center'>
          <p className='mb-3 flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-wood-700'>
            <span className='h-px w-10 bg-wood-400' />
            <T k='order.eyebrow' />
            <span className='h-px w-10 bg-wood-400' />
          </p>
          <h1 className='text-3xl font-light tracking-wide md:text-4xl'>
            <T k='order.title' />
          </h1>
          <p className='mt-3 text-gray-600'>
            <T k='order.description' />
          </p>
        </div>

        <div className='grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16'>
          {/* Product image + selector */}
          <div>
            <div className='relative aspect-[4/3] overflow-hidden bg-stone-100'>
              <Image
                src={product.imageUrl || '/images/1.png'}
                alt={product.name}
                fill
                priority
                className='object-cover'
              />
            </div>

            <div className='mt-6'>
              <label className='mb-2 block text-xs font-medium uppercase tracking-widest text-gray-500'>
                <T k='order.choose' />
              </label>
              <select
                value={String(product.id)}
                onChange={(e) => selectProduct(e.target.value)}
                className='w-full border border-stone-300 bg-white px-4 py-3 text-sm focus:border-stone-900 focus:outline-none'
              >
                {catalogList.map((item) => (
                  <option key={String(item.id)} value={String(item.id)}>
                    <Localized text={item.name} /> — ETB{' '}
                    {Number(item.price).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Order details + form */}
          <div>
            <h2 className='text-2xl font-light tracking-wide'>
              <Localized text={product.name} />
            </h2>
            <p className='mt-1 text-sm text-gray-500'>
              <T k='order.finished' />
            </p>

            <div className='mt-6 flex items-end gap-3'>
              <div>
                <p className='text-xs uppercase tracking-widest text-gray-500'>
                  <T k='order.unitPrice' />
                </p>
                <p className='text-xl text-stone-900'>
                  ETB {Number(product.price).toLocaleString()}
                </p>
              </div>
              <p className='ml-auto text-right'>
                <span className='text-xs uppercase tracking-widest text-gray-500'>
                  <T k='order.total' />
                </span>
                <span className='block text-2xl font-medium text-wood-700'>
                  ETB {total.toLocaleString()}
                </span>
              </p>
            </div>

            {error && (
              <p className='mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600'>
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
              {/* Quantity */}
              <div>
                <label className='mb-2 block text-xs font-medium uppercase tracking-widest text-gray-500'>
                  <T k='order.quantity' />
                </label>
                <div className='inline-flex items-center border border-stone-300'>
                  <button
                    type='button'
                    aria-label={t('order.decrease')}
                    onClick={() => setQuantity((q) => clampQty(q - 1))}
                    className='flex h-11 w-11 items-center justify-center text-stone-600 transition-colors hover:bg-stone-100'
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type='number'
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(clampQty(Number(e.target.value)))
                    }
                    className='w-16 border-x border-stone-300 py-2 text-center focus:outline-none'
                  />
                  <button
                    type='button'
                    aria-label={t('order.increase')}
                    onClick={() => setQuantity((q) => clampQty(q + 1))}
                    className='flex h-11 w-11 items-center justify-center text-stone-600 transition-colors hover:bg-stone-100'
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className='mb-2 block text-xs font-medium uppercase tracking-widest text-gray-500'>
                  <T k='order.fullName' />
                </label>
                <input
                  type='text'
                  required
                  placeholder={t('order.yourName')}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className='w-full border border-stone-300 px-4 py-3 focus:border-stone-900 focus:outline-none'
                />
              </div>

              <div>
                <label className='mb-2 block text-xs font-medium uppercase tracking-widest text-gray-500'>
                  <T k='order.phone' />
                </label>
                <input
                  type='tel'
                  required
                  placeholder='09XXXXXXXX'
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className='w-full border border-stone-300 px-4 py-3 focus:border-stone-900 focus:outline-none'
                />
              </div>

              <button
                type='submit'
                disabled={submitting}
                className='w-full bg-stone-900 py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-wood-700 disabled:opacity-50'
              >
                {submitting
                  ? t('order.placing')
                  : t('order.confirm', { total: total.toLocaleString() })}
              </button>

              <p className='text-center text-xs text-gray-400'>
                <T k='order.note' />
              </p>
            </form>
          </div>
        </div>

        {/* Track order link */}
        <div className='mx-auto mt-20 flex max-w-2xl flex-col items-center gap-3 rounded-lg border border-wood-200 bg-wood-50 px-8 py-8 text-center'>
          <PackageSearch size={28} className='text-wood-700' />
          <p className='font-medium text-stone-900'>
            <T k='order.already' />
          </p>
          <p className='text-sm text-gray-600'>
            <T k='order.lookup' />
          </p>
          <Link
            href='/order-history'
            className='mt-2 inline-block border border-stone-900 px-8 py-3 text-sm font-medium uppercase tracking-widest text-stone-900 transition-colors hover:bg-stone-900 hover:text-white'
          >
            <T k='order.track' />
          </Link>
        </div>
      </>
    )
  }

  return (
    <section className='py-24 md:py-28'>
      <Container>{content}</Container>
    </section>
  )
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className='pt-40 text-center'>
          <T k='common.loading' />
        </div>
      }
    >
      <OrderPageContent />
    </Suspense>
  )
}

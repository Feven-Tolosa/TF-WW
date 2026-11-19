'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import CollectionsView from '@/components/CollectionsView'
import { api } from '@/lib/api'
import { furnitures } from '@/data/furnitures'
import { getWishlist, WISHLIST_EVENT } from '@/lib/wishlist'
import { T } from '@/lib/i18n'

type ApiFurniture = {
  id: number
  name: string
  description: string
  price: string | number
  imageUrl?: string | null
  category?: { name: string } | null
}

type WishlistItem = (typeof furnitures)[number]

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[] | null>(null)

  useEffect(() => {
    const load = () => {
      const ids = getWishlist()
      if (ids.length === 0) {
        setItems([])
        return
      }

      // Try live data from the API, fall back to bundled samples
      api<ApiFurniture[]>('/furniture')
        .then((all) => {
          setItems(
            all
              .filter((item) => ids.includes(String(item.id)))
              .map((item) => ({
                id: String(item.id),
                name: item.name,
                price: Number(item.price),
                category: item.category?.name?.toLowerCase() ?? 'other',
                image: item.imageUrl || '/images/1.png',
                description: item.description,
              })),
          )
        })
        .catch(() => {
          setItems(furnitures.filter((item) => ids.includes(item.id)))
        })
    }

    load()
    window.addEventListener(WISHLIST_EVENT, load)
    return () => window.removeEventListener(WISHLIST_EVENT, load)
  }, [])

  return (
    <section className='pb-24'>
      <div className='mt-5'>
        {items === null ? (
          <p className='py-24 text-center text-gray-500'>
            <T k='common.loading' />
          </p>
        ) : items.length === 0 ? (
          <div className='flex flex-col items-center gap-4 py-24 text-center'>
            <Heart size={40} className='text-stone-300' />
            <p className='text-gray-500'>
              <T k='wishlist.empty' />
            </p>
            <Link
              href='/collections'
              className='bg-stone-900 px-8 py-3 text-sm tracking-wide text-white transition-colors hover:bg-stone-700'
            >
              <T k='order.browse' />
            </Link>
          </div>
        ) : (
          <CollectionsView items={items} />
        )}
      </div>
    </section>
  )
}

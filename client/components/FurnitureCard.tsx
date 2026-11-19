'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { isInWishlist, toggleWishlist, WISHLIST_EVENT } from '@/lib/wishlist'
import { Localized, T, useLanguage } from '@/lib/i18n'

interface FurnitureCardProps {
  name: string
  image?: string
  price?: number
  href?: string
}

export default function FurnitureCard({
  name,
  image = '/images/1.png',
  price = 0,
  href,
}: FurnitureCardProps) {
  const id = href?.split('/').pop() ?? ''
  const [liked, setLiked] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const sync = () => setLiked(isInWishlist(id))
    sync()
    window.addEventListener(WISHLIST_EVENT, sync)
    return () => window.removeEventListener(WISHLIST_EVENT, sync)
  }, [id])

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(toggleWishlist(id))
  }

  return (
    <div className='group'>
      <Link
        href={href ?? '#'}
        className='relative block aspect-[4/5] overflow-hidden bg-wood-100'
      >
        <Image
          src={image}
          alt={name}
          fill
          sizes='(max-width: 768px) 100vw, 33vw'
          className='object-cover transition-transform duration-700 ease-out group-hover:scale-105'
        />

        {/* Quick actions */}
        <div className='absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-3 bg-gradient-to-t from-black/60 to-transparent p-5 transition-transform duration-500 ease-out group-hover:translate-y-0'>
          <span className='flex items-center gap-2 bg-white px-6 py-3 text-xs font-medium uppercase tracking-widest text-stone-900 transition-colors hover:bg-stone-900 hover:text-white'>
            <ShoppingBag size={14} />
            <T k='card.addToCart' />
          </span>
          <button
            aria-label={liked ? t('card.removeWishlist') : t('card.addWishlist')}
            onClick={handleLike}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              liked
                ? 'bg-red-500 text-white'
                : 'bg-white text-stone-900 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Persistent wishlist indicator (visible without hover) */}
        {liked && (
          <span className='absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow'>
            <Heart size={14} fill='currentColor' />
          </span>
        )}
      </Link>

      <div className='flex items-start justify-between gap-4 pt-4'>
        <div>
          <h3 className='text-sm font-medium tracking-wide text-stone-900'>
            <Link href={href ?? '#'} className='hover:text-wood-700'>
              <Localized text={name} />
            </Link>
          </h3>
          <p className='mt-1 text-xs uppercase tracking-widest text-stone-400'>
            <T k='card.solidWood' />
          </p>
        </div>
        {price > 0 && (
          <p className='text-sm font-medium text-wood-800'>
            ETB {price.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Loader2, Search, SearchX, X } from 'lucide-react'
import {
  categoryFilters,
  formatPrice,
  getFurniture,
  type Furniture,
} from '@/lib/store'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [items, setItems] = useState<Furniture[]>([])
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      getFurniture().then((data) => {
        setItems(data)
        setLoading(false)
      })
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesCategory =
        category === 'all' || item.category === category
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [items, query, category])

  const resultCount = results.length
  const showEmpty = !loading && resultCount === 0 && (query || category !== 'all')

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label='Search furniture'
      className={`fixed inset-0 z-[100] flex flex-col bg-stone-950/95 backdrop-blur-sm transition-opacity duration-300 ${
        open ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      {/* Top bar */}
      <div className='border-b border-white/10'>
        <div className='mx-auto flex w-full max-w-4xl items-center gap-4 px-6 py-6 md:py-8'>
          <Search size={22} className='shrink-0 text-white/40' />
          <input
            ref={inputRef}
            value={query}
            autoFocus={open}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search chairs, tables, beds…'
            className='w-full bg-transparent text-xl font-light text-white outline-none transition-colors placeholder:text-white/30 focus:text-white md:text-3xl'
          />
          <button
            onClick={onClose}
            aria-label='Close search'
            className='flex h-10 w-10 shrink-0 items-center justify-center text-white/60 transition-colors hover:text-white'
          >
            <X size={26} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className='flex-1 overflow-y-auto'>
        <div className='mx-auto w-full max-w-4xl px-6 pb-16'>
          {/* Category filters */}
          <div className='flex flex-wrap gap-2 pt-6'>
            {categoryFilters.map((chip) => (
              <button
                key={chip.value}
                onClick={() => setCategory(chip.value)}
                className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-all duration-200 ${
                  category === chip.value
                    ? 'border-wood-400 bg-wood-700 text-white'
                    : 'border-white/15 text-white/50 hover:border-white/40 hover:text-white'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Count */}
          {!loading && (
            <p className='mt-6 text-xs uppercase tracking-widest text-white/30'>
              {showEmpty
                ? '0 results'
                : resultCount === 1
                  ? '1 result'
                  : `${resultCount} results`}
            </p>
          )}

          {/* Results */}
          {loading ? (
            <div className='flex items-center justify-center gap-3 py-24 text-white/40'>
              <Loader2 size={20} className='animate-spin' />
              <span className='text-sm uppercase tracking-widest'>
                Loading…
              </span>
            </div>
          ) : showEmpty ? (
            <div className='flex flex-col items-center gap-4 py-24 text-center text-white/40'>
              <SearchX size={44} />
              <p className='text-sm tracking-wide'>
                No furniture matches{' '}
                {query ? <span className='text-white/70'>“{query}”</span> : ''}{' '}
                {category !== 'all' ? `in ${category}` : ''}.
              </p>
              <button
                onClick={() => {
                  setQuery('')
                  setCategory('all')
                }}
                className='text-xs uppercase tracking-widest text-wood-300 underline-offset-4 hover:underline'
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className='mt-4 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3'>
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  onClick={onClose}
                  className='group'
                >
                  <div className='relative aspect-[4/5] overflow-hidden bg-wood-100'>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes='(max-width: 768px) 100vw, 33vw'
                      className='object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                    />
                    <span className='absolute top-3 left-3 bg-white/90 px-2.5 py-1 text-[10px] uppercase tracking-widest text-stone-700 backdrop-blur'>
                      {item.category}
                    </span>
                  </div>
                  <div className='flex items-start justify-between gap-4 pt-3'>
                    <div className='min-w-0'>
                      <h3 className='truncate text-sm font-medium tracking-wide text-white group-hover:text-wood-300'>
                        {item.name}
                      </h3>
                      <p className='mt-1 line-clamp-1 text-xs text-white/35'>
                        {item.description}
                      </p>
                    </div>
                    <span className='flex shrink-0 items-center gap-1 text-sm font-medium text-wood-300'>
                      {formatPrice(item.price)}
                      <ArrowRight
                        size={14}
                        className='opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

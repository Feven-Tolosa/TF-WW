'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import FurnitureCard from './FurnitureCard'
import Container from './Container'
import type { Furniture } from '@/data/furnitures'

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name'

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
]

interface Props {
  items: Furniture[]
}

export default function CollectionsView({ items }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [sort, setSort] = useState<SortKey>('featured')

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    items.forEach((item) => {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
    })
    return [
      { key: 'all', label: 'All', count: items.length },
      ...Array.from(counts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, count]) => ({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          count,
        })),
    ]
  }, [items])

  const visibleItems = useMemo(() => {
    const filtered =
      activeCategory === 'all'
        ? [...items]
        : items.filter((item) => item.category === activeCategory)

    switch (sort) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price)
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return filtered
    }
  }, [items, activeCategory, sort])

  const activeLabel =
    categories.find((c) => c.key === activeCategory)?.label ?? 'All'

  return (
    <section className='pt-32 pb-24'>
      <Container>
        {/* Header */}
        <div className='mb-12 max-w-2xl'>
          <p className='mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-wood-600'>
            <span className='h-px w-8 bg-wood-400' />
            The Catalogue
          </p>
          <h1 className='text-4xl font-light tracking-tight text-stone-900 md:text-5xl'>
            Our Collections
          </h1>
          <p className='mt-4 leading-relaxed text-stone-600'>
            Every piece is made to order in our workshop from responsibly
            sourced solid wood. Browse by category or explore the full range.
          </p>
        </div>

        {/* Toolbar */}
        <div className='sticky top-20 z-30 -mx-6 mb-10 border-y border-stone-200 bg-background/90 px-6 py-4 backdrop-blur-md'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            {/* Category chips */}
            <div className='no-scrollbar flex items-center gap-2 overflow-x-auto'>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-medium uppercase tracking-widest transition-all duration-300 ${
                    activeCategory === cat.key
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                  }`}
                >
                  {cat.label}
                  <span
                    className={`ml-2 ${activeCategory === cat.key ? 'text-white/50' : 'text-stone-400'}`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className='flex shrink-0 items-center justify-between gap-4 lg:justify-end'>
              <span className='hidden text-xs uppercase tracking-widest text-stone-400 sm:flex sm:items-center sm:gap-2'>
                <SlidersHorizontal size={13} />
                {visibleItems.length} {visibleItems.length === 1 ? 'Piece' : 'Pieces'}
              </span>

              <label className='relative flex items-center'>
                <span className='sr-only'>Sort products</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className='cursor-pointer appearance-none border border-stone-300 bg-white py-2.5 pl-4 pr-10 text-xs uppercase tracking-widest text-stone-700 outline-none transition-colors hover:border-stone-400 focus:border-wood-500'
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className='pointer-events-none absolute right-3.5 text-stone-500'
                />
              </label>
            </div>
          </div>
        </div>

        {/* Grid */}
        {visibleItems.length > 0 ? (
          <div className='grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {visibleItems.map((item, index) => (
              <div
                key={item.id}
                className='animate-revealUp'
                style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
              >
                <FurnitureCard
                  name={item.name}
                  price={item.price}
                  image={item.image}
                  href={`/product/${item.id}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className='border border-dashed border-stone-300 py-24 text-center'>
            <p className='text-lg font-light text-stone-500'>
              No pieces found in {activeLabel}.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className='mt-4 text-sm uppercase tracking-widest text-wood-700 underline underline-offset-4 hover:text-wood-900'
            >
              View all collections
            </button>
          </div>
        )}
      </Container>
    </section>
  )
}

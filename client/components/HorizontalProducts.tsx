'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import FurnitureCard from './FurnitureCard'
import Container from './Container'

interface Props {
  items: {
    id: string
    name: string
    price: number
    image: string
  }[]
  title?: string
}

export default function HorizontalProducts({ items, title = 'Explore the Collection' }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let animationFrame: number
    const scrollSpeed = paused ? 0 : 0.5

    const autoScroll = () => {
      container.scrollLeft += scrollSpeed

      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0
      }

      animationFrame = requestAnimationFrame(autoScroll)
    }

    animationFrame = requestAnimationFrame(autoScroll)

    return () => cancelAnimationFrame(animationFrame)
  }, [paused])

  const duplicatedItems = [...items, ...items]

  return (
    <section className='py-20 md:py-28'>
      <Container>
        <div className='mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-wood-600'>
              <span className='h-px w-8 bg-wood-400' />
              Handpicked for You
            </p>
            <h2 className='text-3xl font-light tracking-tight text-stone-900 md:text-4xl'>
              {title}
            </h2>
          </div>

          <Link
            href='/collections'
            className='group inline-flex w-fit items-center gap-2 border-b border-stone-300 pb-1 text-sm uppercase tracking-widest text-stone-600 transition-colors hover:border-wood-600 hover:text-wood-700'
          >
            View All
            <ArrowRight
              size={14}
              className='transition-transform duration-300 group-hover:translate-x-1'
            />
          </Link>
        </div>
      </Container>

      <div
        ref={scrollRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className='no-scrollbar flex gap-6 overflow-x-scroll px-6 lg:px-[max(1.5rem,calc((100vw-1400px)/2+1.5rem))]'
      >
        {duplicatedItems.map((item, index) => (
          <div key={`${item.id}-${index}`} className='min-w-[260px] md:min-w-[300px]'>
            <FurnitureCard
              name={item.name}
              image={item.image}
              price={item.price}
              href={`/furniture/${item.id}`}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { T, useLanguage, type TranslationKey } from '@/lib/i18n'

const categories: {
  key: TranslationKey
  name: string
  tagline: TranslationKey
  image: string
  href: string
  className: string
}[] = [
  {
    key: 'category.sofas',
    name: 'Sofas',
    tagline: 'shop.tag1',
    image: '/images/3.png',
    href: '/category/sofas',
    className: 'md:col-span-12 h-[320px] md:h-[440px]',
  },
  {
    key: 'category.tables',
    name: 'Tables',
    tagline: 'shop.tag2',
    image: '/images/4.png',
    href: '/category/tables',
    className: 'md:col-span-4 h-[280px] md:h-[340px]',
  },
  {
    key: 'category.dining',
    name: 'Dining',
    tagline: 'shop.tag3',
    image: '/images/2.png',
    href: '/category/dining',
    className: 'md:col-span-8 h-[280px] md:h-[340px]',
  },
  {
    key: 'category.chairs',
    name: 'Chairs',
    tagline: 'shop.tag4',
    image: '/images/1.png',
    href: '/category/chairs',
    className: 'md:col-span-8 h-[280px] md:h-[340px]',
  },
  {
    key: 'category.kitchen',
    name: 'Kitchen',
    tagline: 'shop.tag5',
    image: '/images/3.png',
    href: '/category/kitchen',
    className: 'md:col-span-4 h-[280px] md:h-[340px]',
  },
]

export default function ShopByCategory() {
  const { t } = useLanguage()

  return (
    <section className='bg-wood-50 py-20 md:py-28'>
      <div className='mx-auto max-w-[1400px] px-6'>
        {/* Header */}
        <div className='mb-14 text-center'>
          <p className='mb-3 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-wood-600'>
            <span className='h-px w-8 bg-wood-400' />
            <T k='shop.eyebrow' />
            <span className='h-px w-8 bg-wood-400' />
          </p>
          <h2 className='text-3xl font-light tracking-tight text-stone-900 md:text-5xl'>
            <T k='shop.title' />
          </h2>
        </div>

        {/* Mosaic */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6'>
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              className={`group relative overflow-hidden ${cat.className}`}
            >
              <Image
                src={cat.image}
                alt={t(cat.key)}
                fill
                sizes='(max-width: 768px) 100vw, 66vw'
                className='object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105'
              />

              {/* Gradient overlay */}
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-colors duration-500 group-hover:from-black/80' />

              {/* Label */}
              <div className='absolute inset-x-0 bottom-0 flex items-end justify-between p-6 md:p-8'>
                <div>
                  <h3 className='text-2xl font-light tracking-wide text-white md:text-3xl'>
                    <T k={cat.key} />
                  </h3>
                  <span className='mt-1 block max-h-0 overflow-hidden text-sm tracking-widest text-white/70 uppercase transition-all duration-500 group-hover:max-h-10'>
                    <T k={cat.tagline} />
                  </span>
                </div>

                <span className='flex h-11 w-11 shrink-0 translate-y-2 items-center justify-center rounded-full border border-white/40 text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-hover:bg-white group-hover:text-stone-900'>
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import FurnitureCard from '@/components/FurnitureCard'
import Hero from '@/components/Hero'
import HorizontalProducts from '@/components/HorizontalProducts'
import ShopByCategory from '@/components/ShopByCategory'
import WhyChooseUs from '@/components/WhyChooseUs'
import { furnitures } from '@/data/furnitures'

type CatalogItem = (typeof furnitures)[number]

type ApiFurniture = {
  id: number
  name: string
  description: string
  price: string | number
  imageUrl?: string | null
  available?: boolean
  category?: { name: string } | null
}

const categoryChips = [
  { label: 'Chairs', href: '/category/chairs' },
  { label: 'Tables', href: '/category/tables' },
  { label: 'Sofas', href: '/category/sofas' },
  { label: 'Dining', href: '/category/dining' },
  { label: 'Beds', href: '/category/beds' },
  { label: 'Kitchen', href: '/category/kitchen' },
]

async function getCatalog(): Promise<CatalogItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/furniture`,
      { cache: 'no-store' }
    )
    if (!res.ok) throw new Error('API unavailable')

    const data: ApiFurniture[] = await res.json()
    if (!Array.isArray(data) || data.length === 0) return furnitures

    const mapped = data.map((item) => ({
      id: String(item.id),
      name: item.name,
      price: Number(item.price),
      category: item.category?.name?.toLowerCase() ?? 'other',
      image: item.imageUrl || '/images/1.png',
      description: item.description,
    }))

    // Prefer available pieces first, then newest
    const available = mapped.filter((_, i) => data[i].available !== false)
    return available.length > 0 ? available : mapped
  } catch {
    // Backend offline → bundled sample collection
    return furnitures
  }
}

export default async function Home() {
  const catalog = await getCatalog()
  const featured = catalog.slice(0, 4)
  const newArrivals = catalog.slice(4, 12)

  return (
    <>
      <Hero />

      {/* Category quick nav */}
      <section className='border-y border-stone-200 bg-stone-50'>
        <div className='mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-3 px-6 py-6'>
          <span className='mr-2 text-xs font-medium uppercase tracking-[0.3em] text-stone-400'>
            Browse
          </span>
          {categoryChips.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className='rounded-full border border-stone-300 px-5 py-2 text-sm text-stone-600 transition-all duration-300 hover:border-wood-500 hover:bg-white hover:text-wood-700'
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className='py-20 md:py-28'>
        <div className='mx-auto max-w-[1400px] px-6'>
          <div className='mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
            <div>
              <p className='mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-wood-600'>
                <span className='h-px w-8 bg-wood-400' />
                Best Sellers
              </p>
              <h2 className='text-3xl font-light tracking-tight text-stone-900 md:text-4xl'>
                Featured Pieces
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

          <div className='grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4'>
            {featured.map((item) => (
              <FurnitureCard
                key={item.id}
                name={item.name}
                price={item.price}
                image={item.image}
                href={`/product/${item.id}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Auto-scrolling collection */}
      <HorizontalProducts items={catalog} />

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className='bg-stone-50 py-20 md:py-28'>
          <div className='mx-auto max-w-[1400px] px-6'>
            <div className='mb-12'>
              <p className='mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-wood-600'>
                <span className='h-px w-8 bg-wood-400' />
                Fresh From The Workshop
              </p>
              <h2 className='text-3xl font-light tracking-tight text-stone-900 md:text-4xl'>
                New Arrivals
              </h2>
            </div>

            <div className='grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4'>
              {newArrivals.map((item) => (
                <FurnitureCard
                  key={item.id}
                  name={item.name}
                  price={item.price}
                  image={item.image}
                  href={`/product/${item.id}`}
                />
              ))}
            </div>

            <div className='mt-14 text-center'>
              <Link
                href='/collections'
                className='inline-flex items-center gap-3 bg-stone-900 px-10 py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors duration-300 hover:bg-wood-600'
              >
                Explore Full Collection
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <ShopByCategory />

      <WhyChooseUs />

      {/* CTA banner */}
      <section className='relative overflow-hidden'>
        <div className='relative h-[420px] md:h-[480px]'>
          <Image
            src='/images/3.png'
            alt='Custom furniture workshop'
            fill
            sizes='100vw'
            className='object-cover'
          />
          <div className='absolute inset-0 bg-stone-950/70' />

          <div className='relative flex h-full flex-col items-center justify-center px-6 text-center'>
            <p className='mb-4 text-xs font-medium uppercase tracking-[0.3em] text-wood-300'>
              Made Just for You
            </p>
            <h2 className='max-w-2xl text-3xl font-light tracking-tight text-white md:text-5xl'>
              Have a piece in mind? We build it to order.
            </h2>
            <p className='mt-4 max-w-xl text-sm leading-relaxed text-white/70 md:text-base'>
              From bespoke dining tables to full living-room sets — tell us
              your vision and our craftsmen will bring it to life. No account
              needed — just call or leave your name and number.
            </p>
            <div className='mt-8 flex flex-col items-center gap-4 sm:flex-row'>
              <Link
                href='/order'
                className='inline-flex items-center gap-3 bg-white px-8 py-4 text-sm font-medium uppercase tracking-widest text-stone-900 transition-colors duration-300 hover:bg-wood-400 hover:text-white'
              >
                Start an Order
                <ArrowRight size={15} />
              </Link>
              <a
                href='tel:+251900000000'
                className='inline-flex items-center gap-3 border border-white/40 px-8 py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors duration-300 hover:border-wood-300 hover:text-wood-300'
              >
                Call +251 900 000 000
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

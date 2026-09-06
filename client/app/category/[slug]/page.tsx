import Image from 'next/image'
import Container from '@/components/Container'
import FurnitureCard from '@/components/FurnitureCard'
import { furnitures } from '@/data/furnitures'

interface Props {
  params: {
    slug?: string
  }
}

type ApiFurniture = {
  id: number
  name: string
  description: string
  price: string | number
  imageUrl?: string | null
  available?: boolean
  category?: { name: string } | null
}

async function getProducts(slug: string) {
  let items = furnitures.filter(
    (item) =>
      item.category && item.category.toLowerCase() === slug.toLowerCase(),
  )

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/furniture`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const data: ApiFurniture[] = await res.json()
      if (data.length > 0) {
        const mapped = data
          .filter(
            (item) =>
              item.category?.name &&
              item.category.name.toLowerCase() === slug.toLowerCase() &&
              item.available !== false
          )
          .map((item) => ({
            id: String(item.id),
            name: item.name,
            price: Number(item.price),
            category: item.category?.name?.toLowerCase() ?? 'other',
            image: item.imageUrl || '/images/1.png',
            description: item.description,
          }))
        if (mapped.length > 0) items = mapped
      }
    }
  } catch {
    // Backend offline → keep bundled sample data
  }

  return items
}

export default async function CategoryPage({ params }: Props) {
  const slug = params?.slug
  if (!slug) {
    return <div className='pt-40 text-center'>Invalid category</div>
  }
  const products = await getProducts(slug)

  if (products.length === 0) {
    return <div className='pt-40 text-center'>Category not found</div>
  }

  const categoryTitle = slug.charAt(0).toUpperCase() + slug.slice(1)

  return (
    <section className='pt-28 pb-24'>
      {/* Category Hero */}
      <div className='relative h-[300px] mb-16'>
        <Image
          src='/images/3.png'
          alt={categoryTitle}
          fill
          className='object-cover'
        />

        <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
          <h1 className='text-white text-4xl md:text-5xl font-light tracking-wide'>
            {categoryTitle}
          </h1>
        </div>
      </div>

      <Container>
        {/* Description + Count */}
        <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-12 gap-4'>
          <p className='text-gray-600 max-w-xl'>
            Discover our curated collection of {categoryTitle.toLowerCase()}
            designed to bring warmth and elegance into your space.
          </p>

          <span className='text-sm text-gray-500'>
            {products.length} Products
          </span>
        </div>

        {/* Sort Dropdown (UI only for now) */}
        <div className='mb-12'>
          <select className='border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-black'>
            <option>Sort by</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10'>
          {products.map((item) => (
            <FurnitureCard
              key={item.id}
              name={item.name}
              price={item.price}
              image={item.image}
              href={`/product/${item.id}`}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}

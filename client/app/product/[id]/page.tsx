import Image from 'next/image'
import Container from '@/components/Container'
import FurnitureCard from '@/components/FurnitureCard'
import Link from 'next/link'
import { furnitures } from '@/data/furnitures'

type StaticFurniture = (typeof furnitures)[number]

type ApiFurniture = {
  id: number
  name: string
  description: string
  price: string | number
  imageUrl?: string | null
  available?: boolean
  category?: { name: string } | null
}

async function getProduct(
  id: string
): Promise<StaticFurniture | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/furniture/${id}`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const item: ApiFurniture = await res.json()
      return {
        id: String(item.id),
        name: item.name,
        price: Number(item.price),
        category: item.category?.name?.toLowerCase() ?? 'other',
        image: item.imageUrl || '/images/1.png',
        description: item.description,
      }
    }
  } catch {
    // Backend offline → fall through to bundled data
  }

  return furnitures.find((item) => item.id === id) ?? null
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return <div className='pt-40 text-center'>Product not found</div>
  }

  let relatedFurniture = furnitures.filter(
    (item) => item.category === product.category && item.id !== product.id
  )

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/furniture`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const data: ApiFurniture[] = await res.json()
      const mapped = data
        .filter(
          (item) =>
            String(item.id) !== id &&
            item.category?.name &&
            item.category.name.toLowerCase() === product.category &&
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
      if (mapped.length > 0) relatedFurniture = mapped
    }
  } catch {
    // Backend offline → keep bundled related items
  }

  relatedFurniture = relatedFurniture.slice(0, 3)

  return (
    <section className='pt-32 pb-24'>
      <Container>
        {/* Product Info */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
          {/* Image */}
          <div className='relative aspect-[4/5]'>
            <Image
              src={product.image}
              alt={product.name}
              fill
              className='object-cover'
            />
          </div>

          {/* Details */}
          <div>
            <h1 className='text-3xl font-light tracking-wide'>
              {product.name}
            </h1>
            <p className='mt-4 text-xl text-gray-700'>
              ETB {Number(product.price).toLocaleString()}
            </p>
            <p className='mt-6 text-gray-600 leading-relaxed'>
              {product.description}
            </p>

            <Link
              href={`/order?productId=${product.id}`}
              className='mt-10 inline-block bg-stone-900 px-10 py-3 text-sm tracking-wide text-white transition-colors hover:bg-wood-800'
            >
              Order Now
            </Link>
          </div>
        </div>

        {/* Related Furniture */}
        {relatedFurniture.length > 0 && (
          <div className='mt-28'>
            <h2 className='text-2xl font-light mb-10'>You may also like</h2>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8'>
              {relatedFurniture.map((item) => (
                <FurnitureCard
                  key={item.id}
                  name={item.name}
                  price={item.price}
                  image={item.image}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}

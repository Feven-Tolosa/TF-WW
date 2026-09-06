import { Hammer, Leaf, ShieldCheck, Truck } from 'lucide-react'

const features = [
  {
    icon: Leaf,
    title: 'Premium Materials',
    description:
      'Carefully selected solid wood and high-quality fabrics ensure durability and elegance.',
  },
  {
    icon: Hammer,
    title: 'Handmade Craftsmanship',
    description:
      'Each piece is thoughtfully crafted with precision and attention to every detail.',
  },
  {
    icon: Truck,
    title: 'Reliable Delivery',
    description:
      'Safe and timely delivery across the country, handled with care from workshop to home.',
  },
]

const stats = [
  { value: '15+', label: 'Years of Craft' },
  { value: '2,400+', label: 'Pieces Delivered' },
  { value: '98%', label: 'Happy Clients' },
  { value: '5 Yr', label: 'Warranty' },
]

export default function WhyChooseUs() {
  return (
    <section className='py-20 md:py-28'>
      <div className='mx-auto max-w-[1400px] px-6'>
        {/* Header */}
        <div className='mx-auto mb-16 max-w-2xl text-center'>
          <p className='mb-3 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-wood-600'>
            <span className='h-px w-8 bg-wood-400' />
            Why Choose Us
            <span className='h-px w-8 bg-wood-400' />
          </p>
          <h2 className='text-3xl font-light tracking-tight text-stone-900 md:text-4xl'>
            Crafted for Comfort, <span className='italic text-wood-700'>Designed for Life</span>
          </h2>
          <p className='mt-4 leading-relaxed text-stone-600'>
            We believe furniture should feel warm, timeless, and built to last
            for generations.
          </p>
        </div>

        {/* Features */}
        <div className='grid gap-10 md:grid-cols-3 md:gap-8'>
          {features.map((feature) => (
            <div
              key={feature.title}
              className='group border border-stone-200/80 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-wood-200 hover:shadow-[0_24px_48px_-24px_rgba(46,28,19,0.25)]'
            >
              <span className='mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-wood-50 text-wood-700 transition-colors duration-500 group-hover:bg-wood-700 group-hover:text-white'>
                <feature.icon size={20} strokeWidth={1.75} />
              </span>
              <h3 className='mb-3 text-lg font-medium text-stone-900'>
                {feature.title}
              </h3>
              <p className='text-sm leading-relaxed text-stone-600'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className='mt-20 grid grid-cols-2 gap-y-10 border-t border-stone-200 pt-12 md:grid-cols-4'>
          {stats.map((stat) => (
            <div key={stat.label} className='text-center'>
              <p className='text-4xl font-light tracking-tight text-wood-800 md:text-5xl'>
                {stat.value}
              </p>
              <p className='mt-2 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-stone-500'>
                <ShieldCheck size={13} className='text-wood-500' />
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

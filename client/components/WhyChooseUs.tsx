import { Hammer, Leaf, ShieldCheck, Truck } from 'lucide-react'
import { T, type TranslationKey } from '@/lib/i18n'

const features: {
  icon: typeof Leaf
  title: TranslationKey
  description: TranslationKey
}[] = [
  {
    icon: Leaf,
    title: 'why.f1Title',
    description: 'why.f1Description',
  },
  {
    icon: Hammer,
    title: 'why.f2Title',
    description: 'why.f2Description',
  },
  {
    icon: Truck,
    title: 'why.f3Title',
    description: 'why.f3Description',
  },
]

const stats: { value: string; label: TranslationKey }[] = [
  { value: '15+', label: 'why.s1' },
  { value: '2,400+', label: 'why.s2' },
  { value: '98%', label: 'why.s3' },
  { value: '5 Yr', label: 'why.s4' },
]

export default function WhyChooseUs() {
  return (
    <section className='py-20 md:py-28'>
      <div className='mx-auto max-w-[1400px] px-6'>
        {/* Header */}
        <div className='mx-auto mb-16 max-w-2xl text-center'>
          <p className='mb-3 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-wood-600'>
            <span className='h-px w-8 bg-wood-400' />
            <T k='why.eyebrow' />
            <span className='h-px w-8 bg-wood-400' />
          </p>
          <h2 className='text-3xl font-light tracking-tight text-stone-900 md:text-4xl'>
            <T k='why.title1' />{' '}
            <span className='italic text-wood-700'>
              <T k='why.title2' />
            </span>
          </h2>
          <p className='mt-4 leading-relaxed text-stone-600'>
            <T k='why.description' />
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
                <T k={feature.title} />
              </h3>
              <p className='text-sm leading-relaxed text-stone-600'>
                <T k={feature.description} />
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
                <T k={stat.label} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

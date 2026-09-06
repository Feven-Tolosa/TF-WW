'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Container from './Container'

const slides = [
  {
    image: '/images/2.png',
    title: 'Transform Your Space',
    subtitle: 'with Timeless Elegance',
    description:
      'Handcrafted furniture designed for comfort, warmth and style.',
  },
  {
    image: '/images/3.png',
    title: 'Crafted with',
    subtitle: 'Natural Warmth',
    description:
      'Premium solid-wood furniture built to last for generations.',
  },
  {
    image: '/images/4.png',
    title: 'Designed for',
    subtitle: 'Modern Living',
    description:
      'Minimal, elegant and functional collections for every room.',
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)

  const nextSlide = useCallback(
    () => setCurrent((prev) => (prev + 1) % slides.length),
    [],
  )
  const prevSlide = useCallback(
    () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length),
    [],
  )

  useEffect(() => {
    const timer = setInterval(nextSlide, 7000)
    return () => clearInterval(timer)
  }, [current, nextSlide])

  const slide = slides[current]

  return (
    <section className='relative h-svh min-h-160 overflow-hidden bg-stone-950'>
      {/* Slides */}
      {slides.map((s, index) => (
        <div
          key={s.image}
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            index === current ? 'z-10 opacity-100' : 'z-0 opacity-0'
          }`}
        >
          <div
            key={`${s.image}-${index === current}`}
            className={`absolute inset-0 ${
              index === current ? 'animate-heroZoom' : 'scale-105'
            }`}
          >
            <Image
              src={s.image}
              alt=''
              fill
              priority={index === 0}
              sizes='100vw'
              className='object-cover'
            />
          </div>
        </div>
      ))}

      {/* Overlay */}
      <div className='absolute inset-0 z-20 bg-linear-to-t from-black/80 via-black/30 to-black/40' />

      {/* Content */}
      <div className='relative z-30 flex h-full items-end pb-28 md:items-center md:pb-0'>
        <Container>
          <div key={current} className='max-w-3xl'>
            <p className='mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-white/70 opacity-0 animate-heroFade'>
              <span className='h-px w-10 bg-wood-400' />
              TF Wood Works — Est. Craftsmanship
            </p>

            <h1 className='text-5xl leading-[1.05] font-light tracking-tight text-white md:text-7xl'>
              <span className='block opacity-0 animate-heroText'>{slide.title}</span>
              <span className='block text-wood-300 opacity-0 animate-heroText delay-100 italic'>
                {slide.subtitle}
              </span>
            </h1>

            <p className='mt-6 max-w-xl text-base text-white/75 md:text-lg opacity-0 translate-y-6 animate-heroText delay-200'>
              {slide.description}
            </p>

            <div className='mt-10 flex flex-wrap items-center gap-4 opacity-0 translate-y-6 animate-heroText delay-300'>
              <Link
                href='/collections'
                className='bg-white px-8 py-4 text-sm font-medium uppercase tracking-widest text-stone-900 transition-colors duration-300 hover:bg-wood-400 hover:text-white'
              >
                Shop Now
              </Link>
              <Link
                href='/category/dining'
                className='group border-b border-white/40 pb-1 text-sm uppercase tracking-widest text-white transition-colors hover:border-wood-300 hover:text-wood-300'
              >
                Explore Collections{' '}
                <span className='inline-block transition-transform duration-300 group-hover:translate-x-1'>
                  →
                </span>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom controls */}
      <div className='absolute inset-x-0 bottom-8 z-30'>
        <Container>
          <div className='flex items-center justify-between'>
            {/* Dots */}
            <div className='flex items-center gap-3'>
              {slides.map((s, index) => (
                <button
                  key={s.image}
                  onClick={() => setCurrent(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-1 transition-all duration-500 ${
                    index === current ? 'w-12 bg-wood-300' : 'w-6 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            <div className='flex items-center gap-4'>
              <span className='hidden text-xs tracking-[0.3em] text-white/50 md:block'>
                0{current + 1} / 0{slides.length}
              </span>
              <button
                onClick={prevSlide}
                aria-label='Previous slide'
                className='flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-all duration-300 hover:border-wood-300 hover:bg-wood-300 hover:text-stone-900'
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={nextSlide}
                aria-label='Next slide'
                className='flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-all duration-300 hover:border-wood-300 hover:bg-wood-300 hover:text-stone-900'
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}

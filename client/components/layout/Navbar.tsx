'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import Container from '../Container'
import { getWishlist, WISHLIST_EVENT } from '@/lib/wishlist'
import SearchModal from './SearchModal'
import LanguageButton from '../LanguageButton'
import { T, useLanguage, type TranslationKey } from '@/lib/i18n'

const categories: { key: TranslationKey; slug: string; items: TranslationKey[]; image: string }[] = [
  {
    key: 'category.chairs',
    slug: 'chairs',
    items: ['nav.diningChairs', 'nav.officeChairs', 'nav.armchairs'],
    image: '/images/1.png',
  },
  {
    key: 'category.tables',
    slug: 'tables',
    items: ['nav.coffeeTables', 'nav.sideTables'],
    image: '/images/4.png',
  },
  {
    key: 'category.beds',
    slug: 'beds',
    items: ['nav.bedFrames', 'nav.nightStands'],
    image: '/images/2.png',
  },
]

const navLinks: { key: TranslationKey; href: string }[] = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.collections', href: '/collections' },
  { key: 'nav.order', href: '/order' },
]

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchCount, setSearchCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)
  const { t } = useLanguage()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sync = () =>
      setWishlistCount(getWishlist().length)
    sync()
    window.addEventListener(WISHLIST_EVENT, sync)
    return () => window.removeEventListener(WISHLIST_EVENT, sync)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'bg-stone-950/90 shadow-lg backdrop-blur-md'
          : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}
    >
      <Container>
        <nav className='flex h-20 items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-3'>
            <Image
              src='/images/logos.png'
              alt='TF Wood Works'
              width={40}
              height={40}
              className='h-10 w-auto'
            />
            <span className='text-sm font-light uppercase tracking-[0.25em] text-white'>
              <span className='text-wood-300'>Wood Works</span>
            </span>
          </Link>

          {/* Desktop menu */}
          <ul className='hidden items-center gap-10 text-sm tracking-wide text-white lg:flex'>
            {navLinks.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className='relative py-2 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-wood-300 after:transition-transform after:duration-300 hover:text-wood-200 hover:after:scale-x-100'
                >
                  <T k={link.key} />
                </Link>
              </li>
            ))}

            {/* Shop with mega menu */}
            <li className='group/static static'>
              <span className='cursor-pointer py-2 transition-colors group-hover/static:text-wood-200'>
                <T k='nav.shop' />
              </span>

              {/* Mega menu */}
              <div className='pointer-events-none absolute inset-x-0 top-full hidden opacity-0 transition-all duration-300 group-hover/static:pointer-events-auto group-hover/static:opacity-100 lg:block'>
                <div className='border-t border-white/10 bg-stone-950/95 py-12 shadow-2xl backdrop-blur-md'>
                  <Container>
                    <div className='grid grid-cols-4 gap-10'>
                      {categories.map((cat) => (
                        <div key={cat.key}>
                          <Link
                            href={`/category/${cat.slug}`}
                            className='mb-5 block text-sm font-medium uppercase tracking-widest text-white'
                          >
                            <T k={cat.key} />
                          </Link>
                          <ul className='space-y-3 text-sm text-white/60'>
                            {cat.items.map((item) => (
                              <li key={item}>
                                <Link
                                  href={`/category/${cat.slug}`}
                                  className='transition-colors hover:text-wood-300'
                                >
                                  <T k={item} />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {/* Promo */}
                      <Link
                        href='/category/dining'
                        className='group/promo relative block h-full min-h-[180px] overflow-hidden'
                      >
                        <Image
                          src='/images/3.png'
                          alt={t('nav.featured')}
                          fill
                          sizes='25vw'
                          className='object-cover transition-transform duration-700 group-hover/promo:scale-105'
                        />
                        <div className='absolute inset-0 bg-black/30 transition-colors group-hover/promo:bg-black/50' />
                        <span className='absolute bottom-4 left-4 text-xs uppercase tracking-widest text-white'>
                          <T k='nav.newArrivals' /> →
                        </span>
                      </Link>
                    </div>
                  </Container>
                </div>
              </div>
            </li>
          </ul>

          {/* Icons */}
          <div className='flex items-center gap-5 text-white md:gap-6'>
            <LanguageButton />
            <button
              onClick={() => {
                setSearchCount((c) => c + 1)
                setSearchOpen(true)
              }}
              aria-label={t('nav.search')}
              className='transition-opacity hover:opacity-70'
            >
              <Search size={18} />
            </button>
            <Link
              href='/wishlist'
              aria-label={t('nav.wishlist')}
              className='relative hidden transition-opacity hover:opacity-70 sm:block'
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className='absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white'>
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href='/order'
              aria-label={t('nav.cart')}
              className='transition-opacity hover:opacity-70'
            >
              <ShoppingBag size={18} />
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label={t('nav.openMenu')}
              className='lg:hidden'
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-[90] flex flex-col bg-stone-950 transition-all duration-500 lg:hidden ${
          menuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div className='flex h-20 items-center justify-between px-6'>
          <span className='text-sm font-light uppercase tracking-[0.25em] text-white'>
            TF <span className='text-wood-300'>Wood Works</span>
          </span>
          <div className='flex items-center gap-5'>
            <LanguageButton />
            <button
              onClick={() => setMenuOpen(false)}
              aria-label={t('nav.closeMenu')}
              className='text-white'
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <nav className='flex flex-1 flex-col justify-center gap-2 px-8'>
          {navLinks.map((link, i) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`border-b border-white/10 py-5 text-3xl font-light tracking-wide text-white transition-all duration-500 hover:text-wood-300 ${
                menuOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <T k={link.key} />
            </Link>
          ))}
          {categories.map((cat, i) => (
            <Link
              key={cat.key}
              href={`/category/${cat.slug}`}
              onClick={() => setMenuOpen(false)}
              className={`py-4 text-lg font-light tracking-wide text-white/50 transition-all duration-500 hover:text-wood-300 ${
                menuOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: `${(navLinks.length + i) * 80}ms` }}
            >
              <T k={cat.key} />
            </Link>
          ))}
        </nav>
      </div>

      {/* Search modal */}
      <SearchModal
        key={searchCount}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </header>
  )
}

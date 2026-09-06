import Link from 'next/link'
import {
  ArrowRight,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from 'lucide-react'
import Container from '../Container'

const exploreLinks = [
  { label: 'Home', href: '/' },
  { label: 'All Collections', href: '/collections' },
  { label: 'Your Wishlist', href: '/wishlist' },
  { label: 'Place an Order', href: '/order' },
  { label: 'Track Your Order', href: '/order-history' },
]

const categoryLinks = [
  { label: 'Chairs', href: '/category/chairs' },
  { label: 'Tables', href: '/category/tables' },
  { label: 'Sofas', href: '/category/sofas' },
  { label: 'Dining Sets', href: '/category/dining' },
  { label: 'Beds', href: '/category/beds' },
  { label: 'Kitchen', href: '/category/kitchen' },
]

const socials = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Youtube, label: 'YouTube' },
]

export default function Footer() {
  return (
    <footer className='bg-stone-950 text-white/60'>
      {/* Newsletter */}
      <div className='border-b border-white/10 bg-stone-900/40'>
        <Container>
          <div className='flex flex-col items-start justify-between gap-8 py-12 md:flex-row md:items-center'>
            <div>
              <h2 className='text-2xl font-light tracking-tight text-white md:text-3xl'>
                Join the{' '}
                <span className='italic text-wood-300'>TF Wood Works</span>{' '}
                family
              </h2>
              <p className='mt-2 text-sm'>
                Be first to hear about new collections, offers and stories
                from the workshop.
              </p>
            </div>

            <form className='flex w-full max-w-md'>
              <input
                type='email'
                required
                placeholder='Your email address'
                className='w-full border-b border-white/25 bg-transparent py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-wood-300'
              />
              <button
                type='submit'
                aria-label='Subscribe'
                className='group ml-4 flex h-11 w-11 shrink-0 items-center justify-center bg-wood-700 text-white transition-colors hover:bg-wood-500'
              >
                <ArrowRight
                  size={16}
                  className='transition-transform duration-300 group-hover:translate-x-0.5'
                />
              </button>
            </form>
          </div>
        </Container>
      </div>

      {/* Main columns */}
      <Container>
        <div className='grid grid-cols-1 gap-12 border-b border-white/10 py-16 sm:grid-cols-2 md:grid-cols-4'>
          {/* Brand */}
          <div>
            <h2 className='mb-4 text-xl font-light tracking-wide text-white'>
              TF<span className='text-wood-300'>Woods</span>
            </h2>
            <p className='text-sm leading-relaxed'>
              Thoughtfully crafted furniture for modern living. Designed to
              bring warmth, comfort, and timeless style into your space.
            </p>

            <div className='mt-6 flex gap-3'>
              {socials.map((social) => (
                <a
                  key={social.label}
                  href='#'
                  aria-label={social.label}
                  className='flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-300 hover:border-wood-400 hover:bg-wood-700 hover:text-white'
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className='mb-5 text-sm font-medium uppercase tracking-widest text-white'>
              Explore
            </h3>
            <ul className='space-y-3 text-sm'>
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className='inline-block transition-all duration-300 hover:translate-x-1 hover:text-wood-300'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className='mb-5 text-sm font-medium uppercase tracking-widest text-white'>
              Categories
            </h3>
            <ul className='space-y-3 text-sm'>
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className='inline-block transition-all duration-300 hover:translate-x-1 hover:text-wood-300'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='mb-5 text-sm font-medium uppercase tracking-widest text-white'>
              Contact Us
            </h3>
            <ul className='space-y-4 text-sm'>
              <li>
                <a
                  href='tel:+251900000000'
                  className='flex items-start gap-3 transition-colors hover:text-wood-300'
                >
                  <Phone size={16} className='mt-0.5 shrink-0 text-wood-400' />
                  <span>
                    +251 900 000 000
                    <span className='block text-xs text-white/40'>
                      Call to order directly
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href='mailto:dawitberiso406@gmail.com'
                  className='flex items-start gap-3 transition-colors hover:text-wood-300'
                >
                  <Mail size={16} className='mt-0.5 shrink-0 text-wood-400' />
                  dawitberiso406@gmail.com
                </a>
              </li>
              <li className='flex items-start gap-3'>
                <MapPin size={16} className='mt-0.5 shrink-0 text-wood-400' />
                Addis Ababa, Ethiopia
              </li>
              <li className='flex items-start gap-3'>
                <Clock size={16} className='mt-0.5 shrink-0 text-wood-400' />
                Mon – Sat · 8:00 AM – 6:00 PM
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className='flex flex-col items-center justify-between gap-4 py-8 text-xs tracking-wide md:flex-row'>
          <p>© {new Date().getFullYear()} TFWoods. All rights reserved.</p>
          <p>Crafted with care in Ethiopia.</p>
          <Link
            href='/admin/login'
            className='text-white/30 transition-colors hover:text-wood-300'
          >
            Admin
          </Link>
        </div>
      </Container>
    </footer>
  )
}

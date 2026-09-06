'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { clearToken } from '@/lib/api'

const links = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Furniture', href: '/admin/dashboard/furniture' },
  { label: 'Orders', href: '/admin/dashboard/orders' },
  { label: 'Notifications', href: '/admin/dashboard/notifications' },
]

const activeNavClass =
  'bg-stone-900 text-wood-300 border-l-2 border-wood-400'
const idleNavClass =
  'border-l-2 border-transparent text-stone-400 hover:border-stone-700 hover:bg-stone-900/60 hover:text-white'

function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    clearToken()
    router.push('/admin/login')
  }

  const isActive = (href: string) =>
    pathname === href ||
    (href !== '/admin/dashboard' && pathname.startsWith(href))

  const brand = (
    <div>
      <h2 className='text-xl font-light tracking-tight text-white'>
        TF Wood Works
        <span className='block pt-1 text-xs font-normal uppercase tracking-[0.3em] text-wood-400'>
          Admin Panel
        </span>
      </h2>
    </div>
  )

  const nav = (
    <nav className='space-y-1 text-sm'>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setOpen(false)}
          className={`block px-4 py-2.5 transition-colors ${
            isActive(link.href) ? activeNavClass : idleNavClass
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )

  const logout = (
    <button
      onClick={handleLogout}
      className={`mt-6 flex w-full items-center justify-between border border-stone-800 py-2.5 pl-4 pr-3 text-sm text-stone-400 transition-colors hover:border-red-900/60 hover:bg-red-950/40 hover:text-red-400`}
    >
      Logout
      <LogOut size={15} />
    </button>
  )

  return (
    <div className='min-h-screen bg-stone-100'>
      {/* Mobile top bar */}
      <header className='sticky top-0 z-40 flex items-center justify-between border-b border-stone-800 bg-stone-950 px-4 py-3 lg:hidden'>
        {brand}
        <button
          onClick={() => setOpen(true)}
          aria-label='Open menu'
          className='flex h-10 w-10 items-center justify-center rounded text-white active:bg-stone-800'
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className='fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-stone-800 bg-stone-950 p-6 lg:flex'>
        {brand}
        <div className='mt-8'>{nav}</div>
        {logout}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div
            className='absolute inset-0 bg-black/50'
            onClick={() => setOpen(false)}
          />
          <aside className='absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-stone-800 bg-stone-950 p-6 shadow-2xl'>
            <div className='mb-8 flex items-start justify-between gap-4'>
              {brand}
              <button
                onClick={() => setOpen(false)}
                aria-label='Close menu'
                className='flex h-9 w-9 shrink-0 items-center justify-center text-stone-400 hover:text-white'
              >
                <X size={20} />
              </button>
            </div>
            {nav}
            {logout}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className='px-4 py-6 sm:px-6 lg:py-10 lg:pl-72 lg:pr-10'>
        {children}
      </div>
    </div>
  )
}

export default AdminShell
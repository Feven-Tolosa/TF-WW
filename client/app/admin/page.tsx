'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getToken } from '@/lib/api'

export default function AdminIndexPage() {
  const [token, setToken] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(getToken())
  }, [])

  return (
    <div className='flex min-h-screen items-center justify-center bg-stone-100 px-4'>
      <div className='admin-card w-full max-w-sm p-10 text-center'>
        <Link href='/' className='mb-1 text-2xl font-light tracking-tight text-stone-900'>
          TF Wood Works
        </Link>
        <p className='mb-2 text-xs font-medium uppercase tracking-[0.3em] text-wood-700'>
          Admin Panel
        </p>
        <p className='mb-8 text-sm text-stone-500'>
          {token
            ? 'You are signed in. Continue to your dashboard.'
            : 'Sign in to manage furniture, orders and notifications.'}
        </p>

        {token === undefined ? (
          <p className='text-sm text-stone-400'>Checking session…</p>
        ) : token ? (
          <Link
            href='/admin/dashboard'
            className='admin-btn inline-flex w-full'
          >
            Go to Dashboard
            <ArrowRight size={16} />
          </Link>
        ) : (
          <Link
            href='/admin/login'
            className='admin-btn inline-flex w-full'
          >
            Admin Login
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  )
}
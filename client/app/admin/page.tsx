'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getToken } from '@/lib/api'
import { T, useLanguage } from '@/lib/i18n'

export default function AdminIndexPage() {
  const [token, setToken] = useState<string | null | undefined>(undefined)
  const { t } = useLanguage()

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
          <T k='admin.panel' />
        </p>
        <p className='mb-8 text-sm text-stone-500'>
          {token ? t('admin.signedIn') : t('admin.signInManage')}
        </p>

        {token === undefined ? (
          <p className='text-sm text-stone-400'>
            <T k='admin.checking' />
          </p>
        ) : token ? (
          <Link
            href='/admin/dashboard'
            className='admin-btn inline-flex w-full'
          >
            <T k='admin.goDashboard' />
            <ArrowRight size={16} />
          </Link>
        ) : (
          <Link
            href='/admin/login'
            className='admin-btn inline-flex w-full'
          >
            <T k='admin.login' />
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  )
}
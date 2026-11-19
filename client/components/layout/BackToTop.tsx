'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button
      type='button'
      onClick={scrollToTop}
      aria-label={t('common.backToTop')}
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-wood-700 text-white shadow-lg transition-all duration-300 hover:bg-wood-500 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ArrowUp size={20} />
    </button>
  )
}

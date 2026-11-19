'use client'

import { Languages } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

export default function LanguageButton({ className = '' }: { className?: string }) {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <button
      type='button'
      onClick={toggleLanguage}
      aria-label={t('nav.language')}
      title={t('nav.language')}
      className={`inline-flex items-center gap-1.5 text-xs font-medium tracking-widest transition-opacity hover:opacity-70 ${className}`}
    >
      <Languages size={17} />
      <span>{language === 'en' ? 'AM' : 'EN'}</span>
    </button>
  )
}

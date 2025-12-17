'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import translations from './translations.json'

export type Language = 'en' | 'fr' | 'ar'

type TranslationValue = {
  en: string
  en_plural?: string
  fr: string
  fr_plural?: string
  ar: string
  ar_plural?: string
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  dir: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Get nested value from object using dot notation
function getNestedValue(obj: unknown, path: string): TranslationValue | undefined {
  const keys = path.split('.')
  let current: unknown = obj
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  
  return current as TranslationValue | undefined
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    // Check localStorage for saved language preference
    const savedLang = localStorage.getItem('language') as Language | null
    if (savedLang && ['en', 'fr', 'ar'].includes(savedLang)) {
      setLanguageState(savedLang)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0]
      if (browserLang === 'fr') setLanguageState('fr')
      else if (browserLang === 'ar') setLanguageState('ar')
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    // Update document direction for RTL support
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  // Set initial direction
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  const t = (key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(translations, key)
    
    if (!value) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }

    // Handle pluralization
    let text = value[language]
    if (params?.count !== undefined) {
      const count = Number(params.count)
      const pluralKey = `${language}_plural` as keyof TranslationValue
      if (count !== 1 && value[pluralKey]) {
        text = value[pluralKey] as string
      }
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue))
      })
    }

    return text
  }

  const dir = language === 'ar' ? 'rtl' : 'ltr'

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Language names for display
export const languageNames: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية'
}

// Short language codes for compact display
const languageCodes: Record<Language, string> = {
  en: 'EN',
  fr: 'FR',
  ar: 'AR'
}

// Language Switcher Component
export function LanguageSwitcher({ 
  className, 
  variant = 'compact',
  activeColor,
  inactiveColor 
}: { 
  className?: string
  variant?: 'compact' | 'full'
  activeColor?: string
  inactiveColor?: string
}) {
  const { language, setLanguage } = useI18n()

  const isCompact = variant === 'compact'
  const activeBg = activeColor || 'var(--primary, #4F46E5)'
  const inactiveTextColor = inactiveColor || '#6B7280'

  return (
    <div className={className} style={{ display: 'flex', gap: '4px' }}>
      {(['en', 'fr', 'ar'] as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          title={languageNames[lang]}
          style={{
            padding: isCompact ? '4px 8px' : '6px 12px',
            border: 'none',
            borderRadius: '4px',
            background: language === lang ? activeBg : '#F3F4F6',
            color: language === lang ? 'white' : inactiveTextColor,
            cursor: 'pointer',
            fontSize: isCompact ? '11px' : '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            minWidth: isCompact ? '32px' : 'auto'
          }}
        >
          {isCompact ? languageCodes[lang] : languageNames[lang]}
        </button>
      ))}
    </div>
  )
}

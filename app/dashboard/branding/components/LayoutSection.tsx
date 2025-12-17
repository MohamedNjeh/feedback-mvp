'use client'

import type { BrandingConfig, HeaderStyle, CardStyle, Spacing } from '@/lib/types'
import styles from '../branding.module.css'

interface LayoutSectionProps {
  branding: BrandingConfig
  setBranding: React.Dispatch<React.SetStateAction<BrandingConfig>>
  t: (key: string) => string
}

const HEADER_STYLES: HeaderStyle[] = ['minimal', 'centered', 'left-aligned']
const CARD_STYLES: CardStyle[] = ['flat', 'elevated', 'rounded']
const SPACING_OPTIONS: Spacing[] = ['compact', 'regular', 'spacious']

export function LayoutSection({ branding, setBranding, t }: LayoutSectionProps) {
  const handleHeaderStyleChange = (style: HeaderStyle) => {
    setBranding(prev => ({
      ...prev,
      layout: { ...prev.layout, headerStyle: style }
    }))
  }

  const handleCardStyleChange = (style: CardStyle) => {
    setBranding(prev => ({
      ...prev,
      layout: { ...prev.layout, cardStyle: style }
    }))
  }

  const handleSpacingChange = (spacing: Spacing) => {
    setBranding(prev => ({
      ...prev,
      layout: { ...prev.layout, spacing }
    }))
  }

  const handleShowSentimentChange = (checked: boolean) => {
    setBranding(prev => ({
      ...prev,
      layout: { ...prev.layout, showSentimentIcons: checked }
    }))
  }

  const getHeaderStyleLabel = (style: HeaderStyle) => {
    return t(`branding.layout.${style === 'left-aligned' ? 'full_width' : style}`)
  }

  const getCardStyleLabel = (style: CardStyle) => {
    return t(`branding.layout.${style === 'rounded' ? 'bordered' : style}`)
  }

  const getSpacingLabel = (spacing: Spacing) => {
    return t(`branding.layout.${spacing === 'regular' ? 'comfortable' : spacing}`)
  }

  return (
    <div className={styles.section}>
      <h3>{t('branding.layout.title')}</h3>

      <div className={styles.formGroup}>
        <label>{t('branding.layout.header_style')}</label>
        <div className={styles.buttonGroup}>
          {HEADER_STYLES.map(style => (
            <button
              key={style}
              className={`${styles.optionButton} ${branding.layout.headerStyle === style ? styles.optionActive : ''}`}
              onClick={() => handleHeaderStyleChange(style)}
            >
              {getHeaderStyleLabel(style)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>{t('branding.layout.card_style')}</label>
        <div className={styles.buttonGroup}>
          {CARD_STYLES.map(style => (
            <button
              key={style}
              className={`${styles.optionButton} ${branding.layout.cardStyle === style ? styles.optionActive : ''}`}
              onClick={() => handleCardStyleChange(style)}
            >
              {getCardStyleLabel(style)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>{t('branding.layout.spacing')}</label>
        <div className={styles.buttonGroup}>
          {SPACING_OPTIONS.map(spacing => (
            <button
              key={spacing}
              className={`${styles.optionButton} ${branding.layout.spacing === spacing ? styles.optionActive : ''}`}
              onClick={() => handleSpacingChange(spacing)}
            >
              {getSpacingLabel(spacing)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.toggleGroup}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={branding.layout.showSentimentIcons}
            onChange={(e) => handleShowSentimentChange(e.target.checked)}
          />
          <span className={styles.toggleSlider}></span>
          {t('branding.layout.show_sentiment')}
        </label>
      </div>
    </div>
  )
}

'use client'

import type { BrandingConfig } from '@/lib/types'
import styles from '../branding.module.css'

interface CustomSectionProps {
  branding: BrandingConfig
  setBranding: React.Dispatch<React.SetStateAction<BrandingConfig>>
  t: (key: string) => string
}

export function CustomSection({ branding, setBranding, t }: CustomSectionProps) {
  const updateCustomField = <K extends keyof BrandingConfig['custom']>(
    field: K,
    value: BrandingConfig['custom'][K]
  ) => {
    setBranding(prev => ({
      ...prev,
      custom: { ...prev.custom, [field]: value }
    }))
  }

  return (
    <div className={styles.section}>
      <h3>{t('branding.custom.title')}</h3>

      <div className={styles.formGroup}>
        <label>{t('branding.custom.slogan')}</label>
        <input
          type="text"
          value={branding.custom.slogan}
          onChange={(e) => updateCustomField('slogan', e.target.value)}
          placeholder={t('branding.custom.slogan_placeholder')}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label>{t('branding.custom.thank_you')}</label>
        <textarea
          value={branding.custom.thankYouMessage}
          onChange={(e) => updateCustomField('thankYouMessage', e.target.value)}
          placeholder={t('branding.custom.thank_you_placeholder')}
          className={styles.textarea}
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <label>{t('branding.custom.cta_text')}</label>
        <input
          type="text"
          value={branding.custom.ctaButtonText}
          onChange={(e) => updateCustomField('ctaButtonText', e.target.value)}
          placeholder={t('branding.custom.cta_text_placeholder')}
          className={styles.input}
        />
      </div>

      <ColorInput
        label={t('branding.custom.cta_color')}
        value={branding.custom.ctaButtonColor}
        onChange={(value) => updateCustomField('ctaButtonColor', value)}
      />

      <ColorInput
        label={t('branding.custom.lang_switcher_color')}
        value={branding.custom.languageSwitcherColor || '#6B7280'}
        onChange={(value) => updateCustomField('languageSwitcherColor', value)}
      />

      {/* Glass Effect Branding */}
      <div className={styles.glassSection}>
        <h4 className={styles.sectionSubtitle}>{t('branding.custom.glass_branding')}</h4>
        <p className={styles.sectionHint}>{t('branding.custom.glass_branding_hint')}</p>

        <ColorInput
          label={t('branding.custom.glass_card_tint')}
          value={branding.custom.glassCardTint || '#667eea'}
          onChange={(value) => updateCustomField('glassCardTint', value)}
        />

        <ColorInput
          label={t('branding.custom.rating_button_color')}
          value={branding.custom.ratingButtonColor || '#ffffff'}
          onChange={(value) => updateCustomField('ratingButtonColor', value)}
        />
      </div>
    </div>
  )
}

interface ColorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className={styles.formGroup}>
      <label>{label}</label>
      <div className={styles.colorInput}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.hexInput}
        />
      </div>
    </div>
  )
}

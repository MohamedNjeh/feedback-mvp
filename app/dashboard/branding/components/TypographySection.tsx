'use client'

import { ALL_FONTS } from '@/lib/fonts'
import type { BrandingConfig, FontWeight } from '@/lib/types'
import styles from '../branding.module.css'

interface TypographySectionProps {
  branding: BrandingConfig
  setBranding: React.Dispatch<React.SetStateAction<BrandingConfig>>
  t: (key: string) => string
}

const FONT_WEIGHTS: FontWeight[] = ['light', 'regular', 'bold']

interface SliderConfig {
  key: 'titleSize' | 'subtitleSize' | 'bodySize'
  labelKey: string
  min: number
  max: number
}

const SLIDER_CONFIGS: SliderConfig[] = [
  { key: 'titleSize', labelKey: 'title_size', min: 18, max: 48 },
  { key: 'subtitleSize', labelKey: 'subtitle_size', min: 12, max: 24 },
  { key: 'bodySize', labelKey: 'body_size', min: 12, max: 20 },
]

export function TypographySection({ branding, setBranding, t }: TypographySectionProps) {
  const handleFontFamilyChange = (fontFamily: string) => {
    setBranding(prev => ({
      ...prev,
      typography: { ...prev.typography, fontFamily }
    }))
  }

  const handleSizeChange = (key: SliderConfig['key'], value: number) => {
    setBranding(prev => ({
      ...prev,
      typography: { ...prev.typography, [key]: value }
    }))
  }

  const handleFontWeightChange = (weight: FontWeight) => {
    setBranding(prev => ({
      ...prev,
      typography: { ...prev.typography, fontWeight: weight }
    }))
  }

  const getFontWeightLabel = (weight: FontWeight) => {
    return t(`branding.typography.${weight === 'regular' ? 'normal' : weight}`)
  }

  return (
    <div className={styles.section}>
      <h3>{t('branding.typography.title')}</h3>

      <div className={styles.formGroup}>
        <label>{t('branding.typography.font_family')}</label>
        <select
          value={branding.typography.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
          className={styles.select}
        >
          {ALL_FONTS.map(font => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {SLIDER_CONFIGS.map(({ key, labelKey, min, max }) => (
        <div key={key} className={styles.formGroup}>
          <label>
            {t(`branding.typography.${labelKey}`)}: {branding.typography[key]}px
          </label>
          <input
            type="range"
            min={min}
            max={max}
            value={branding.typography[key]}
            onChange={(e) => handleSizeChange(key, parseInt(e.target.value))}
            className={styles.slider}
          />
        </div>
      ))}

      <div className={styles.formGroup}>
        <label>{t('branding.typography.font_weight')}</label>
        <div className={styles.buttonGroup}>
          {FONT_WEIGHTS.map(weight => (
            <button
              key={weight}
              className={`${styles.optionButton} ${branding.typography.fontWeight === weight ? styles.optionActive : ''}`}
              onClick={() => handleFontWeightChange(weight)}
            >
              {getFontWeightLabel(weight)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

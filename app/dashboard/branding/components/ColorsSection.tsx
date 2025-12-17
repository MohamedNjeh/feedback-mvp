'use client'

import type { BrandingConfig } from '@/lib/types'
import styles from '../branding.module.css'

interface ColorsSectionProps {
  branding: BrandingConfig
  setBranding: React.Dispatch<React.SetStateAction<BrandingConfig>>
  t: (key: string) => string
}

const COLOR_KEYS = ['primary', 'secondary', 'background', 'accent'] as const

export function ColorsSection({ branding, setBranding, t }: ColorsSectionProps) {
  const handleColorChange = (colorKey: typeof COLOR_KEYS[number], value: string) => {
    setBranding(prev => ({
      ...prev,
      colors: { ...prev.colors, [colorKey]: value }
    }))
  }

  return (
    <div className={styles.section}>
      <h3>{t('branding.colors.title')}</h3>

      <div className={styles.colorGrid}>
        {COLOR_KEYS.map(colorKey => (
          <div key={colorKey} className={styles.colorField}>
            <label>{t(`branding.colors.${colorKey}`)}</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={branding.colors[colorKey]}
                onChange={(e) => handleColorChange(colorKey, e.target.value)}
              />
              <input
                type="text"
                value={branding.colors[colorKey]}
                onChange={(e) => handleColorChange(colorKey, e.target.value)}
                className={styles.hexInput}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

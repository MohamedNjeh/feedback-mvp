'use client'

import { ChangeEvent, RefObject } from 'react'
import { UploadIcon } from '@/components/Icons'
import type { LogoSize, LogoShape, BrandingConfig } from '@/lib/types'
import styles from '../branding.module.css'

interface LogoSectionProps {
  branding: BrandingConfig
  setBranding: React.Dispatch<React.SetStateAction<BrandingConfig>>
  uploadingLogo: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onLogoUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onRemoveLogo: () => void
  t: (key: string) => string
}

const LOGO_SIZES: LogoSize[] = ['small', 'medium', 'large']
const LOGO_SHAPES: LogoShape[] = ['square', 'rounded', 'circle']

export function LogoSection({
  branding,
  setBranding,
  uploadingLogo,
  fileInputRef,
  onLogoUpload,
  onRemoveLogo,
  t,
}: LogoSectionProps) {
  const handleSizeChange = (size: LogoSize) => {
    setBranding(prev => ({ ...prev, logoSize: size }))
  }

  const handleShapeChange = (shape: LogoShape) => {
    setBranding(prev => ({ ...prev, logoShape: shape }))
  }

  const getLogoClassName = () => {
    const shape = branding.logoShape
    return `${styles.logoImage} ${styles[`logo${shape.charAt(0).toUpperCase() + shape.slice(1)}`]}`
  }

  return (
    <div className={styles.section}>
      <h3>{t('branding.logo.title')}</h3>

      <div className={styles.uploadArea}>
        {branding.logoUrl ? (
          <div className={styles.logoPreview}>
            <img
              src={branding.logoUrl}
              alt="Logo"
              className={getLogoClassName()}
            />
            <button onClick={onRemoveLogo} className={styles.removeButton}>
              {t('branding.logo.remove')}
            </button>
          </div>
        ) : (
          <div
            className={styles.dropzone}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon />
            <p>{t('branding.logo.drop_hint')}</p>
            <span>{t('branding.logo.formats')}</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={onLogoUpload}
          hidden
        />
        {uploadingLogo && <div className={styles.uploading}>{t('common.uploading')}</div>}
      </div>

      <div className={styles.formGroup}>
        <label>{t('branding.logo.size')}</label>
        <div className={styles.buttonGroup}>
          {LOGO_SIZES.map(size => (
            <button
              key={size}
              className={`${styles.optionButton} ${branding.logoSize === size ? styles.optionActive : ''}`}
              onClick={() => handleSizeChange(size)}
            >
              {t(`branding.logo.${size}`)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>{t('branding.logo.shape')}</label>
        <div className={styles.buttonGroup}>
          {LOGO_SHAPES.map(shape => (
            <button
              key={shape}
              className={`${styles.optionButton} ${branding.logoShape === shape ? styles.optionActive : ''}`}
              onClick={() => handleShapeChange(shape)}
            >
              {t(`branding.logo.${shape}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

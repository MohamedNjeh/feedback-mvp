'use client'

import type { BrandingConfig, Spacing } from '@/lib/types'
import styles from '../branding.module.css'

interface PreviewPanelProps {
  branding: BrandingConfig
  t: (key: string) => string
}

const EMOJI_OPTIONS = ['😡', '😞', '😐', '😊', '😍']
const SELECTED_EMOJI_INDEX = 3

export function PreviewPanel({ branding, t }: PreviewPanelProps) {
  const getCardClassName = () => {
    const cardStyle = branding.layout.cardStyle
    return `${styles.previewCard} ${styles[`card${cardStyle.charAt(0).toUpperCase() + cardStyle.slice(1)}`]}`
  }

  const getLogoSizeClassName = () => {
    const logoSize = branding.logoSize
    return `${styles.previewLogo} ${styles[`previewLogo${logoSize.charAt(0).toUpperCase() + logoSize.slice(1)}`]}`
  }

  const getLogoShapeClassName = () => {
    const logoShape = branding.logoShape
    return styles[`logo${logoShape.charAt(0).toUpperCase() + logoShape.slice(1)}`]
  }

  const getCardPadding = () => {
    const spacingMap: Record<Spacing, string> = {
      compact: '16px',
      regular: '24px',
      spacious: '32px',
    }
    return spacingMap[branding.layout.spacing]
  }

  const getTitleStyles = () => ({
    fontSize: `${branding.typography.titleSize}px`,
    fontWeight: branding.typography.fontWeight === 'light' ? 300 : branding.typography.fontWeight === 'bold' ? 700 : 400,
    color: branding.colors.primary,
    textAlign: branding.layout.headerStyle === 'centered' ? 'center' as const : 'left' as const,
  })

  const getEmojiStyles = (index: number) => {
    const isSelected = index === SELECTED_EMOJI_INDEX
    return {
      opacity: isSelected ? 1 : 0.5,
      border: isSelected ? `2px solid ${branding.colors.accent}` : '2px solid transparent',
      backgroundColor: isSelected ? `${branding.colors.accent}15` : 'transparent',
    }
  }

  return (
    <div className={styles.previewPanel}>
      <div className={styles.previewHeader}>
        <h3>{t('branding.preview')}</h3>
      </div>
      <div
        className={styles.previewContainer}
        style={{
          backgroundColor: branding.colors.background,
          fontFamily: branding.typography.fontFamily,
        }}
      >
        <div
          className={getCardClassName()}
          style={{ padding: getCardPadding() }}
        >
          {/* Logo Preview */}
          {branding.logoUrl && (
            <div className={getLogoSizeClassName()}>
              <img
                src={branding.logoUrl}
                alt="Logo"
                className={getLogoShapeClassName()}
              />
            </div>
          )}

          {/* Slogan */}
          {branding.custom.slogan && (
            <p
              className={styles.previewSlogan}
              style={{
                color: branding.colors.secondary,
                fontSize: `${branding.typography.subtitleSize}px`,
              }}
            >
              {branding.custom.slogan}
            </p>
          )}

          {/* Title */}
          <h2 style={getTitleStyles()}>
            {t('survey.header')}
          </h2>

          {/* Emoji Rating Preview */}
          {branding.layout.showSentimentIcons && (
            <div className={styles.previewEmojis}>
              {EMOJI_OPTIONS.map((emoji, index) => (
                <span
                  key={index}
                  className={styles.previewEmoji}
                  style={getEmojiStyles(index)}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}

          {/* Comment Box Preview */}
          <div
            className={styles.previewTextarea}
            style={{ fontSize: `${branding.typography.bodySize}px` }}
          >
            {t('survey.comment_placeholder')}
          </div>

          {/* CTA Button */}
          <button
            className={styles.previewButton}
            style={{
              backgroundColor: branding.custom.ctaButtonColor,
              fontSize: `${branding.typography.bodySize}px`,
            }}
          >
            {branding.custom.ctaButtonText || t('survey.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}

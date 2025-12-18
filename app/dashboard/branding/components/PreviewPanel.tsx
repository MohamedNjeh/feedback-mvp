'use client'

import type { BrandingConfig, Spacing } from '@/lib/types'
import styles from '../branding.module.css'

interface PreviewPanelProps {
  branding: BrandingConfig
  t: (key: string, params?: Record<string, string | number>) => string
}

const EMOJI_OPTIONS = [
  { emoji: '😡', label: 'Very Dissatisfied' },
  { emoji: '😞', label: 'Dissatisfied' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😊', label: 'Satisfied' },
  { emoji: '😍', label: 'Very Satisfied' },
]
const SELECTED_EMOJI_INDEX = 3

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(102, 126, 234, ${alpha})`
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

// Helper to determine if color is light or dark for contrast
function isLightColor(hex: string): boolean {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return false
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

export function PreviewPanel({ branding, t }: PreviewPanelProps) {
  const glassEnabled = branding.layout.glassEnabled ?? true

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
    color: glassEnabled ? 'rgba(255, 255, 255, 0.95)' : branding.colors.primary,
    textAlign: branding.layout.headerStyle === 'centered' ? 'center' as const : 'left' as const,
    textShadow: glassEnabled ? '0 1px 2px rgba(0, 0, 0, 0.15)' : 'none',
    margin: '0 0 16px',
  })

  const getEmojiStyles = (index: number) => {
    const isSelected = index === SELECTED_EMOJI_INDEX
    const ratingColor = branding.custom.ratingButtonColor || '#ffffff'
    
    if (glassEnabled) {
      return {
        opacity: isSelected ? 1 : 0.6,
        background: isSelected ? hexToRgba(ratingColor, 0.25) : hexToRgba(ratingColor, 0.1),
        border: isSelected ? `2px solid ${hexToRgba(ratingColor, 0.5)}` : `2px solid ${hexToRgba(ratingColor, 0.2)}`,
        borderRadius: '14px',
        padding: '8px',
        backdropFilter: 'blur(8px)',
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
        boxShadow: isSelected ? `0 4px 16px ${hexToRgba(ratingColor, 0.2)}` : 'none',
      }
    }
    return {
      opacity: isSelected ? 1 : 0.5,
      border: isSelected ? `2px solid ${branding.colors.accent}` : '2px solid transparent',
      backgroundColor: isSelected ? `${branding.colors.accent}15` : 'transparent',
      borderRadius: '12px',
      padding: '8px',
    }
  }

  // Non-glass card styles
  const getCardClassName = () => {
    if (glassEnabled) return styles.previewGlassCard
    const cardStyle = branding.layout.cardStyle
    return `${styles.previewCard} ${styles[`card${cardStyle.charAt(0).toUpperCase() + cardStyle.slice(1)}`]}`
  }

  const getLogoSizeValue = () => {
    const sizeMap: Record<string, number> = { small: 48, medium: 72, large: 96 }
    return sizeMap[branding.logoSize] || 72
  }

  const getLogoShapeRadius = () => {
    const shapeMap: Record<string, string> = { square: '0', rounded: '12px', circle: '50%' }
    return shapeMap[branding.logoShape] || '12px'
  }

  // Glass gradient background based on brand tint
  const glassGradient = glassEnabled
    ? `linear-gradient(135deg, ${branding.custom.glassCardTint || '#667eea'} 0%, ${hexToRgba(branding.custom.glassCardTint || '#667eea', 0.7)} 50%, ${branding.colors.accent} 100%)`
    : branding.colors.background

  // Glass card tint overlay
  const glassCardBackground = glassEnabled
    ? hexToRgba(branding.custom.glassCardTint || '#667eea', 0.15)
    : '#ffffff'

  // Button text color for contrast
  const buttonTextColor = isLightColor(branding.custom.ctaButtonColor) ? '#1a1a2e' : '#ffffff'

  return (
    <div className={styles.previewPanel}>
      <div className={styles.previewHeader}>
        <h3>{t('branding.preview')}</h3>
        {glassEnabled && (
          <span className={styles.glassIndicator} aria-label="Glass effect enabled">
            ✨ Glass
          </span>
        )}
      </div>
      
      <div
        className={`${styles.previewContainer} ${glassEnabled ? styles.previewContainerGlass : ''}`}
        style={{
          background: glassGradient,
          fontFamily: branding.typography.fontFamily,
        }}
      >
        {/* Liquid Blobs for Glass Mode */}
        {glassEnabled && (
          <>
            <div 
              className={styles.previewBlob1}
              style={{ background: `linear-gradient(180deg, ${hexToRgba(branding.custom.glassCardTint || '#667eea', 0.6)} 0%, ${hexToRgba(branding.colors.accent, 0.4)} 100%)` }}
              aria-hidden="true"
            />
            <div 
              className={styles.previewBlob2}
              style={{ background: `linear-gradient(180deg, ${hexToRgba(branding.colors.accent, 0.5)} 0%, ${hexToRgba(branding.custom.glassCardTint || '#667eea', 0.3)} 100%)` }}
              aria-hidden="true"
            />
          </>
        )}
        
        <div
          className={getCardClassName()}
          style={{ 
            padding: getCardPadding(),
            background: glassCardBackground,
          }}
        >
          {/* Logo Preview */}
          {branding.logoUrl && (
            <div 
              className={styles.previewLogo}
              style={{
                justifyContent: branding.layout.headerStyle === 'centered' ? 'center' : 'flex-start',
              }}
            >
              <div
                className={`${styles.previewLogoWrapper} ${glassEnabled ? styles.previewLogoGlass : ''}`}
                style={{
                  width: getLogoSizeValue(),
                  height: getLogoSizeValue(),
                  borderRadius: getLogoShapeRadius(),
                }}
              >
                <img
                  src={branding.logoUrl}
                  alt="Logo preview"
                  style={{ borderRadius: getLogoShapeRadius() }}
                />
              </div>
            </div>
          )}

          {/* Placeholder Logo when none uploaded */}
          {!branding.logoUrl && (
            <div 
              className={styles.previewLogo}
              style={{
                justifyContent: branding.layout.headerStyle === 'centered' ? 'center' : 'flex-start',
              }}
            >
              <div
                className={`${styles.previewLogoPlaceholder} ${glassEnabled ? styles.previewLogoGlass : ''}`}
                style={{
                  width: getLogoSizeValue(),
                  height: getLogoSizeValue(),
                  borderRadius: getLogoShapeRadius(),
                  backgroundColor: glassEnabled ? 'rgba(255,255,255,0.2)' : branding.colors.primary,
                  color: glassEnabled ? 'rgba(255,255,255,0.9)' : '#fff',
                  fontSize: getLogoSizeValue() * 0.4,
                }}
              >
                B
              </div>
            </div>
          )}

          {/* Slogan */}
          {branding.custom.slogan && (
            <p
              className={styles.previewSlogan}
              style={{
                color: glassEnabled ? 'rgba(255, 255, 255, 0.8)' : branding.colors.secondary,
                fontSize: `${branding.typography.subtitleSize}px`,
                textAlign: branding.layout.headerStyle === 'centered' ? 'center' : 'left',
              }}
            >
              {branding.custom.slogan}
            </p>
          )}

          {/* Title */}
          <h2 style={getTitleStyles()}>
            {t('survey.header')}
          </h2>

          {/* Table Tag */}
          <div 
            className={`${styles.previewTableTag} ${glassEnabled ? styles.previewTableTagGlass : ''}`}
            style={{
              justifyContent: branding.layout.headerStyle === 'centered' ? 'center' : 'flex-start',
            }}
          >
            <span>{t('survey.table', { number: '5' })}</span>
          </div>

          {/* Emoji Rating Preview */}
          {branding.layout.showSentimentIcons && (
            <div 
              className={styles.previewEmojis}
              role="group"
              aria-label="Rating preview"
            >
              {EMOJI_OPTIONS.map((item, index) => (
                <span
                  key={index}
                  className={styles.previewEmoji}
                  style={getEmojiStyles(index)}
                  title={item.label}
                >
                  {item.emoji}
                </span>
              ))}
            </div>
          )}

          {/* Number Rating (when emojis disabled) */}
          {!branding.layout.showSentimentIcons && (
            <div className={styles.previewRatingNumbers} role="group" aria-label="Rating preview">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`${styles.previewRatingNumber} ${n === 4 ? styles.previewRatingNumberActive : ''}`}
                  style={{
                    backgroundColor: n === 4 
                      ? (glassEnabled ? hexToRgba(branding.custom.ratingButtonColor || '#ffffff', 0.3) : branding.colors.primary)
                      : (glassEnabled ? hexToRgba(branding.custom.ratingButtonColor || '#ffffff', 0.1) : 'transparent'),
                    borderColor: glassEnabled 
                      ? hexToRgba(branding.custom.ratingButtonColor || '#ffffff', 0.3) 
                      : branding.colors.primary,
                    color: n === 4 
                      ? (glassEnabled ? 'rgba(255,255,255,0.95)' : '#fff')
                      : (glassEnabled ? 'rgba(255,255,255,0.8)' : branding.colors.primary),
                  }}
                >
                  {n}
                </span>
              ))}
            </div>
          )}

          {/* Comment Box Preview */}
          <div
            className={`${styles.previewTextarea} ${glassEnabled ? styles.previewTextareaGlass : ''}`}
            style={{ fontSize: `${branding.typography.bodySize}px` }}
          >
            {t('survey.comment_placeholder')}
          </div>

          {/* CTA Button */}
          <button
            className={`${styles.previewButton} ${glassEnabled ? styles.previewButtonGlass : ''}`}
            style={{
              backgroundColor: glassEnabled 
                ? hexToRgba(branding.custom.ctaButtonColor, 0.85)
                : branding.custom.ctaButtonColor,
              color: buttonTextColor,
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

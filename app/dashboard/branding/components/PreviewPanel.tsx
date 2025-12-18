'use client'

import type { BrandingConfig, Spacing } from '@/lib/types'
import styles from '../branding.module.css'

interface PreviewPanelProps {
  branding: BrandingConfig
  t: (key: string, params?: Record<string, string | number>) => string
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const EMOJI_OPTIONS = [
  { emoji: '😡', label: 'Very Dissatisfied' },
  { emoji: '😞', label: 'Dissatisfied' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😊', label: 'Satisfied' },
  { emoji: '😍', label: 'Very Satisfied' },
]
const SELECTED_EMOJI_INDEX = 3
const SELECTED_RATING = 4

const SPACING_MAP: Record<Spacing, string> = {
  compact: '16px',
  regular: '24px',
  spacious: '32px',
}

const SIZE_MAP: Record<string, number> = { small: 48, medium: 72, large: 96 }
const SHAPE_MAP: Record<string, string> = { square: '0', rounded: '12px', circle: '50%' }

// ─────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(102, 126, 234, ${alpha})`
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

function isLightColor(hex: string): boolean {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return false
  const luminance = (0.299 * parseInt(result[1], 16) + 0.587 * parseInt(result[2], 16) + 0.114 * parseInt(result[3], 16)) / 255
  return luminance > 0.5
}

function getFontWeight(weight: string): number {
  return weight === 'light' ? 300 : weight === 'bold' ? 700 : 400
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

interface PreviewBlobsProps {
  tint: string
  accent: string
}

function PreviewBlobs({ tint, accent }: PreviewBlobsProps) {
  return (
    <>
      <div className={styles.previewBlob1} style={{ background: `linear-gradient(180deg, ${hexToRgba(tint, 0.6)} 0%, ${hexToRgba(accent, 0.4)} 100%)` }} aria-hidden="true" />
      <div className={styles.previewBlob2} style={{ background: `linear-gradient(180deg, ${hexToRgba(accent, 0.5)} 0%, ${hexToRgba(tint, 0.3)} 100%)` }} aria-hidden="true" />
    </>
  )
}

interface PreviewLogoProps {
  logoUrl: string | null
  size: number
  radius: string
  isCentered: boolean
  glassEnabled: boolean
  primaryColor: string
}

function PreviewLogo({ logoUrl, size, radius, isCentered, glassEnabled, primaryColor }: PreviewLogoProps) {
  const wrapperClass = `${styles.previewLogoWrapper} ${glassEnabled ? styles.previewLogoGlass : ''}`
  const placeholderClass = `${styles.previewLogoPlaceholder} ${glassEnabled ? styles.previewLogoGlass : ''}`
  
  return (
    <div className={styles.previewLogo} style={{ justifyContent: isCentered ? 'center' : 'flex-start' }}>
      {logoUrl ? (
        <div className={wrapperClass} style={{ width: size, height: size, borderRadius: radius }}>
          <img src={logoUrl} alt="Logo preview" style={{ borderRadius: radius }} />
        </div>
      ) : (
        <div
          className={placeholderClass}
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: glassEnabled ? 'rgba(255,255,255,0.2)' : primaryColor,
            color: glassEnabled ? 'rgba(255,255,255,0.9)' : '#fff',
            fontSize: size * 0.4,
          }}
        >
          B
        </div>
      )}
    </div>
  )
}

interface EmojiRatingProps {
  glassEnabled: boolean
  ratingColor: string
  accentColor: string
}

function EmojiRating({ glassEnabled, ratingColor, accentColor }: EmojiRatingProps) {
  return (
    <div className={styles.previewEmojis} role="group" aria-label="Rating preview">
      {EMOJI_OPTIONS.map((item, index) => {
        const isSelected = index === SELECTED_EMOJI_INDEX
        const style = glassEnabled
          ? {
              opacity: isSelected ? 1 : 0.6,
              background: hexToRgba(ratingColor, isSelected ? 0.25 : 0.1),
              border: `2px solid ${hexToRgba(ratingColor, isSelected ? 0.5 : 0.2)}`,
              borderRadius: '14px',
              padding: '8px',
              backdropFilter: 'blur(8px)',
              transform: isSelected ? 'scale(1.1)' : 'scale(1)',
              boxShadow: isSelected ? `0 4px 16px ${hexToRgba(ratingColor, 0.2)}` : 'none',
            }
          : {
              opacity: isSelected ? 1 : 0.5,
              border: isSelected ? `2px solid ${accentColor}` : '2px solid transparent',
              backgroundColor: isSelected ? `${accentColor}15` : 'transparent',
              borderRadius: '12px',
              padding: '8px',
            }
        return (
          <span key={index} className={styles.previewEmoji} style={style} title={item.label}>
            {item.emoji}
          </span>
        )
      })}
    </div>
  )
}

interface NumberRatingProps {
  glassEnabled: boolean
  ratingColor: string
  primaryColor: string
}

function NumberRating({ glassEnabled, ratingColor, primaryColor }: NumberRatingProps) {
  return (
    <div className={styles.previewRatingNumbers} role="group" aria-label="Rating preview">
      {[1, 2, 3, 4, 5].map((n) => {
        const isSelected = n === SELECTED_RATING
        return (
          <span
            key={n}
            className={`${styles.previewRatingNumber} ${isSelected ? styles.previewRatingNumberActive : ''}`}
            style={{
              backgroundColor: isSelected
                ? (glassEnabled ? hexToRgba(ratingColor, 0.3) : primaryColor)
                : (glassEnabled ? hexToRgba(ratingColor, 0.1) : 'transparent'),
              borderColor: glassEnabled ? hexToRgba(ratingColor, 0.3) : primaryColor,
              color: isSelected
                ? (glassEnabled ? 'rgba(255,255,255,0.95)' : '#fff')
                : (glassEnabled ? 'rgba(255,255,255,0.8)' : primaryColor),
            }}
          >
            {n}
          </span>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export function PreviewPanel({ branding, t }: PreviewPanelProps) {
  const glassEnabled = branding.layout.glassEnabled ?? true
  const glassTint = branding.custom.glassCardTint || '#667eea'
  const ratingColor = branding.custom.ratingButtonColor || '#ffffff'
  const isCentered = branding.layout.headerStyle === 'centered'
  const logoSize = SIZE_MAP[branding.logoSize] || 72
  const logoRadius = SHAPE_MAP[branding.logoShape] || '12px'

  const glassGradient = glassEnabled
    ? `linear-gradient(135deg, ${glassTint} 0%, ${hexToRgba(glassTint, 0.7)} 50%, ${branding.colors.accent} 100%)`
    : branding.colors.background

  const cardBackground = glassEnabled ? hexToRgba(glassTint, 0.15) : '#ffffff'
  const buttonTextColor = isLightColor(branding.custom.ctaButtonColor) ? '#1a1a2e' : '#ffffff'
  
  const cardClassName = glassEnabled
    ? styles.previewGlassCard
    : `${styles.previewCard} ${styles[`card${branding.layout.cardStyle.charAt(0).toUpperCase() + branding.layout.cardStyle.slice(1)}`]}`

  return (
    <div className={styles.previewPanel}>
      <div className={styles.previewHeader}>
        <h3>{t('branding.preview')}</h3>
        {glassEnabled && <span className={styles.glassIndicator} aria-label="Glass effect enabled">✨ Glass</span>}
      </div>
      
      <div
        className={`${styles.previewContainer} ${glassEnabled ? styles.previewContainerGlass : ''}`}
        style={{ background: glassGradient, fontFamily: branding.typography.fontFamily }}
      >
        {glassEnabled && <PreviewBlobs tint={glassTint} accent={branding.colors.accent} />}
        
        <div className={cardClassName} style={{ padding: SPACING_MAP[branding.layout.spacing], background: cardBackground }}>
          <PreviewLogo
            logoUrl={branding.logoUrl}
            size={logoSize}
            radius={logoRadius}
            isCentered={isCentered}
            glassEnabled={glassEnabled}
            primaryColor={branding.colors.primary}
          />

          {branding.custom.slogan && (
            <p
              className={styles.previewSlogan}
              style={{
                color: glassEnabled ? 'rgba(255, 255, 255, 0.8)' : branding.colors.secondary,
                fontSize: `${branding.typography.subtitleSize}px`,
                textAlign: isCentered ? 'center' : 'left',
              }}
            >
              {branding.custom.slogan}
            </p>
          )}

          <h2
            style={{
              fontSize: `${branding.typography.titleSize}px`,
              fontWeight: getFontWeight(branding.typography.fontWeight),
              color: glassEnabled ? 'rgba(255, 255, 255, 0.95)' : branding.colors.primary,
              textAlign: isCentered ? 'center' : 'left',
              textShadow: glassEnabled ? '0 1px 2px rgba(0, 0, 0, 0.15)' : 'none',
              margin: '0 0 16px',
            }}
          >
            {t('survey.header')}
          </h2>

          <div
            className={`${styles.previewTableTag} ${glassEnabled ? styles.previewTableTagGlass : ''}`}
            style={{ justifyContent: isCentered ? 'center' : 'flex-start' }}
          >
            <span>{t('survey.table', { number: '5' })}</span>
          </div>

          {branding.layout.showSentimentIcons ? (
            <EmojiRating glassEnabled={glassEnabled} ratingColor={ratingColor} accentColor={branding.colors.accent} />
          ) : (
            <NumberRating glassEnabled={glassEnabled} ratingColor={ratingColor} primaryColor={branding.colors.primary} />
          )}

          <div
            className={`${styles.previewTextarea} ${glassEnabled ? styles.previewTextareaGlass : ''}`}
            style={{ fontSize: `${branding.typography.bodySize}px` }}
          >
            {t('survey.comment_placeholder')}
          </div>

          <button
            className={`${styles.previewButton} ${glassEnabled ? styles.previewButtonGlass : ''}`}
            style={{
              backgroundColor: glassEnabled ? hexToRgba(branding.custom.ctaButtonColor, 0.85) : branding.custom.ctaButtonColor,
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

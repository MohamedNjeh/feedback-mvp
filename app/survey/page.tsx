'use client'

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { useI18n, LanguageSwitcher } from '@/lib/i18n'
import { DEFAULT_BRANDING, type BrandingConfig } from '@/lib/types'
import styles from './survey.module.css'

// ─────────────────────────────────────────────────────────────
// Utility Functions (outside component to avoid re-creation)
// ─────────────────────────────────────────────────────────────

/** Convert hex color to rgba string */
const hexToRgba = (hex: string, alpha: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(102, 126, 234, ${alpha})`
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

/** Get font weight numeric value */
const getFontWeight = (weight: string): number => {
  const weights: Record<string, number> = { light: 300, normal: 400, bold: 700 }
  return weights[weight] || 400
}

/** Get logo size in pixels */
const getLogoSize = (size: string): number => {
  const sizes: Record<string, number> = { small: 48, medium: 72, large: 96 }
  return sizes[size] || 72
}

/** Get logo border radius */
const getLogoRadius = (shape: string): string => {
  const radii: Record<string, string> = { square: '0', circle: '50%', rounded: '12px' }
  return radii[shape] || '12px'
}

/** Deep merge branding with defaults */
const mergeBranding = (data: Partial<BrandingConfig>): BrandingConfig => ({
  ...DEFAULT_BRANDING,
  ...data,
  colors: { ...DEFAULT_BRANDING.colors, ...data.colors },
  typography: { ...DEFAULT_BRANDING.typography, ...data.typography },
  layout: { ...DEFAULT_BRANDING.layout, ...data.layout },
  custom: { ...DEFAULT_BRANDING.custom, ...data.custom },
})

/** Rating options for emoji selector */
const RATING_OPTIONS = [
  { value: 1, emoji: '😡', label: 'Very Dissatisfied' },
  { value: 2, emoji: '😞', label: 'Dissatisfied' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '😊', label: 'Satisfied' },
  { value: 5, emoji: '😍', label: 'Very Satisfied' },
] as const

// ─────────────────────────────────────────────────────────────
// Reusable Components
// ─────────────────────────────────────────────────────────────

/** Liquid background blobs with optional custom colors */
interface LiquidBlobsProps {
  tint?: string
  accent?: string
}

function LiquidBlobs({ tint = '#667eea', accent = '#764ba2' }: LiquidBlobsProps) {
  return (
    <>
      <div 
        className={`${styles.liquidBlob} ${styles.liquidBlob1}`} 
        aria-hidden="true"
        style={{ background: `linear-gradient(180deg, ${hexToRgba(tint, 0.8)} 0%, ${hexToRgba(accent, 0.6)} 100%)` }}
      />
      <div 
        className={`${styles.liquidBlob} ${styles.liquidBlob2}`} 
        aria-hidden="true"
        style={{ background: `linear-gradient(180deg, ${hexToRgba(accent, 0.7)} 0%, ${hexToRgba(tint, 0.5)} 100%)` }}
      />
      <div 
        className={`${styles.liquidBlob} ${styles.liquidBlob3}`} 
        aria-hidden="true"
        style={{ background: `linear-gradient(180deg, ${hexToRgba(tint, 0.6)} 0%, ${hexToRgba(accent, 0.4)} 100%)` }}
      />
    </>
  )
}

/** Default blobs without custom styling */
function DefaultBlobs() {
  return (
    <>
      <div className={`${styles.liquidBlob} ${styles.liquidBlob1}`} aria-hidden="true" />
      <div className={`${styles.liquidBlob} ${styles.liquidBlob2}`} aria-hidden="true" />
      <div className={`${styles.liquidBlob} ${styles.liquidBlob3}`} aria-hidden="true" />
    </>
  )
}

/** Logo component */
interface LogoProps {
  url?: string | null
  name: string | null
  size: number
  radius: string
}

function Logo({ url, name, size, radius }: LogoProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  
  if (url) {
    return (
      <div className={styles.logo} style={{ width: size, height: size, borderRadius: radius }}>
        <img src={url} alt={name || 'Business logo'} className={styles.logoImage} style={{ borderRadius: radius }} />
      </div>
    )
  }
  
  return (
    <div className={styles.logo} style={{ width: size, height: size, borderRadius: radius, fontSize: size * 0.4 }} aria-hidden="true">
      {initial}
    </div>
  )
}

/** Glass card wrapper for status screens */
interface StatusScreenProps {
  icon: string
  title: string
  subtitle: string
  isError?: boolean
}

function StatusScreen({ icon, title, subtitle, isError }: StatusScreenProps) {
  return (
    <div className={styles.container}>
      <DefaultBlobs />
      <div className={styles.content}>
        <div className={styles.glassCard}>
          <div className={isError ? styles.errorScreen : styles.successScreen} role={isError ? 'alert' : undefined}>
            <div className={isError ? styles.errorIcon : styles.successIcon} aria-hidden="true">{icon}</div>
            <h2 className={isError ? styles.errorTitle : styles.successTitle}>{title}</h2>
            <p className={isError ? styles.errorSubtitle : styles.successSubtitle}>{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Form Section Components
// ─────────────────────────────────────────────────────────────

interface RatingSectionProps {
  rating: number
  setRating: (value: number) => void
  showEmojis: boolean
  bodySize: number | string
  glassEnabled: boolean
  getRatingButtonStyle: (isSelected: boolean) => React.CSSProperties
  getNumberButtonStyle: (isSelected: boolean) => React.CSSProperties
  t: (key: string) => string
}

function RatingSection({ 
  rating, setRating, showEmojis, bodySize, glassEnabled, 
  getRatingButtonStyle, getNumberButtonStyle, t 
}: RatingSectionProps) {
  return (
    <fieldset className={styles.section}>
      <legend 
        className={styles.label}
        style={{ 
          fontSize: bodySize,
          color: glassEnabled ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-primary)',
        }}
      >
        {t('survey.rate_experience')}
      </legend>
      {showEmojis ? (
        <div className={styles.emojiContainer} role="radiogroup" aria-label="Rating selection">
          {RATING_OPTIONS.map(({ value, emoji, label }) => (
            <button
              type="button"
              key={value}
              onClick={() => setRating(value)}
              className={`${styles.emojiButton} ${rating === value ? styles.emojiButtonActive : ''}`}
              role="radio"
              aria-checked={rating === value}
              aria-label={`${label} - ${value} out of 5`}
              style={getRatingButtonStyle(rating === value)}
            >
              <span className={styles.emoji} aria-hidden="true">{emoji}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.ratingButtons} role="radiogroup" aria-label="Rating selection">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              className={`${styles.ratingButton} ${rating === n ? styles.ratingButtonActive : ''}`}
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} out of 5`}
              style={getNumberButtonStyle(rating === n)}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  )
}

interface ImageUploadProps {
  imagePreview: string | null
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  t: (key: string) => string
}

function ImageUpload({ imagePreview, onImageChange, onRemove, t }: ImageUploadProps) {
  if (imagePreview) {
    return (
      <div className={styles.imagePreviewContainer}>
        <img src={imagePreview} alt={t('survey.preview')} className={styles.imagePreview} />
        <button type="button" onClick={onRemove} className={styles.removeImageButton} aria-label="Remove uploaded image">
          ✕
        </button>
      </div>
    )
  }

  return (
    <label className={styles.uploadCard}>
      <input type="file" accept="image/*" onChange={onImageChange} className={styles.fileInput} aria-label={t('survey.add_photo')} />
      <svg className={styles.cameraIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
      <span className={styles.uploadText}>{t('survey.add_photo')}</span>
    </label>
  )
}

interface SurveyHeaderProps {
  branding: BrandingConfig
  businessName: string | null
  glassEnabled: boolean
  derivedStyles: { fontWeight: number; logoSize: number; logoRadius: string }
  table: string
  t: (key: string, params?: Record<string, string | number>) => string
}

function SurveyHeader({ branding, businessName, glassEnabled, derivedStyles, table, t }: SurveyHeaderProps) {
  const isCentered = branding.layout.headerStyle === 'centered'
  
  return (
    <header 
      className={styles.header}
      style={{ 
        textAlign: isCentered ? 'center' : 'left',
        alignItems: isCentered ? 'center' : 'flex-start',
      }}
    >
      <Logo 
        url={branding.logoUrl}
        name={businessName}
        size={derivedStyles.logoSize}
        radius={derivedStyles.logoRadius}
      />
      
      {branding.custom.slogan && (
        <p 
          className={styles.slogan}
          style={{ 
            fontSize: branding.typography.subtitleSize,
            color: glassEnabled ? 'rgba(255, 255, 255, 0.8)' : branding.colors.secondary,
          }}
        >
          {branding.custom.slogan}
        </p>
      )}
      
      <h1 
        className={styles.title}
        style={{
          fontSize: branding.typography.titleSize,
          fontWeight: derivedStyles.fontWeight,
          color: glassEnabled ? 'rgba(255, 255, 255, 0.95)' : branding.colors.primary,
        }}
      >
        {t('survey.header')}
      </h1>
      <span className={styles.tableTag}>{t('survey.table', { number: table })}</span>
    </header>
  )
}

// ─────────────────────────────────────────────────────────────
// Main Survey Form Component
// ─────────────────────────────────────────────────────────────

function SurveyForm() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const table = searchParams.get('table')
  const business = searchParams.get('business')
  const location = searchParams.get('location') || 'Default'

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING)

  // Fetch business data on mount
  useEffect(() => {
    if (!business) return
    
    const fetchData = async () => {
      const { data } = await supabase
        .from('businesses')
        .select('name, branding')
        .eq('id', business)
        .single()
      
      if (data) {
        setBusinessName(data.name)
        if (data.branding) {
          setBranding(mergeBranding(data.branding))
        }
      }
    }
    
    fetchData()
  }, [business])

  // Memoized derived values
  const glassEnabled = branding.layout.glassEnabled ?? true
  const glassTint = branding.custom.glassCardTint || '#667eea'
  const ratingColor = branding.custom.ratingButtonColor || '#ffffff'
  
  const derivedStyles = useMemo(() => ({
    fontWeight: getFontWeight(branding.typography.fontWeight),
    logoSize: getLogoSize(branding.logoSize),
    logoRadius: getLogoRadius(branding.logoShape),
    background: glassEnabled
      ? `linear-gradient(135deg, ${glassTint} 0%, ${hexToRgba(glassTint, 0.7)} 50%, ${branding.colors.accent} 100%)`
      : branding.colors.background,
    cardBg: hexToRgba(glassTint, 0.15),
  }), [branding, glassEnabled, glassTint])

  /** Get style for emoji/rating buttons based on glass mode and selection */
  const getRatingButtonStyle = useCallback((isSelected: boolean) => {
    if (glassEnabled) {
      return {
        background: hexToRgba(ratingColor, isSelected ? 0.25 : 0.1),
        borderColor: hexToRgba(ratingColor, isSelected ? 0.5 : 0.2),
      }
    }
    return {
      borderColor: isSelected ? branding.colors.accent : 'transparent',
      backgroundColor: isSelected ? `${branding.colors.accent}15` : 'transparent',
    }
  }, [glassEnabled, ratingColor, branding.colors.accent])

  /** Get style for number rating buttons */
  const getNumberButtonStyle = useCallback((isSelected: boolean) => {
    if (glassEnabled) {
      return {
        backgroundColor: hexToRgba(ratingColor, isSelected ? 0.3 : 0.1),
        borderColor: hexToRgba(ratingColor, 0.3),
        color: 'rgba(255, 255, 255, 0.9)',
      }
    }
    return {
      backgroundColor: isSelected ? branding.colors.primary : 'transparent',
      borderColor: branding.colors.primary,
      color: isSelected ? '#fff' : branding.colors.primary,
    }
  }, [glassEnabled, ratingColor, branding.colors.primary])

  // Event handlers
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImage(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const removeImage = useCallback(() => {
    setImage(null)
    setImagePreview(null)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setUploading(true)

    if (!table || !business) {
      setError(t('survey.invalid_link'))
      setUploading(false)
      return
    }

    if (rating === 0) {
      setError(t('survey.rating_required'))
      setUploading(false)
      return
    }

    let imagePath: string | null = null

    if (image) {
      const fileExt = image.name.split('.').pop()
      const filePath = `feedback-images/${uuidv4()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('feedback-images')
        .upload(filePath, image)

      if (uploadError) {
        setError('Error uploading image: ' + uploadError.message)
        setUploading(false)
        return
      }
      imagePath = filePath
    }

    const { error: submitError } = await supabase
      .from('feedback')
      .insert([{ 
        table: parseInt(table), 
        business_id: business,
        location, 
        rating, 
        comment, 
        image_path: imagePath ? [imagePath] : null 
      }])

    if (submitError) {
      setError('Error submitting feedback: ' + submitError.message)
    } else {
      setSubmitted(true)
    }
    setUploading(false)
  }, [table, business, location, rating, comment, image, t])

  // ─── Status Screens ───
  if (!table || !business) {
    return <StatusScreen icon="⚠️" title={t('survey.invalid_link')} subtitle={t('survey.scan_valid_qr')} isError />
  }

  if (alreadySubmitted) {
    return <StatusScreen icon="🔒" title={t('survey.already_submitted')} subtitle={t('survey.once_per_visit')} />
  }

  if (submitted) {
    return <StatusScreen icon="✓" title={branding.custom.thankYouMessage || t('survey.thank_you')} subtitle={t('survey.feedback_helps')} />
  }

  // ─── Main Form ───
  return (
    <div 
      className={glassEnabled ? styles.container : styles.containerNoGlass}
      style={{ fontFamily: branding.typography.fontFamily, background: derivedStyles.background }}
    >
      {glassEnabled && <LiquidBlobs tint={glassTint} accent={branding.colors.accent} />}
      
      <div className={styles.content}>
        <div 
          className={glassEnabled ? styles.glassCard : styles.solidCard}
          style={glassEnabled ? { background: derivedStyles.cardBg } : undefined}
        >
          <LanguageSwitcher className={styles.languageSwitcher} activeColor={branding.custom.languageSwitcherColor} />
          
          <SurveyHeader
            branding={branding}
            businessName={businessName}
            glassEnabled={glassEnabled}
            derivedStyles={derivedStyles}
            table={table}
            t={t}
          />

          <form onSubmit={handleSubmit} className={styles.form} aria-label="Feedback form">
            <RatingSection
              rating={rating}
              setRating={setRating}
              showEmojis={branding.layout.showSentimentIcons}
              bodySize={branding.typography.bodySize}
              glassEnabled={glassEnabled}
              getRatingButtonStyle={getRatingButtonStyle}
              getNumberButtonStyle={getNumberButtonStyle}
              t={t}
            />

            {/* Comment Section */}
            <div className={styles.section}>
              <label htmlFor="feedback-comment" className="sr-only">{t('survey.comment_placeholder')}</label>
              <textarea
                id="feedback-comment"
                className={styles.textarea}
                placeholder={t('survey.comment_placeholder')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                aria-label="Additional comments"
              />
            </div>

            {/* Image Upload Section */}
            <div className={styles.section}>
              <ImageUpload
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                onRemove={removeImage}
                t={t}
              />
            </div>

            {error && <p className={styles.error} role="alert" aria-live="polite">{error}</p>}

            <button
              type="submit"
              disabled={uploading}
              className={styles.submitButton}
              style={{
                fontSize: branding.typography.bodySize,
                backgroundColor: glassEnabled 
                  ? hexToRgba(branding.custom.ctaButtonColor || branding.colors.primary, 0.85)
                  : branding.custom.ctaButtonColor || branding.colors.primary,
              }}
              aria-busy={uploading}
            >
              {uploading ? t('survey.sending') : (branding.custom.ctaButtonText || t('survey.submit'))}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Survey() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        {/* Liquid Background Blobs */}
        <div className={`${styles.liquidBlob} ${styles.liquidBlob1}`} aria-hidden="true" />
        <div className={`${styles.liquidBlob} ${styles.liquidBlob2}`} aria-hidden="true" />
        <div className={`${styles.liquidBlob} ${styles.liquidBlob3}`} aria-hidden="true" />
        
        <div className={styles.content}>
          <div className={styles.glassCard}>
            <div className={styles.loading} role="status" aria-live="polite">
              Loading...
            </div>
          </div>
        </div>
      </div>
    }>
      <SurveyForm />
    </Suspense>
  )
}

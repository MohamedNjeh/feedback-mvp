'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { useI18n, LanguageSwitcher } from '@/lib/i18n'
import { DEFAULT_BRANDING, type BrandingConfig } from '@/lib/types'
import styles from './survey.module.css'

function SurveyForm() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const table = searchParams.get('table')
  const business = searchParams.get('business')
  const location = searchParams.get('location') || 'Default'

  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING)

  const cookieName = `feedback_submitted_${business}_table_${table}`

  useEffect(() => {
    // Check if already submitted
    // Temporarily disabled for testing
    // if (typeof window !== 'undefined' && localStorage.getItem(cookieName)) {
    //   setAlreadySubmitted(true)
    // }

    if (business) {
      fetchBusinessData()
    }
  }, [cookieName, business])

  const fetchBusinessData = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('name, branding')
      .eq('id', business)
      .single()
    
    console.log('Business data fetched:', data, 'Error:', error)
    
    if (data) {
      setBusinessName(data.name)
      if (data.branding) {
        // Deep merge branding with defaults to handle nested objects
        const mergedBranding: BrandingConfig = {
          ...DEFAULT_BRANDING,
          ...data.branding,
          colors: { ...DEFAULT_BRANDING.colors, ...data.branding.colors },
          typography: { ...DEFAULT_BRANDING.typography, ...data.branding.typography },
          layout: { ...DEFAULT_BRANDING.layout, ...data.branding.layout },
          custom: { ...DEFAULT_BRANDING.custom, ...data.branding.custom },
        }
        console.log('Merged branding:', mergedBranding)
        setBranding(mergedBranding)
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `feedback-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('feedback-images')
        .upload(filePath, image)

      if (uploadError) {
        console.error('Upload error:', uploadError)
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

    if (!submitError) {
      // Temporarily disabled for testing
      // localStorage.setItem(cookieName, 'true')
      setSubmitted(true)
    } else {
      console.error('Supabase error:', submitError)
      setError('Error submitting feedback: ' + submitError.message)
    }
    setUploading(false)
  }

  // Invalid link screen
  if (!table || !business) {
    return (
      <div className={styles.container}>
        <div className={styles.errorScreen}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>{t('survey.invalid_link')}</h2>
          <p className={styles.errorSubtitle}>{t('survey.scan_valid_qr')}</p>
        </div>
      </div>
    )
  }

  // Already submitted screen
  if (alreadySubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successScreen}>
          <div className={styles.successIcon}>🔒</div>
          <h2 className={styles.successTitle}>{t('survey.already_submitted')}</h2>
          <p className={styles.successSubtitle}>{t('survey.once_per_visit')}</p>
        </div>
      </div>
    )
  }

  // Success screen
  if (submitted) {
    return (
      <div 
        className={styles.container}
        style={{ 
          backgroundColor: branding.colors.background,
          fontFamily: branding.typography.fontFamily,
        }}
      >
        <div className={styles.successScreen}>
          <div className={styles.successIcon} style={{ color: branding.colors.accent }}>✓</div>
          <h2 className={styles.successTitle} style={{ color: branding.colors.primary }}>
            {branding.custom.thankYouMessage || t('survey.thank_you')}
          </h2>
          <p className={styles.successSubtitle}>{t('survey.feedback_helps')}</p>
        </div>
      </div>
    )
  }

  // Helper for spacing
  const spacingValue = branding.layout.spacing === 'compact' ? '16px' : branding.layout.spacing === 'spacious' ? '32px' : '24px'
  
  // Helper for font weight
  const fontWeightValue = branding.typography.fontWeight === 'light' ? 300 : branding.typography.fontWeight === 'bold' ? 700 : 400

  // Helper for card style
  const cardStyles: React.CSSProperties = {
    ...(branding.layout.cardStyle === 'flat' && { boxShadow: 'none', border: '1px solid #E5E7EB' }),
    ...(branding.layout.cardStyle === 'elevated' && { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }),
    ...(branding.layout.cardStyle === 'rounded' && { borderRadius: '24px', border: '2px solid #E5E7EB' }),
  }

  // Helper for logo size
  const logoSizeValue = branding.logoSize === 'small' ? 48 : branding.logoSize === 'large' ? 96 : 72
  
  // Helper for logo shape
  const logoShapeStyle = branding.logoShape === 'square' ? '0' : branding.logoShape === 'circle' ? '50%' : '12px'

  return (
    <div 
      className={styles.container}
      style={{ 
        backgroundColor: branding.colors.background,
        fontFamily: branding.typography.fontFamily,
      }}
    >
      <div 
        className={styles.content}
        style={{
          ...cardStyles,
          padding: spacingValue,
        }}
      >
        {/* Language Switcher */}
        <LanguageSwitcher 
          className={styles.languageSwitcher} 
          activeColor={branding.custom.languageSwitcherColor}
        />
        
        {/* Header */}
        <div 
          className={styles.header}
          style={{ 
            textAlign: branding.layout.headerStyle === 'centered' ? 'center' : 'left',
            alignItems: branding.layout.headerStyle === 'centered' ? 'center' : 'flex-start',
          }}
        >
          {/* Logo */}
          {branding.logoUrl ? (
            <img 
              src={branding.logoUrl} 
              alt={businessName || 'Logo'}
              style={{
                width: logoSizeValue,
                height: logoSizeValue,
                objectFit: 'cover',
                borderRadius: logoShapeStyle,
              }}
            />
          ) : (
            <div 
              className={styles.logo}
              style={{
                width: logoSizeValue,
                height: logoSizeValue,
                backgroundColor: branding.colors.primary,
                borderRadius: logoShapeStyle,
                fontSize: logoSizeValue * 0.5,
              }}
            >
              {businessName ? businessName.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          
          {/* Slogan */}
          {branding.custom.slogan && (
            <p 
              className={styles.slogan}
              style={{ 
                color: branding.colors.secondary,
                fontSize: branding.typography.subtitleSize,
              }}
            >
              {branding.custom.slogan}
            </p>
          )}
          
          <h1 
            className={styles.title}
            style={{
              color: branding.colors.primary,
              fontSize: branding.typography.titleSize,
              fontWeight: fontWeightValue,
            }}
          >
            {t('survey.header')}
          </h1>
          <span className={styles.tableTag}>{t('survey.table', { number: table || '' })}</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Rating Section */}
          <div className={styles.section}>
            <label 
              className={styles.label}
              style={{ fontSize: branding.typography.bodySize }}
            >
              {t('survey.rate_experience')}
            </label>
            {branding.layout.showSentimentIcons && (
              <div className={styles.emojiContainer}>
                {[
                  { value: 1, emoji: '😡' },
                  { value: 2, emoji: '😞' },
                  { value: 3, emoji: '😐' },
                  { value: 4, emoji: '😊' },
                  { value: 5, emoji: '😍' },
                ].map(({ value, emoji }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setRating(value)}
                    className={`${styles.emojiButton} ${rating === value ? styles.emojiButtonActive : ''}`}
                    style={{
                      borderColor: rating === value ? branding.colors.accent : 'transparent',
                      backgroundColor: rating === value ? `${branding.colors.accent}15` : 'transparent',
                    }}
                  >
                    <span className={styles.emoji}>{emoji}</span>
                  </button>
                ))}
              </div>
            )}
            {!branding.layout.showSentimentIcons && (
              <div className={styles.ratingButtons}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(n)}
                    className={`${styles.ratingButton} ${rating === n ? styles.ratingButtonActive : ''}`}
                    style={{
                      backgroundColor: rating === n ? branding.colors.primary : 'transparent',
                      borderColor: branding.colors.primary,
                      color: rating === n ? '#fff' : branding.colors.primary,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comment Section */}
          <div className={styles.section}>
            <textarea
              className={styles.textarea}
              placeholder={t('survey.comment_placeholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {/* Image Upload Section */}
          <div className={styles.section}>
            {!imagePreview ? (
              <label className={styles.uploadCard}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                />
                <svg className={styles.cameraIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className={styles.uploadText}>{t('survey.add_photo')}</span>
              </label>
            ) : (
              <div className={styles.imagePreviewContainer}>
                <img src={imagePreview} alt={t('survey.preview')} className={styles.imagePreview} />
                <button type="button" onClick={removeImage} className={styles.removeImageButton}>
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && <p className={styles.error}>{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className={styles.submitButton}
            style={{
              backgroundColor: branding.custom.ctaButtonColor || branding.colors.primary,
              fontSize: branding.typography.bodySize,
            }}
          >
            {uploading ? t('survey.sending') : (branding.custom.ctaButtonText || t('survey.submit'))}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Survey() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    }>
      <SurveyForm />
    </Suspense>
  )
}

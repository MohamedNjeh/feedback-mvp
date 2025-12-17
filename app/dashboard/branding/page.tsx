'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'
import { useAuth, useBranding } from '@/hooks'
import { Sidebar } from '@/components/Sidebar'
import { UploadIcon, ResetIcon } from '@/components/Icons'
import { ALL_FONTS } from '@/lib/fonts'
import type { LogoSize, LogoShape, HeaderStyle, CardStyle, Spacing, FontWeight } from '@/lib/types'
import styles from './branding.module.css'

type SectionTab = 'logo' | 'colors' | 'typography' | 'layout' | 'custom'

export default function BrandingPage() {
  const { t } = useI18n()
  const { business, loading: authLoading } = useAuth()
  const {
    branding,
    setBranding,
    saveBranding,
    resetBranding,
    loading: brandingLoading,
    saving,
    error,
  } = useBranding(business?.id)

  const [activeTab, setActiveTab] = useState<SectionTab>('logo')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setSuccess('')
    const saved = await saveBranding()
    if (saved) {
      setSuccess(t('branding.saved') || 'Branding saved successfully!')
    }
  }

  const handleReset = () => {
    if (confirm(t('common.confirm_reset') || 'Are you sure you want to reset to default?')) {
      resetBranding()
    }
  }

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business) return

    // Validate file
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      alert('Please upload PNG, JPG, or SVG files only')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB')
      return
    }

    setUploadingLogo(true)
    const fileName = `${business.id}/logo-${Date.now()}.${file.name.split('.').pop()}`

    const { error: uploadError } = await supabase.storage
      .from('branding')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      alert('Failed to upload logo')
      setUploadingLogo(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('branding')
      .getPublicUrl(fileName)

    setBranding(prev => ({ ...prev, logoUrl: publicUrl }))
    setUploadingLogo(false)
  }

  const handleRemoveLogo = () => {
    setBranding(prev => ({ ...prev, logoUrl: null }))
  }

  const tabs: { key: SectionTab; label: string }[] = [
    { key: 'logo', label: t('branding.sections.logo') },
    { key: 'colors', label: t('branding.sections.colors') },
    { key: 'typography', label: t('branding.sections.typography') },
    { key: 'layout', label: t('branding.sections.layout') },
    { key: 'custom', label: t('branding.sections.custom') },
  ]

  if (authLoading || brandingLoading) {
    return <div className={styles.loading}>{t('common.loading')}</div>
  }

  return (
    <div className={styles.pageWrapper}>
      <Sidebar businessName={business?.name} dashboardLogo={business?.dashboard_logo} />

      <main className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div>
              <h1>{t('branding.title')}</h1>
              <p>{t('branding.subtitle')}</p>
            </div>
            <div className={styles.headerActions}>
              <button onClick={handleReset} className={styles.resetButton}>
                <ResetIcon />
                {t('branding.reset')}
              </button>
              <button onClick={handleSave} disabled={saving} className={styles.saveButton}>
                {saving ? t('branding.saving') : t('branding.save')}
              </button>
            </div>
          </div>
          {success && <div className={styles.success}>{success}</div>}
          {error && <div className={styles.error}>{error}</div>}
        </header>

        <div className={styles.contentGrid}>
          {/* Left Panel - Settings */}
          <div className={styles.settingsPanel}>
            {/* Tabs */}
            <div className={styles.tabs}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {/* Logo Section */}
              {activeTab === 'logo' && (
                <div className={styles.section}>
                  <h3>{t('branding.logo.title')}</h3>
                  
                  <div className={styles.uploadArea}>
                    {branding.logoUrl ? (
                      <div className={styles.logoPreview}>
                        <img
                          src={branding.logoUrl}
                          alt="Logo"
                          className={`${styles.logoImage} ${styles[`logo${branding.logoShape.charAt(0).toUpperCase() + branding.logoShape.slice(1)}`]}`}
                        />
                        <button onClick={handleRemoveLogo} className={styles.removeButton}>
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
                      onChange={handleLogoUpload}
                      hidden
                    />
                    {uploadingLogo && <div className={styles.uploading}>{t('common.uploading')}</div>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('branding.logo.size')}</label>
                    <div className={styles.buttonGroup}>
                      {(['small', 'medium', 'large'] as LogoSize[]).map(size => (
                        <button
                          key={size}
                          className={`${styles.optionButton} ${branding.logoSize === size ? styles.optionActive : ''}`}
                          onClick={() => setBranding(prev => ({ ...prev, logoSize: size }))}
                        >
                          {t(`branding.logo.${size}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('branding.logo.shape')}</label>
                    <div className={styles.buttonGroup}>
                      {(['square', 'rounded', 'circle'] as LogoShape[]).map(shape => (
                        <button
                          key={shape}
                          className={`${styles.optionButton} ${branding.logoShape === shape ? styles.optionActive : ''}`}
                          onClick={() => setBranding(prev => ({ ...prev, logoShape: shape }))}
                        >
                          {t(`branding.logo.${shape}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Colors Section */}
              {activeTab === 'colors' && (
                <div className={styles.section}>
                  <h3>{t('branding.colors.title')}</h3>
                  
                  <div className={styles.colorGrid}>
                    {(['primary', 'secondary', 'background', 'accent'] as const).map(colorKey => (
                      <div key={colorKey} className={styles.colorField}>
                        <label>{t(`branding.colors.${colorKey}`)}</label>
                        <div className={styles.colorInput}>
                          <input
                            type="color"
                            value={branding.colors[colorKey]}
                            onChange={(e) => setBranding(prev => ({
                              ...prev,
                              colors: { ...prev.colors, [colorKey]: e.target.value }
                            }))}
                          />
                          <input
                            type="text"
                            value={branding.colors[colorKey]}
                            onChange={(e) => setBranding(prev => ({
                              ...prev,
                              colors: { ...prev.colors, [colorKey]: e.target.value }
                            }))}
                            className={styles.hexInput}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Typography Section */}
              {activeTab === 'typography' && (
                <div className={styles.section}>
                  <h3>{t('branding.typography.title')}</h3>
                  
                  <div className={styles.formGroup}>
                    <label>{t('branding.typography.font_family')}</label>
                    <select
                      value={branding.typography.fontFamily}
                      onChange={(e) => setBranding(prev => ({
                        ...prev,
                        typography: { ...prev.typography, fontFamily: e.target.value }
                      }))}
                      className={styles.select}
                    >
                      {ALL_FONTS.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('branding.typography.title_size')}: {branding.typography.titleSize}px</label>
                    <input
                      type="range"
                      min="18"
                      max="48"
                      value={branding.typography.titleSize}
                      onChange={(e) => setBranding(prev => ({
                        ...prev,
                        typography: { ...prev.typography, titleSize: parseInt(e.target.value) }
                      }))}
                      className={styles.slider}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('branding.typography.subtitle_size')}: {branding.typography.subtitleSize}px</label>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={branding.typography.subtitleSize}
                      onChange={(e) => setBranding(prev => ({
                        ...prev,
                        typography: { ...prev.typography, subtitleSize: parseInt(e.target.value) }
                      }))}
                      className={styles.slider}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('branding.typography.body_size')}: {branding.typography.bodySize}px</label>
                    <input
                      type="range"
                      min="12"
                      max="20"
                      value={branding.typography.bodySize}
                      onChange={(e) => setBranding(prev => ({
                        ...prev,
                        typography: { ...prev.typography, bodySize: parseInt(e.target.value) }
                      }))}
                      className={styles.slider}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('branding.typography.font_weight')}</label>
                    <div className={styles.buttonGroup}>
                      {(['light', 'regular', 'bold'] as FontWeight[]).map(weight => (
                        <button
                          key={weight}
                          className={`${styles.optionButton} ${branding.typography.fontWeight === weight ? styles.optionActive : ''}`}
                          onClick={() => setBranding(prev => ({
                            ...prev,
                            typography: { ...prev.typography, fontWeight: weight }
                          }))}
                        >
                          {t(`branding.typography.${weight === 'regular' ? 'normal' : weight}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Layout Section */}
              {activeTab === 'layout' && (
                <div className={styles.section}>
                  <h3>{t('branding.layout.title')}</h3>
                  
                  <div className={styles.formGroup}>
                    <label>{t('branding.layout.header_style')}</label>
                    <div className={styles.buttonGroup}>
                      {(['minimal', 'centered', 'left-aligned'] as HeaderStyle[]).map(style => (
                        <button
                          key={style}
                          className={`${styles.optionButton} ${branding.layout.headerStyle === style ? styles.optionActive : ''}`}
                          onClick={() => setBranding(prev => ({
                            ...prev,
                            layout: { ...prev.layout, headerStyle: style }
                          }))}
                        >
                          {t(`branding.layout.${style === 'left-aligned' ? 'full_width' : style}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('branding.layout.card_style')}</label>
                    <div className={styles.buttonGroup}>
                      {(['flat', 'elevated', 'rounded'] as CardStyle[]).map(style => (
                        <button
                          key={style}
                          className={`${styles.optionButton} ${branding.layout.cardStyle === style ? styles.optionActive : ''}`}
                          onClick={() => setBranding(prev => ({
                            ...prev,
                            layout: { ...prev.layout, cardStyle: style }
                          }))}
                        >
                          {t(`branding.layout.${style === 'rounded' ? 'bordered' : style}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('branding.layout.spacing')}</label>
                    <div className={styles.buttonGroup}>
                      {(['compact', 'regular', 'spacious'] as Spacing[]).map(spacing => (
                        <button
                          key={spacing}
                          className={`${styles.optionButton} ${branding.layout.spacing === spacing ? styles.optionActive : ''}`}
                          onClick={() => setBranding(prev => ({
                            ...prev,
                            layout: { ...prev.layout, spacing }
                          }))}
                        >
                          {t(`branding.layout.${spacing === 'regular' ? 'comfortable' : spacing}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.toggleGroup}>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={branding.layout.showSentimentIcons}
                        onChange={(e) => setBranding(prev => ({
                          ...prev,
                          layout: { ...prev.layout, showSentimentIcons: e.target.checked }
                        }))}
                      />
                      <span className={styles.toggleSlider}></span>
                      {t('branding.layout.show_sentiment')}
                    </label>
                    
                  </div>
                </div>
              )}

              {/* Custom Section */}
              {activeTab === 'custom' && (
                <div className={styles.section}>
                  <h3>{t('branding.custom.title')}</h3>
                  
                  <div className={styles.formGroup}>
                    <label>{t('branding.custom.slogan')}</label>
                    <input
                      type="text"
                      value={branding.custom.slogan}
                      onChange={(e) => setBranding(prev => ({
                        ...prev,
                        custom: { ...prev.custom, slogan: e.target.value }
                      }))}
                      placeholder={t('branding.custom.slogan_placeholder')}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('branding.custom.thank_you')}</label>
                    <textarea
                      value={branding.custom.thankYouMessage}
                      onChange={(e) => setBranding(prev => ({
                        ...prev,
                        custom: { ...prev.custom, thankYouMessage: e.target.value }
                      }))}
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
                      onChange={(e) => setBranding(prev => ({
                        ...prev,
                        custom: { ...prev.custom, ctaButtonText: e.target.value }
                      }))}
                      placeholder={t('branding.custom.cta_text_placeholder')}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('branding.custom.cta_color')}</label>
                    <div className={styles.colorInput}>
                      <input
                        type="color"
                        value={branding.custom.ctaButtonColor}
                        onChange={(e) => setBranding(prev => ({
                          ...prev,
                          custom: { ...prev.custom, ctaButtonColor: e.target.value }
                        }))}
                      />
                      <input
                        type="text"
                        value={branding.custom.ctaButtonColor}
                        onChange={(e) => setBranding(prev => ({
                          ...prev,
                          custom: { ...prev.custom, ctaButtonColor: e.target.value }
                        }))}
                        className={styles.hexInput}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('branding.custom.lang_switcher_color')}</label>
                    <div className={styles.colorInput}>
                      <input
                        type="color"
                        value={branding.custom.languageSwitcherColor || '#6B7280'}
                        onChange={(e) => setBranding(prev => ({
                          ...prev,
                          custom: { ...prev.custom, languageSwitcherColor: e.target.value }
                        }))}
                      />
                      <input
                        type="text"
                        value={branding.custom.languageSwitcherColor || '#6B7280'}
                        onChange={(e) => setBranding(prev => ({
                          ...prev,
                          custom: { ...prev.custom, languageSwitcherColor: e.target.value }
                        }))}
                        className={styles.hexInput}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Live Preview */}
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
                className={`${styles.previewCard} ${styles[`card${branding.layout.cardStyle.charAt(0).toUpperCase() + branding.layout.cardStyle.slice(1)}`]}`}
                style={{
                  padding: branding.layout.spacing === 'compact' ? '16px' : branding.layout.spacing === 'spacious' ? '32px' : '24px',
                }}
              >
                {/* Logo Preview */}
                {branding.logoUrl && (
                  <div className={`${styles.previewLogo} ${styles[`previewLogo${branding.logoSize.charAt(0).toUpperCase() + branding.logoSize.slice(1)}`]}`}>
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      className={styles[`logo${branding.logoShape.charAt(0).toUpperCase() + branding.logoShape.slice(1)}`]}
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
                <h2
                  style={{
                    fontSize: `${branding.typography.titleSize}px`,
                    fontWeight: branding.typography.fontWeight === 'light' ? 300 : branding.typography.fontWeight === 'bold' ? 700 : 400,
                    color: branding.colors.primary,
                    textAlign: branding.layout.headerStyle === 'centered' ? 'center' : 'left',
                  }}
                >
                  {t('survey.header')}
                </h2>

                {/* Emoji Rating Preview */}
                {branding.layout.showSentimentIcons && (
                  <div className={styles.previewEmojis}>
                    {['😡', '😞', '😐', '😊', '😍'].map((emoji, index) => (
                      <span
                        key={index}
                        className={styles.previewEmoji}
                        style={{ 
                          opacity: index === 3 ? 1 : 0.5,
                          border: index === 3 ? `2px solid ${branding.colors.accent}` : '2px solid transparent',
                          backgroundColor: index === 3 ? `${branding.colors.accent}15` : 'transparent',
                        }}
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
        </div>
      </main>
    </div>
  )
}

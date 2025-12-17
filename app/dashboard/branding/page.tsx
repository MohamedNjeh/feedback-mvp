'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'
import { useAuth, useBranding } from '@/hooks'
import { Sidebar } from '@/components/Sidebar'
import { ResetIcon } from '@/components/Icons'
import {
  LogoSection,
  ColorsSection,
  TypographySection,
  LayoutSection,
  CustomSection,
  PreviewPanel,
} from './components'
import styles from './branding.module.css'

type SectionTab = 'logo' | 'colors' | 'typography' | 'layout' | 'custom'

const TABS: { key: SectionTab; labelKey: string }[] = [
  { key: 'logo', labelKey: 'branding.sections.logo' },
  { key: 'colors', labelKey: 'branding.sections.colors' },
  { key: 'typography', labelKey: 'branding.sections.typography' },
  { key: 'layout', labelKey: 'branding.sections.layout' },
  { key: 'custom', labelKey: 'branding.sections.custom' },
]

const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

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

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert('Please upload PNG, JPG, or SVG files only')
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 2MB')
      return false
    }
    return true
  }

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business) return

    if (!validateFile(file)) return

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

  const renderTabContent = () => {
    const commonProps = { branding, setBranding, t }

    switch (activeTab) {
      case 'logo':
        return (
          <LogoSection
            {...commonProps}
            uploadingLogo={uploadingLogo}
            fileInputRef={fileInputRef}
            onLogoUpload={handleLogoUpload}
            onRemoveLogo={handleRemoveLogo}
          />
        )
      case 'colors':
        return <ColorsSection {...commonProps} />
      case 'typography':
        return <TypographySection {...commonProps} />
      case 'layout':
        return <LayoutSection {...commonProps} />
      case 'custom':
        return <CustomSection {...commonProps} />
      default:
        return null
    }
  }

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
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                >
                  {t(tab.labelKey)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {renderTabContent()}
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <PreviewPanel branding={branding} t={t} />
        </div>
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/hooks'
import { Sidebar } from '@/components/Sidebar'
import { UploadIcon } from '@/components/Icons'
import styles from './settings.module.css'

export default function SettingsPage() {
  const { t } = useI18n()
  const { user, business, loading: authLoading } = useAuth()
  const [businessName, setBusinessName] = useState('')
  const [dashboardLogo, setDashboardLogo] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (business?.name) {
      setBusinessName(business.name)
    }
    if (business?.dashboard_logo) {
      setDashboardLogo(business.dashboard_logo)
    }
  }, [business?.name, business?.dashboard_logo])

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business) return

    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      setError('Please upload PNG, JPG, or SVG files only')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB')
      return
    }

    setUploadingLogo(true)
    setError('')
    const fileName = `${business.id}/dashboard-logo-${Date.now()}.${file.name.split('.').pop()}`

    const { error: uploadError } = await supabase.storage
      .from('branding')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      setError('Failed to upload logo: ' + uploadError.message)
      setUploadingLogo(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('branding')
      .getPublicUrl(fileName)

    // Save to database
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ dashboard_logo: publicUrl })
      .eq('id', business.id)

    if (updateError) {
      setError('Failed to save logo: ' + updateError.message)
    } else {
      setDashboardLogo(publicUrl)
      setSuccess(t('settings.logo_updated') || 'Logo updated successfully!')
    }
    setUploadingLogo(false)
  }

  const handleRemoveLogo = async () => {
    if (!business) return
    
    setSaving(true)
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ dashboard_logo: null })
      .eq('id', business.id)

    if (updateError) {
      setError('Failed to remove logo')
    } else {
      setDashboardLogo(null)
      setSuccess(t('settings.logo_removed') || 'Logo removed successfully!')
    }
    setSaving(false)
  }

  const handleSaveBusinessName = async () => {
    if (!business || !businessName.trim()) return
    
    setSaving(true)
    setError('')
    setSuccess('')

    const { error: updateError } = await supabase
      .from('businesses')
      .update({ name: businessName.trim() })
      .eq('id', business.id)

    if (updateError) {
      setError('Failed to update business name: ' + updateError.message)
    } else {
      setSuccess(t('settings.name_saved') || 'Business name updated successfully!')
    }
    setSaving(false)
  }

  if (authLoading) {
    return <div className={styles.loading}>{t('common.loading')}</div>
  }

  return (
    <div className={styles.pageWrapper}>
      <Sidebar businessName={business?.name} dashboardLogo={business?.dashboard_logo} />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <h1>{t('settings.title')}</h1>
          <p>{t('settings.subtitle')}</p>
        </header>

        {/* Business Settings */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h2>{t('settings.business_info')}</h2>
          </div>
          <div className={styles.cardBody}>
            {success && <div className={styles.success}>{success}</div>}
            {error && <div className={styles.error}>{error}</div>}
            
            {/* Dashboard Logo */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('settings.dashboard_logo')}</label>
              <div className={styles.logoSection}>
                {dashboardLogo ? (
                  <div className={styles.logoPreview}>
                    <img src={dashboardLogo} alt="Dashboard Logo" className={styles.logoImage} />
                    <button onClick={handleRemoveLogo} className={styles.removeButton} disabled={saving}>
                      {t('settings.remove')}
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                    <UploadIcon className={styles.uploadIcon} />
                    <p>{t('settings.upload_logo')}</p>
                    <span>{t('settings.logo_formats')}</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleLogoUpload}
                  hidden
                />
                {uploadingLogo && <p className={styles.uploading}>{t('settings.uploading')}</p>}
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('settings.business_name')}</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={styles.input}
                placeholder={t('settings.business_name_placeholder')}
              />
            </div>
            
            <button
              onClick={handleSaveBusinessName}
              disabled={saving || !businessName.trim() || businessName === business?.name}
              className={styles.saveButton}
            >
              {saving ? t('settings.saving') : t('settings.save_changes')}
            </button>
          </div>
        </div>

        {/* Account Settings */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h2>{t('settings.account_info')}</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('settings.email')}</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className={styles.input}
              />
              <p className={styles.infoText}>{t('settings.email_readonly')}</p>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('settings.account_id')}</label>
              <input
                type="text"
                value={user?.id || ''}
                disabled
                className={styles.input}
              />
              <p className={styles.infoText}>{t('settings.account_id_info')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

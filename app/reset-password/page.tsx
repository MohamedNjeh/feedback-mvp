'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useI18n, LanguageSwitcher } from '@/lib/i18n'
import styles from './reset-password.module.css'

export default function ResetPassword() {
  const { t } = useI18n()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user came from email link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // No session means invalid or expired link
        setError(t('dashboard.reset_password.invalid_link'))
      }
    }
    checkSession()
  }, [t])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError(t('dashboard.reset_password.passwords_mismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('dashboard.reset_password.password_too_short'))
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(t('dashboard.reset_password.success'))
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <LanguageSwitcher className={styles.languageSwitcher} />
        
        <div className={styles.header}>
          <h1 className={styles.logo}>Feedback</h1>
          <h2 className={styles.title}>{t('dashboard.reset_password.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.reset_password.subtitle')}</p>
        </div>

        <form onSubmit={handleResetPassword} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.reset_password.new_password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('dashboard.reset_password.new_password_placeholder')}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.reset_password.confirm_password')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('dashboard.reset_password.confirm_password_placeholder')}
              required
              className={styles.input}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? t('dashboard.reset_password.updating') : t('dashboard.reset_password.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useI18n, LanguageSwitcher } from '@/lib/i18n'
import styles from './forgot-password.module.css'

export default function ForgotPassword() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(t('dashboard.forgot_password.success'))
    }
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <LanguageSwitcher className={styles.languageSwitcher} />
        
        <div className={styles.header}>
          <h1 className={styles.logo}>Feedback</h1>
          <h2 className={styles.title}>{t('dashboard.forgot_password.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.forgot_password.subtitle')}</p>
        </div>

        <form onSubmit={handleResetPassword} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.login.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('dashboard.login.email_placeholder')}
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
            {loading ? t('dashboard.forgot_password.sending') : t('dashboard.forgot_password.submit')}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            {t('dashboard.forgot_password.remember')}{' '}
            <Link href="/login">{t('dashboard.forgot_password.back_to_login')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

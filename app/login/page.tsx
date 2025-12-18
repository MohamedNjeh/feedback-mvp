'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useI18n, LanguageSwitcher } from '@/lib/i18n'
import styles from './login.module.css'

export default function Login() {
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Check if business exists, create if not (for users who confirmed email)
    if (data.user) {
      const { data: businessData } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!businessData) {
        // Business doesn't exist - create it using metadata from signup
        const businessName = data.user.user_metadata?.business_name || 'My Business'
        const { error: businessError } = await supabase
          .from('businesses')
          .insert([
            {
              id: data.user.id,
              name: businessName,
              owner_email: email,
            },
          ])

        if (businessError) {
          console.error('Business creation error:', businessError)
        }
      }
    }

    router.push('/dashboard')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <LanguageSwitcher className={styles.languageSwitcher} />
        
        <div className={styles.header}>
          <h1 className={styles.logo}>Feedback</h1>
          <h2 className={styles.title}>{t('dashboard.login.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.login.subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
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

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.login.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('dashboard.login.password_placeholder')}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.forgotPassword}>
            <Link href="/forgot-password">{t('dashboard.login.forgot_password')}</Link>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? t('dashboard.login.signing_in') : t('dashboard.login.submit')}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            {t('dashboard.login.no_account')}{' '}
            <Link href="/signup">{t('dashboard.login.signup_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

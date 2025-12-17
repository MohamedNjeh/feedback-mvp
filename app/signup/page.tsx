'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useI18n, LanguageSwitcher } from '@/lib/i18n'
import styles from './signup.module.css'

export default function Signup() {
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Sign up the user with business name in metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user && authData.session) {
      // User is signed up and has a session - create business
      const { error: businessError } = await supabase
        .from('businesses')
        .insert([
          {
            id: authData.user.id,
            name: businessName,
            owner_email: email,
          },
        ])

      if (businessError) {
        console.error('Business creation error:', businessError)
        setError('Account created but failed to create business: ' + businessError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } else if (authData.user && !authData.session) {
      // Email confirmation is required
      setLoading(false)
      setSuccess('Please check your email to confirm your account, then log in.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <LanguageSwitcher className={styles.languageSwitcher} />
        
        <div className={styles.header}>
          <h1 className={styles.logo}>Feedback</h1>
          <h2 className={styles.title}>{t('dashboard.signup.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.signup.subtitle')}</p>
        </div>

        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.signup.business_name')}</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={t('dashboard.signup.business_placeholder')}
              required
              className={styles.input}
            />
          </div>

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
              placeholder={t('dashboard.signup.password_placeholder')}
              required
              minLength={6}
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
            {loading ? t('dashboard.signup.creating') : t('dashboard.signup.submit')}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            {t('dashboard.signup.have_account')}{' '}
            <Link href="/login">{t('dashboard.signup.login_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

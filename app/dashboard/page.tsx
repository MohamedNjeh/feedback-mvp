'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { useAuth, useFeedback } from '@/hooks'
import { isAlert, formatRelativeTime, isToday, calculateAverageRating, getRatingEmoji } from '@/lib/utils'
import { Sidebar } from '@/components/Sidebar'
import type { Feedback } from '@/lib/types'
import styles from './dashboard.module.css'

export default function Dashboard() {
  const { t } = useI18n()
  const { business, loading: authLoading } = useAuth()
  const { feedbacks, loading: feedbackLoading } = useFeedback(business?.id)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)

  const loading = authLoading || feedbackLoading

  // Calculate stats
  const todayFeedbacks = feedbacks.filter(f => isToday(f.timestamp))
  const todayAverage = calculateAverageRating(todayFeedbacks)
  const alertsCount = feedbacks.filter(isAlert).length

  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>
  }

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar businessName={business?.name} dashboardLogo={business?.dashboard_logo} alertCount={alertsCount} />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{t('dashboard.overview.title')}</h1>
          <p className={styles.pageSubtitle}>{t('dashboard.overview.subtitle')}</p>
        </header>

        {/* Overview Cards */}
        <div className={styles.cardsGrid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>{t('dashboard.overview.today_score')}</p>
            <p className={styles.cardValue}>{todayAverage}</p>
            <p className={styles.cardSubtext}>{t('dashboard.overview.based_on', { count: todayFeedbacks.length })}</p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>{t('dashboard.overview.new_feedback')}</p>
            <p className={styles.cardValue}>{todayFeedbacks.length}</p>
            <p className={styles.cardSubtext}>{t('dashboard.overview.received_today')}</p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>{t('dashboard.overview.alerts_triggered')}</p>
            <p className={styles.cardValue} style={{ color: alertsCount > 0 ? '#FF4D4F' : undefined }}>{alertsCount}</p>
            <p className={styles.cardSubtext}>{t('dashboard.overview.need_attention')}</p>
          </div>
        </div>

        {/* Recent Feedback */}
        <section className={styles.feedbackSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('dashboard.recent.title')}</h2>
            <Link href="/dashboard/feedback" className={styles.viewAllLink}>
              {t('dashboard.recent.view_all')} →
            </Link>
          </div>
          
          <div className={styles.feedbackList}>
            {feedbacks.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{t('dashboard.recent.empty')}</p>
              </div>
            ) : (
              feedbacks.slice(0, 10).map((f) => (
                <div
                  key={f.id}
                  className={`${styles.feedbackItem} ${isAlert(f) ? styles.feedbackItemAlert : ''}`}
                  onClick={() => setSelectedFeedback(f)}
                >
                  <div className={styles.feedbackContent}>
                    <div className={styles.feedbackHeader}>
                      <span className={styles.feedbackEmoji}>{getRatingEmoji(f.rating)}</span>
                      <span className={styles.feedbackTable}>{t('survey.table', { number: f.table })}</span>
                    </div>
                    <p className={styles.feedbackComment}>{f.comment || t('dashboard.recent.no_comment')}</p>
                    <span className={styles.feedbackTime}>{formatRelativeTime(f.timestamp)}</span>
                  </div>
                  {f.imageUrl && (
                    <img src={f.imageUrl} alt="" className={styles.feedbackImage} />
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className={styles.modal} onClick={() => setSelectedFeedback(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t('dashboard.modal.title')}</h3>
              <button className={styles.modalClose} onClick={() => setSelectedFeedback(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              {selectedFeedback.imageUrl && (
                <img src={selectedFeedback.imageUrl} alt="" className={styles.modalImage} />
              )}
              <div className={styles.modalRow}>
                <p className={styles.modalLabel}>{t('dashboard.modal.rating')}</p>
                <span className={styles.modalEmoji}>{getRatingEmoji(selectedFeedback.rating)}</span>
              </div>
              <div className={styles.modalRow}>
                <p className={styles.modalLabel}>{t('dashboard.modal.table')}</p>
                <p className={styles.modalValue}>{t('survey.table', { number: selectedFeedback.table })}</p>
              </div>
              <div className={styles.modalRow}>
                <p className={styles.modalLabel}>{t('dashboard.modal.location')}</p>
                <p className={styles.modalValue}>{selectedFeedback.location || t('dashboard.modal.not_specified')}</p>
              </div>
              <div className={styles.modalRow}>
                <p className={styles.modalLabel}>{t('dashboard.modal.comment')}</p>
                <p className={styles.modalValue}>{selectedFeedback.comment || t('dashboard.recent.no_comment')}</p>
              </div>
              <div className={styles.modalRow}>
                <p className={styles.modalLabel}>{t('dashboard.modal.time')}</p>
                <p className={styles.modalValue}>{new Date(selectedFeedback.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

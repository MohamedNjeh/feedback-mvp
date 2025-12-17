'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useAuth, useFeedback } from '@/hooks'
import { isAlert, getRatingEmoji } from '@/lib/utils'
import { Sidebar } from '@/components/Sidebar'
import type { Feedback } from '@/lib/types'
import styles from './feedback.module.css'

type FilterType = 'all' | 'positive' | 'negative' | 'with-image'

export default function FeedbackPage() {
  const { t } = useI18n()
  const { business, loading: authLoading } = useAuth()
  const { feedbacks, loading: feedbackLoading } = useFeedback(business?.id)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const loading = authLoading || feedbackLoading

  // Alert count for sidebar
  const alertsCount = feedbacks.filter(isAlert).length

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(f => {
    switch (filter) {
      case 'positive':
        return f.rating >= 4
      case 'negative':
        return f.rating <= 2
      case 'with-image':
        return f.image_path && f.image_path.length > 0
      default:
        return true
    }
  })

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>
  }

  return (
    <div className={styles.pageWrapper}>
      <Sidebar businessName={business?.name} dashboardLogo={business?.dashboard_logo} alertCount={alertsCount} />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <div className={styles.headerText}>
            <h1>{t('feedback.title')}</h1>
            <p>{t('feedback.total_responses', { count: feedbacks.length })}</p>
          </div>
        </header>

        {/* Filters */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('feedback.filter_all')} ({feedbacks.length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'positive' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('positive')}
          >
            {t('feedback.filter_positive')} ({feedbacks.filter(f => f.rating >= 4).length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'negative' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('negative')}
          >
            {t('feedback.filter_negative')} ({feedbacks.filter(f => f.rating <= 2).length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'with-image' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('with-image')}
          >
            {t('feedback.filter_with_image')} ({feedbacks.filter(f => f.image_path && f.image_path.length > 0).length})
          </button>
        </div>

        {/* Feedback List */}
        {filteredFeedbacks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{t('feedback.no_results')}</p>
          </div>
        ) : (
          <div className={styles.feedbackList}>
            {filteredFeedbacks.map((f) => (
              <div
                key={f.id}
                className={`${styles.feedbackCard} ${isAlert(f) ? styles.feedbackCardAlert : ''}`}
                onClick={() => setSelectedFeedback(f)}
              >
                <div className={styles.feedbackHeader}>
                  <div className={styles.feedbackMeta}>
                    <span className={styles.feedbackEmoji}>{getRatingEmoji(f.rating)}</span>
                    <span className={styles.feedbackTable}>{t('survey.table', { number: f.table })}</span>
                  </div>
                  <span className={styles.feedbackTime}>{formatTime(f.timestamp)}</span>
                </div>
                <div className={styles.feedbackBody}>
                  <div className={styles.feedbackContent}>
                    <p className={styles.feedbackComment}>{f.comment || t('dashboard.recent.no_comment')}</p>
                  </div>
                  {f.imageUrl && (
                    <img src={f.imageUrl} alt="" className={styles.feedbackImage} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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

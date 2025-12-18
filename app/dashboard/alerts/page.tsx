'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'
import { useAuth, useFeedback } from '@/hooks'
import { isAlert, getMatchedKeyword, formatRelativeTime, getRatingEmoji } from '@/lib/utils'
import { ALERT_RATING_THRESHOLD } from '@/lib/constants'
import { Sidebar } from '@/components/Sidebar'
import type { Feedback } from '@/lib/types'
import styles from './alerts.module.css'

export default function AlertsPage() {
  const { t } = useI18n()
  const { business, loading: authLoading } = useAuth()
  const { feedbacks, loading: feedbackLoading } = useFeedback(business?.id)
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const loading = authLoading || feedbackLoading

  // Fetch resolved alerts from database
  const fetchResolvedAlerts = useCallback(async () => {
    if (!business?.id) return

    const { data, error } = await supabase
      .from('resolved_alerts')
      .select('feedback_id')
      .eq('business_id', business.id)

    if (!error && data) {
      setResolvedIds(new Set(data.map((r) => r.feedback_id)))
    }
  }, [business?.id])

  useEffect(() => {
    fetchResolvedAlerts()
  }, [fetchResolvedAlerts])

  // Filter alerts from feedbacks
  const alerts = feedbacks.filter(isAlert)
  const unresolvedAlerts = alerts.filter((a) => !resolvedIds.has(a.id))

  const getAlertReason = (f: Feedback): string => {
    if (f.rating <= ALERT_RATING_THRESHOLD) return t('alerts.low_rating')
    const matchedKeyword = getMatchedKeyword(f.comment)
    if (matchedKeyword) return `${t('alerts.contains_keyword', { keyword: matchedKeyword })}`
    return t('alerts.title')
  }

  const handleResolve = async (feedbackId: string) => {
    if (!business?.id) return

    setResolvingId(feedbackId)

    const { error } = await supabase
      .from('resolved_alerts')
      .insert({
        feedback_id: feedbackId,
        business_id: business.id,
        resolved_by: business.id,
      })

    if (!error) {
      setResolvedIds((prev) => new Set([...prev, feedbackId]))
    } else {
      console.error('Error resolving alert:', error)
      // If it's a duplicate, still mark as resolved locally
      if (error.code === '23505') {
        setResolvedIds((prev) => new Set([...prev, feedbackId]))
      }
    }

    setResolvingId(null)
  }

  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>
  }

  return (
    <div className={styles.pageWrapper}>
      <Sidebar businessName={business?.name} dashboardLogo={business?.dashboard_logo} alertCount={unresolvedAlerts.length} />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <h1>{t('alerts.title')}</h1>
          <p>{t('alerts.need_attention', { count: unresolvedAlerts.length })}</p>
        </header>

        {/* Alert List */}
        {unresolvedAlerts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✓</div>
            <h3>{t('alerts.all_clear')}</h3>
            <p>{t('alerts.no_alerts')}</p>
          </div>
        ) : (
          <div className={styles.alertList}>
            {unresolvedAlerts.map((alert) => (
              <div key={alert.id} className={styles.alertCard}>
                <div className={styles.alertContent}>
                  <div className={styles.alertHeader}>
                    <span className={styles.alertEmoji}>{getRatingEmoji(alert.rating)}</span>
                    <span className={styles.alertTable}>{t('survey.table', { number: alert.table })}</span>
                    <span className={styles.alertReason}>{getAlertReason(alert)}</span>
                  </div>
                  <p className={styles.alertComment}>{alert.comment || t('dashboard.recent.no_comment')}</p>
                  <span className={styles.alertTime}>{formatRelativeTime(alert.timestamp)}</span>
                </div>
                <div className={styles.alertActions}>
                  <button
                    className={styles.resolveButton}
                    onClick={() => handleResolve(alert.id)}
                    disabled={resolvingId === alert.id}
                  >
                    {resolvingId === alert.id ? '...' : t('alerts.mark_resolved')}
                  </button>
                  <button
                    className={styles.viewButton}
                    onClick={() => setSelectedFeedback(alert)}
                  >
                    {t('alerts.view_details')}
                  </button>
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
              <h3 className={styles.modalTitle}>{t('alerts.alert_details')}</h3>
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
                <p className={styles.modalLabel}>{t('alerts.alert_reason')}</p>
                <p className={styles.modalValue} style={{ color: '#FF4D4F' }}>{getAlertReason(selectedFeedback)}</p>
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

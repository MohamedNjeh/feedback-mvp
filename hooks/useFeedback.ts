'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchFeedbackWithImages } from '@/lib/utils'
import type { Feedback } from '@/lib/types'

interface UseFeedbackReturn {
  feedbacks: Feedback[]
  loading: boolean
  refetch: () => Promise<void>
}

export function useFeedback(businessId: string | undefined): UseFeedbackReturn {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeedback = useCallback(async () => {
    if (!businessId) return

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('business_id', businessId)
      .order('timestamp', { ascending: false })
    
    if (!error && data) {
      const feedbacksWithUrls = await fetchFeedbackWithImages(data)
      setFeedbacks(feedbacksWithUrls)
    }
    setLoading(false)
  }, [businessId])

  useEffect(() => {
    if (!businessId) return

    fetchFeedback()

    // Setup realtime subscription
    const channel = supabase
      .channel(`feedback-${businessId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feedback', filter: `business_id=eq.${businessId}` },
        async (payload) => {
          const newFeedback = payload.new as Feedback
          const [feedbackWithUrl] = await fetchFeedbackWithImages([newFeedback])
          setFeedbacks((prev) => [feedbackWithUrl, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [businessId, fetchFeedback])

  return { feedbacks, loading, refetch: fetchFeedback }
}

import { supabase } from './supabase'
import { NEGATIVE_KEYWORDS, ALERT_RATING_THRESHOLD } from './constants'
import type { Feedback } from './types'

/**
 * Check if feedback should trigger an alert
 */
export function isAlert(feedback: Feedback): boolean {
  const hasLowRating = feedback.rating <= ALERT_RATING_THRESHOLD
  const hasNegativeKeyword = NEGATIVE_KEYWORDS.some((keyword) =>
    feedback.comment?.toLowerCase().includes(keyword.toLowerCase())
  )
  return hasLowRating || hasNegativeKeyword
}

/**
 * Find which negative keyword triggered the alert
 */
export function getMatchedKeyword(comment: string): string | null {
  if (!comment) return null
  const lowerComment = comment.toLowerCase()
  return NEGATIVE_KEYWORDS.find((k) => lowerComment.includes(k.toLowerCase())) || null
}

/**
 * Get a signed URL for an image in storage
 */
export async function getSignedUrl(path: string): Promise<string | undefined> {
  const { data, error } = await supabase.storage
    .from('feedback-images')
    .createSignedUrl(path, 3600)
  
  if (error) {
    console.error('Error getting signed URL:', error)
    return undefined
  }
  return data.signedUrl
}

/**
 * Fetch feedback with signed image URLs
 */
export async function fetchFeedbackWithImages(feedbacks: Feedback[]): Promise<Feedback[]> {
  return Promise.all(
    feedbacks.map(async (f) => {
      if (f.image_path && f.image_path.length > 0) {
        f.imageUrl = await getSignedUrl(f.image_path[0])
      }
      return f
    })
  )
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
  return date.toLocaleDateString()
}

/**
 * Check if feedback is from today
 */
export function isToday(timestamp: string): boolean {
  const today = new Date()
  const feedbackDate = new Date(timestamp)
  return feedbackDate.toDateString() === today.toDateString()
}

/**
 * Calculate average rating
 */
export function calculateAverageRating(feedbacks: Feedback[]): string {
  if (feedbacks.length === 0) return '0.0'
  const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0)
  return (sum / feedbacks.length).toFixed(1)
}

/**
 * Get emoji for rating
 */
export function getRatingEmoji(rating: number): string {
  const emojis: Record<number, string> = {
    1: '😡',
    2: '😞',
    3: '😐',
    4: '😊',
    5: '😍',
  }
  return emojis[rating] || '😐'
}

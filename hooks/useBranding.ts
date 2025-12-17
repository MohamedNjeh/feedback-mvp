'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { BrandingConfig } from '@/lib/types'
import { DEFAULT_BRANDING } from '@/lib/types'

interface UseBrandingReturn {
  branding: BrandingConfig
  setBranding: React.Dispatch<React.SetStateAction<BrandingConfig>>
  updateBranding: (updates: Partial<BrandingConfig>) => void
  saveBranding: () => Promise<boolean>
  resetBranding: () => void
  loading: boolean
  saving: boolean
  error: string | null
}

export function useBranding(businessId: string | undefined): UseBrandingReturn {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load branding from database
  useEffect(() => {
    if (!businessId) {
      setLoading(false)
      return
    }

    const loadBranding = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('branding')
        .eq('id', businessId)
        .single()

      if (error) {
        console.error('Error loading branding:', error)
      } else if (data?.branding) {
        setBranding({ ...DEFAULT_BRANDING, ...data.branding })
      }
      setLoading(false)
    }

    loadBranding()
  }, [businessId])

  // Update partial branding
  const updateBranding = useCallback((updates: Partial<BrandingConfig>) => {
    setBranding(prev => ({ ...prev, ...updates }))
  }, [])

  // Save branding to database
  const saveBranding = useCallback(async (): Promise<boolean> => {
    if (!businessId) {
      console.error('No businessId provided')
      return false
    }

    setSaving(true)
    setError(null)

    console.log('Saving branding for business:', businessId)
    console.log('Branding data:', branding)

    const { data, error } = await supabase
      .from('businesses')
      .update({ branding })
      .eq('id', businessId)
      .select()

    console.log('Save response - data:', data, 'error:', error)

    setSaving(false)

    if (error) {
      console.error('Failed to save branding:', error)
      setError('Failed to save branding: ' + error.message)
      return false
    }

    return true
  }, [businessId, branding])

  // Reset to default
  const resetBranding = useCallback(() => {
    setBranding(DEFAULT_BRANDING)
  }, [])

  return {
    branding,
    setBranding,
    updateBranding,
    saveBranding,
    resetBranding,
    loading,
    saving,
    error,
  }
}

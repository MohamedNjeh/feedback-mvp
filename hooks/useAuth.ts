'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Business } from '@/lib/types'

interface UseAuthReturn {
  user: User | null
  business: Business | null
  loading: boolean
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)

      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', user.id)
        .single()

      if (businessData) {
        setBusiness(businessData)
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [router])

  return { user, business, loading }
}

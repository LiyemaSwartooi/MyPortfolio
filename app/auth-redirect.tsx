"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * CRITICAL SECURITY COMPONENT
 * 
 * This component immediately redirects any OAuth authorization codes
 * to the secure callback handler to prevent code exposure in:
 * - Browser history
 * - Analytics logs
 * - Referer headers
 * - Browser console
 * 
 * OAuth codes should NEVER be visible to the user!
 */
export function AuthRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if there's an OAuth code in the URL
    const code = searchParams.get('code')
    
    if (code) {
      // CRITICAL: Immediately redirect to secure callback handler
      // This prevents the code from:
      // 1. Being stored in browser history
      // 2. Being logged by analytics
      // 3. Being exposed to user
      // 4. Being leaked via Referer header
      
      // Use replace() instead of push() to prevent back button from exposing code
      window.location.replace(`/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  return null // This component has no visual output
}


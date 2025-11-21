"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        // Silently handle auth errors - it's normal for users to not be logged in
        if (error) {
          // Don't log expected auth errors (session missing, refresh token expired, etc.)
          const expectedErrors = ['session', 'refresh', 'token', 'not found', 'invalid', 'missing']
          const isExpectedError = expectedErrors.some(keyword => 
            error.message?.toLowerCase().includes(keyword)
          )
          
          if (!isExpectedError) {
            console.error('Unexpected auth error:', error)
          }
          setUser(null)
        } else {
          setUser(user)
        }
      } catch (err) {
        // Silently handle errors - user is just not logged in
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle sign out events
      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
      } else if (event === 'USER_UPDATED') {
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Signed in successfully')
      return { data, error: null }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      })

      if (error) throw error

      toast.success('Account created successfully')
      return { data, error: null }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up')
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success('Signed out successfully')
      return { error: null }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
      return { error }
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }
}

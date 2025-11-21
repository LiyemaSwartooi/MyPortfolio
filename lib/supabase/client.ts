import { createBrowserClient } from '@supabase/ssr'
import { getEnv } from '@/lib/env'

// Suppress console errors for expected auth state issues
const originalConsoleError = console.error
if (typeof window !== 'undefined') {
  console.error = (...args: any[]) => {
    // Filter out expected Supabase auth errors
    const message = args[0]?.toString() || ''
    const expectedErrors = [
      'AuthSessionMissingError',
      'Auth session missing',
      'Invalid Refresh Token',
      'Refresh Token Not Found',
      'AuthRetryableFetchError'
    ]
    
    const isExpectedAuthError = expectedErrors.some(error => 
      message.includes(error)
    )
    
    if (!isExpectedAuthError) {
      originalConsoleError.apply(console, args)
    }
  }
}

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getEnv()
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Disable auto refresh popup
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Suppress storage errors
      storageKey: `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`,
    },
    cookies: {
      getAll() {
        // Check if we're in the browser
        if (typeof document === 'undefined') {
          return []
        }
        
        return document.cookie.split(';').map(cookie => {
          const [name, ...rest] = cookie.trim().split('=')
          return {
            name,
            value: rest.join('=')
          }
        }).filter(cookie => cookie.name)
      },
      setAll(cookiesToSet) {
        // Check if we're in the browser
        if (typeof document === 'undefined') {
          return
        }
        
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookie = `${name}=${value}`
          
          if (options?.maxAge) {
            cookie += `; max-age=${options.maxAge}`
          }
          if (options?.path) {
            cookie += `; path=${options.path}`
          }
          if (options?.domain) {
            cookie += `; domain=${options.domain}`
          }
          if (options?.sameSite) {
            cookie += `; samesite=${options.sameSite}`
          }
          if (options?.secure) {
            cookie += '; secure'
          }
          
          document.cookie = cookie
        })
      }
    }
  })
}


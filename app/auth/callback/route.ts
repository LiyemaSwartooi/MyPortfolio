import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      // Redirect to home with error (but don't expose the code!)
      return NextResponse.redirect(`${origin}/?auth_error=true`)
    }
  }

  // CRITICAL: Redirect to clean URL without the code
  // This prevents the OAuth code from being:
  // - Stored in browser history
  // - Leaked via Referer header
  // - Logged by analytics
  // - Visible to the user
  return NextResponse.redirect(origin)
}


import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateProfileData, sanitizeText } from '@/lib/utils/validation'
import { ERROR_MESSAGES } from '@/lib/constants'

/**
 * GET /api/about/profile
 * Fetch profile data (public read access)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/about/profile
 * Update profile data (authenticated only)
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate and sanitize input
    const validation = validateProfileData(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || ERROR_MESSAGES.VALIDATION },
        { status: 400 }
      )
    }

    // Sanitize all text fields
    const sanitizedData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (body.full_name !== undefined) sanitizedData.full_name = sanitizeText(body.full_name)
    if (body.title !== undefined) sanitizedData.title = sanitizeText(body.title)
    if (body.bio !== undefined) sanitizedData.bio = sanitizeText(body.bio)
    if (body.summary !== undefined) sanitizedData.summary = sanitizeText(body.summary)
    if (body.subtitle !== undefined) sanitizedData.subtitle = sanitizeText(body.subtitle)
    if (body.location !== undefined) sanitizedData.location = sanitizeText(body.location)
    if (body.email !== undefined) sanitizedData.email = body.email.trim()
    if (body.phone !== undefined) sanitizedData.phone = sanitizeText(body.phone)
    if (body.linkedin_url !== undefined) sanitizedData.linkedin_url = body.linkedin_url.trim()
    if (body.github_url !== undefined) sanitizedData.github_url = body.github_url.trim()
    if (body.website_url !== undefined) sanitizedData.website_url = body.website_url.trim()
    if (body.avatar_url !== undefined) sanitizedData.avatar_url = body.avatar_url.trim()

    // Get or create profile
    let profileId = body.id
    
    if (!profileId) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .maybeSingle()
      
      if (existingProfile) {
        profileId = existingProfile.id
      } else {
        return NextResponse.json(
          { error: 'No profile found. Please contact administrator.' },
          { status: 404 }
        )
      }
    }

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update(sanitizedData)
      .eq('id', profileId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC },
      { status: 500 }
    )
  }
}

import { createClient } from '@supabase/supabase-js'
import { getEnv } from '@/lib/env'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Use service role key for contact form to bypass RLS
    // This is safe because it's a public contact form
    const { supabaseUrl } = getEnv()
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    let supabase
    
    if (serviceRoleKey) {
      // Use service role key (bypasses RLS) - preferred for public contact form
      supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    } else {
      // Fallback to anon key if service role not available
      const { supabaseAnonKey } = getEnv()
      supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      const body = await request.json()
      
      const { name, email, subject, message } = body

      if (!name || !email || !subject || !message) {
        return NextResponse.json(
          { error: 'All fields are required' },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{ name, email, subject, message }])
        .select()
        .single()

      if (error) {
        console.error('Error inserting contact message:', error)
        return NextResponse.json(
          { 
            error: 'Failed to send message',
            message: error.message,
            code: error.code,
            details: error.details
          },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data }, { status: 201 })
    }
    
    // Common code for both service role and anon key
    const body = await request.json()
    
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, subject, message }])
      .select()
      .single()

    if (error) {
      console.error('Error inserting contact message:', error)
      return NextResponse.json(
        { 
          error: 'Failed to send message',
          message: error.message,
          code: error.code,
          details: error.details
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in contact API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}


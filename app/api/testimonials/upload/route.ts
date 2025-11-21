import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9)
    const fileName = `testimonials/${user.id}/${timestamp}-${randomStr}.${fileExt}`
    const filePath = fileName

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      
      if (uploadError.message?.includes('Bucket not found')) {
        return NextResponse.json(
          { error: 'Storage bucket not configured. Please create the "images" bucket in Supabase.' },
          { status: 500 }
        )
      }
      
      if (uploadError.message?.includes('new row violates row-level security')) {
        return NextResponse.json(
          { error: 'Permission denied. Please check storage bucket policies.' },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      path: filePath 
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in upload API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


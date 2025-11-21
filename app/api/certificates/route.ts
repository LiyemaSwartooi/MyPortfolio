import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { name, issuer, issue_date, expiry_date, credential_id, verification_url, image_url, gradient, display_order } = body

    // Allow empty strings for new items - validation happens on save
    if (name === undefined || issuer === undefined || issue_date === undefined) {
      return NextResponse.json(
        { error: 'Name, issuer, and issue date are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('certifications')
      .insert([{
        name: name.trim(),
        issuer: issuer.trim(),
        issue_date,
        expiry_date: expiry_date || null,
        credential_id: credential_id?.trim() || null,
        verification_url: verification_url?.trim() || null,
        image_url: image_url || null,
        gradient: gradient || null,
        display_order: display_order || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating certificate:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create certificate' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in certificates API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { id, name, issuer, issue_date, expiry_date, credential_id, verification_url, image_url, gradient, display_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (issuer !== undefined) updateData.issuer = issuer.trim()
    if (issue_date !== undefined) updateData.issue_date = issue_date
    if (expiry_date !== undefined) updateData.expiry_date = expiry_date || null
    if (credential_id !== undefined) updateData.credential_id = credential_id?.trim() || null
    if (verification_url !== undefined) updateData.verification_url = verification_url?.trim() || null
    if (image_url !== undefined) updateData.image_url = image_url || null
    if (gradient !== undefined) updateData.gradient = gradient || null
    if (display_order !== undefined) updateData.display_order = display_order
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('certifications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating certificate:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update certificate' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in certificates API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting certificate:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete certificate' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in certificates API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


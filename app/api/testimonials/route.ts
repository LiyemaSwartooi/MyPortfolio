import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { name, role, company, content, initial, display_order } = body

    // Allow empty strings for new items (user will fill in)
    const { data, error } = await supabase
      .from('testimonials')
      .insert([{
        name: (name || '').trim(),
        role: (role || '').trim(),
        company: (company || '').trim(),
        content: (content || '').trim(),
        initial: initial?.trim() || (name ? name.charAt(0).toUpperCase() : ''),
        image_url: body.image_url || '',
        display_order: display_order || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating testimonial:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create testimonial' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in testimonials API:', error)
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
    
    const { id, name, role, company, content, initial, display_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (role !== undefined) updateData.role = role.trim()
    if (company !== undefined) updateData.company = company.trim()
    if (content !== undefined) updateData.content = content.trim()
    if (initial !== undefined) updateData.initial = initial?.trim() || name?.charAt(0).toUpperCase()
    if (body.image_url !== undefined) updateData.image_url = body.image_url || ''
    if (display_order !== undefined) updateData.display_order = display_order
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating testimonial:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update testimonial' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in testimonials API:', error)
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
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting testimonial:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete testimonial' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in testimonials API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


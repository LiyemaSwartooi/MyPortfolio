import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { type, label, value, icon_name, gradient, display_order } = body

    if (!type || !label || !value) {
      return NextResponse.json(
        { error: 'Type, label, and value are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('contact_info')
      .insert([{
        type,
        label: label.trim(),
        value: value.trim(),
        icon_name: icon_name || null,
        gradient: gradient || null,
        display_order: display_order || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating contact info:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create contact info' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in contact info API:', error)
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
    
    const { id, type, label, value, icon_name, gradient, display_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (type !== undefined) updateData.type = type
    if (label !== undefined) updateData.label = label.trim()
    if (value !== undefined) updateData.value = value.trim()
    if (icon_name !== undefined) updateData.icon_name = icon_name || null
    if (gradient !== undefined) updateData.gradient = gradient || null
    if (display_order !== undefined) updateData.display_order = display_order
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('contact_info')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating contact info:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update contact info' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in contact info API:', error)
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
      .from('contact_info')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting contact info:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete contact info' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in contact info API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


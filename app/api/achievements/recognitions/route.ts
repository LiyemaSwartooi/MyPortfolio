import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { title, event, description, display_order, image_url } = body

    if (!title || !event) {
      return NextResponse.json(
        { error: 'Title and event are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('recognitions')
      .insert([{
        title: title.trim(),
        event: event.trim(),
        description: description?.trim() || null,
        image_url: image_url?.trim() || null,
        display_order: display_order || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating recognition:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create recognition' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in recognitions API:', error)
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
    
    const { id, title, event, description, display_order, image_url } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (event !== undefined) updateData.event = event.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (image_url !== undefined) updateData.image_url = image_url?.trim() || null
    if (display_order !== undefined) updateData.display_order = display_order
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('recognitions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating recognition:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update recognition' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in recognitions API:', error)
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
      .from('recognitions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting recognition:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete recognition' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in recognitions API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { platform, url, icon_name, color_class, display_order } = body

    if (!platform || !url) {
      return NextResponse.json(
        { error: 'Platform and URL are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('social_links')
      .insert([{
        platform: platform.trim(),
        url: url.trim(),
        icon_name: icon_name || null,
        color_class: color_class || null,
        display_order: display_order || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating social link:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create social link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in social links API:', error)
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
    
    const { id, platform, url, icon_name, color_class, display_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (platform !== undefined) updateData.platform = platform.trim()
    if (url !== undefined) updateData.url = url.trim()
    if (icon_name !== undefined) updateData.icon_name = icon_name || null
    if (color_class !== undefined) updateData.color_class = color_class || null
    if (display_order !== undefined) updateData.display_order = display_order
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('social_links')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating social link:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update social link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in social links API:', error)
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
      .from('social_links')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting social link:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete social link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in social links API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


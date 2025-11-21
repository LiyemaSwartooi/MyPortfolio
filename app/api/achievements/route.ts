import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { title, organization, year, description, icon_name, gradient, image_url, display_order } = body

    // Allow empty strings for new items - validation happens on save
    if (title === undefined || organization === undefined || year === undefined) {
      return NextResponse.json(
        { error: 'Title, organization, and year are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('achievements')
      .insert([{
        title: title.trim(),
        organization: organization.trim(),
        year: parseInt(year),
        description: description?.trim() || null,
        icon_name: icon_name || null,
        gradient: gradient || null,
        image_url: image_url || null,
        display_order: display_order || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating achievement:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create achievement' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in achievements API:', error)
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
    
    const { id, title, organization, year, description, icon_name, gradient, image_url, display_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (organization !== undefined) updateData.organization = organization.trim()
    if (year !== undefined) updateData.year = parseInt(year)
    if (description !== undefined) updateData.description = description?.trim() || null
    if (icon_name !== undefined) updateData.icon_name = icon_name || null
    if (gradient !== undefined) updateData.gradient = gradient || null
    if (image_url !== undefined) updateData.image_url = image_url || null
    if (display_order !== undefined) updateData.display_order = display_order
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('achievements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating achievement:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update achievement' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in achievements API:', error)
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
      .from('achievements')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting achievement:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete achievement' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in achievements API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { name, description, pages, size, file_url, last_updated, display_order } = body

    if (!name || !description || !pages || !size || !last_updated) {
      return NextResponse.json(
        { error: 'Name, description, pages, size, and last updated are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('resume_versions')
      .insert([{
        name: name.trim(),
        description: description.trim(),
        pages: pages.trim(),
        size: size.trim(),
        file_url: file_url || null,
        last_updated,
        display_order: display_order || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating resume version:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create resume version' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in resume API:', error)
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
    
    const { id, name, description, pages, size, file_url, last_updated, display_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (pages !== undefined) updateData.pages = pages.trim()
    if (size !== undefined) updateData.size = size.trim()
    if (file_url !== undefined) updateData.file_url = file_url || null
    if (last_updated !== undefined) updateData.last_updated = last_updated
    if (display_order !== undefined) updateData.display_order = display_order
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('resume_versions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating resume version:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update resume version' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in resume API:', error)
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
      .from('resume_versions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting resume version:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete resume version' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in resume API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


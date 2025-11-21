import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { title, description, status, image_url, gradient, github_url, demo_url, display_order } = body

    if (!title || !description || !status) {
      return NextResponse.json(
        { error: 'Title, description, and status are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title: title.trim(),
        description: description.trim(),
        status,
        image_url: image_url || null,
        gradient: gradient || null,
        github_url: github_url || null,
        demo_url: demo_url || null,
        display_order: display_order || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in projects API:', error)
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
    
    const { id, title, description, status, image_url, gradient, github_url, demo_url, display_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (status !== undefined) updateData.status = status
    if (image_url !== undefined) updateData.image_url = image_url || null
    if (gradient !== undefined) updateData.gradient = gradient || null
    if (github_url !== undefined) updateData.github_url = github_url || null
    if (demo_url !== undefined) updateData.demo_url = demo_url || null
    if (display_order !== undefined) updateData.display_order = display_order
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in projects API:', error)
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
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in projects API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


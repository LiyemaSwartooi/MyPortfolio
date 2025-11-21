import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { project_id, technology, display_order } = body

    if (!project_id || !technology) {
      return NextResponse.json(
        { error: 'Project ID and technology are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('project_technologies')
      .insert([{
        project_id,
        technology: technology.trim(),
        display_order: display_order || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating technology:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create technology' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in technologies API:', error)
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
    
    const { id, technology, display_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (technology !== undefined) updateData.technology = technology.trim()
    if (display_order !== undefined) updateData.display_order = display_order

    const { data, error } = await supabase
      .from('project_technologies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating technology:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update technology' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in technologies API:', error)
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
      .from('project_technologies')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting technology:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete technology' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in technologies API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


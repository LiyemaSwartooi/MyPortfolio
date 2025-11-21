import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { project_id, feature, display_order } = body

    if (!project_id || !feature) {
      return NextResponse.json(
        { error: 'Project ID and feature are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('project_features')
      .insert([{
        project_id,
        feature: feature.trim(),
        display_order: display_order || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating feature:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create feature' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in features API:', error)
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
    
    const { id, feature, display_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (feature !== undefined) updateData.feature = feature.trim()
    if (display_order !== undefined) updateData.display_order = display_order

    const { data, error } = await supabase
      .from('project_features')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating feature:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update feature' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in features API:', error)
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
      .from('project_features')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting feature:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete feature' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in features API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


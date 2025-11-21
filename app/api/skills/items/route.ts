import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { category_id, name, display_order } = body

    if (!category_id || !name) {
      return NextResponse.json(
        { error: 'Category ID and name are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('skills')
      .insert([{
        category_id,
        name: name.trim(),
        display_order: display_order || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating skill:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create skill' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in skills API:', error)
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
    
    const { id, name, display_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (display_order !== undefined) updateData.display_order = display_order

    const { data, error } = await supabase
      .from('skills')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating skill:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update skill' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in skills API:', error)
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
      .from('skills')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting skill:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete skill' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in skills API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


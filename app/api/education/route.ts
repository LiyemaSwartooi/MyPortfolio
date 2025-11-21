import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { degree, institution, start_date, end_date, is_current, description, display_order } = body

    if (!degree || !institution || !start_date) {
      return NextResponse.json(
        { error: 'Degree, institution, and start date are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('education')
      .insert([{
        degree: degree.trim(),
        institution: institution.trim(),
        start_date,
        end_date: end_date || null,
        is_current: is_current || false,
        description: description?.trim() || null,
        display_order: display_order || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating education:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create education' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in education API:', error)
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
    
    const { id, degree, institution, start_date, end_date, is_current, description, display_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (degree !== undefined) updateData.degree = degree.trim()
    if (institution !== undefined) updateData.institution = institution.trim()
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date || null
    if (is_current !== undefined) updateData.is_current = is_current
    if (description !== undefined) updateData.description = description?.trim() || null
    if (display_order !== undefined) updateData.display_order = display_order
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('education')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating education:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update education' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in education API:', error)
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
      .from('education')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting education:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete education' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in education API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


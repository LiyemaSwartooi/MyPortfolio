import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateText, validateUUID, sanitizeText } from '@/lib/utils/validation'
import { ERROR_MESSAGES } from '@/lib/constants'

/**
 * POST /api/about/traits
 * Create a new trait (authenticated only)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input - allow empty strings for new items (user will fill in)
    const labelValidation = validateText(body.label || '', 'Label', { required: false, maxLength: 100 })
    if (!labelValidation.valid) {
      return NextResponse.json(
        { error: labelValidation.error },
        { status: 400 }
      )
    }

    // Sanitize and prepare data
    const insertData = {
      label: sanitizeText(body.label),
      icon_name: body.icon_name ? sanitizeText(body.icon_name) : null,
      color: body.color ? sanitizeText(body.color) : null,
      display_order: typeof body.display_order === 'number' ? body.display_order : 0
    }

    const { data, error } = await supabase
      .from('personality_traits')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/about/traits
 * Update a trait (authenticated only)
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate ID
    const idValidation = validateUUID(body.id)
    if (!idValidation.valid) {
      return NextResponse.json(
        { error: idValidation.error },
        { status: 400 }
      )
    }

    // Validate and sanitize input
    const updateData: any = {}
    
    if (body.label !== undefined) {
      const labelValidation = validateText(body.label, 'Label', { maxLength: 100 })
      if (!labelValidation.valid) {
        return NextResponse.json(
          { error: labelValidation.error },
          { status: 400 }
        )
      }
      updateData.label = sanitizeText(body.label)
    }

    if (body.icon_name !== undefined) {
      updateData.icon_name = body.icon_name ? sanitizeText(body.icon_name) : null
    }

    if (body.color !== undefined) {
      updateData.color = body.color ? sanitizeText(body.color) : null
    }

    if (body.display_order !== undefined) {
      updateData.display_order = typeof body.display_order === 'number' ? body.display_order : 0
    }

    const { data, error } = await supabase
      .from('personality_traits')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/about/traits
 * Delete a trait (authenticated only)
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Validate UUID
    const idValidation = validateUUID(id)
    if (!idValidation.valid) {
      return NextResponse.json(
        { error: idValidation.error },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('personality_traits')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC },
      { status: 500 }
    )
  }
}

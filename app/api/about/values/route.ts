import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateText, validateUUID, sanitizeText } from '@/lib/utils/validation'
import { ERROR_MESSAGES, VALIDATION_RULES } from '@/lib/constants'

/**
 * POST /api/about/values
 * Create a new value (authenticated only)
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
    const titleValidation = validateText(body.title || '', 'Title', { 
      required: false, 
      maxLength: VALIDATION_RULES.MAX_TITLE_LENGTH 
    })
    if (!titleValidation.valid) {
      return NextResponse.json(
        { error: titleValidation.error },
        { status: 400 }
      )
    }

    const descriptionValidation = validateText(body.description || '', 'Description', { 
      required: false, 
      maxLength: VALIDATION_RULES.MAX_DESCRIPTION_LENGTH 
    })
    if (!descriptionValidation.valid) {
      return NextResponse.json(
        { error: descriptionValidation.error },
        { status: 400 }
      )
    }

    // Sanitize and prepare data
    const insertData = {
      title: sanitizeText(body.title),
      description: sanitizeText(body.description),
      display_order: typeof body.display_order === 'number' ? body.display_order : 0
    }

    const { data, error } = await supabase
      .from('about_values')
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
 * PATCH /api/about/values
 * Update a value (authenticated only)
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
    
    if (body.title !== undefined) {
      const titleValidation = validateText(body.title, 'Title', { 
        maxLength: VALIDATION_RULES.MAX_TITLE_LENGTH 
      })
      if (!titleValidation.valid) {
        return NextResponse.json(
          { error: titleValidation.error },
          { status: 400 }
        )
      }
      updateData.title = sanitizeText(body.title)
    }

    if (body.description !== undefined) {
      const descriptionValidation = validateText(body.description, 'Description', { 
        maxLength: VALIDATION_RULES.MAX_DESCRIPTION_LENGTH 
      })
      if (!descriptionValidation.valid) {
        return NextResponse.json(
          { error: descriptionValidation.error },
          { status: 400 }
        )
      }
      updateData.description = sanitizeText(body.description)
    }

    if (body.display_order !== undefined) {
      updateData.display_order = typeof body.display_order === 'number' ? body.display_order : 0
    }

    const { data, error } = await supabase
      .from('about_values')
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
 * DELETE /api/about/values
 * Delete a value (authenticated only)
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
      .from('about_values')
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

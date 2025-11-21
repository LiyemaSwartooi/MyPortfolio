import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateText, validateUUID, sanitizeText } from '@/lib/utils/validation'
import { ERROR_MESSAGES, VALIDATION_RULES } from '@/lib/constants'

/**
 * POST /api/about/milestones
 * Create a new milestone (authenticated only)
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
    
    // Validate fields - allow empty strings for new items (user will fill in)
    const dateValidation = validateText(body.date || '', 'Date', { required: false, maxLength: 50 })
    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      )
    }

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
    const locationValue = body.location && body.location.trim() 
      ? sanitizeText(body.location) 
      : ""

    const insertData = {
      date: sanitizeText(body.date || ''),
      title: sanitizeText(body.title || ''),
      description: sanitizeText(body.description || ''),
      location: locationValue,
      image_url: body.image_url || '',
      icon_name: body.icon_name || 'Calendar',
      display_order: typeof body.display_order === 'number' ? body.display_order : 0
    }

    const { data, error } = await supabase
      .from('journey_memories')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message || ERROR_MESSAGES.GENERIC },
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
 * PATCH /api/about/milestones
 * Update a milestone (authenticated only)
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
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      )
    }

    const idValidation = validateUUID(body.id)
    if (!idValidation.valid) {
      return NextResponse.json(
        { error: idValidation.error },
        { status: 400 }
      )
    }

    // Validate and sanitize input
    const updateData: any = {}
    
    if (body.date !== undefined) {
      const dateValidation = validateText(body.date, 'Date', { maxLength: 50 })
      if (!dateValidation.valid) {
        return NextResponse.json(
          { error: dateValidation.error },
          { status: 400 }
        )
      }
      updateData.date = sanitizeText(body.date)
    }

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

    if (body.location !== undefined) {
      updateData.location = body.location && body.location.trim() 
        ? sanitizeText(body.location) 
        : "Not specified"
    }

    if (body.image_url !== undefined) {
      updateData.image_url = body.image_url || ''
    }

    if (body.icon_name !== undefined) {
      updateData.icon_name = body.icon_name || 'Calendar'
    }

    if (body.display_order !== undefined) {
      updateData.display_order = typeof body.display_order === 'number' ? body.display_order : 0
    }

    const { data, error } = await supabase
      .from('journey_memories')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message || ERROR_MESSAGES.GENERIC },
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
 * DELETE /api/about/milestones
 * Delete a milestone (authenticated only)
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
      .from('journey_memories')
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

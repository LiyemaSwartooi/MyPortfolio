import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

// Cache portfolio context for 5 minutes to avoid repeated database queries
let cachedContext: { data: string; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Input validation
function validateChatInput(message: string, sessionId: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required and must be a string' }
  }
  
  if (message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' }
  }
  
  if (message.length > 2000) {
    return { valid: false, error: 'Message too long (max 2000 characters)' }
  }
  
  if (!sessionId || typeof sessionId !== 'string') {
    return { valid: false, error: 'Valid session ID is required' }
  }
  
  // Sanitize: block potential SQL injection or XSS attempts
  const dangerousPatterns = [
    /<script/i, 
    /javascript:/i, 
    /on\w+\s*=/i,
    /DROP\s+TABLE/i,
    /DELETE\s+FROM/i,
    /INSERT\s+INTO/i,
    /UPDATE\s+\w+\s+SET/i
  ]
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(message)) {
      return { valid: false, error: 'Invalid input detected' }
    }
  }
  
  return { valid: true }
}

// Helper function to get portfolio context with caching
async function getPortfolioContext(supabase: any): Promise<string> {
  // Check cache first
  if (cachedContext && Date.now() - cachedContext.timestamp < CACHE_DURATION) {
    return cachedContext.data
  }
  
  const context: string[] = []
  
  try {
    // Fetch all data in parallel for better performance
    const [
      profileResult,
      projectsResult,
      experiencesResult,
      skillsResult,
      achievementsResult,
      educationResult,
      certificatesResult,
      testimonialsResult,
      contactResult,
      socialResult
    ] = await Promise.all([
      supabase.from('profiles').select('full_name, title, bio, summary, location, email, phone, subtitle').single(),
      supabase.from('projects').select('title, description, status, github_url, demo_url').order('display_order').limit(10),
      supabase.from('experiences').select('title, company, description, start_date, end_date, is_current').order('start_date', { ascending: false }).limit(10),
      supabase.from('skill_categories').select('title, skills(name)').order('display_order').limit(10),
      supabase.from('achievements').select('title, organization, year, description').order('year', { ascending: false }).limit(10),
      supabase.from('education').select('degree, institution, start_date, end_date, is_current, description').order('start_date', { ascending: false }).limit(10),
      supabase.from('certifications').select('name, issuer, issue_date, expiry_date').order('issue_date', { ascending: false }).limit(10),
      supabase.from('testimonials').select('name, role, company, content').order('display_order').limit(5),
      supabase.from('contact_info').select('type, label, value').order('display_order'),
      supabase.from('social_links').select('platform, url').order('display_order')
    ])

    // Build context from results
    const profile = profileResult.data
    if (profile) {
      context.push(`=== PORTFOLIO OWNER INFORMATION ===`)
      context.push(`Name: ${profile.full_name || 'Not specified'}`)
      if (profile.title) context.push(`Title: ${profile.title}`)
      if (profile.subtitle) context.push(`Subtitle: ${profile.subtitle}`)
      if (profile.bio) context.push(`Bio: ${profile.bio}`)
      if (profile.summary) context.push(`Summary: ${profile.summary}`)
      if (profile.location) context.push(`Location: ${profile.location}`)
      if (profile.email) context.push(`Email: ${profile.email}`)
      if (profile.phone) context.push(`Phone: ${profile.phone}`)
    }

    const projects = projectsResult.data
    if (projects && projects.length > 0) {
      context.push('\n=== PROJECTS ===')
      projects.forEach((p: any) => {
        context.push(`- ${p.title} (${p.status}): ${p.description?.substring(0, 200) || 'No description'}`)
        if (p.github_url) context.push(`  GitHub: ${p.github_url}`)
        if (p.demo_url) context.push(`  Demo: ${p.demo_url}`)
      })
    } else {
      context.push('\n=== PROJECTS ===')
      context.push('No projects data available')
    }

    const experiences = experiencesResult.data
    if (experiences && experiences.length > 0) {
      context.push('\n=== WORK EXPERIENCE ===')
      experiences.forEach((e: any) => {
        const period = e.is_current 
          ? `${new Date(e.start_date).getFullYear()} - Present`
          : `${new Date(e.start_date).getFullYear()} - ${e.end_date ? new Date(e.end_date).getFullYear() : 'N/A'}`
        context.push(`- ${e.title} at ${e.company} (${period}): ${e.description?.substring(0, 200) || 'No description'}`)
      })
    } else {
      context.push('\n=== WORK EXPERIENCE ===')
      context.push('No experience data available')
    }

    const skillCategories = skillsResult.data
    if (skillCategories && skillCategories.length > 0) {
      context.push('\n=== SKILLS ===')
      skillCategories.forEach((cat: any) => {
        const skills = cat.skills?.map((s: any) => s.name).join(', ') || 'None listed'
        context.push(`- ${cat.title}: ${skills}`)
      })
    } else {
      context.push('\n=== SKILLS ===')
      context.push('No skills data available')
    }

    const achievements = achievementsResult.data
    if (achievements && achievements.length > 0) {
      context.push('\n=== ACHIEVEMENTS ===')
      achievements.forEach((a: any) => {
        context.push(`- ${a.title} (${a.organization}, ${a.year}): ${a.description?.substring(0, 150) || 'No description'}`)
      })
    } else {
      context.push('\n=== ACHIEVEMENTS ===')
      context.push('No achievements data available')
    }

    const education = educationResult.data
    if (education && education.length > 0) {
      context.push('\n=== EDUCATION ===')
      education.forEach((e: any) => {
        const period = e.is_current 
          ? `${new Date(e.start_date).getFullYear()} - Present`
          : `${new Date(e.start_date).getFullYear()} - ${e.end_date ? new Date(e.end_date).getFullYear() : 'N/A'}`
        context.push(`- ${e.degree} from ${e.institution} (${period}): ${e.description?.substring(0, 150) || 'No description'}`)
      })
    } else {
      context.push('\n=== EDUCATION ===')
      context.push('No education data available')
    }

    const certificates = certificatesResult.data
    if (certificates && certificates.length > 0) {
      context.push('\n=== CERTIFICATIONS ===')
      certificates.forEach((c: any) => {
        context.push(`- ${c.name} from ${c.issuer} (Issued: ${new Date(c.issue_date).getFullYear()})`)
      })
    } else {
      context.push('\n=== CERTIFICATIONS ===')
      context.push('No certifications data available')
    }

    const testimonials = testimonialsResult.data
    if (testimonials && testimonials.length > 0) {
      context.push('\n=== TESTIMONIALS ===')
      testimonials.forEach((t: any) => {
        context.push(`- ${t.name} (${t.role} at ${t.company}): "${t.content.substring(0, 150)}"`)
      })
    } else {
      context.push('\n=== TESTIMONIALS ===')
      context.push('No testimonials data available')
    }

    const contactInfo = contactResult.data
    if (contactInfo && contactInfo.length > 0) {
      context.push('\n=== CONTACT INFORMATION ===')
      contactInfo.forEach((c: any) => {
        context.push(`- ${c.label}: ${c.value}`)
      })
    }

    const socialLinks = socialResult.data
    if (socialLinks && socialLinks.length > 0) {
      context.push('\n=== SOCIAL LINKS ===')
      socialLinks.forEach((s: any) => {
        context.push(`- ${s.platform}: ${s.url}`)
      })
    }
    
    const contextString = context.join('\n')
    
    // Cache the result
    cachedContext = {
      data: contextString,
      timestamp: Date.now()
    }
    
    return contextString
  } catch (error) {
    throw new Error('Failed to fetch portfolio context')
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { message, sessionId, category, conversationHistory } = body

    // Validate inputs
    const validation = validateChatInput(message, sessionId)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      )
    }

    // Store user message
    const { data: userMessage, error: userError } = await supabase
      .from('chat_messages')
      .insert([{
        session_id: sessionId,
        message: message.trim(),
        category: category || 'smart',
        is_user: true,
      }])
      .select()
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      )
    }

    // Get portfolio context (cached)
    const portfolioContext = await getPortfolioContext(supabase)

    // Build conversation history for context (last 10 messages only for performance)
    const messages: any[] = [
      {
        role: 'system',
        content: `You are the portfolio owner answering questions about yourself. You are NOT an AI assistant or DeepSeek - you are a real person with the background and experience detailed below.

CRITICAL IDENTITY RULES:
1. You ARE the portfolio owner - answer as yourself using first-person (I, my, me, I've, I'm)
2. Speak naturally as if having a conversation with a visitor interested in your work
3. Be personable, professional, and genuine in your responses
4. Share insights about your work, experiences, and skills enthusiastically
5. NEVER identify as an AI, assistant, DeepSeek, or chatbot - you are the actual person

INFORMATION BOUNDARIES:
1. ONLY share information explicitly provided in YOUR PORTFOLIO DATA below
2. If asked about something not in your data, respond naturally: "I haven't added that to my portfolio yet" or "I'd prefer to discuss that personally - feel free to contact me!"
3. NEVER fabricate or guess information not in the data
4. If unsure, be honest: "That's not something I've documented here yet"

RESPONSE STYLE:
1. Be conversational and warm, not robotic
2. Show enthusiasm for your work and achievements
3. Use natural transitions like "Yes, I have!" or "Absolutely!" or "Great question!"
4. If relevant, guide visitors to other sections: "You can see more in my Projects section"

YOUR PORTFOLIO DATA:
${portfolioContext}

Remember: You are speaking as yourself about your own portfolio. Be authentic, professional, and only share what's documented above.`
      }
    ]

    // Add conversation history (last 10 messages for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10)
      recentHistory.forEach((msg: any) => {
        messages.push({
          role: msg.is_user ? 'user' : 'assistant',
          content: msg.message
        })
      })
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message.trim()
    })

    // Call DeepSeek API with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false,
        }),
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (!deepseekResponse.ok) {
        throw new Error('AI service error')
      }

      const deepseekData = await deepseekResponse.json()
      const aiResponse = deepseekData.choices?.[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.'

      // Store AI response
      const { data: aiMessage, error: aiError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          message: aiResponse,
          category: category || 'smart',
          is_user: false,
        }])
        .select()
        .single()

      if (aiError) {
        // Log error but still return response
        return NextResponse.json({
          success: true,
          userMessage,
          aiMessage: { message: aiResponse, is_user: false, created_at: new Date().toISOString() },
          warning: 'Response not saved'
        }, { status: 201 })
      }

      return NextResponse.json({
        success: true,
        userMessage,
        aiMessage,
      }, { status: 201 })
    } catch (error: any) {
      clearTimeout(timeout)
      
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - please try again' },
          { status: 504 }
        )
      }
      
      throw error
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(100) // Limit to prevent excessive data transfer

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, messages: messages || [] }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Service error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    // Check authentication for delete operations
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', sessionId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete chat' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Service error' },
      { status: 500 }
    )
  }
}

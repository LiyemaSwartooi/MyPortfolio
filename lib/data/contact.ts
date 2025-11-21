import { createClient } from '@/lib/supabase/server'

export async function getContactInfo() {
  const supabase = await createClient()
  
  const [contactInfoResult, socialLinksResult] = await Promise.all([
    supabase
      .from('contact_info')
      .select('*')
      .order('display_order', { ascending: true }),
    supabase
      .from('social_links')
      .select('*')
      .order('display_order', { ascending: true })
  ])

  return {
    contactInfo: contactInfoResult.data || [],
    socialLinks: socialLinksResult.data || [],
    errors: {
      contactInfo: contactInfoResult.error,
      socialLinks: socialLinksResult.error
    }
  }
}


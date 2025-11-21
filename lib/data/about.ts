import { createClient } from '@/lib/supabase/server'

export async function getAboutData() {
  const supabase = await createClient()
  
  const [statsResult, valuesResult, profileResult] = await Promise.all([
    supabase
      .from('about_stats')
      .select('*')
      .order('display_order', { ascending: true }),
    supabase
      .from('about_values')
      .select('*')
      .order('display_order', { ascending: true }),
    supabase
      .from('profiles')
      .select('*')
      .single()
  ])

  return {
    stats: statsResult.data || [],
    values: valuesResult.data || [],
    profile: profileResult.data || null,
    errors: {
      stats: statsResult.error,
      values: valuesResult.error,
      profile: profileResult.error
    }
  }
}


import { createClient } from '@/lib/supabase/server'

export async function getExperiences() {
  const supabase = await createClient()
  
  const { data: experiences, error } = await supabase
    .from('experiences')
    .select(`
      *,
      achievements:experience_achievements(*)
    `)
    .order('display_order', { ascending: true })
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching experiences:', error)
    return { data: [], error }
  }

  return { data: experiences || [], error: null }
}


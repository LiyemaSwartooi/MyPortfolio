import { createClient } from '@/lib/supabase/server'

export async function getJourneyMemories() {
  const supabase = await createClient()
  
  const { data: memories, error } = await supabase
    .from('journey_memories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching journey memories:', error)
    return { data: [], error }
  }

  return { data: memories || [], error: null }
}


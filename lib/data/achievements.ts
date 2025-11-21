import { createClient } from '@/lib/supabase/server'

export async function getAchievements() {
  const supabase = await createClient()
  
  const [achievementsResult, recognitionsResult] = await Promise.all([
    supabase
      .from('achievements')
      .select('*')
      .order('display_order', { ascending: true })
      .order('year', { ascending: false }),
    supabase
      .from('recognitions')
      .select('*')
      .order('display_order', { ascending: true })
  ])

  return {
    achievements: achievementsResult.data || [],
    recognitions: recognitionsResult.data || [],
    errors: {
      achievements: achievementsResult.error,
      recognitions: recognitionsResult.error
    }
  }
}


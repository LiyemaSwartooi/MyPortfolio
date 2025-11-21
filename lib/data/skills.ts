import { createClient } from '@/lib/supabase/server'

export async function getSkills() {
  const supabase = await createClient()
  
  const { data: categories, error } = await supabase
    .from('skill_categories')
    .select(`
      *,
      skills(*)
    `)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching skills:', error)
    return { data: [], error }
  }

  // Sort skills within each category
  const sortedCategories = (categories || []).map(category => ({
    ...category,
    skills: (category.skills || []).sort((a: any, b: any) => 
      a.display_order - b.display_order
    )
  }))

  return { data: sortedCategories, error: null }
}


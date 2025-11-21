import { createClient } from '@/lib/supabase/server'

export async function getTestimonials() {
  const supabase = await createClient()
  
  const { data: testimonials, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching testimonials:', error)
    return { data: [], error }
  }

  return { data: testimonials || [], error: null }
}


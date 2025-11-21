import { createClient } from '@/lib/supabase/server'

export async function getProjects() {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      technologies:project_technologies(*),
      features:project_features(*)
    `)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching projects:', error)
    return { data: [], error }
  }

  // Sort technologies and features within each project
  const sortedProjects = (projects || []).map(project => ({
    ...project,
    technologies: (project.technologies || []).sort((a: any, b: any) => 
      a.display_order - b.display_order
    ),
    features: (project.features || []).sort((a: any, b: any) => 
      a.display_order - b.display_order
    )
  }))

  return { data: sortedProjects, error: null }
}


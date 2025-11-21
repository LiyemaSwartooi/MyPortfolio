import { createClient } from '@/lib/supabase/server'

export async function getEducation() {
  const supabase = await createClient()
  
  const [educationResult, certificationsResult, coursesResult] = await Promise.all([
    supabase
      .from('education')
      .select(`
        *,
        achievements:education_achievements(*)
      `)
      .order('display_order', { ascending: true })
      .order('start_date', { ascending: false }),
    supabase
      .from('certifications')
      .select(`
        *,
        skills:certification_skills(*)
      `)
      .order('display_order', { ascending: true })
      .order('issue_date', { ascending: false }),
    supabase
      .from('courses')
      .select('*')
      .order('display_order', { ascending: true })
  ])

  // Sort achievements and skills
  const education = (educationResult.data || []).map(edu => ({
    ...edu,
    achievements: (edu.achievements || []).sort((a: any, b: any) => 
      a.display_order - b.display_order
    )
  }))

  const certifications = (certificationsResult.data || []).map(cert => ({
    ...cert,
    skills: (cert.skills || []).sort((a: any, b: any) => 
      a.display_order - b.display_order
    )
  }))

  return {
    education,
    certifications,
    courses: coursesResult.data || [],
    errors: {
      education: educationResult.error,
      certifications: certificationsResult.error,
      courses: coursesResult.error
    }
  }
}


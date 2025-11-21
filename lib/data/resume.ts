import { createClient } from '@/lib/supabase/server'

export async function getResumeData() {
  const supabase = await createClient()
  
  const [profileResult, resumeVersionsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .single(),
    supabase
      .from('resume_versions')
      .select('*')
      .order('display_order', { ascending: true })
  ])

  return {
    profile: profileResult.data || null,
    resumeVersions: resumeVersionsResult.data || [],
    errors: {
      profile: profileResult.error,
      resumeVersions: resumeVersionsResult.error
    }
  }
}


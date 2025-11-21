import { createClient } from '@/lib/supabase/server'

export async function getCertificates() {
  const supabase = await createClient()
  
  const { data: certificates, error } = await supabase
    .from('certifications')
    .select(`
      *,
      skills:certification_skills(*)
    `)
    .order('display_order', { ascending: true })
    .order('issue_date', { ascending: false })

  if (error) {
    console.error('Error fetching certificates:', error)
    return { data: [], error }
  }

  // Sort skills within each certificate
  const sortedCertificates = (certificates || []).map(cert => ({
    ...cert,
    skills: (cert.skills || []).sort((a: any, b: any) => 
      a.display_order - b.display_order
    )
  }))

  return { data: sortedCertificates, error: null }
}


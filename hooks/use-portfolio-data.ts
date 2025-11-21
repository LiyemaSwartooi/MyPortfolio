"use client"

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ERROR_MESSAGES } from '@/lib/constants'

export function useAboutData() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Fetch all data in parallel for optimal performance
      const [statsResult, valuesResult, profileResult, traitsResult, milestonesResult] = await Promise.all([
        supabase.from('about_stats').select('*').order('display_order'),
        supabase.from('about_values').select('*').order('display_order'),
        supabase.from('profiles').select('*').single(),
        supabase.from('personality_traits').select('*').order('display_order'),
        supabase.from('journey_memories').select('*').order('display_order').order('created_at', { ascending: false })
      ])

      // Check for critical errors
      if (statsResult.error) throw statsResult.error
      if (valuesResult.error) throw valuesResult.error
      if (profileResult.error && profileResult.error.code !== 'PGRST116') throw profileResult.error

      setData({
        stats: statsResult.data || [],
        values: valuesResult.data || [],
        profile: profileResult.data || null,
        traits: traitsResult.data || [],
        milestones: milestonesResult.data || []
      })
      setError(null)
    } catch (err: any) {
      setError(err)
      toast.error(ERROR_MESSAGES.GENERIC)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useExperiences() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: experiences, error } = await supabase
        .from('experiences')
        .select(`
          *,
          achievements:experience_achievements(*)
        `)
        .order('display_order', { ascending: true })

      if (error) throw error
      
      // Ensure all experiences are included and properly sorted
      const sortedExperiences = (experiences || []).sort((a: any, b: any) => {
        // First sort by display_order
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order
        }
        // Then by start_date (most recent first)
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      })
      
      setData(sortedExperiences)
      setError(null)
    } catch (err: any) {
      setError(err)
      toast.error(ERROR_MESSAGES.GENERIC)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useSkills() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: categories, error } = await supabase
        .from('skill_categories')
        .select(`
          *,
          skills(*)
        `)
        .order('display_order')

      if (error) throw error

      const sorted = (categories || []).map((cat: any) => ({
        ...cat,
        skills: (cat.skills || []).sort((a: any, b: any) => a.display_order - b.display_order)
      }))

      setData(sorted)
      setError(null)
    } catch (err: any) {
      setError(err)
      toast.error(ERROR_MESSAGES.GENERIC)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useProjects() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          technologies:project_technologies(*),
          features:project_features(*)
        `)
        .order('display_order')

      if (error) throw error

      const sorted = (projects || []).map((proj: any) => ({
        ...proj,
        technologies: (proj.technologies || []).sort((a: any, b: any) => a.display_order - b.display_order),
        features: (proj.features || []).sort((a: any, b: any) => a.display_order - b.display_order)
      }))

      setData(sorted)
      setError(null)
    } catch (err: any) {
      setError(err)
      toast.error(ERROR_MESSAGES.GENERIC)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useEducation() {
  const [data, setData] = useState<any>({ education: [], certifications: [], courses: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const [eduResult, certResult, coursesResult] = await Promise.all([
        supabase.from('education').select('*, achievements:education_achievements(*)').order('display_order').order('start_date', { ascending: false }),
        supabase.from('certifications').select('*, skills:certification_skills(*)').order('display_order').order('issue_date', { ascending: false }),
        supabase.from('courses').select('*').order('display_order')
      ])

      if (eduResult.error) throw eduResult.error
      if (certResult.error) throw certResult.error
      if (coursesResult.error) throw coursesResult.error

      const education = (eduResult.data || []).map((edu: any) => ({
        ...edu,
        achievements: (edu.achievements || []).sort((a: any, b: any) => a.display_order - b.display_order)
      }))

      const certifications = (certResult.data || []).map((cert: any) => ({
        ...cert,
        skills: (cert.skills || []).sort((a: any, b: any) => a.display_order - b.display_order)
      }))

      setData({ education, certifications, courses: coursesResult.data || [] })
      setError(null)
    } catch (err: any) {
      setError(err)
      toast.error(ERROR_MESSAGES.GENERIC)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useAchievements() {
  const [data, setData] = useState<any>({ achievements: [], recognitions: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const [achievementsResult, recognitionsResult] = await Promise.all([
        supabase.from('achievements').select('*').order('display_order').order('year', { ascending: false }),
        supabase.from('recognitions').select('*').order('display_order')
      ])

      if (achievementsResult.error) throw achievementsResult.error
      if (recognitionsResult.error) throw recognitionsResult.error

      setData({
        achievements: achievementsResult.data || [],
        recognitions: recognitionsResult.data || []
      })
      setError(null)
    } catch (err: any) {
      setError(err)
      toast.error(ERROR_MESSAGES.GENERIC)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useCertificates() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: certificates, error } = await supabase
        .from('certifications')
        .select(`
          *,
          skills:certification_skills(*)
        `)
        .order('display_order')
        .order('issue_date', { ascending: false })

      if (error) throw error

      const sorted = (certificates || []).map((cert: any) => ({
        ...cert,
        skills: (cert.skills || []).sort((a: any, b: any) => a.display_order - b.display_order)
      }))

      setData(sorted)
      setError(null)
    } catch (err: any) {
      setError(err)
      toast.error(ERROR_MESSAGES.GENERIC)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useTestimonials() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: testimonials, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order')

      if (error) throw error
      setData(testimonials || [])
      setError(null)
    } catch (err: any) {
      setError(err)
      toast.error(ERROR_MESSAGES.GENERIC)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useContactInfo() {
  const [data, setData] = useState<any>({ contactInfo: [], socialLinks: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const [contactResult, socialResult] = await Promise.all([
        supabase.from('contact_info').select('*').order('display_order'),
        supabase.from('social_links').select('*').order('display_order')
      ])

      if (contactResult.error) throw contactResult.error
      if (socialResult.error) throw socialResult.error

      setData({
        contactInfo: contactResult.data || [],
        socialLinks: socialResult.data || []
      })
      setError(null)
    } catch (err: any) {
      setError(err)
      toast.error(ERROR_MESSAGES.GENERIC)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useJourneyMemories() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: memories, error } = await supabase
        .from('journey_memories')
        .select('*')
        .order('display_order')
        .order('created_at', { ascending: false })

      if (error) throw error
      setData(memories || [])
      setError(null)
    } catch (err: any) {
      setError(err)
      toast.error(ERROR_MESSAGES.GENERIC)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useResumeData() {
  const [data, setData] = useState<any>({ profile: null, resumeVersions: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const [profileResult, versionsResult] = await Promise.all([
        supabase.from('profiles').select('*').single(),
        supabase.from('resume_versions').select('*').order('display_order')
      ])

      if (profileResult.error && profileResult.error.code !== 'PGRST116') throw profileResult.error
      if (versionsResult.error) throw versionsResult.error

      setData({
        profile: profileResult.data,
        resumeVersions: versionsResult.data || []
      })
      setError(null)
    } catch (err: any) {
      setError(err)
      toast.error(ERROR_MESSAGES.GENERIC)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

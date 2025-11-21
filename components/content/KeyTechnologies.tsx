"use client"

import { useSkills } from "@/hooks/use-portfolio-data"
import { Box, Globe, FileText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface KeyTechnologiesProps {
  onSkillClick: (name: string) => void
}

export function KeyTechnologies({ onSkillClick }: KeyTechnologiesProps) {
  const { data: skillCategories, loading } = useSkills()

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-2 w-12" />
          </div>
        ))}
      </div>
    )
  }

  // Get first 6 skills from all categories
  const allSkills: any[] = []
  skillCategories?.forEach((category: any) => {
    category.skills?.slice(0, 2).forEach((skill: any) => {
      allSkills.push({ ...skill, categoryName: category.title })
    })
  })

  const topSkills = allSkills.slice(0, 6)

  const getIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('react') || lower.includes('next')) return Globe
    if (lower.includes('typescript') || lower.includes('javascript')) return FileText
    return Box
  }

  const getGradient = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('react')) return "from-blue-500 to-cyan-500"
    if (lower.includes('next')) return "from-gray-800 to-gray-900"
    if (lower.includes('typescript')) return "from-blue-600 to-blue-800"
    if (lower.includes('node')) return "from-green-500 to-green-600"
    if (lower.includes('python')) return "from-yellow-400 to-yellow-500"
    return "from-orange-500 to-red-500"
  }

  if (topSkills.length === 0) {
    return (
      <div className="text-[11px] text-gray-500 p-2">
        No skills available
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {topSkills.map((skill: any) => {
        const IconComponent = getIcon(skill.name)
        return (
          <button
            key={skill.id}
            className="flex flex-col items-center gap-1 rounded-lg p-1.5 transition-colors hover:bg-gray-50"
            onClick={() => onSkillClick(skill.name)}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${getGradient(skill.name)} shadow-sm`}>
              <IconComponent className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[9px] font-medium text-gray-600">{skill.name}</span>
          </button>
        )
      })}
    </div>
  )
}


"use client"

import { useProjects } from "@/hooks/use-portfolio-data"
import { Button } from "@/components/ui/button"
import { MoreVertical, Globe } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface FeaturedProjectsProps {
  onProjectClick: (text: string) => void
}

export function FeaturedProjects({ onProjectClick }: FeaturedProjectsProps) {
  const { data: projects, loading } = useProjects()

  if (loading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg p-1.5">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        ))}
      </>
    )
  }

  const featuredProjects = (projects || []).slice(0, 3)

  if (featuredProjects.length === 0) {
    return (
      <div className="text-[11px] text-gray-500 p-2">
        No projects available
      </div>
    )
  }

  return (
    <>
      {featuredProjects.map((project: any) => {
        const year = project.created_at ? new Date(project.created_at).getFullYear() : '2024'
        return (
          <div
            key={project.id}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-50 cursor-pointer"
            onClick={() => onProjectClick(project.title)}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm">
              <Globe className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-800 truncate leading-tight">{project.title}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">{year}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-4 w-4 shrink-0">
              <MoreVertical className="h-3 w-3 text-gray-400" />
            </Button>
          </div>
        )
      })}
    </>
  )
}


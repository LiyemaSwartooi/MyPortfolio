"use client"

import { useEditMode } from "@/contexts/EditModeContext"
import { Pencil } from "lucide-react"

export function EditModeIndicator() {
  const { isEditMode } = useEditMode()

  if (!isEditMode) return null

  return (
    <div className="fixed top-2 right-2 z-50 flex items-center gap-2 rounded-full bg-orange-500 px-3 py-1.5 shadow-lg">
      <Pencil className="h-3 w-3 text-white animate-pulse" />
      <span className="text-xs font-semibold text-white">Edit Mode</span>
    </div>
  )
}


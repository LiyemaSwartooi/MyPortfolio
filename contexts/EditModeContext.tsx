"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface EditModeContextType {
  isEditMode: boolean
  toggleEditMode: () => void
  setEditMode: (enabled: boolean) => void
  canEdit: boolean
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined)

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const { user } = useAuth()
  const canEdit = !!user

  const toggleEditMode = () => {
    if (canEdit) {
      setIsEditMode(prev => !prev)
    }
  }

  const setEditMode = (enabled: boolean) => {
    if (canEdit || !enabled) {
      setIsEditMode(enabled)
    }
  }

  // Automatically disable edit mode when user signs out
  useEffect(() => {
    if (!canEdit) {
      setIsEditMode(false)
    }
  }, [canEdit])

  return (
    <EditModeContext.Provider value={{ 
      isEditMode: isEditMode && canEdit, // Only allow edit mode if authenticated
      toggleEditMode, 
      setEditMode,
      canEdit 
    }}>
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode() {
  const context = useContext(EditModeContext)
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider')
  }
  return context
}


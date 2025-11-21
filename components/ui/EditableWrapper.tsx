"use client"

import { useEditMode } from "@/contexts/EditModeContext"
import { Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface EditableWrapperProps {
  children: React.ReactNode
  onSave?: (data: any) => void | Promise<void>
  editComponent?: React.ReactNode
  className?: string
}

export function EditableWrapper({ 
  children, 
  onSave, 
  editComponent,
  className = "" 
}: EditableWrapperProps) {
  const { isEditMode } = useEditMode()
  const [isEditing, setIsEditing] = useState(false)

  if (!isEditMode) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Edit Button - Shows on hover in edit mode */}
      <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="h-7 w-7 p-0 bg-white shadow-md hover:bg-gray-50"
        >
          {isEditing ? (
            <X className="h-3.5 w-3.5 text-gray-600" />
          ) : (
            <Pencil className="h-3.5 w-3.5 text-orange-600" />
          )}
        </Button>
      </div>

      {/* Content */}
      {isEditing && editComponent ? (
        <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50/50">
          {editComponent}
          {onSave && (
            <div className="mt-3 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="h-8"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  if (onSave) await onSave({})
                  setIsEditing(false)
                }}
                className="h-8 bg-orange-600 hover:bg-orange-700"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-transparent group-hover:border-orange-200 rounded-lg transition-colors">
          {children}
        </div>
      )}
    </div>
  )
}


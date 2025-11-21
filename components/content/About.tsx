"use client"

import React, { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  User, Users, Award, Target, Lightbulb, Code, Rocket, Heart, Zap, 
  MapPin, Mail, Calendar, Coffee, Music, BookOpen, Gamepad2,
  TrendingUp, Globe, Sparkles, Star, Briefcase, GraduationCap,
  Pencil, Save, X, Plus, Trash2, Upload, Image as ImageIcon, Loader2
} from "lucide-react"
import { useAboutData } from "@/hooks/use-portfolio-data"
import { AboutSkeleton } from "@/components/ui/loading-skeleton"
import { getIcon } from "@/lib/icon-mapper"
import { motion, useInView } from "framer-motion"
import { useEditMode } from "@/contexts/EditModeContext"
import { toast } from "sonner"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { SUCCESS_MESSAGES, ERROR_MESSAGES, API_ENDPOINTS, UI_CONFIG } from "@/lib/constants"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

// Helper function to get current year
function getCurrentYear(): string {
  return new Date().getFullYear().toString()
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const
    }
  }
}

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const
    }
  }
}

// Counter animation hook
function useCounter(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start)
  const countRef = useRef(start)

  useEffect(() => {
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      countRef.current += increment
      if (countRef.current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(countRef.current))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [end, duration])

  return count
}

// Editable Field Component
function EditableField({ 
  value, 
  onSave, 
  isEditing, 
  onEdit, 
  onCancel,
  multiline = false,
  placeholder = "",
  className = ""
}: {
  value: string
  onSave: (value: string) => void
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  multiline?: boolean
  placeholder?: string
  className?: string
}) {
  const [editValue, setEditValue] = useState(value)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = () => {
    if (editValue.trim() !== value.trim()) {
      onSave(editValue.trim())
    }
    onCancel()
  }

  if (!isEditing) {
    return (
      <div 
        className={`group relative ${className}`}
        onClick={onEdit}
      >
        {multiline ? (
          <p className="whitespace-pre-line cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            {value || placeholder}
          </p>
        ) : (
          <p className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            {value || placeholder}
          </p>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Pencil className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-3 bg-orange-50/50 border-2 border-orange-300 rounded-lg">
      {multiline ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className={`${className} border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white`}
          rows={6}
          autoFocus
        />
      ) : (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className={`${className} border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white text-base`}
          autoFocus
        />
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  )
}

// Animated Stat Card Component
function AnimatedStatCard({ stat, index, isEditMode, onUpdate, onDelete, refetch }: any) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState({
    label: stat.label || "",
    value: stat.value || "",
    icon_name: stat.icon_name || "Award",
    gradient: stat.gradient || "from-blue-500 to-cyan-500"
  })
  
  const DefaultIcon = Award
  const IconComponent = stat.icon_name ? getIcon(stat.icon_name, DefaultIcon) : DefaultIcon
  const gradient = stat.gradient || 'from-blue-500 to-cyan-500'
  const value = stat.value || "0"
  const numericValue = parseInt(value.replace(/\D/g, '')) || 0
  const suffix = value.replace(/\d/g, '') || ""
  const count = useCounter(numericValue, 1500, 0)

  // Initialize edit data when stat changes - only if stat has data
  useEffect(() => {
    if (stat && stat.id) {
      setEditData({
        label: stat.label || "",
        value: stat.value || "",
        icon_name: stat.icon_name || "Award",
        gradient: stat.gradient || "from-blue-500 to-cyan-500"
      })
    } else {
      // New stat - keep empty
      setEditData({
        label: "",
        value: "",
        icon_name: "Award",
        gradient: "from-blue-500 to-cyan-500"
      })
    }
  }, [stat])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.ABOUT}/stats`, {
        method: stat.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: stat.id,
          ...editData,
          display_order: index
        })
      })

      if (!response.ok) throw new Error('Failed to save')
      // Silent save - no toast, no refetch (will sync when exiting edit mode)
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!stat.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!stat.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.ABOUT}/stats?id=${stat.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete')
      toast.success(SUCCESS_MESSAGES.DELETED)
      refetch()
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Initialize edit data when stat changes
  useEffect(() => {
    if (stat) {
      setEditData({
        label: stat.label || "",
        value: stat.value || "",
        icon_name: stat.icon_name || "Award",
        gradient: stat.gradient || "from-blue-500 to-cyan-500"
      })
    }
  }, [stat])

  if (isEditMode) {
    return (
      <Card className="border-2 border-orange-300 bg-orange-50/30">
        <CardContent className="p-4 space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
            <Input
              placeholder="Label"
              value={editData.label}
              onChange={(e) => setEditData({ ...editData, label: e.target.value })}
              onBlur={handleSave}
              className="h-11 min-h-[44px] text-base md:h-9 md:text-sm touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">Value</label>
            <Input
              placeholder="Value (e.g., 5+, 50+)"
              value={editData.value}
              onChange={(e) => setEditData({ ...editData, value: e.target.value })}
              onBlur={handleSave}
              className="h-11 min-h-[44px] text-base md:h-9 md:text-sm touch-manipulation"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 text-xs bg-orange-500 hover:bg-orange-600 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            {stat.id && (
              <>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 text-xs touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3 mr-1" />
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
                <DeleteConfirmationDialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                  onConfirm={confirmDelete}
                  itemName="stat"
                  description="Are you sure you want to delete this stat? This action cannot be undone."
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={scaleVariants}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-orange-300 transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shadow-sm`}>
              <IconComponent className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900 md:text-3xl">
                {isInView ? `${count}${suffix}` : "0"}
              </p>
              <p className="text-xs font-medium text-gray-600 md:text-sm">
                {stat.label || ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Animated Value Card Component
function AnimatedValueCard({ value, index, isEditMode, onUpdate, onDelete, refetch }: any) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [editData, setEditData] = useState({
    title: value.title || "",
    description: value.description || ""
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // Initialize edit data when value changes - only if value has data
  useEffect(() => {
    if (value && value.id) {
      setEditData({
        title: value.title || "",
        description: value.description || ""
      })
    } else {
      // New value - keep empty
      setEditData({
        title: "",
        description: ""
      })
    }
  }, [value])
  const icons = [Lightbulb, Award, Zap, Heart, Target, Rocket]

  // Initialize edit data when value changes - only if value has data
  useEffect(() => {
    if (value && value.id) {
      setEditData({
        title: value.title || "",
        description: value.description || ""
      })
    } else {
      // New value - keep empty
      setEditData({
        title: "",
        description: ""
      })
    }
  }, [value])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.ABOUT}/values`, {
        method: value.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: value.id,
          ...editData,
          display_order: index
        })
      })

      if (!response.ok) throw new Error('Failed to save')
      // Silent save - no toast, no refetch (will sync when exiting edit mode)
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!value.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!value.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.ABOUT}/values?id=${value.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete')
      toast.success(SUCCESS_MESSAGES.DELETED)
      refetch()
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Removed auto-save useEffect - using onBlur handlers instead for better UX

  if (isEditMode) {
    return (
      <Card className="border-2 border-orange-300 bg-orange-50/30">
        <CardContent className="p-4 space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
            <Input
              placeholder="Title"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              onBlur={handleSave}
              className="h-11 min-h-[44px] text-base md:h-9 md:text-sm touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">Description</label>
            <Textarea
              placeholder="Description"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              onBlur={handleSave}
              rows={4}
              className="text-base resize-none md:text-sm md:rows-3 touch-manipulation"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
              className="h-11 min-h-[44px] text-sm bg-orange-500 hover:bg-orange-600 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed md:h-8 md:text-xs"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin md:h-3 md:w-3 md:mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1.5 md:h-3 md:w-3 md:mr-1" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            {value.id && (
              <>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-11 min-h-[44px] text-sm touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed md:h-8 md:text-xs"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin md:h-3 md:w-3 md:mr-1" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1.5 md:h-3 md:w-3 md:mr-1" />
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
                <DeleteConfirmationDialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                  onConfirm={confirmDelete}
                  itemName="value"
                  description="Are you sure you want to delete this value? This action cannot be undone."
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={itemVariants}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group h-full border border-gray-200 bg-white hover:border-purple-300 hover:shadow-md transition-all">
        <CardContent className="p-4 md:p-4">
          <div className="mb-2 flex items-center gap-2 md:mb-2 md:gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm md:h-9 md:w-9">
              {React.createElement(icons[index % icons.length], {
                className: "h-4 w-4 text-white md:h-4 md:w-4",
                strokeWidth: 2
              })}
            </div>
            <h4 className="text-base font-semibold text-gray-900 break-words md:text-base">
              {value.title || ""}
            </h4>
          </div>
          <p className="text-base leading-relaxed text-gray-700 break-words md:text-sm">
            {value.description || ""}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Personality Trait Item Component
function PersonalityTraitItem({ trait, index, isEditMode, refetch, onDelete, isSaving, isDeleting }: any) {
  const [traitEditData, setTraitEditData] = useState({
    label: trait.label || "",
    icon_name: trait.icon_name || "Coffee",
    color: trait.color || "from-amber-500 to-orange-500"
  })

  const iconOptions = [
    { name: "Coffee", icon: Coffee },
    { name: "Music", icon: Music },
    { name: "BookOpen", icon: BookOpen },
    { name: "Gamepad2", icon: Gamepad2 },
    { name: "Heart", icon: Heart },
    { name: "Star", icon: Star },
    { name: "Code", icon: Code },
    { name: "Rocket", icon: Rocket },
    { name: "Lightbulb", icon: Lightbulb },
    { name: "Users", icon: Users },
    { name: "Target", icon: Target },
    { name: "Zap", icon: Zap },
  ]

  // Initialize trait edit data
  useEffect(() => {
    setTraitEditData({
      label: trait.label || "",
      icon_name: trait.icon_name || "Coffee",
      color: trait.color || "from-amber-500 to-orange-500"
    })
  }, [trait])

  const handleTraitSave = async () => {
    if (isSaving) return
    try {
      const response = await fetch(`${API_ENDPOINTS.ABOUT}/traits`, {
        method: trait.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: trait.id,
          ...traitEditData,
          display_order: index
        })
      })
      if (!response.ok) throw new Error('Failed to save')
      // Silent save - no toast, no refetch (will sync when exiting edit mode)
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
    }
  }

  // Map color values to gradient classes
  const getColorGradient = (color: string) => {
    const colorMap: Record<string, string> = {
      "blue": "from-blue-500 to-indigo-500",
      "green": "from-green-500 to-emerald-500",
      "purple": "from-purple-500 to-pink-500",
      "orange": "from-amber-500 to-orange-500",
      "pink": "from-pink-500 to-rose-500",
      "red": "from-red-500 to-orange-500",
      "yellow": "from-yellow-500 to-orange-500",
      "cyan": "from-cyan-500 to-blue-500"
    }
    if (color && colorMap[color.toLowerCase()]) {
      return colorMap[color.toLowerCase()]
    }
    // If it's already a gradient class, return as is
    if (color && color.includes("from-") && color.includes("to-")) {
      return color
    }
    return "from-amber-500 to-orange-500"
  }
  
  const gradientClass = getColorGradient(trait.color || traitEditData.color)
  
  // Get icon component - ensure it always returns a valid component
  const iconName = (trait.icon_name || traitEditData.icon_name || "Coffee").trim()
  const IconComponent = getIcon(iconName, Coffee) || Coffee

  if (isEditMode) {
    return (
      <Card key={trait.id} className="border-2 border-orange-300 bg-orange-50/30">
        <CardContent className="p-3 space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
            <Input
              placeholder="Label"
              value={traitEditData.label}
              onChange={(e) => setTraitEditData({ ...traitEditData, label: e.target.value })}
              onBlur={handleTraitSave}
              className="h-11 min-h-[44px] text-base md:h-8 md:text-xs touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
            <select
              value={traitEditData.icon_name}
              onChange={(e) => {
                setTraitEditData({ ...traitEditData, icon_name: e.target.value })
                if (trait.id) setTimeout(() => handleTraitSave(), 500)
              }}
              className="w-full h-11 min-h-[44px] rounded-md border border-gray-300 px-3 text-base touch-manipulation md:h-8 md:px-2 md:text-xs"
            >
              {iconOptions.map(opt => (
                <option key={opt.name} value={opt.name}>{opt.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button 
              size="sm" 
              onClick={handleTraitSave}
              disabled={isSaving}
              className="h-11 min-h-[44px] text-sm bg-orange-500 hover:bg-orange-600 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed md:h-7 md:text-xs"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin md:h-3 md:w-3 md:mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1.5 md:h-3 md:w-3 md:mr-1" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            {trait.id && (
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => onDelete(trait.id)}
                disabled={isDeleting}
                className="h-11 min-h-[44px] text-sm touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed md:h-7 md:text-xs"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin md:h-3 md:w-3 md:mr-1" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1.5 md:h-3 md:w-3 md:mr-1" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      key={trait.id || index}
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="border border-gray-200 bg-white hover:shadow-sm transition-all">
        <CardContent className="flex flex-col items-center justify-center p-4 text-center md:p-3">
          <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${gradientClass} shadow-sm md:mb-1.5 md:h-10 md:w-10`}>
            <IconComponent className="h-5 w-5 text-white md:h-5 md:w-5" strokeWidth={2} />
          </div>
          <p className="text-sm font-medium text-gray-700 md:text-xs">{trait.label || ""}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Personality Traits Component
function PersonalityTraits({ traits, isEditMode, refetch }: any) {
  const [deleteTraitId, setDeleteTraitId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingTraitIds, setDeletingTraitIds] = useState<Set<string>>(new Set())
  const [isAdding, setIsAdding] = useState(false)
  const [savingTraitIds, setSavingTraitIds] = useState<Set<string>>(new Set())

  const iconOptions = [
    { name: "Coffee", icon: Coffee },
    { name: "Music", icon: Music },
    { name: "BookOpen", icon: BookOpen },
    { name: "Gamepad2", icon: Gamepad2 },
    { name: "Heart", icon: Heart },
    { name: "Star", icon: Star },
    { name: "Code", icon: Code },
    { name: "Rocket", icon: Rocket },
  ]

  const colorOptions = [
    "from-amber-500 to-orange-500",
    "from-pink-500 to-rose-500",
    "from-blue-500 to-indigo-500",
    "from-green-500 to-emerald-500",
    "from-purple-500 to-pink-500",
    "from-cyan-500 to-blue-500",
    "from-red-500 to-orange-500",
    "from-yellow-500 to-orange-500",
  ]

  const handleDelete = (traitId: string) => {
    setDeleteTraitId(traitId)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deleteTraitId || deletingTraitIds.has(deleteTraitId)) return
    setDeletingTraitIds(prev => new Set(prev).add(deleteTraitId))
    try {
      const response = await fetch(`${API_ENDPOINTS.ABOUT}/traits?id=${deleteTraitId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete')
      toast.success(SUCCESS_MESSAGES.DELETED)
      refetch()
      setDeleteTraitId(null)
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
    } finally {
      setDeletingTraitIds(prev => {
        const next = new Set(prev)
        next.delete(deleteTraitId!)
        return next
      })
      setShowDeleteDialog(false)
    }
  }


  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
    >
      {traits.map((trait: any, index: number) => {
        const traitId = trait.id || `new-${index}`
        const isSavingTrait = savingTraitIds.has(traitId)
        const isDeletingTrait = deletingTraitIds.has(traitId)

        return (
          <PersonalityTraitItem
            key={trait.id || index}
            trait={trait}
            index={index}
            isEditMode={isEditMode}
            refetch={refetch}
            onDelete={handleDelete}
            isSaving={isSavingTrait}
            isDeleting={isDeletingTrait}
          />
        )
      })}
      {isEditMode && (
        <Card 
          className={`border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-orange-400 transition-colors cursor-pointer touch-manipulation ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={async () => {
            if (isAdding) return
            setIsAdding(true)
            try {
              const response = await fetch(`${API_ENDPOINTS.ABOUT}/traits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  label: "",
                  icon_name: "Coffee",
                  color: "from-amber-500 to-orange-500",
                  display_order: traits.length
                })
              })
              if (!response.ok) throw new Error('Failed to create')
              // Silent create - no toast, no refetch (will sync when exiting edit mode)
              refetch() // Only refetch for new items to show them immediately
            } catch (error: any) {
              toast.error(error.message || ERROR_MESSAGES.GENERIC)
            } finally {
              setIsAdding(false)
            }
          }}
        >
          <CardContent className="flex items-center justify-center p-5">
            <div className="text-center">
              {isAdding ? (
                <Loader2 className="h-6 w-6 text-gray-400 mx-auto mb-1 animate-spin" />
              ) : (
                <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
              )}
              <p className="text-xs text-gray-600">{isAdding ? 'Adding...' : 'Add Trait'}</p>
            </div>
          </CardContent>
        </Card>
      )}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="trait"
        description="Are you sure you want to delete this trait? This action cannot be undone."
      />
    </motion.div>
  )
}

// Milestone Item Component
function MilestoneItem({ milestone, index, isEditMode, refetch }: any) {
  const [editData, setEditData] = useState({
    date: milestone.date || "",
    title: milestone.title || "",
    description: milestone.description || "",
    location: milestone.location || ""
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (milestone && milestone.id) {
    setEditData({
        date: milestone.date || "",
      title: milestone.title || "",
      description: milestone.description || "",
      location: milestone.location || ""
    })
    } else {
      // New milestone - keep empty
      setEditData({
        date: "",
        title: "",
        description: "",
        location: ""
      })
    }
  }, [milestone])

  const handleSave = async () => {
    if (isSaving) return
    
    // Validate required fields
    if (!editData.date || !editData.date.trim()) {
      toast.error('Date is required')
      return
    }
    if (!editData.title || !editData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!editData.description || !editData.description.trim()) {
      toast.error('Description is required')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.ABOUT}/milestones`, {
        method: milestone.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: milestone.id,
          date: editData.date.trim(),
          title: editData.title.trim(),
          description: editData.description.trim(),
          location: editData.location && editData.location.trim() ? editData.location.trim() : "",
          display_order: index
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      
      // Silent save - no toast, no refetch (will sync when exiting edit mode)
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!milestone.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!milestone.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.ABOUT}/milestones?id=${milestone.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success(SUCCESS_MESSAGES.DELETED)
      refetch()
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isEditMode) {
    return (
      <Card className="border-2 border-orange-300 bg-orange-50/30 mb-4">
        <CardContent className="p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <Input
                type="date"
                value={editData.date}
                onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                onBlur={handleSave}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
              <Input
                placeholder="Location"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                onBlur={handleSave}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
            <Input
              placeholder="Title"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              onBlur={() => milestone.id && handleSave()}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <Textarea
              placeholder="Description"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              onBlur={() => milestone.id && handleSave()}
              rows={2}
              className="text-sm resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 text-xs bg-orange-500 hover:bg-orange-600 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            {milestone.id && (
              <>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 text-xs touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3 mr-1" />
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
                <DeleteConfirmationDialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                  onConfirm={confirmDelete}
                  itemName="milestone"
                  description="Are you sure you want to delete this milestone? This action cannot be undone."
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      key={milestone.id || index}
      variants={itemVariants}
      className="relative flex items-start gap-3 md:items-center"
    >
      <div className={`flex shrink-0 justify-start md:w-1/2 md:pr-6 md:justify-end ${index % 2 === 1 ? 'md:order-2 md:justify-start md:pl-6' : ''}`}>
        <div className="flex h-12 min-w-[90px] items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 px-3 text-sm font-bold text-white shadow-sm whitespace-nowrap md:h-14 md:min-w-[80px] md:text-xs">
          {milestone.date || ""}
        </div>
      </div>
      <div className={`flex-1 md:w-1/2 ${index % 2 === 1 ? 'md:order-1 md:text-right' : ''}`}>
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-3">
            <h4 className="mb-1 text-base font-semibold text-gray-900 md:mb-0.5 md:text-sm">{milestone.title || ""}</h4>
            {milestone.location && (
              <p className="text-xs text-gray-500 mb-1.5 md:text-[10px] md:mb-1"><MapPin className="h-3.5 w-3.5 inline mr-1 md:h-3 md:w-3" />{milestone.location}</p>
            )}
            <p className="text-base text-gray-600 leading-relaxed md:text-xs">{milestone.description || ""}</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// Timeline Component
function TimelineSection({ milestones = [], isEditMode, refetch }: any) {
  const [isAdding, setIsAdding] = useState(false)
  
  const handleAddMilestone = async () => {
    if (isAdding) return
    setIsAdding(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.ABOUT}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: "",
          title: "",
          description: "",
          location: "",
          display_order: milestones.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="relative">
      {milestones.length > 0 && !isEditMode && (
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 md:left-1/2 md:-translate-x-0.5" />
      )}
      <div className="space-y-8">
        {/* Show empty state only when NOT in edit mode and no milestones */}
        {milestones.length === 0 && !isEditMode && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No milestones yet</p>
            <p className="text-sm">Enable edit mode to add your journey milestones</p>
          </div>
        )}
        
        {/* Always show existing milestones */}
        {milestones.map((milestone: any, index: number) => (
          <MilestoneItem
            key={milestone.id || index}
            milestone={milestone}
            index={index}
            isEditMode={isEditMode}
            refetch={refetch}
          />
        ))}
        
        {/* Always show "Add Milestone" card when in edit mode - CRITICAL: Must always be visible */}
        {isEditMode && (
          <div key="add-milestone" className="relative flex items-center justify-center w-full">
            <Card 
              className={`border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-orange-400 transition-colors cursor-pointer w-full touch-manipulation ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleAddMilestone}
            >
              <CardContent className="flex items-center justify-center p-5">
                <div className="text-center">
                  {isAdding ? (
                    <Loader2 className="h-6 w-6 text-gray-400 mx-auto mb-1 animate-spin" />
                  ) : (
                    <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  )}
                  <p className="text-xs text-gray-600">{isAdding ? 'Adding...' : 'Add Milestone'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export function About() {
  const { data, loading, error, refetch } = useAboutData()
  const { isEditMode } = useEditMode()
  const [editingField, setEditingField] = useState<string | null>(null)
  
  // Remove redundant useEffect - not needed
  const [profileData, setProfileData] = useState({
    full_name: "",
    title: "",
    bio: "",
    location: "",
    email: "",
    avatar_url: "",
    subtitle: ""
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAddingStat, setIsAddingStat] = useState(false)
  const [isAddingValue, setIsAddingValue] = useState(false)

  // Initialize profile data from database - sync with database values
  // When entering edit mode, populate fields with current database values
  // When exiting edit mode, sync with latest database values
  useEffect(() => {
    if (data?.profile) {
      setProfileData({
        full_name: data.profile.full_name || "",
        title: data.profile.title || "",
        bio: data.profile.bio || "",
        location: data.profile.location || "",
        email: data.profile.email || "",
        avatar_url: data.profile.avatar_url || "",
        subtitle: data.profile.subtitle || ""
      })
    }
  }, [data, isEditMode])

  // Refetch data ONLY when EXITING edit mode to sync with server
  useEffect(() => {
    if (!isEditMode) {
      // Small delay to ensure any pending saves are complete
      const timer = setTimeout(() => {
        refetch()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditMode, refetch])

  // Debounce all profile fields for real-time auto-save (industry standard UX)
  const debouncedFullName = useDebounce(profileData.full_name, UI_CONFIG.DEBOUNCE_DELAY_MS)
  const debouncedTitle = useDebounce(profileData.title, UI_CONFIG.DEBOUNCE_DELAY_MS)
  const debouncedBio = useDebounce(profileData.bio, UI_CONFIG.DEBOUNCE_DELAY_MS)
  const debouncedLocation = useDebounce(profileData.location, UI_CONFIG.DEBOUNCE_DELAY_MS)
  const debouncedEmail = useDebounce(profileData.email, UI_CONFIG.DEBOUNCE_DELAY_MS)
  const debouncedSubtitle = useDebounce(profileData.subtitle, UI_CONFIG.DEBOUNCE_DELAY_MS)
  
  // Auto-save all fields when debounced values change (silent saves - no toast, no refresh)
  useEffect(() => {
    if (isEditMode && data?.profile) {
      if (debouncedFullName !== data.profile.full_name && debouncedFullName.trim() !== (data.profile.full_name || "").trim()) {
        handleProfileUpdate('full_name', debouncedFullName, false)
      }
    }
  }, [debouncedFullName, isEditMode])
  
  useEffect(() => {
    if (isEditMode && data?.profile) {
      if (debouncedTitle !== data.profile.title && debouncedTitle.trim() !== (data.profile.title || "").trim()) {
        handleProfileUpdate('title', debouncedTitle, false)
      }
    }
  }, [debouncedTitle, isEditMode])
  
  useEffect(() => {
    if (isEditMode && data?.profile) {
      if (debouncedBio !== data.profile.bio && debouncedBio.trim() !== (data.profile.bio || "").trim()) {
        handleProfileUpdate('bio', debouncedBio, false)
      }
    }
  }, [debouncedBio, isEditMode])
  
  useEffect(() => {
    if (isEditMode && data?.profile) {
      if (debouncedLocation !== data.profile.location && debouncedLocation.trim() !== (data.profile.location || "").trim()) {
        handleProfileUpdate('location', debouncedLocation, false)
      }
    }
  }, [debouncedLocation, isEditMode])
  
  useEffect(() => {
    if (isEditMode && data?.profile) {
      if (debouncedEmail !== data.profile.email && debouncedEmail.trim() !== (data.profile.email || "").trim()) {
        handleProfileUpdate('email', debouncedEmail, false)
      }
    }
  }, [debouncedEmail, isEditMode])
  
  useEffect(() => {
    if (isEditMode && data?.profile) {
      const currentSubtitle = data.profile.subtitle || ""
      if (debouncedSubtitle !== currentSubtitle && debouncedSubtitle.trim() !== currentSubtitle.trim()) {
        handleProfileUpdate('subtitle', debouncedSubtitle, false) // Silent save
      }
    }
  }, [debouncedSubtitle, isEditMode])

  const handleProfileUpdate = async (field: string, value: string, showToast: boolean = true) => {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileData,
          [field]: value
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || ERROR_MESSAGES.GENERIC)
      }

      if (showToast) {
        toast.success(SUCCESS_MESSAGES.SAVED)
      }
      
      setEditingField(null)
      // Optimistic update - update local state immediately
      setProfileData(prev => ({ ...prev, [field]: value }))
      // Don't refetch - optimistic update is enough, will sync when exiting edit mode
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
      // Revert optimistic update on error
      if (data?.profile) {
        setProfileData({
          full_name: data.profile.full_name || "",
          title: data.profile.title || "",
          bio: data.profile.bio || "",
          location: data.profile.location || "",
          email: data.profile.email || "",
          avatar_url: data.profile.avatar_url || "",
          subtitle: data.profile.subtitle || ""
        })
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed')

      await handleProfileUpdate('avatar_url', result.url)
      toast.success(SUCCESS_MESSAGES.UPLOADED)
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAddStat = async () => {
    if (isAddingStat) return
    setIsAddingStat(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.ABOUT}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: "",
          value: "",
          icon_name: "Award",
          gradient: "from-blue-500 to-cyan-500",
          display_order: (data?.stats?.length || 0)
        })
      })

      if (!response.ok) throw new Error('Failed to create')
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
    } finally {
      setIsAddingStat(false)
    }
  }

  const handleAddValue = async () => {
    if (isAddingValue) return
    setIsAddingValue(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.ABOUT}/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "",
          description: "",
          display_order: (data?.values?.length || 0)
        })
      })

      if (!response.ok) throw new Error('Failed to create')
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
    } finally {
      setIsAddingValue(false)
    }
  }

  if (loading) {
    return <AboutSkeleton />
  }

  if (error) {
    return (
      <div className="w-full max-w-[1140px] text-center">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-red-600 mb-2">
              {ERROR_MESSAGES.GENERIC}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = data?.stats || []
  const values = data?.values || []
  const profile = data?.profile || {}

  return (
    <div className="w-full max-w-[1140px] space-y-4 md:space-y-5 px-4 md:px-0">
      {/* Compact Header with Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-2 md:space-y-2"
      >
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          About Me
        </h2>
        {isEditMode ? (
          <div className="flex justify-center px-4 md:px-0">
            <Input
              value={profileData.subtitle}
              onChange={(e) => setProfileData({ ...profileData, subtitle: e.target.value })}
              onBlur={() => handleProfileUpdate('subtitle', profileData.subtitle)}
              placeholder="Enter a subtitle (e.g., Get to know me better, my story, my journey...)"
              className="max-w-2xl h-11 min-h-[44px] text-base text-center bg-white/95 border border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 placeholder:text-gray-400 touch-manipulation md:h-9 md:text-sm"
            />
          </div>
        ) : (
          profile?.subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base font-medium text-white/80 md:text-base max-w-2xl mx-auto px-4 md:px-0 leading-relaxed"
            >
              {profile.subtitle}
            </motion.p>
          )
        )}
      </motion.div>

      {/* Hero Introduction Card - Compact & Clean */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
              <User className="h-4 w-4 text-blue-500" />
              Profile Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:gap-5">
              {/* Compact Avatar/Image Upload */}
              <div className="flex shrink-0 items-center justify-center md:items-start">
                <div className="relative">
                  {isEditMode && !profile?.avatar_url && (
                    <div 
                      className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-orange-400 hover:bg-orange-50/30 touch-manipulation md:h-32 md:w-32"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
                          <span className="text-xs text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mb-1" />
                          <span className="text-xs font-medium text-gray-600">Upload Photo</span>
                          <span className="text-[10px] text-gray-500">JPG, PNG</span>
                        </>
                      )}
                    </div>
                  )}
                  {profile?.avatar_url && (
                    <div className="relative group">
                      <img
                        src={profile.avatar_url}
                        alt={profile?.full_name || "Profile"}
                        className="h-28 w-28 rounded-xl object-cover border border-gray-200 md:h-32 md:w-32"
                      />
                      {isEditMode && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer touch-manipulation"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploading ? (
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Upload className="h-5 w-5 text-white" />
                              <span className="text-[10px] font-medium text-white">Change</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Compact Bio Content */}
              <div className="flex-1 space-y-3 md:space-y-3">
                {isEditMode ? (
                  <div className="space-y-3 md:space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs">Full Name</label>
                      <Input
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        placeholder="Your Name"
                        className="h-11 min-h-[44px] text-base md:h-9 md:text-base touch-manipulation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs">Title</label>
                      <Input
                        value={profileData.title}
                        onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                        placeholder="Your Title"
                        className="h-11 min-h-[44px] text-base md:h-9 md:text-sm touch-manipulation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs">Bio</label>
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        placeholder="Write a brief bio..."
                        rows={5}
                        className="text-base resize-none md:text-sm md:rows-4 touch-manipulation"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 leading-tight md:text-2xl">
                        {profile?.full_name || "Your Name"}
                      </h3>
                      <p className="text-base font-medium text-gray-600 mt-1 md:text-sm md:mt-0.5">
                        {profile?.title || "Your Title"}
                      </p>
                    </div>
                    <p className="text-base leading-relaxed text-gray-700 whitespace-pre-line md:text-sm">
                      {profile?.bio || "Write something about yourself..."}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Compact Stats Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={itemVariants}
      >
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-4 md:p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-4">
              {stats.map((stat: any, index: number) => (
                <AnimatedStatCard
                  key={stat.id || index}
                  stat={stat}
                  index={index}
                  isEditMode={isEditMode}
                  refetch={refetch}
                />
              ))}
              {isEditMode && (
                <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-orange-400 transition-colors cursor-pointer touch-manipulation min-h-[120px]"
                  onClick={handleAddStat}
                >
                  <CardContent className="flex items-center justify-center p-6 md:p-5">
                    <div className="text-center">
                      <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-600 md:text-xs">Add Stat</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personality Traits - Compact */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={itemVariants}
      >
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
              <Heart className="h-4 w-4 text-pink-500" />
              Beyond Code
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <PersonalityTraits 
              traits={data?.traits || []} 
              isEditMode={isEditMode} 
              refetch={refetch} 
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Core Values & Principles - Compact */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm">
                <Target className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <CardTitle className="text-base font-semibold text-gray-900 md:text-lg">
                Core Values & Principles
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-4 md:p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
              {values.map((value: any, index: number) => (
                <AnimatedValueCard
                  key={value.id || index}
                  value={value}
                  index={index}
                  isEditMode={isEditMode}
                  refetch={refetch}
                />
              ))}
              {isEditMode && (
                <Card 
                  className={`border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-orange-400 transition-colors cursor-pointer touch-manipulation min-h-[140px] ${isAddingValue ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleAddValue}
                >
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                      {isAddingValue ? (
                        <Loader2 className="h-6 w-6 text-gray-400 mx-auto mb-1 animate-spin" />
                      ) : (
                        <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                      )}
                      <p className="text-sm text-gray-600 md:text-xs">{isAddingValue ? 'Adding...' : 'Add Value'}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Timeline Section - Compact */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={itemVariants}
      >
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
              <Calendar className="h-4 w-4 text-blue-500" />
              My Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <TimelineSection 
              milestones={data?.milestones || []} 
              isEditMode={isEditMode} 
              refetch={refetch} 
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Info Section - Location Only */}
      {profile?.location && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
        >
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4 md:p-4">
              <div className="flex items-center gap-3 md:gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm md:h-10 md:w-10">
                  <MapPin className="h-5 w-5 text-white md:h-5 md:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 md:text-[10px] md:mb-0.5">Location</p>
                  {isEditMode ? (
                    <Input
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      onBlur={() => handleProfileUpdate('location', profileData.location)}
                      placeholder="Location"
                      className="h-11 min-h-[44px] text-base md:h-8 md:text-sm touch-manipulation"
                    />
                  ) : (
                    <p className="text-base font-semibold text-gray-900 truncate md:text-sm">
                      {profile.location}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

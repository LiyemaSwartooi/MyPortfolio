"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trophy, Plus, Save, Trash2, ChevronLeft, ChevronRight, Upload, Loader2, Calendar } from "lucide-react"
import { useAchievements } from "@/hooks/use-portfolio-data"
import { Skeleton } from "@/components/ui/skeleton"
import { getIcon } from "@/lib/icon-mapper"
import { useEditMode } from "@/contexts/EditModeContext"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { getCurrentYear } from "@/lib/date-utils"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const availableIcons = [
  "Code", "Target", "Lightbulb", "User", "Briefcase", "Calendar",
  "GraduationCap", "Award", "BookOpen", "Trophy", "Star", "TrendingUp",
  "Rocket", "Coffee", "Music", "Gamepad2", "Heart"
]

const gradientOptions = [
  "from-yellow-500 to-orange-500",
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-indigo-500 to-purple-500",
  "from-teal-500 to-blue-500"
]

// Recognition Item Component (for edit mode)
function RecognitionItem({ recognition, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editData, setEditData] = useState({
    title: recognition.title || "",
    event: recognition.event || "",
    description: recognition.description || "",
    image_url: recognition.image_url || ""
  })

  // Initialize edit data when recognition changes - only if recognition has data
  useEffect(() => {
    if (recognition && recognition.id) {
      setEditData({
        title: recognition.title || "",
        event: recognition.event || "",
        description: recognition.description || "",
        image_url: recognition.image_url || ""
      })
    } else {
      // New recognition - keep empty
      setEditData({
        title: "",
        event: "",
        description: "",
        image_url: ""
      })
    }
  }, [recognition])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      if (!editData.title || !editData.event) {
        toast.error('Title and event are required')
        return
      }

      const response = await fetch('/api/achievements/recognitions', {
        method: recognition.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: recognition.id,
          ...editData,
          image_url: editData.image_url || "",
          display_order: 0
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      
      // Silent save - no toast, no refetch (will sync when exiting edit mode)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save recognition')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!recognition.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!recognition.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/achievements/recognitions?id=${recognition.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Recognition deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete recognition')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/achievements/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed')

      setEditData({ ...editData, image_url: result.url })
      if (recognition.id) {
        await handleSave()
      }
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (isEditMode) {
    return (
      <>
        <Card className="border-2 border-orange-300 bg-orange-50/30">
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
        <Input
                  placeholder="Recognition title"
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          onBlur={() => recognition.id && handleSave()}
                  className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
        />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Event</label>
        <Input
                  placeholder="Event name"
          value={editData.event}
          onChange={(e) => setEditData({ ...editData, event: e.target.value })}
          onBlur={() => recognition.id && handleSave()}
                  className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Image</label>
              <div className="space-y-2">
                {editData.image_url ? (
                  <div className="relative group">
                    <img
                      src={editData.image_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="h-5 w-5 text-white" />
                          <span className="text-[10px] font-medium text-white">Change</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div 
                    className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-orange-400 hover:bg-orange-50/30"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-1">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                        <span className="text-xs text-gray-600">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mb-1" />
                        <span className="text-xs font-medium text-gray-600">Upload Image</span>
                        <span className="text-[10px] text-gray-500">JPG, PNG, WebP</span>
                      </>
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
                <Input
                  placeholder="Or enter image URL"
                  value={editData.image_url}
                  onChange={(e) => setEditData({ ...editData, image_url: e.target.value })}
                  onBlur={() => recognition.id && handleSave()}
                  className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
        <Textarea
                placeholder="Description"
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          onBlur={() => recognition.id && handleSave()}
                rows={3}
                className="text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white resize-none"
        />
            </div>
            <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          {recognition.id && (
            <Button size="sm" variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
          </CardContent>
        </Card>
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={confirmDelete}
          itemName="recognition"
        />
      </>
    )
  }

  return null // Recognitions display handled in RecognitionCard component
}

// Recognition Card Component (for slideshow view)
function RecognitionCard({ recognition, index, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    if (!recognition.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!recognition.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/achievements/recognitions?id=${recognition.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Recognition deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete recognition')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <motion.div variants={itemVariants} className="h-full">
      <Card className="relative overflow-hidden border border-gray-200/80 bg-transparent p-0 shadow-xl h-full min-h-[320px] md:min-h-[360px]">
        {recognition.image_url && (
          <img
            src={recognition.image_url}
            alt={recognition.title}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        
        <CardContent className="relative z-10 p-4 md:p-5 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Trophy className="h-5 w-5 text-white" />
      </div>
    </div>
            <h3 className="mb-2 text-[22px] font-bold text-white drop-shadow-lg md:mb-3 md:text-[26px] break-words">
              {recognition.title}
            </h3>
            <p className="text-[14px] font-medium text-white/90 drop-shadow-md md:text-[15px] break-words mb-2">
              {recognition.event}
            </p>
            {recognition.description && (
              <p className="text-[14px] leading-relaxed text-white/95 drop-shadow-md md:text-[15px] break-words">
                {recognition.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="recognition"
      />
    </motion.div>
  )
}

// Achievement Item Component
function AchievementItem({ achievement, index, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editData, setEditData] = useState({
    title: achievement.title || "",
    organization: achievement.organization || "",
    year: achievement.year?.toString() || "",
    description: achievement.description || "",
    icon_name: achievement.icon_name || "Trophy",
    gradient: achievement.gradient || "from-yellow-500 to-orange-500",
    image_url: achievement.image_url || ""
  })

  // Initialize edit data when achievement changes - only if achievement has data
  useEffect(() => {
    if (achievement && achievement.id) {
      setEditData({
        title: achievement.title || "",
        organization: achievement.organization || "",
        year: achievement.year?.toString() || "",
        description: achievement.description || "",
        icon_name: achievement.icon_name || "Trophy",
        gradient: achievement.gradient || "from-yellow-500 to-orange-500",
        image_url: achievement.image_url || ""
      })
    } else {
      // New achievement - keep empty
      setEditData({
        title: "",
        organization: "",
        year: "",
        description: "",
        icon_name: "Trophy",
        gradient: "from-yellow-500 to-orange-500",
        image_url: ""
      })
    }
  }, [achievement])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      if (!editData.title || !editData.organization || !editData.year) {
        toast.error('Title, organization, and year are required')
        return
      }

      const response = await fetch('/api/achievements', {
        method: achievement.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: achievement.id,
          ...editData,
          year: parseInt(editData.year),
          image_url: editData.image_url || "",
          display_order: index
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      
      // Silent save - no toast, no refetch (will sync when exiting edit mode)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save achievement')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!achievement.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!achievement.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/achievements?id=${achievement.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Achievement deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete achievement')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/achievements/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed')

      setEditData({ ...editData, image_url: result.url })
      if (achievement.id) {
        await handleSave()
      }
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const IconComponent = getIcon(editData.icon_name)

  if (isEditMode) {
    return (
      <Card className="border-2 border-orange-300 bg-orange-50/30">
        <CardContent className="p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
              <Input
                placeholder="Achievement title"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                onBlur={() => achievement.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Organization</label>
              <Input
                placeholder="Organization"
                value={editData.organization}
                onChange={(e) => setEditData({ ...editData, organization: e.target.value })}
                onBlur={() => achievement.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
              <Input
                type="number"
                placeholder="Year"
                value={editData.year}
                onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                onBlur={() => achievement.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
              <Select
                value={editData.icon_name}
                onValueChange={(value) => {
                  setEditData({ ...editData, icon_name: value })
                  if (achievement.id) {
                    setTimeout(() => handleSave(), 100)
                  }
                }}
              >
                <SelectTrigger className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map((icon) => {
                    const IconComp = getIcon(icon)
                    return (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <IconComp className="h-4 w-4" />
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gradient</label>
              <Select
                value={editData.gradient}
                onValueChange={(value) => {
                  setEditData({ ...editData, gradient: value })
                  if (achievement.id) {
                    setTimeout(() => handleSave(), 100)
                  }
                }}
              >
                <SelectTrigger className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gradientOptions.map((grad) => (
                    <SelectItem key={grad} value={grad}>
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded bg-gradient-to-br ${grad}`} />
                        <span>{grad}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Image</label>
            <div className="space-y-2">
              {editData.image_url ? (
                <div className="relative group">
                  <img
                    src={editData.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <div 
                    className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-5 w-5 text-white" />
                        <span className="text-[10px] font-medium text-white">Change</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-orange-400 hover:bg-orange-50/30"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-1">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                      <span className="text-xs text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-1" />
                      <span className="text-xs font-medium text-gray-600">Upload Image</span>
                      <span className="text-[10px] text-gray-500">JPG, PNG, WebP</span>
                    </>
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
              <Input
                placeholder="Or enter image URL"
                value={editData.image_url}
                onChange={(e) => setEditData({ ...editData, image_url: e.target.value })}
                onBlur={() => achievement.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <Textarea
              placeholder="Description"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              onBlur={() => achievement.id && handleSave()}
              rows={3}
              className="text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            {achievement.id && (
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div variants={itemVariants} className="h-full">
      <Card className="relative overflow-hidden border border-gray-200/80 bg-transparent p-0 shadow-xl h-full min-h-[320px] md:min-h-[360px]">
        {achievement.image_url && (
          <img
            src={achievement.image_url}
            alt={achievement.title}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        
        <CardContent className="relative z-10 p-4 md:p-5 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <IconComponent className="h-5 w-5 text-white" />
            </div>
              <span className="rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-2.5 py-1 text-[10px] font-semibold text-white md:text-[11px]">
              {achievement.year}
            </span>
          </div>
            <h3 className="mb-2 text-[22px] font-bold text-white drop-shadow-lg md:mb-3 md:text-[26px] break-words">
              {achievement.title}
            </h3>
            <p className="text-[14px] font-medium text-white/90 drop-shadow-md md:text-[15px] break-words mb-2">
              {achievement.organization}
            </p>
          {achievement.description && (
              <p className="text-[14px] leading-relaxed text-white/95 drop-shadow-md md:text-[15px] break-words">
                {achievement.description}
              </p>
          )}
          </div>
        </CardContent>
      </Card>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="achievement"
      />
    </motion.div>
  )
}

export function Achievements() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { data, loading, error, refetch } = useAchievements()
  const { isEditMode } = useEditMode()
  const [subtitle, setSubtitle] = useState("Milestones and honors throughout my career")

  const achievements = data?.achievements || []
  const recognitions = data?.recognitions || []
  
  // Combine achievements and recognitions into one array for slideshow
  const allItems = [
    ...achievements.map((a: any) => ({ ...a, type: 'achievement' })),
    ...recognitions.map((r: any) => ({ ...r, type: 'recognition' }))
  ]

  useEffect(() => {
    if (allItems && allItems.length > 0 && currentIndex >= allItems.length) {
      setCurrentIndex(0)
    }
  }, [allItems, currentIndex])

  // Refetch data ONLY when EXITING edit mode to sync with server
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        refetch()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditMode, refetch])

  const handleAddAchievement = async () => {
    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "",
          organization: "",
          year: null,
          description: "",
          icon_name: "Trophy",
          gradient: "from-yellow-500 to-orange-500",
          display_order: achievements.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add achievement')
    }
  }

  const handleAddRecognition = async () => {
    try {
      const response = await fetch('/api/achievements/recognitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "",
          event: "Event Name",
          description: "",
          image_url: "",
          display_order: recognitions.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add recognition')
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-[1140px] space-y-3 md:space-y-4">
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-[1140px] text-center text-red-600">
        Failed to load achievements. Please try again later.
      </div>
    )
  }

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
          Achievements & Recognition
        </h2>
        {isEditMode ? (
          <div className="flex justify-center px-4 md:px-0">
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter a subtitle (e.g., Milestones and honors throughout my career...)"
              className="max-w-2xl h-11 min-h-[44px] text-base text-center bg-white border border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 placeholder:text-gray-400 touch-manipulation md:h-9 md:text-sm"
            />
          </div>
        ) : (
          subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base font-medium text-white/80 md:text-base max-w-2xl mx-auto px-4 md:px-0 leading-relaxed"
          >
            {subtitle}
          </motion.p>
          )
        )}
      </motion.div>

      {/* Achievements & Recognition - Slideshow View (Non-Edit Mode) */}
      {!isEditMode ? (
        allItems.length === 0 ? (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
                <Trophy className="h-4 w-4 text-blue-500" />
                Achievements & Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500 md:py-12">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium md:text-lg">No achievements or recognitions yet</p>
                <p className="text-base md:text-sm">Enable edit mode to add your achievements and recognitions</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
                  <Trophy className="h-4 w-4 text-blue-500" />
                  Achievements & Recognition
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {allItems[currentIndex]?.type === 'achievement' ? (
                    <AchievementItem
                      achievement={allItems[currentIndex]}
                      index={currentIndex}
                      isEditMode={false}
                      refetch={refetch}
                    />
                  ) : (
                    <RecognitionCard
                      recognition={allItems[currentIndex]}
                      index={currentIndex}
                      isEditMode={false}
                      refetch={refetch}
                    />
                  )}
                </motion.div>

                {allItems.length > 1 && (
                  <>
                    <div className="mt-4 flex items-center justify-between md:mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentIndex((prev) => (prev === 0 ? allItems.length - 1 : prev - 1))}
                        className="h-11 min-h-[44px] border-gray-300 bg-white hover:bg-gray-50 touch-manipulation active:bg-gray-100 md:h-9 md:h-8"
                      >
                        <ChevronLeft className="mr-1.5 h-5 w-5 md:mr-1 md:h-4 md:w-4 md:mr-1.5" />
                        <span className="text-sm md:hidden sm:inline md:text-xs">Previous</span>
                      </Button>

                      <div className="flex items-center gap-2 md:gap-1.5 md:gap-2">
                        {allItems.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2.5 rounded-full transition-all touch-manipulation md:h-2 ${
                              idx === currentIndex
                                ? "w-8 bg-blue-600 md:w-6 md:w-8"
                                : "w-2.5 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 md:w-2"
                            }`}
                            aria-label={`Go to item ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentIndex((prev) => (prev === allItems.length - 1 ? 0 : prev + 1))}
                        className="h-11 min-h-[44px] border-gray-300 bg-white hover:bg-gray-50 touch-manipulation active:bg-gray-100 md:h-9 md:h-8"
                      >
                        <span className="text-sm md:hidden sm:inline md:text-xs">Next</span>
                        <ChevronRight className="ml-1.5 h-5 w-5 md:ml-1 md:h-4 md:w-4 md:ml-1.5" />
                      </Button>
                    </div>

                    <div className="mt-3 text-center text-sm font-bold text-gray-700 md:mt-2 md:text-[12px] md:text-[13px]">
                      {currentIndex + 1} of {allItems.length}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )
      ) : (
        /* Edit Mode - Grid View */
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
        >
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
                <Trophy className="h-4 w-4 text-blue-500" />
                Achievements & Recognition
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
                className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3"
      >
                {allItems.length === 0 && !isEditMode ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No achievements or recognitions yet</p>
                    <p className="text-sm">Enable edit mode to add your achievements and recognitions</p>
          </div>
        ) : (
                  <>
            {achievements.map((achievement: any, index: number) => (
              <AchievementItem
                key={achievement.id || index}
                achievement={achievement}
                index={index}
                isEditMode={isEditMode}
                refetch={refetch}
              />
            ))}
                    {recognitions.map((recognition: any, index: number) => (
                  <RecognitionItem
                        key={recognition.id || `recognition-${index}`}
                    recognition={recognition}
                    isEditMode={isEditMode}
                    refetch={refetch}
                  />
                ))}
                {isEditMode && (
                      <>
                        <motion.div variants={itemVariants}>
                          <Card className="border-2 border-dashed border-gray-300 bg-gray-50 hover:border-orange-400 transition-colors cursor-pointer h-full touch-manipulation min-h-[280px]"
                            onClick={handleAddAchievement}
                          >
                            <CardContent className="flex items-center justify-center p-6 h-full min-h-[280px] md:p-5 md:min-h-[320px]">
                              <div className="text-center">
                                <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                <p className="text-sm text-gray-600 md:text-xs">Add Achievement</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <Card className="border-2 border-dashed border-gray-300 bg-gray-50 hover:border-orange-400 transition-colors cursor-pointer h-full touch-manipulation min-h-[280px]"
                    onClick={handleAddRecognition}
                  >
                            <CardContent className="flex items-center justify-center p-6 h-full min-h-[280px] md:p-5 md:min-h-[320px]">
                      <div className="text-center">
                                <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm text-gray-600 md:text-xs">Add Recognition</p>
                      </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </>
                    )}
                  </>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        )}

    </div>
  )
}

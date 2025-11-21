"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, MapPin, Plus, Save, Trash2, ChevronLeft, ChevronRight, Upload, Loader2 } from "lucide-react"
import { useJourneyMemories } from "@/hooks/use-portfolio-data"
import { Skeleton } from "@/components/ui/skeleton"
import { getIcon } from "@/lib/icon-mapper"
import { useEditMode } from "@/contexts/EditModeContext"
import { toast } from "sonner"
import { motion } from "framer-motion"
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

// Journey Memory Item Component
function JourneyMemoryItem({ memory, index, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editData, setEditData] = useState({
    date: memory.date || "",
    title: memory.title || "",
    description: memory.description || "",
    location: memory.location || "",
    icon_name: memory.icon_name || "Calendar",
    image_url: memory.image_url || ""
  })

  // Initialize edit data when memory changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (memory && memory.id) {
      setEditData({
        date: memory.date || "",
        title: memory.title || "",
        description: memory.description || "",
        location: memory.location || "",
        icon_name: memory.icon_name || "Calendar",
        image_url: memory.image_url || ""
      })
    } else {
      // New memory - keep empty
      setEditData({
        date: "",
        title: "",
        description: "",
        location: "",
        icon_name: "Calendar",
        image_url: ""
      })
    }
  }, [memory, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      if (!editData.date || !editData.title || !editData.description) {
        toast.error('Date, title, and description are required')
        return
      }

      const response = await fetch('/api/about/milestones', {
        method: memory.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: memory.id,
          ...editData,
          location: editData.location || "",
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
      toast.error(error.message || 'Failed to save journey memory')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!memory.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!memory.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/about/milestones?id=${memory.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Journey memory deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete journey memory')
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

      const response = await fetch('/api/journey/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed')

      setEditData({ ...editData, image_url: result.url })
      if (memory.id) {
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
        <CardContent className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
            <Select
              value={editData.icon_name}
              onValueChange={(value) => {
                setEditData({ ...editData, icon_name: value })
                if (memory.id) {
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
            <Input
              placeholder="Date (e.g., 2024 or Jan 2024)"
              value={editData.date}
              onChange={(e) => setEditData({ ...editData, date: e.target.value })}
              onBlur={() => memory.id && handleSave()}
              className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
            <Input
              placeholder="Title"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              onBlur={() => memory.id && handleSave()}
              className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
            <Input
              placeholder="Location"
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              onBlur={() => memory.id && handleSave()}
              className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
            />
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
                onBlur={() => memory.id && handleSave()}
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
              onBlur={() => memory.id && handleSave()}
              rows={3}
              className="text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            {memory.id && (
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
        {memory.image_url && (
          <img
            src={memory.image_url}
            alt={memory.title}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        
        <CardContent className="relative z-10 p-4 md:p-5 h-full flex flex-col justify-between">
          <div>
            <h3 className="mb-2 text-[22px] font-bold text-white drop-shadow-lg md:mb-3 md:text-[26px] break-words">
              {memory.title}
            </h3>
            <p className="text-[14px] leading-relaxed text-white/95 drop-shadow-md md:text-[15px] break-words">
              {memory.description}
            </p>
          </div>

          <div className="space-y-2 md:space-y-2.5 mt-3">
            <div className="flex items-center gap-2 text-[13px] text-white/90 drop-shadow-md md:text-[14px]">
              <Calendar className="h-4 w-4" />
              <span>{memory.date}</span>
              </div>
              {memory.location && (
              <div className="flex items-center gap-2 text-[13px] text-white/90 drop-shadow-md md:text-[14px]">
                <MapPin className="h-4 w-4" />
                <span>{memory.location}</span>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="journey memory"
      />
    </motion.div>
  )
}

export function JourneyGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { data: memories, loading, error, refetch } = useJourneyMemories()
  const { isEditMode } = useEditMode()
  const [subtitle, setSubtitle] = useState("Milestones and memorable moments from my career")

  useEffect(() => {
    if (memories && memories.length > 0 && currentIndex >= memories.length) {
      setCurrentIndex(0)
    }
  }, [memories, currentIndex])

  // Refetch data ONLY when EXITING edit mode to sync with server
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        refetch()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditMode, refetch])

  const handleAddMemory = async () => {
    try {
      const response = await fetch('/api/about/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: "",
          title: "",
          description: "",
          location: "",
          image_url: "",
          icon_name: "Calendar",
          display_order: memories.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add journey memory')
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-[1140px]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-gray-200/80 bg-white/98 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <Skeleton className="h-24 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-[1140px] text-center text-red-600">
        Failed to load journey memories. Please try again later.
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
          Professional Journey
        </h2>
        {isEditMode ? (
          <div className="flex justify-center px-4 md:px-0">
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter a subtitle (e.g., Milestones and memorable moments from my career...)"
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

      {/* Journey Memories - Slideshow View (Non-Edit Mode) */}
      {!isEditMode ? (
        memories.length === 0 ? (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
                <Calendar className="h-4 w-4 text-blue-500" />
                Journey Memories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No journey memories yet</p>
                <p className="text-sm">Enable edit mode to add your journey memories</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Journey Memories
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
                  <JourneyMemoryItem
                    memory={memories[currentIndex]}
                    index={currentIndex}
                    isEditMode={false}
                    refetch={refetch}
                  />
                </motion.div>

                {memories.length > 1 && (
                  <>
                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentIndex((prev) => (prev === 0 ? memories.length - 1 : prev - 1))}
                        className="h-9 border-gray-300 bg-white hover:bg-gray-50 touch-manipulation active:bg-gray-100 md:h-8"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4 md:mr-1.5" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>

                      <div className="flex items-center gap-1.5 md:gap-2">
                        {memories.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2 rounded-full transition-all touch-manipulation ${
                              idx === currentIndex
                                ? "w-6 bg-blue-600 md:w-8"
                                : "w-2 bg-gray-300 hover:bg-gray-400 active:bg-gray-500"
                            }`}
                            aria-label={`Go to memory ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentIndex((prev) => (prev === memories.length - 1 ? 0 : prev + 1))}
                        className="h-9 border-gray-300 bg-white hover:bg-gray-50 touch-manipulation active:bg-gray-100 md:h-8"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="ml-1 h-4 w-4 md:ml-1.5" />
                      </Button>
                    </div>

                    <div className="mt-2 text-center text-[12px] font-bold text-gray-700 md:text-[13px]">
                      {currentIndex + 1} of {memories.length}
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
                <Calendar className="h-4 w-4 text-blue-500" />
                Journey Memories
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3"
      >
        {memories.length === 0 && !isEditMode ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No journey memories yet</p>
            <p className="text-sm">Enable edit mode to add your journey memories</p>
          </div>
        ) : (
          <>
            {memories.map((memory: any, index: number) => (
              <JourneyMemoryItem
                key={memory.id || index}
                memory={memory}
                index={index}
                isEditMode={isEditMode}
                refetch={refetch}
              />
            ))}
            {isEditMode && (
              <motion.div variants={itemVariants}>
                        <Card className="border-2 border-dashed border-gray-300 bg-gray-50 hover:border-orange-400 transition-colors cursor-pointer h-full touch-manipulation"
                  onClick={handleAddMemory}
                >
                          <CardContent className="flex items-center justify-center p-5 h-full min-h-[300px]">
                    <div className="text-center">
                              <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-600">Add Journey Memory</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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

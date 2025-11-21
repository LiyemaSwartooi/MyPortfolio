"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Quote, Plus, Save, Trash2, ChevronLeft, ChevronRight, Upload, Loader2 } from "lucide-react"
import { useTestimonials } from "@/hooks/use-portfolio-data"
import { Skeleton } from "@/components/ui/skeleton"
import { useEditMode } from "@/contexts/EditModeContext"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

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

// Testimonial Item Component
function TestimonialItem({ testimonial, index, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editData, setEditData] = useState({
    name: testimonial.name || "",
    role: testimonial.role || "",
    company: testimonial.company || "",
    content: testimonial.content || "",
    initial: testimonial.initial || "",
    image_url: testimonial.image_url || ""
  })

  // Initialize edit data when testimonial changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (testimonial && testimonial.id) {
      setEditData({
        name: testimonial.name || "",
        role: testimonial.role || "",
        company: testimonial.company || "",
        content: testimonial.content || "",
        initial: testimonial.initial || "",
        image_url: testimonial.image_url || ""
      })
    } else {
      // New testimonial - keep empty
      setEditData({
        name: "",
        role: "",
        company: "",
        content: "",
        initial: "",
        image_url: ""
      })
    }
  }, [testimonial, isEditMode])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      if (!editData.name || !editData.role || !editData.company || !editData.content) {
        toast.error('Name, role, company, and content are required')
        return
      }

      const response = await fetch('/api/testimonials', {
        method: testimonial.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: testimonial.id,
          ...editData,
          initial: editData.initial || getInitials(editData.name),
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
      toast.error(error.message || 'Failed to save testimonial')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/testimonials/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed')

      setEditData({ ...editData, image_url: result.url })
      if (testimonial.id) {
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

  const handleDelete = () => {
    if (!testimonial.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!testimonial.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/testimonials?id=${testimonial.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Testimonial deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete testimonial')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isEditMode) {
    return (
      <Card className="border-2 border-orange-300 bg-orange-50/30">
        <CardContent className="p-3 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <Input
                placeholder="Name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                onBlur={() => testimonial.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <Input
                placeholder="Role"
                value={editData.role}
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                onBlur={() => testimonial.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
            <Input
              placeholder="Company"
              value={editData.company}
              onChange={(e) => setEditData({ ...editData, company: e.target.value })}
              onBlur={() => testimonial.id && handleSave()}
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
                onBlur={() => testimonial.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Testimonial Content</label>
            <Textarea
              placeholder="Testimonial content"
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              onBlur={() => testimonial.id && handleSave()}
              rows={3}
              className="text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            {testimonial.id && (
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
    <motion.div variants={itemVariants}>
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-3 md:p-4">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-[13px] md:h-10 md:w-10 md:text-[14px]">
                {testimonial.initial || getInitials(testimonial.name)}
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-gray-900 break-words md:text-[14px]">{testimonial.name}</h3>
                <p className="text-[11px] text-blue-600 break-words">{testimonial.role}</p>
                <p className="text-[10px] text-gray-500 break-words">{testimonial.company}</p>
              </div>
            </div>
            <Quote className="h-4 w-4 text-gray-300 md:h-5 md:w-5" />
          </div>
          <p className="text-[12px] leading-relaxed text-gray-700 italic break-words md:text-[13px]">"{testimonial.content}"</p>
        </CardContent>
      </Card>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="testimonial"
      />
    </motion.div>
  )
}

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { data: testimonials, loading, error, refetch } = useTestimonials()
  const { isEditMode } = useEditMode()
  const [subtitle, setSubtitle] = useState("What colleagues and clients say about working with me")

  useEffect(() => {
    if (testimonials && testimonials.length > 0 && currentIndex >= testimonials.length) {
      setCurrentIndex(0)
    }
  }, [testimonials, currentIndex])

  // Refetch data ONLY when EXITING edit mode to sync with server
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        refetch()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditMode, refetch])

  const handleAddTestimonial = async () => {
    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "",
          role: "",
          company: "",
          content: "",
          initial: "",
          image_url: "",
          display_order: testimonials.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add testimonial')
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-[1140px]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-gray-200/80 bg-white/98 shadow-sm">
              <CardContent className="p-4 md:p-5">
                <Skeleton className="h-20 w-full" />
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
        Failed to load testimonials. Please try again later.
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
          Testimonials
        </h2>
        {isEditMode ? (
          <div className="flex justify-center px-4 md:px-0">
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter a subtitle (e.g., What colleagues and clients say about working with me...)"
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

      {/* Testimonials - Slideshow View (Non-Edit Mode) */}
      {!isEditMode ? (
        testimonials.length === 0 ? (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
                <Quote className="h-4 w-4 text-blue-500" />
                Client Testimonials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Quote className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                <p className="text-base font-medium">No testimonials yet</p>
                <p className="text-sm">Enable edit mode to add testimonials</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
                  <Quote className="h-4 w-4 text-blue-500" />
                  Client Testimonials
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
                  <TestimonialItem
                    testimonial={testimonials[currentIndex]}
                    index={currentIndex}
                    isEditMode={false}
                    refetch={refetch}
                  />
                </motion.div>

                {testimonials.length > 1 && (
                  <>
                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                        className="h-9 border-gray-300 bg-white hover:bg-gray-50 touch-manipulation active:bg-gray-100 md:h-8"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4 md:mr-1.5" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>

                      <div className="flex items-center gap-1.5 md:gap-2">
                        {testimonials.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2 rounded-full transition-all touch-manipulation ${
                              idx === currentIndex
                                ? "w-6 bg-blue-600 md:w-8"
                                : "w-2 bg-gray-300 hover:bg-gray-400 active:bg-gray-500"
                            }`}
                            aria-label={`Go to testimonial ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                        className="h-9 border-gray-300 bg-white hover:bg-gray-50 touch-manipulation active:bg-gray-100 md:h-8"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="ml-1 h-4 w-4 md:ml-1.5" />
                      </Button>
                    </div>

                    <div className="mt-2 text-center text-[12px] font-bold text-gray-700 md:text-[13px]">
                      {currentIndex + 1} of {testimonials.length}
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
                <Quote className="h-4 w-4 text-blue-500" />
                Client Testimonials
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
                className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3"
      >
            {testimonials.map((testimonial: any, index: number) => (
              <TestimonialItem
                key={testimonial.id || index}
                testimonial={testimonial}
                index={index}
                isEditMode={isEditMode}
                refetch={refetch}
              />
            ))}
            {isEditMode && (
              <motion.div variants={itemVariants}>
                    <Card className="border-2 border-dashed border-gray-300 bg-gray-50 hover:border-orange-400 transition-colors cursor-pointer h-full touch-manipulation"
                  onClick={handleAddTestimonial}
                >
                      <CardContent className="flex items-center justify-center p-4 h-full min-h-[150px]">
                    <div className="text-center">
                          <Plus className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">Add Testimonial</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        )}
    </div>
  )
}

"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GraduationCap, Calendar, Plus, Save, Trash2, Building2, Clock, Target, CheckCircle2, Loader2 } from "lucide-react"
import { useEducation } from "@/hooks/use-portfolio-data"
import { Skeleton } from "@/components/ui/skeleton"
import { useEditMode } from "@/contexts/EditModeContext"
import { toast } from "sonner"
import { motion, useInView, Variants } from "framer-motion"
import { formatPeriod, getCurrentDateISO } from "@/lib/date-utils"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] // easeOut cubic bezier
    }
  }
}

const timelineVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.6, 1] // easeInOut cubic bezier
    }
  }
}

// Education Achievement Item Component
function EducationAchievementItem({ achievement, educationId, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editText, setEditText] = useState(achievement.achievement || "")

  // Initialize edit text when achievement changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (achievement && achievement.id) {
      setEditText(achievement.achievement || "")
    } else {
      // New achievement - keep empty
      setEditText("")
    }
  }, [achievement, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const response = await fetch('/api/education/achievements', {
        method: achievement.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: achievement.id,
          education_id: educationId,
          achievement: editText.trim(),
          display_order: 0
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
      const response = await fetch(`/api/education/achievements?id=${achievement.id}`, {
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

  if (isEditMode) {
    return (
      <div className="flex items-start gap-2 p-2 bg-orange-50/30 border-2 border-orange-300 rounded-lg">
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={() => achievement.id && handleSave()}
          placeholder="Achievement description"
          className="flex-1 h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
        />
        <div className="flex gap-1">
          <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 h-8">
            <Save className="h-3 w-3" />
          </Button>
          {achievement.id && (
            <Button size="sm" variant="destructive" onClick={handleDelete} className="h-8">
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
    <motion.li 
      className="flex items-start gap-3 text-sm text-gray-700"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
      <span className="leading-relaxed">{achievement.achievement}</span>
    </motion.li>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="achievement"
      />
    </>
  )
}

// Education Item Component
function EducationItem({ education, index, isEditMode, refetch, isLast }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState({
    degree: education.degree || "",
    institution: education.institution || "",
    start_date: education.start_date || "",
    end_date: education.end_date || "",
    is_current: education.is_current || false,
    description: education.description || ""
  })
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Initialize edit data when education changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (education && education.id) {
      setEditData({
        degree: education.degree || "",
        institution: education.institution || "",
        start_date: education.start_date || "",
        end_date: education.end_date || "",
        is_current: education.is_current || false,
        description: education.description || ""
      })
    } else {
      // New education - keep empty
      setEditData({
        degree: "",
        institution: "",
        start_date: "",
        end_date: "",
        is_current: false,
        description: ""
      })
    }
  }, [education, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    
    // Validate required fields first
    if (!editData.degree || !editData.institution || !editData.start_date) {
      toast.error('Degree, institution, and start date are required')
      return
    }
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/education', {
        method: education.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: education.id,
          ...editData,
          display_order: index
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      
      toast.success('Education saved successfully')
      refetch() // Refresh to show updated data
    } catch (error: any) {
      toast.error(error.message || 'Failed to save education')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!education.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!education.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/education?id=${education.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Education deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete education')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleAddAchievement = async () => {
    try {
      const response = await fetch('/api/education/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          education_id: education.id,
          achievement: "",
          display_order: (education.achievements?.length || 0)
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


  if (isEditMode) {
    return (
      <Card className="border-2 border-orange-300 bg-orange-50/30 mb-4">
        <CardContent className="p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Degree</label>
              <Input
                placeholder="Degree"
                value={editData.degree}
                onChange={(e) => setEditData({ ...editData, degree: e.target.value })}
                onBlur={() => education.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Institution</label>
              <Input
                placeholder="Institution"
                value={editData.institution}
                onChange={(e) => setEditData({ ...editData, institution: e.target.value })}
                onBlur={() => education.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={editData.start_date}
                onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                onBlur={() => education.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={editData.end_date || ""}
                onChange={(e) => setEditData({ ...editData, end_date: e.target.value, is_current: false })}
                onBlur={() => education.id && handleSave()}
                disabled={editData.is_current}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white disabled:bg-gray-100"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.is_current}
                  onChange={(e) => {
                    setEditData({ ...editData, is_current: e.target.checked, end_date: e.target.checked ? "" : editData.end_date })
                    if (education.id) {
                      setTimeout(() => handleSave(), 100)
                    }
                  }}
                  className="h-4 w-4 text-orange-500 border-orange-400 rounded focus:ring-orange-200"
                />
                <span className="text-xs font-medium text-gray-700">Current</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <Textarea
              placeholder="Description"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              onBlur={() => education.id && handleSave()}
              rows={4}
              className="text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Achievements</label>
            <div className="space-y-2">
              {education.achievements?.map((achievement: any) => (
                <EducationAchievementItem
                  key={achievement.id}
                  achievement={achievement}
                  educationId={education.id}
                  isEditMode={isEditMode}
                  refetch={refetch}
                />
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddAchievement}
                className="w-full border-dashed border-2 border-gray-300 hover:border-orange-400"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            {education.id && (
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
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
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={itemVariants}
      className="relative pl-12 pb-12 last:pb-0"
    >
      {/* Timeline Line */}
      {!isLast && (
        <motion.div
          variants={timelineVariants}
          className="absolute left-[22px] top-12 w-0.5 h-full bg-gradient-to-b from-purple-500 via-blue-500 to-transparent origin-top"
        />
      )}

      {/* Timeline Node */}
      <motion.div
        className="absolute left-0 top-2 z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative flex h-11 w-11 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 animate-pulse" />
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white">
            <GraduationCap className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </motion.div>

      {/* Education Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-orange-300 transition-all">
        <CardHeader className="pb-3 md:pb-2.5 md:pb-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-2.5 md:gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0 md:gap-2.5 md:gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm md:h-9 md:w-9 md:h-10 md:w-10">
                  <GraduationCap className="h-5 w-5 text-white md:h-4 md:w-4 md:h-5 md:w-5" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-bold text-gray-900 mb-1 break-words md:text-base md:mb-0.5 md:text-lg">
                    {education.degree}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-gray-600 mt-0.5 md:mt-0">
                    <Building2 className="h-4 w-4 shrink-0 md:h-3.5 md:w-3.5" />
                    <span className="text-sm font-medium break-words md:text-xs md:text-sm">{education.institution}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap md:gap-1.5 md:shrink-0">
                <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                  <Calendar className="h-3 w-3 text-gray-600" />
                  <span className="text-[10px] font-medium text-gray-700 md:text-xs">
                    {formatPeriod(education.start_date, education.end_date, education.is_current)}
                  </span>
              </div>
                {education.is_current && (
                  <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5">
                    <Clock className="h-3 w-3 text-emerald-600" />
                    <span className="text-[10px] font-medium text-emerald-700 md:text-xs">Current</span>
                  </div>
                )}
            </div>
          </div>
        </CardHeader>

          <CardContent className="pt-0 space-y-2.5">
          {education.description && (
              <p className="text-xs leading-relaxed text-gray-700 md:text-sm">
                {education.description}
              </p>
          )}

          {education.achievements && education.achievements.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-gray-600" />
                  <h4 className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 md:text-xs">
                    Key Achievements
                  </h4>
                </div>
                <ul className="space-y-1.5 pl-0.5">
                {education.achievements.map((achievement: any) => (
                  <EducationAchievementItem
                    key={achievement.id}
                    achievement={achievement}
                    educationId={education.id}
                    isEditMode={isEditMode}
                    refetch={refetch}
                  />
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="education entry"
      />
    </motion.div>
  )
}

export function Education() {
  const { data, loading, error, refetch } = useEducation()
  const { isEditMode } = useEditMode()
  const [subtitle, setSubtitle] = useState("Academic background and continuous learning journey")

  const education = data?.education || []
  const certifications = data?.certifications || []

  // Refetch data ONLY when EXITING edit mode to sync with server
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        refetch()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditMode, refetch])

  const handleAddEducation = async () => {
    try {
      const response = await fetch('/api/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          degree: "",
          institution: "",
          start_date: "",
          is_current: false,
          description: "",
          display_order: education.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add education')
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-[1140px] space-y-3 md:space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-[1140px] text-center text-red-600">
        Failed to load education data. Please try again later.
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
          Education & Certifications
        </h2>
        {isEditMode ? (
          <div className="flex justify-center px-4 md:px-0">
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter a subtitle (e.g., Academic background and continuous learning journey...)"
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

      {/* Education Timeline - Wrapped in Card */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={itemVariants}
      >
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
              <GraduationCap className="h-4 w-4 text-blue-500" />
              Education Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative"
      >
        {education.length === 0 && !isEditMode ? (
          <div className="text-center py-12 text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No education entries yet</p>
            <p className="text-sm">Enable edit mode to add your education</p>
          </div>
        ) : (
          <div className="space-y-0">
            {education.map((edu: any, index: number) => (
              <EducationItem
                key={edu.id || index}
                education={edu}
                index={index}
                isEditMode={isEditMode}
                refetch={refetch}
                isLast={index === education.length - 1}
              />
            ))}
          </div>
        )}

            {isEditMode && (
          <motion.div
            variants={itemVariants}
            className="mt-4"
          >
            <Card
              className="border-2 border-dashed border-gray-300 bg-gray-50 hover:border-orange-400 transition-colors cursor-pointer touch-manipulation"
                  onClick={handleAddEducation}
                >
              <CardContent className="flex items-center justify-center p-5">
                    <div className="text-center">
                  <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Add Education</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

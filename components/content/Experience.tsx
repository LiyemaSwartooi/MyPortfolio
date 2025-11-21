"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Briefcase, Calendar, Plus, Save, Trash2, CheckCircle2, 
  Building2, MapPin, TrendingUp, Clock, Zap, Target, Loader2
} from "lucide-react"
import { useExperiences } from "@/hooks/use-portfolio-data"
import { ExperienceSkeleton } from "@/components/ui/loading-skeleton"
import { useEditMode } from "@/contexts/EditModeContext"
import { toast } from "sonner"
import { motion, useInView, Variants } from "framer-motion"
import { formatPeriod, getCurrentDateISO } from "@/lib/date-utils"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

// Animation variants
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

// Calculate years of experience
function calculateYearsOfExperience(experiences: any[]) {
  if (!experiences || experiences.length === 0) return 2 // Default to 2+ if no experiences loaded yet
  
  // Find the earliest start date and latest end date
  const dates = experiences
    .filter(exp => exp.start_date)
    .map(exp => ({
      start: new Date(exp.start_date),
      end: exp.is_current ? new Date() : (exp.end_date ? new Date(exp.end_date) : new Date())
    }))
  
  if (dates.length === 0) return 2
  
  const earliestStart = new Date(Math.min(...dates.map(d => d.start.getTime())))
  const latestEnd = new Date(Math.max(...dates.map(d => d.end.getTime())))
  
  // Calculate total months from earliest start to latest end
  const months = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 + 
                 (latestEnd.getMonth() - earliestStart.getMonth())
  
  // Calculate years and round up (e.g., 1.5 years = 2+)
  const years = Math.ceil(months / 12)
  
  // Return at least 2 years (user has experience from Nov 2023 to present = ~2 years)
  return Math.max(2, years)
}

// Achievement Item Component
function AchievementItem({ achievement, experienceId, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editText, setEditText] = useState(achievement.achievement || "")

  // Initialize edit text when achievement changes - only if achievement has data
  useEffect(() => {
    if (achievement && achievement.id) {
      setEditText(achievement.achievement || "")
    } else {
      // New achievement - keep empty
      setEditText("")
    }
  }, [achievement])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const response = await fetch('/api/experience/achievements', {
        method: achievement.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: achievement.id,
          experience_id: experienceId,
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
      const response = await fetch(`/api/experience/achievements?id=${achievement.id}`, {
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
      <div className="flex items-start gap-2 p-3 bg-orange-50/30 border-2 border-orange-300 rounded-lg md:p-2">
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={() => achievement.id && handleSave()}
          placeholder="Achievement description"
          className="flex-1 h-11 min-h-[44px] text-base border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white touch-manipulation md:h-9 md:text-sm"
        />
        <div className="flex gap-1.5 md:gap-1">
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-orange-500 hover:bg-orange-600 h-11 min-h-[44px] text-sm touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed md:h-8 md:text-xs"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin md:h-3 md:w-3" />
            ) : (
              <Save className="h-4 w-4 md:h-3 md:w-3" />
            )}
          </Button>
          {achievement.id && (
            <>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-11 min-h-[44px] text-sm touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed md:h-8 md:text-xs"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin md:h-3 md:w-3" />
                ) : (
                  <Trash2 className="h-4 w-4 md:h-3 md:w-3" />
                )}
              </Button>
              <DeleteConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={confirmDelete}
                itemName="achievement"
                description="Are you sure you want to delete this achievement? This action cannot be undone."
              />
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <motion.li 
      className="flex items-start gap-3 text-base text-gray-700 md:text-sm"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500 md:h-4 md:w-4" />
      <span className="leading-relaxed">{achievement.achievement}</span>
    </motion.li>
  )
}

// Experience Item Component with Timeline
function ExperienceItem({ experience, index, isEditMode, refetch, isLast }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddingAchievement, setIsAddingAchievement] = useState(false)
  const [editData, setEditData] = useState({
    title: experience.title || "",
    company: experience.company || "",
    start_date: experience.start_date || "",
    end_date: experience.end_date || "",
    is_current: experience.is_current || false,
    description: experience.description || ""
  })
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Initialize edit data when experience changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (experience && experience.id) {
      setEditData({
        title: experience.title || "",
        company: experience.company || "",
        start_date: experience.start_date || "",
        end_date: experience.end_date || "",
        is_current: experience.is_current || false,
        description: experience.description || ""
      })
    } else {
      // New experience - keep empty
      setEditData({
        title: "",
        company: "",
        start_date: "",
        end_date: "",
        is_current: false,
        description: ""
      })
    }
  }, [experience, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    
    if (!editData.title || !editData.company || !editData.start_date) {
      toast.error('Title, company, and start date are required')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/experience', {
        method: experience.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: experience.id,
          ...editData,
          display_order: index
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      
      // Silent save - no toast, no refetch (will sync when exiting edit mode)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save experience')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!experience.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!experience.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/experience?id=${experience.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Experience deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete experience')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleAddAchievement = async () => {
    if (isAddingAchievement) return
    setIsAddingAchievement(true)
    try {
      const response = await fetch('/api/experience/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience_id: experience.id,
          achievement: "",
          display_order: (experience.achievements?.length || 0)
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
    } finally {
      setIsAddingAchievement(false)
    }
  }

  if (isEditMode) {
    return (
      <div className="relative pl-0 pb-8">
        <Card className="border-2 border-orange-300 bg-orange-50/30">
          <CardContent className="p-4 space-y-4 md:p-5 md:space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">Job Title</label>
                <Input
                  placeholder="Job Title"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  onBlur={() => experience.id && handleSave()}
                  className="h-11 min-h-[44px] text-base border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white touch-manipulation md:h-9 md:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">Company</label>
                <Input
                  placeholder="Company Name"
                  value={editData.company}
                  onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                  onBlur={() => experience.id && handleSave()}
                  className="h-11 min-h-[44px] text-base border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white touch-manipulation md:h-9 md:text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">Start Date</label>
                <Input
                  type="date"
                  value={editData.start_date}
                  onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                  onBlur={() => experience.id && handleSave()}
                  className="h-11 min-h-[44px] text-base border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white touch-manipulation md:h-9 md:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">End Date</label>
                <Input
                  type="date"
                  value={editData.end_date || ""}
                  onChange={(e) => setEditData({ ...editData, end_date: e.target.value, is_current: false })}
                  onBlur={() => experience.id && handleSave()}
                  disabled={editData.is_current}
                  className="h-11 min-h-[44px] text-base border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white disabled:bg-gray-100 touch-manipulation md:h-9 md:text-sm"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
                  <input
                    type="checkbox"
                    checked={editData.is_current}
                    onChange={(e) => {
                      setEditData({ ...editData, is_current: e.target.checked, end_date: e.target.checked ? "" : editData.end_date })
                      if (experience.id) {
                        setTimeout(() => handleSave(), 100)
                      }
                    }}
                    className="h-5 w-5 text-orange-500 border-orange-400 rounded focus:ring-orange-200 md:h-4 md:w-4"
                  />
                  <span className="text-sm font-medium text-gray-700 md:text-xs">Current Position</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">Description</label>
              <Textarea
                placeholder="Job description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                onBlur={() => experience.id && handleSave()}
                rows={5}
                className="text-base border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white resize-none touch-manipulation md:text-sm md:rows-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 md:text-xs">Achievements</label>
              <div className="space-y-3 md:space-y-2">
                {experience.achievements?.map((achievement: any) => (
                  <AchievementItem
                    key={achievement.id}
                    achievement={achievement}
                    experienceId={experience.id}
                    isEditMode={isEditMode}
                    refetch={refetch}
                  />
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddAchievement}
                  className="w-full h-11 min-h-[44px] border-dashed border-2 border-gray-300 hover:border-orange-400 touch-manipulation md:h-auto"
                >
                  <Plus className="h-4 w-4 mr-2 md:h-4 md:w-4" />
                  <span className="text-sm md:text-xs">Add Achievement</span>
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-2 md:pt-2">
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving}
                className="h-11 min-h-[44px] text-sm bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation md:h-auto md:text-xs"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin md:h-4 md:w-4 md:mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1.5 md:h-4 md:w-4 md:mr-1" />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              {experience.id && (
                <>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-11 min-h-[44px] text-sm disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation md:h-auto md:text-xs"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin md:h-4 md:w-4 md:mr-1" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1.5 md:h-4 md:w-4 md:mr-1" />
                    )}
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                  <DeleteConfirmationDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    onConfirm={confirmDelete}
                    itemName="experience"
                    description="Are you sure you want to delete this experience? This action cannot be undone."
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={itemVariants}
      className="relative pl-14 pb-12 last:pb-0 md:pl-12"
    >
      {/* Timeline Line */}
      {!isLast && (
        <motion.div
          variants={timelineVariants}
          className="absolute left-[26px] top-14 w-0.5 h-full bg-gradient-to-b from-purple-500 via-blue-500 to-transparent origin-top md:left-[22px] md:top-12"
        />
      )}

      {/* Timeline Node */}
      <motion.div
        className="absolute left-0 top-2 z-10 md:left-0 md:top-2"
        initial={{ scale: 0, rotate: -180 }}
        animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative flex h-12 w-12 items-center justify-center md:h-11 md:w-11">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 animate-pulse" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white md:h-9 md:w-9">
            <Briefcase className="h-5 w-5 text-purple-600 md:h-5 md:w-5" />
          </div>
        </div>
      </motion.div>

      {/* Experience Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-orange-300 transition-all">
          <CardHeader className="pb-3 md:pb-2.5 md:pb-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-2.5 md:gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0 md:gap-2.5 md:gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm md:h-9 md:w-9 md:h-10 md:w-10">
                  <Briefcase className="h-5 w-5 text-white md:h-4 md:w-4 md:h-5 md:w-5" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-bold text-gray-900 mb-1 break-words md:text-base md:mb-0.5 md:text-lg">
                    {experience.title}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-gray-600 mt-0.5">
                    <Building2 className="h-4 w-4 shrink-0 md:h-3.5 md:w-3.5" />
                    <span className="text-sm font-medium break-words md:text-xs md:text-sm">{experience.company}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap md:gap-1.5 md:shrink-0">
                <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 md:px-2 md:py-0.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-600 md:h-3 md:w-3" />
                  <span className="text-xs font-medium text-gray-700 md:text-[10px] md:text-xs">
                    {formatPeriod(experience.start_date, experience.end_date, experience.is_current)}
                  </span>
                </div>
                {experience.is_current && (
                  <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 md:px-2 md:py-0.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-600 md:h-3 md:w-3" />
                    <span className="text-xs font-medium text-emerald-700 md:text-[10px] md:text-xs">Current</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3 md:space-y-2.5">
            {experience.description && (
              <p className="text-base leading-relaxed text-gray-700 md:text-xs md:text-sm">
                {experience.description}
              </p>
            )}

            {experience.achievements && experience.achievements.length > 0 && (
              <div className="space-y-2 md:space-y-1.5">
                <div className="flex items-center gap-2 md:gap-1.5">
                  <Target className="h-4 w-4 text-gray-600 md:h-3.5 md:w-3.5" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 md:text-[10px] md:text-xs">
                    Key Achievements
                  </h4>
                </div>
                <ul className="space-y-2 pl-1 md:space-y-1.5 md:pl-0.5">
                  {experience.achievements.map((achievement: any) => (
                    <AchievementItem
                      key={achievement.id}
                      achievement={achievement}
                      experienceId={experience.id}
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
    </motion.div>
  )
}

export function Experience() {
  const { data: experiences, loading, error, refetch } = useExperiences()
  const { isEditMode } = useEditMode()
  const [subtitle, setSubtitle] = useState("My career journey and key accomplishments")
  const [isAdding, setIsAdding] = useState(false)
  const yearsOfExperience = calculateYearsOfExperience(experiences)

  // Refetch data ONLY when EXITING edit mode to sync with server
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        refetch()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditMode, refetch])

  const handleAddExperience = async () => {
    if (isAdding) return
    setIsAdding(true)
    try {
      const response = await fetch('/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "",
          company: "",
          start_date: "",
          is_current: false,
          description: "",
          display_order: experiences.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add experience')
    } finally {
      setIsAdding(false)
    }
  }

  if (loading) {
    return <ExperienceSkeleton />
  }

  if (error) {
    return (
      <div className="w-full max-w-[1140px] text-center">
        <Card className="border-2 border-red-200 bg-red-50/50">
          <CardContent className="p-8">
            <p className="text-red-600 font-medium">Failed to load experiences. Please try again later.</p>
          </CardContent>
        </Card>
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
            Professional Experience
        </h2>
          {isEditMode ? (
            <div className="flex justify-center px-4 md:px-0">
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter a subtitle (e.g., My career journey and key accomplishments...)"
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

      {/* Stats Counter - Wrapped in Card */}
        {experiences.length > 0 && !isEditMode && (
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
                Experience Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-4 md:p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
                <Card className="border border-gray-200 bg-white">
              <CardContent className="p-4 md:p-4">
                <div className="flex items-center gap-3 md:gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 shadow-sm md:h-11 md:w-11">
                    <TrendingUp className="h-6 w-6 text-white md:h-5 md:w-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900 md:text-3xl">
                      {yearsOfExperience}+
                    </p>
                    <p className="text-sm font-medium text-gray-600 md:text-xs md:text-sm">
                      Years of Experience
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

                <Card className="border border-gray-200 bg-white">
              <CardContent className="p-4 md:p-4">
                <div className="flex items-center gap-3 md:gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm md:h-11 md:w-11">
                    <Briefcase className="h-6 w-6 text-white md:h-5 md:w-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900 md:text-3xl">
                      {experiences.length}
                    </p>
                    <p className="text-sm font-medium text-gray-600 md:text-xs md:text-sm">
                      Positions Held
                    </p>
                  </div>
                    </div>
                  </CardContent>
                </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      {/* Experience Timeline - Wrapped in Card */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={itemVariants}
      >
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
              <Briefcase className="h-4 w-4 text-blue-500" />
              Career Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative"
      >
        {experiences.length === 0 && !isEditMode ? (
          <div className="text-center py-12 text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No experience yet</p>
            <p className="text-sm">Enable edit mode to add your professional experience</p>
          </div>
        ) : (
          <div className="space-y-0">
            {experiences.map((exp: any, index: number) => (
              <ExperienceItem
                key={exp.id || index}
                experience={exp}
                index={index}
                isEditMode={isEditMode}
                refetch={refetch}
                isLast={index === experiences.length - 1}
              />
            ))}
          </div>
        )}

        {isEditMode && (
          <motion.div
            variants={itemVariants}
                  className="relative pl-12 mt-4"
          >
            <div className="absolute left-[22px] top-0 w-0.5 h-8 bg-gradient-to-b from-blue-500 to-transparent" />
            <Card 
                    className={`border-2 border-dashed border-gray-300 bg-gray-50 hover:border-orange-400 transition-colors cursor-pointer w-full touch-manipulation min-h-[120px] ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleAddExperience}
            >
              <CardContent className="flex items-center justify-center p-6 md:p-5">
                <div className="text-center">
                  {isAdding ? (
                    <Loader2 className="h-6 w-6 text-gray-400 mx-auto mb-1 animate-spin" />
                  ) : (
                    <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  )}
                  <p className="text-sm text-gray-600 md:text-xs">{isAdding ? 'Adding...' : 'Add Experience'}</p>
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

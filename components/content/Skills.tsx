"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Code, Plus, Save, Trash2, Sparkles, Zap, TrendingUp, Target, Layers, Loader2 } from "lucide-react"
import { useSkills } from "@/hooks/use-portfolio-data"
import { SkillsSkeleton } from "@/components/ui/loading-skeleton"
import { useEditMode } from "@/contexts/EditModeContext"
import { toast } from "sonner"
import { motion, useInView, Variants } from "framer-motion"
import { getIcon } from "@/lib/icon-mapper"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] // easeOut cubic bezier
    }
  }
}

const skillTagVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3
    }
  }
}

// Available icons for selection
const availableIcons = [
  "Code", "Target", "Lightbulb", "User", "Briefcase", "Calendar",
  "GraduationCap", "Award", "BookOpen", "Trophy", "Star", "TrendingUp",
  "Rocket", "Coffee", "Music", "Gamepad2", "Heart", "Zap", "Layers",
  "Sparkles"
]

const gradientOptions = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-teal-500 to-blue-500",
  "from-yellow-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-violet-500 to-purple-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500"
]

// Calculate total skills count
function getTotalSkillsCount(categories: any[]) {
  return categories.reduce((total, category) => {
    return total + (category.skills?.length || 0)
  }, 0)
}

// Skill Item Component with hover effects
function SkillItem({ skill, categoryId, isEditMode, refetch, gradient }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editName, setEditName] = useState(skill.name || "")

  // Initialize edit name when skill changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (skill && skill.id) {
      setEditName(skill.name || "")
    } else {
      // New skill - keep empty
      setEditName("")
    }
  }, [skill, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    
    if (!editName.trim()) {
      toast.error('Skill name is required')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/skills/items', {
        method: skill.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: skill.id,
          category_id: categoryId,
          name: editName.trim(),
          display_order: 0
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      
      // Silent save - no toast, no refetch (will sync when exiting edit mode)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save skill')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!skill.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!skill.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/skills/items?id=${skill.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Skill deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete skill')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isEditMode) {
    return (
      <div className="flex items-center gap-2 p-3 bg-orange-50/30 border-2 border-orange-300 rounded-lg md:p-2">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={() => skill.id && handleSave()}
          placeholder="Skill name"
          className="flex-1 h-11 min-h-[44px] text-base border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white touch-manipulation md:h-9 md:text-sm"
        />
        <div className="flex gap-1.5 md:gap-1">
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-orange-500 hover:bg-orange-600 h-11 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation md:h-8"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin md:h-3 md:w-3" />
            ) : (
              <Save className="h-4 w-4 md:h-3 md:w-3" />
            )}
          </Button>
          {skill.id && (
            <>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-11 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation md:h-8"
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
                itemName="skill"
                description="Are you sure you want to delete this skill? This action cannot be undone."
              />
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <motion.span
      variants={skillTagVariants}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${gradient} px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md cursor-default md:gap-1.5 md:px-3 md:py-1.5 md:text-xs`}
    >
      <Sparkles className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100 transition-opacity md:h-3 md:w-3" />
      {skill.name}
    </motion.span>
  )
}

// Category Item Component with masonry support
function CategoryItem({ category, index, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [editData, setEditData] = useState({
    title: category.title || "",
    icon_name: category.icon_name || "Code",
    gradient: category.gradient || "from-blue-500 to-cyan-500"
  })
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  // Initialize edit data when category changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (category && category.id) {
      setEditData({
        title: category.title || "",
        icon_name: category.icon_name || "Code",
        gradient: category.gradient || "from-blue-500 to-cyan-500"
      })
    } else {
      // New category - keep empty
      setEditData({
        title: "",
        icon_name: "Code",
        gradient: "from-blue-500 to-cyan-500"
      })
    }
  }, [category, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    
    if (!editData.title.trim()) {
      toast.error('Category title is required')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/skills/categories', {
        method: category.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: category.id,
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
      toast.error(error.message || 'Failed to save category')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!category.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!category.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/skills/categories?id=${category.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Category deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleAddSkill = async () => {
    if (isAddingSkill) return
    setIsAddingSkill(true)
    try {
      const response = await fetch('/api/skills/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: category.id,
          name: "",
          display_order: (category.skills?.length || 0)
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add skill')
    } finally {
      setIsAddingSkill(false)
    }
  }

  const IconComponent = getIcon(editData.icon_name)
  const skillCount = category.skills?.length || 0

  if (isEditMode) {
    return (
      <Card className="border-2 border-orange-300 bg-orange-50/30 break-inside-avoid mb-4 md:mb-4">
        <CardContent className="p-4 space-y-3 md:p-4 md:space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">Category Title</label>
              <Input
                placeholder="Category Title"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                onBlur={() => category.id && handleSave()}
                className="h-11 min-h-[44px] text-base border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white touch-manipulation md:h-9 md:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">Icon</label>
              <Select
                value={editData.icon_name}
                onValueChange={(value) => {
                  setEditData({ ...editData, icon_name: value })
                  if (category.id) {
                    setTimeout(() => handleSave(), 100)
                  }
                }}
              >
                <SelectTrigger className="h-11 min-h-[44px] text-base touch-manipulation md:h-9 md:text-sm">
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">Gradient</label>
            <Select
              value={editData.gradient}
              onValueChange={(value) => {
                setEditData({ ...editData, gradient: value })
                if (category.id) {
                  setTimeout(() => handleSave(), 100)
                }
              }}
            >
              <SelectTrigger className="h-11 min-h-[44px] text-base touch-manipulation md:h-9 md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gradientOptions.map((grad) => (
                  <SelectItem key={grad} value={grad}>
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded bg-gradient-to-br ${grad}`} />
                      <span className="text-xs">{grad}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 md:text-xs md:mb-1">Skills</label>
            <div className="space-y-3 md:space-y-2">
              {category.skills?.map((skill: any) => (
                <SkillItem
                  key={skill.id}
                  skill={skill}
                  categoryId={category.id}
                  isEditMode={isEditMode}
                  refetch={refetch}
                  gradient={editData.gradient}
                />
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddSkill}
                disabled={isAddingSkill}
                className="w-full h-11 min-h-[44px] border-dashed border-2 border-gray-300 hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm touch-manipulation md:h-8 md:text-xs"
              >
                {isAddingSkill ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin md:h-3 md:w-3" />
                ) : (
                  <Plus className="h-4 w-4 mr-2 md:h-3 md:w-3" />
                )}
                {isAddingSkill ? 'Adding...' : 'Add Skill'}
              </Button>
            </div>
          </div>
          <div className="flex gap-2 pt-2 md:pt-1">
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
            {category.id && (
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
                  itemName="category"
                  description="Are you sure you want to delete this category? All skills in it will also be deleted. This action cannot be undone."
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
      className="break-inside-avoid mb-4"
    >
      <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-orange-300 transition-all break-inside-avoid mb-4 md:mb-4">
        <CardHeader className="pb-3 md:pb-2.5 md:pb-3">
          <div className="flex items-start justify-between gap-3 md:gap-2.5 md:gap-3">
            <div className="flex items-center gap-3 flex-1 md:gap-2.5 md:gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${category.gradient || 'from-blue-500 to-cyan-500'} shadow-sm md:h-9 md:w-9 md:h-10 md:w-10`}>
                <IconComponent className="h-5 w-5 text-white md:h-4 md:w-4 md:h-5 md:w-5" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold text-gray-900 mb-1 break-words md:text-base md:mb-0.5 md:text-lg">
                  {category.title}
                </CardTitle>
                <div className="flex items-center gap-1.5 mt-0.5 md:mt-0">
                  <Layers className="h-3.5 w-3.5 text-gray-500 md:h-3 md:w-3" />
                  <span className="text-xs font-medium text-gray-500 md:text-[10px] md:text-xs">
                    {skillCount} {skillCount === 1 ? 'skill' : 'skills'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 md:pb-3">
          {category.skills && category.skills.length > 0 ? (
            <motion.div 
              className="flex flex-wrap gap-2 md:gap-1.5 md:gap-2"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {category.skills.map((skill: any) => (
                <SkillItem
                  key={skill.id}
                  skill={skill}
                  categoryId={category.id}
                  isEditMode={isEditMode}
                  refetch={refetch}
                  gradient={category.gradient || 'from-blue-500 to-cyan-500'}
                />
              ))}
            </motion.div>
          ) : (
            <p className="text-sm text-gray-400 italic md:text-xs">No skills added yet</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function Skills() {
  const { data: skillCategories, loading, error, refetch } = useSkills()
  const { isEditMode } = useEditMode()
  const [subtitle, setSubtitle] = useState("Technologies and competencies I've mastered")
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const totalSkills = getTotalSkillsCount(skillCategories)

  // Refetch data ONLY when EXITING edit mode to sync with server
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        refetch()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditMode, refetch])

  const handleAddCategory = async () => {
    if (isAddingCategory) return
    setIsAddingCategory(true)
    try {
      const response = await fetch('/api/skills/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "",
          icon_name: "Code",
          gradient: "from-blue-500 to-cyan-500",
          display_order: skillCategories.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add category')
    } finally {
      setIsAddingCategory(false)
    }
  }

  if (loading) {
    return <SkillsSkeleton />
  }

  if (error) {
    return (
      <div className="w-full max-w-[1140px] text-center">
        <Card className="border-2 border-red-200 bg-red-50/50">
          <CardContent className="p-8">
            <p className="text-red-600 font-medium">Failed to load skills. Please try again later.</p>
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
            Skills & Expertise
        </h2>
          {isEditMode ? (
            <div className="flex justify-center px-4 md:px-0">
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter a subtitle (e.g., Technologies and competencies I've mastered...)"
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
        {skillCategories.length > 0 && !isEditMode && (
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
                Skills Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-4 md:p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
                <Card className="border border-gray-200 bg-white">
              <CardContent className="p-4 md:p-4">
                <div className="flex items-center gap-3 md:gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm md:h-11 md:w-11">
                    <Code className="h-6 w-6 text-white md:h-5 md:w-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900 md:text-3xl">
                      {totalSkills}+
                    </p>
                    <p className="text-sm font-medium text-gray-600 md:text-xs md:text-sm">
                      Total Skills
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

                <Card className="border border-gray-200 bg-white">
              <CardContent className="p-4 md:p-4">
                <div className="flex items-center gap-3 md:gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm md:h-11 md:w-11">
                    <Target className="h-6 w-6 text-white md:h-5 md:w-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900 md:text-3xl">
                      {skillCategories.length}
                    </p>
                    <p className="text-sm font-medium text-gray-600 md:text-xs md:text-sm">
                      Categories
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

      {/* Skills Masonry Grid - Wrapped in Card */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={itemVariants}
      >
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
              <Code className="h-4 w-4 text-blue-500" />
              Skill Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-4 md:p-5">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {skillCategories.length === 0 && !isEditMode ? (
                <div className="text-center py-12 text-gray-500 md:py-12">
                  <Code className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium md:text-lg">No skills yet</p>
                  <p className="text-base md:text-sm">Enable edit mode to add your skills and categories</p>
                </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-0 md:gap-4">
            {skillCategories.map((category: any, index: number) => (
              <CategoryItem
                key={category.id || index}
                category={category}
                index={index}
                isEditMode={isEditMode}
                refetch={refetch}
              />
            ))}
            {isEditMode && (
              <motion.div 
                variants={itemVariants}
                className="break-inside-avoid mb-4 md:mb-4"
              >
                <Card 
                        className={`border-2 border-dashed border-gray-300 bg-gray-50 hover:border-orange-400 transition-colors cursor-pointer break-inside-avoid mb-4 touch-manipulation min-h-[140px] ${isAddingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleAddCategory}
                >
                  <CardContent className="flex items-center justify-center p-6 min-h-[140px] md:p-5 md:min-h-[120px]">
                    <div className="text-center">
                      {isAddingCategory ? (
                        <Loader2 className="h-6 w-6 text-gray-400 mx-auto mb-1 animate-spin" />
                      ) : (
                        <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                      )}
                      <p className="text-sm text-gray-600 md:text-xs">{isAddingCategory ? 'Adding...' : 'Add Category'}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

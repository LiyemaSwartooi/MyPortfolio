"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ExternalLink, Github, ChevronLeft, ChevronRight, Plus, Save, Trash2, Upload, Loader2 } from "lucide-react"
import { useProjects } from "@/hooks/use-portfolio-data"
import { ProjectsSkeleton } from "@/components/ui/loading-skeleton"
import { useEditMode } from "@/contexts/EditModeContext"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

interface ProjectsProps {
  viewMode?: "slideshow" | "grid"
  setViewMode?: (mode: "slideshow" | "grid") => void
}

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

// Technology Item Component
function TechnologyItem({ technology, projectId, isEditMode, refetch, hasImage }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editText, setEditText] = useState(technology.technology || "")

  // Initialize edit text when technology changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (technology && technology.id) {
      setEditText(technology.technology || "")
    } else {
      // New technology - keep empty
      setEditText("")
    }
  }, [technology, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const response = await fetch('/api/projects/technologies', {
        method: technology.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: technology.id,
          project_id: projectId,
          technology: editText.trim(),
          display_order: 0
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      
      // Silent save - no toast, no refetch (will sync when exiting edit mode)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save technology')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!technology.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!technology.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/technologies?id=${technology.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Technology deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete technology')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isEditMode) {
    return (
      <div className="flex items-center gap-2 p-3 bg-orange-50/30 border-2 border-orange-300 rounded-lg md:p-2">
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={() => technology.id && handleSave()}
          placeholder="Technology name"
          className="flex-1 h-11 min-h-[44px] text-base border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white touch-manipulation md:h-9 md:text-sm"
        />
        <div className="flex gap-1.5 md:gap-1">
          <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 h-11 min-h-[44px] touch-manipulation md:h-8">
            <Save className="h-4 w-4 md:h-3 md:w-3" />
          </Button>
          {technology.id && (
            <Button size="sm" variant="destructive" onClick={handleDelete} className="h-11 min-h-[44px] touch-manipulation md:h-8">
              <Trash2 className="h-4 w-4 md:h-3 md:w-3" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
    <span className={`rounded-full px-3 py-1.5 text-sm font-medium touch-manipulation md:px-2.5 md:py-1 md:text-[11px] md:px-3 md:py-1.5 md:text-[12px] ${
      hasImage !== false 
        ? 'bg-white/20 backdrop-blur-sm text-white' 
        : 'bg-gray-100 text-gray-700'
    }`}>
      {technology.technology}
    </span>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="technology"
      />
    </>
  )
}

// Feature Item Component
function FeatureItem({ feature, projectId, isEditMode, refetch, hasImage }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editText, setEditText] = useState(feature.feature || "")

  // Initialize edit text when feature changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (feature && feature.id) {
      setEditText(feature.feature || "")
    } else {
      // New feature - keep empty
      setEditText("")
    }
  }, [feature, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const response = await fetch('/api/projects/features', {
        method: feature.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: feature.id,
          project_id: projectId,
          feature: editText.trim(),
          display_order: 0
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      
      // Silent save - no toast, no refetch (will sync when exiting edit mode)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save feature')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!feature.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!feature.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/features?id=${feature.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Feature deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete feature')
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
          onBlur={() => feature.id && handleSave()}
          placeholder="Feature description"
          className="flex-1 h-11 min-h-[44px] text-base border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white touch-manipulation md:h-9 md:text-sm"
        />
        <div className="flex gap-1.5 md:gap-1">
          <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 h-11 min-h-[44px] touch-manipulation md:h-8">
            <Save className="h-4 w-4 md:h-3 md:w-3" />
          </Button>
          {feature.id && (
            <Button size="sm" variant="destructive" onClick={handleDelete} className="h-11 min-h-[44px] touch-manipulation md:h-8">
              <Trash2 className="h-4 w-4 md:h-3 md:w-3" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
    <div className={`flex items-center gap-2 text-base md:text-[12px] md:text-[13px] ${
      hasImage !== false ? 'text-white/95' : 'text-gray-700'
    }`}>
      <div className={`h-2.5 w-2.5 rounded-full shrink-0 md:h-2 md:w-2 ${
        hasImage !== false 
          ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
          : 'bg-blue-500'
      }`} />
      <span className="line-clamp-2 md:line-clamp-1">{feature.feature}</span>
    </div>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="feature"
      />
    </>
  )
}

// Project Item Component (for edit mode)
function ProjectItem({ project, index, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editData, setEditData] = useState({
    title: project.title || "",
    description: project.description || "",
    status: project.status || "Live",
    image_url: project.image_url || "",
    github_url: project.github_url || "",
    demo_url: project.demo_url || "",
    gradient: project.gradient || "from-blue-500 to-purple-600"
  })

  // Initialize edit data when project changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (project && project.id) {
      setEditData({
        title: project.title || "",
        description: project.description || "",
        status: project.status || "Live",
        image_url: project.image_url || "",
        github_url: project.github_url || "",
        demo_url: project.demo_url || "",
        gradient: project.gradient || "from-blue-500 to-purple-600"
      })
    } else {
      // New project - keep empty
      setEditData({
        title: "",
        description: "",
        status: "Live",
        image_url: "",
        github_url: "",
        demo_url: "",
        gradient: "from-blue-500 to-purple-600"
      })
    }
  }, [project, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      if (!editData.title || !editData.description || !editData.status) {
        toast.error('Title, description, and status are required')
        return
      }

      const response = await fetch('/api/projects', {
        method: project.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
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
      toast.error(error.message || 'Failed to save project')
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

      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed')

      setEditData({ ...editData, image_url: result.url })
      if (project.id) {
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
    if (!project.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!project.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects?id=${project.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Project deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleAddTechnology = async () => {
    try {
      const response = await fetch('/api/projects/technologies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          technology: "",
          display_order: (project.technologies?.length || 0)
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add technology')
    }
  }

  const handleAddFeature = async () => {
    try {
      const response = await fetch('/api/projects/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          feature: "",
          display_order: (project.features?.length || 0)
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add feature')
    }
  }

  if (isEditMode) {
    return (
      <>
        <Card className="border-2 border-orange-300 bg-orange-50/30 mb-4 md:mb-4">
        <CardContent className="p-4 space-y-4 md:p-5 md:space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">Project Title</label>
              <Input
                placeholder="Project Title"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                onBlur={() => project.id && handleSave()}
                className="h-11 min-h-[44px] text-base border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white touch-manipulation md:h-9 md:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">Status</label>
              <Select
                value={editData.status}
                onValueChange={(value) => {
                  setEditData({ ...editData, status: value })
                  if (project.id) {
                    setTimeout(() => handleSave(), 100)
                  }
                }}
              >
                <SelectTrigger className="h-11 min-h-[44px] text-base border-2 border-orange-400 focus:border-orange-500 bg-white touch-manipulation md:h-9 md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Live">Live</SelectItem>
                  <SelectItem value="Beta">Beta</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 md:text-xs md:mb-1">Description</label>
            <Textarea
              placeholder="Project description"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              onBlur={() => project.id && handleSave()}
              rows={5}
              className="text-base border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white resize-none touch-manipulation md:text-sm md:rows-4"
            />
          </div>
            <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Background Image</label>
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
                      <span className="text-xs font-medium text-gray-600">Upload Background Image</span>
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
                onBlur={() => project.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">GitHub URL</label>
              <Input
                placeholder="GitHub URL"
                value={editData.github_url}
                onChange={(e) => setEditData({ ...editData, github_url: e.target.value })}
                onBlur={() => project.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Demo URL</label>
              <Input
                placeholder="Demo URL"
                value={editData.demo_url}
                onChange={(e) => setEditData({ ...editData, demo_url: e.target.value })}
                onBlur={() => project.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Technologies</label>
            <div className="space-y-2">
              {project.technologies?.map((tech: any) => (
                <TechnologyItem
                  key={tech.id}
                  technology={tech}
                  projectId={project.id}
                  isEditMode={isEditMode}
                  refetch={refetch}
                  hasImage={!!project.image_url}
                />
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddTechnology}
                className="w-full h-11 min-h-[44px] border-dashed border-2 border-gray-300 hover:border-orange-400 touch-manipulation md:h-auto"
              >
                <Plus className="h-4 w-4 mr-2 md:h-4 md:w-4" />
                <span className="text-sm md:text-xs">Add Technology</span>
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 md:text-xs">Features</label>
            <div className="space-y-3 md:space-y-2">
              {project.features?.map((feature: any) => (
                <FeatureItem
                  key={feature.id}
                  feature={feature}
                  projectId={project.id}
                  isEditMode={isEditMode}
                  refetch={refetch}
                  hasImage={!!project.image_url}
                />
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddFeature}
                className="w-full h-11 min-h-[44px] border-dashed border-2 border-gray-300 hover:border-orange-400 touch-manipulation md:h-auto"
              >
                <Plus className="h-4 w-4 mr-2 md:h-4 md:w-4" />
                <span className="text-sm md:text-xs">Add Feature</span>
              </Button>
            </div>
          </div>
          <div className="flex gap-2 pt-2 md:pt-2">
            <Button size="sm" onClick={handleSave} className="h-11 min-h-[44px] text-sm bg-orange-500 hover:bg-orange-600 touch-manipulation md:h-auto md:text-xs">
              <Save className="h-4 w-4 mr-1.5 md:h-4 md:w-4 md:mr-1" />
              Save
            </Button>
            {project.id && (
              <Button size="sm" variant="destructive" onClick={handleDelete} className="h-11 min-h-[44px] text-sm touch-manipulation md:h-auto md:text-xs">
                <Trash2 className="h-4 w-4 mr-1.5 md:h-4 md:w-4 md:mr-1" />
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
          itemName="project"
        />
      </>
    )
  }

  return null // Projects display handled in main component
}

export function Projects({ viewMode = "slideshow", setViewMode }: ProjectsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { data: projects, loading, error, refetch } = useProjects()
  const { isEditMode } = useEditMode()
  const [subtitle, setSubtitle] = useState("A showcase of my recent work and creative solutions")

  useEffect(() => {
    if (projects && projects.length > 0 && currentIndex >= projects.length) {
      setCurrentIndex(0)
    }
  }, [projects, currentIndex])

  // Refetch data ONLY when EXITING edit mode to sync with server
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        refetch()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditMode, refetch])

  const handleAddProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "",
          description: "Project description",
          status: "Development",
          display_order: projects.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add project')
    }
  }

  if (loading) {
    return <ProjectsSkeleton />
  }

  if (error) {
    return (
      <div className="w-full max-w-[1140px] text-center text-red-600">
        Failed to load projects. Please try again later.
      </div>
    )
  }

  // Edit Mode - Show all projects as editable cards
  if (isEditMode) {
    return (
      <div className="w-full max-w-[1140px] space-y-4 md:space-y-5">
        {/* Compact Header with Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Featured Projects
          </h2>
          <div className="flex justify-center px-4 md:px-0">
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter a subtitle (e.g., A showcase of my recent work and creative solutions...)"
              className="max-w-2xl h-11 min-h-[44px] text-base text-center bg-white border border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 placeholder:text-gray-400 touch-manipulation md:h-9 md:text-sm"
            />
          </div>
        </motion.div>

        {/* Projects List - Wrapped in Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
        >
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
                <Github className="h-4 w-4 text-blue-500" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-4"
        >
                {projects.length === 0 && !isEditMode ? (
            <div className="text-center py-12 text-gray-500">
              <Github className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No projects yet</p>
              <p className="text-sm">Add your first project below</p>
            </div>
          ) : (
                  <>
                    {projects.map((project: any, index: number) => (
              <ProjectItem
                key={project.id || index}
                project={project}
                index={index}
                isEditMode={isEditMode}
                refetch={refetch}
              />
                    ))}
                    {isEditMode && (
          <motion.div variants={itemVariants}>
                        <Card className="border-2 border-dashed border-gray-300 bg-gray-50 hover:border-orange-400 transition-colors cursor-pointer touch-manipulation min-h-[140px]"
              onClick={handleAddProject}
            >
                          <CardContent className="flex items-center justify-center p-6 md:p-5">
                <div className="text-center">
                              <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                              <p className="text-sm text-gray-600 md:text-xs">Add Project</p>
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
      </div>
    )
  }

  // View Mode - Show slideshow or grid
  if (!projects || projects.length === 0) {
    return (
      <div className="w-full max-w-[1140px] text-center text-gray-500">
        No projects available.
      </div>
    )
  }

  const currentProject = projects[currentIndex]

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
          Featured Projects
        </h2>
        {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base font-medium text-white/80 md:text-base max-w-2xl mx-auto px-4 md:px-0 leading-relaxed"
        >
          {subtitle}
        </motion.p>
        )}
      </motion.div>

      {/* Slideshow View */}
      {viewMode === "slideshow" && (
        <div className="relative">
          <Card className={`relative overflow-hidden border border-gray-200/80 p-0 shadow-xl ${currentProject.image_url ? 'bg-transparent' : 'bg-white'}`}>
            {currentProject.image_url && (
              <img
                src={currentProject.image_url}
                alt={currentProject.title}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            )}
            {currentProject.image_url && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
            )}
            
            <div className="absolute top-4 right-4 z-10 md:top-5 md:right-5">
              <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold md:px-4 md:text-[12px] ${
                currentProject.image_url ? 'backdrop-blur-sm' : ''
              } ${
                currentProject.status === "Live" ? "bg-green-500/90 text-white" :
                currentProject.status === "Beta" ? "bg-blue-500/90 text-white" :
                "bg-orange-500/90 text-white"
              }`}>
                {currentProject.status}
              </span>
            </div>

            <CardContent className={`relative z-10 p-4 md:p-6 ${currentProject.image_url ? '' : 'text-gray-900'}`}>
              <div className="mb-4 md:mb-5">
                <h3 className={`mb-2 text-xl font-bold md:mb-3 md:text-[22px] md:text-[28px] ${currentProject.image_url ? 'text-white drop-shadow-lg' : 'text-gray-900'}`}>
                  {currentProject.title}
                </h3>
                <p className={`text-base leading-relaxed line-clamp-3 md:line-clamp-2 md:text-[14px] md:text-[15px] ${currentProject.image_url ? 'text-white/95 drop-shadow-md' : 'text-gray-700'}`}>
                  {currentProject.description}
                </p>
              </div>

              {currentProject.technologies && currentProject.technologies.length > 0 && (
                <div className="mb-4 md:mb-3 md:mb-4">
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-wider md:mb-2 md:mb-3 md:text-[11px] md:text-[12px] ${currentProject.image_url ? 'text-white/80' : 'text-gray-600'}`}>Technologies</p>
                  <div className="flex flex-wrap gap-2 md:gap-1.5 md:gap-2">
                    {currentProject.technologies.slice(0, 5).map((tech: any) => (
                      <TechnologyItem
                        key={tech.id}
                        technology={tech}
                        projectId={currentProject.id}
                        isEditMode={false}
                        refetch={refetch}
                        hasImage={!!currentProject.image_url}
                      />
                    ))}
                    {currentProject.technologies.length > 5 && (
                      <span className={`rounded-full px-3 py-1.5 text-xs font-medium md:px-2.5 md:py-1 md:text-[11px] md:px-3 md:py-1.5 md:text-[12px] ${currentProject.image_url ? 'bg-white/20 backdrop-blur-sm text-white' : 'bg-gray-100 text-gray-700'}`}>
                        +{currentProject.technologies.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {currentProject.features && currentProject.features.length > 0 && (
                <div className="mb-4 md:mb-4 md:mb-5">
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-wider md:mb-2 md:mb-3 md:text-[11px] md:text-[12px] ${currentProject.image_url ? 'text-white/80' : 'text-gray-600'}`}>Key Features</p>
                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-2 md:gap-3">
                    {currentProject.features.slice(0, 4).map((feature: any) => (
                      <FeatureItem
                        key={feature.id}
                        feature={feature}
                        projectId={currentProject.id}
                        isEditMode={false}
                        refetch={refetch}
                        hasImage={!!currentProject.image_url}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 md:flex-row md:gap-2 md:gap-3">
                {currentProject.github_url && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className={`flex-1 text-sm h-12 min-h-[44px] touch-manipulation md:text-[12px] md:text-[13px] md:h-10 md:h-11 ${
                      currentProject.image_url 
                        ? 'border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 active:bg-white/25' 
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                    onClick={() => window.open(currentProject.github_url, '_blank')}
                  >
                    <Github className="mr-2 h-4 w-4 md:h-4 md:w-4" />
                    View Code
                  </Button>
                )}
                {currentProject.demo_url && (
                  <Button 
                    size="lg" 
                    className={`flex-1 text-sm h-12 min-h-[44px] touch-manipulation md:text-[12px] md:text-[13px] md:h-10 md:h-11 ${
                      currentProject.image_url 
                        ? 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 active:bg-white/40' 
                        : 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700'
                    }`}
                    onClick={() => window.open(currentProject.demo_url, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4 md:h-4 md:w-4" />
                    Live Demo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center justify-between md:mt-3 md:mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1))}
              className="h-11 min-h-[44px] border-gray-300 bg-white hover:bg-gray-50 touch-manipulation active:bg-gray-100 md:h-9 md:h-8"
            >
              <ChevronLeft className="mr-1.5 h-5 w-5 md:mr-1 md:h-4 md:w-4 md:mr-1.5" />
              <span className="text-sm md:hidden sm:inline md:text-xs">Previous</span>
            </Button>

            <div className="flex items-center gap-2 md:gap-1.5 md:gap-2">
              {projects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all touch-manipulation md:h-2 ${
                    idx === currentIndex
                      ? "w-8 bg-blue-600 md:w-6 md:w-8"
                      : "w-2.5 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 md:w-2"
                  }`}
                  aria-label={`Go to project ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1))}
              className="h-11 min-h-[44px] border-gray-300 bg-white hover:bg-gray-50 touch-manipulation active:bg-gray-100 md:h-9 md:h-8"
            >
              <span className="text-sm md:hidden sm:inline md:text-xs">Next</span>
              <ChevronRight className="ml-1.5 h-5 w-5 md:ml-1 md:h-4 md:w-4 md:ml-1.5" />
            </Button>
          </div>

          <div className="mt-3 text-center text-sm font-bold text-white md:mt-2 md:text-[12px] md:text-[13px]">
            {currentIndex + 1} of {projects.length}
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {projects.map((project: any) => (
            <Card key={project.id} className="group overflow-hidden border border-gray-200/80 bg-white p-0 shadow-sm transition-all hover:shadow-lg">
              <div className={`relative h-56 w-full overflow-hidden md:h-48 ${project.image_url ? '' : 'bg-white'}`}>
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                {project.image_url && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                )}
                
                <div className="absolute top-3 right-3 md:top-3 md:right-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold md:px-2 md:py-0.5 md:text-[10px] ${
                    project.image_url ? 'backdrop-blur-sm' : ''
                  } ${
                    project.status === "Live" ? "bg-green-500/90 text-white" :
                    project.status === "Beta" ? "bg-blue-500/90 text-white" :
                    "bg-orange-500/90 text-white"
                  }`}>
                    {project.status}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-4">
                  <h3 className={`text-lg font-bold line-clamp-1 md:text-[16px] ${
                    project.image_url ? 'text-white drop-shadow-lg' : 'text-gray-900'
                  }`}>
                    {project.title}
                  </h3>
                </div>
              </div>

              <CardContent className="p-4 md:p-4">
                <p className="mb-3 line-clamp-2 text-base leading-relaxed text-gray-600 break-words md:text-[13px]">{project.description}</p>
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className="mb-3 md:mb-3">
                    <div className="flex flex-wrap gap-2 md:gap-1.5">
                      {project.technologies.slice(0, 3).map((tech: any) => (
                        <span key={tech.id} className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 md:px-2 md:py-0.5 md:text-[10px]">
                          {tech.technology}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 md:px-2 md:py-0.5 md:text-[10px]">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 md:gap-2">
                  {project.github_url && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 h-11 min-h-[44px] text-sm touch-manipulation active:bg-gray-100 md:text-[11px] md:h-auto"
                      onClick={() => window.open(project.github_url, '_blank')}
                    >
                      <Github className="mr-1.5 h-4 w-4 md:mr-1 md:h-3 md:w-3" />
                      Code
                    </Button>
                  )}
                  {project.demo_url && (
                    <Button 
                      size="sm" 
                      className="flex-1 h-11 min-h-[44px] bg-gray-900 text-sm hover:bg-gray-800 touch-manipulation active:bg-gray-700 md:text-[11px] md:h-auto"
                      onClick={() => window.open(project.demo_url, '_blank')}
                    >
                      <ExternalLink className="mr-1.5 h-4 w-4 md:mr-1 md:h-3 md:w-3" />
                      Demo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

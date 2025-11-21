"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Plus, Save, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useEditMode } from "@/contexts/EditModeContext"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useResumeData } from "@/hooks/use-portfolio-data"

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

// CV Section Item Component
function CVSectionItem({ section, index, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState({
    title: section.title || "",
    content: section.content || ""
  })

  // Initialize edit data when section changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (section && section.id) {
      setEditData({
        title: section.title || "",
        content: section.content || ""
      })
    } else {
      setEditData({
        title: "",
        content: ""
      })
    }
  }, [section, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const response = await fetch('/api/cv-sections', {
        method: section.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: section.id,
          ...editData,
          display_order: index
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      refetch() // Refresh the list after saving
    } catch (error: any) {
      toast.error(error.message || 'Failed to save section')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!section.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!section.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/cv-sections?id=${section.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Section deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete section')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isEditMode) {
    return (
      <>
        <Card className="border-2 border-orange-300 bg-orange-50/30 mb-4">
          <CardContent className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
              <Input
                placeholder="Section Title (e.g., Professional Profile, Education)"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                onBlur={() => section.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
            <Textarea
                placeholder="Enter section content..."
                value={editData.content}
                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                onBlur={() => section.id && handleSave()}
                rows={6}
                className="text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white resize-none"
              />
          </div>
          <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-orange-500 hover:bg-orange-600"
              >
              <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              {section.id && (
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
            )}
          </div>
        </CardContent>
      </Card>
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={confirmDelete}
          itemName="section"
        />
      </>
    )
  }

  return (
    <motion.div variants={itemVariants} className="mb-3">
      <h3 className={`text-lg font-bold text-gray-900 mb-1.5 uppercase tracking-wide pb-1 ${section.title === 'PROFESSIONAL PROFILE' || section.title === 'PROFESSIONAL SUMMARY' ? '' : 'border-b-2 border-gray-300'}`}>
        {section.title}
      </h3>
      <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line break-words">
        {section.content}
      </div>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="section"
      />
    </motion.div>
  )
}

export function Resume() {
  const [cvSections, setCvSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { isEditMode } = useEditMode()
  const { data: resumeData } = useResumeData()
  const profile = resumeData?.profile
  const cvRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCVSections()
  }, [])

  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        fetchCVSections()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditMode])

  const fetchCVSections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cv-sections')
      const result = await response.json()
      if (result.success) {
        setCvSections(result.data || [])
      }
    } catch (error: any) {
      toast.error('Failed to load CV sections')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSection = async () => {
    try {
      const response = await fetch('/api/cv-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "",
          content: "",
          display_order: cvSections.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      fetchCVSections()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add section')
    }
  }


  if (loading) {
    return (
      <div className="w-full max-w-[1140px]">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1140px] space-y-4 md:space-y-5 px-4 md:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-2 md:space-y-2"
      >
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Resume / CV
        </h2>
      </motion.div>

      {/* CV Template */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
              <FileText className="h-4 w-4 text-blue-500" />
              CV Template
            </CardTitle>
              </div>
            </CardHeader>
        <CardContent className="pt-0">
          <div ref={cvRef} className="bg-white p-6 md:p-8">
            {/* CV Header */}
            <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {profile?.full_name || 'Your Name'}
              </h1>
              <div className="text-sm text-gray-600 space-x-2 break-words">
                {profile?.website_url && <span>{profile.website_url}</span>}
                {profile?.website_url && profile?.github_url && <span>|</span>}
                {profile?.github_url && <span>{profile.github_url}</span>}
                {(profile?.website_url || profile?.github_url) && profile?.email && <span>|</span>}
                {profile?.email && <span>{profile.email}</span>}
                {(profile?.website_url || profile?.github_url || profile?.email) && profile?.phone && <span>|</span>}
                {profile?.phone && <span>{profile.phone}</span>}
              </div>
                </div>

            {/* CV Sections */}
            {cvSections.length === 0 && !isEditMode ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No CV sections yet</p>
                <p className="text-sm">Enable edit mode to add sections</p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-2"
              >
                {cvSections.map((section: any, index: number) => (
                  <CVSectionItem
                    key={section.id || index}
                    section={section}
                    index={index}
                    isEditMode={isEditMode}
                    refetch={fetchCVSections}
                  />
                ))}
                {isEditMode && (
                  <motion.div variants={itemVariants} className="mt-4">
                    <Card
                      className="border-2 border-dashed border-gray-300 bg-gray-50 hover:border-orange-400 transition-colors cursor-pointer"
                      onClick={handleAddSection}
                    >
                      <CardContent className="flex items-center justify-center p-6">
                        <div className="text-center">
                          <Plus className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Add Section</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}
              </div>
            </CardContent>
          </Card>
    </div>
  )
}

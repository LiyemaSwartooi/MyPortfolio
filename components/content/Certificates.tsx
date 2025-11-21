"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Award, Eye, ExternalLink, Calendar, ChevronLeft, ChevronRight, Plus, Save, Trash2, Upload, Loader2 } from "lucide-react"
import { useCertificates } from "@/hooks/use-portfolio-data"
import { ProjectsSkeleton } from "@/components/ui/loading-skeleton"
import { getIcon } from "@/lib/icon-mapper"
import { useEditMode } from "@/contexts/EditModeContext"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { formatDate, getCurrentDateISO } from "@/lib/date-utils"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

interface CertificatesProps {
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

// Certificate Skill Item Component
function CertificateSkillItem({ skill, certificationId, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editText, setEditText] = useState(skill.skill || "")

  // Initialize edit text when skill changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (skill && skill.id) {
      setEditText(skill.skill || "")
    } else {
      // New skill - keep empty
      setEditText("")
    }
  }, [skill, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const response = await fetch('/api/certificates/skills', {
        method: skill.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: skill.id,
          certification_id: certificationId,
          skill: editText.trim(),
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
      const response = await fetch(`/api/certificates/skills?id=${skill.id}`, {
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
      <div className="flex items-center gap-2 p-2 bg-orange-50/30 border-2 border-orange-300 rounded-lg">
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={() => skill.id && handleSave()}
          placeholder="Skill name"
          className="flex-1 h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
        />
        <div className="flex gap-1">
          <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 h-8">
            <Save className="h-3 w-3" />
          </Button>
          {skill.id && (
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
    <span className="rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white touch-manipulation md:px-3 md:py-1.5 md:text-[12px]">
      {skill.skill}
    </span>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="skill"
      />
    </>
  )
}

// Certificate Item Component (for edit mode)
function CertificateItem({ certificate, index, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editData, setEditData] = useState({
    name: certificate.name || "",
    issuer: certificate.issuer || "",
    issue_date: certificate.issue_date || "",
    expiry_date: certificate.expiry_date || "",
    credential_id: certificate.credential_id || "",
    verification_url: certificate.verification_url || "",
    image_url: certificate.image_url || "",
    gradient: certificate.gradient || "from-orange-500 to-yellow-500"
  })

  // Initialize edit data when certificate changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (certificate && certificate.id) {
      setEditData({
        name: certificate.name || "",
        issuer: certificate.issuer || "",
        issue_date: certificate.issue_date || "",
        expiry_date: certificate.expiry_date || "",
        credential_id: certificate.credential_id || "",
        verification_url: certificate.verification_url || "",
        image_url: certificate.image_url || "",
        gradient: certificate.gradient || "from-orange-500 to-yellow-500"
      })
    } else {
      // New certificate - keep empty
      setEditData({
        name: "",
        issuer: "",
        issue_date: "",
        expiry_date: "",
        credential_id: "",
        verification_url: "",
        image_url: "",
        gradient: "from-orange-500 to-yellow-500"
      })
    }
  }, [certificate, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      if (!editData.name || !editData.issuer || !editData.issue_date) {
        toast.error('Name, issuer, and issue date are required')
        return
      }

      const response = await fetch('/api/certificates', {
        method: certificate.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: certificate.id,
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
      toast.error(error.message || 'Failed to save certificate')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!certificate.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!certificate.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/certificates?id=${certificate.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Certificate deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete certificate')
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

      const response = await fetch('/api/certificates/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed')

      setEditData({ ...editData, image_url: result.url })
      if (certificate.id) {
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

  const handleAddSkill = async () => {
    try {
      const response = await fetch('/api/certificates/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certification_id: certificate.id,
          skill: "",
          display_order: (certificate.skills?.length || 0)
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
    }
  }

  if (isEditMode) {
    return (
      <Card className="border-2 border-orange-300 bg-orange-50/30 mb-4">
        <CardContent className="p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Certificate Name</label>
              <Input
                placeholder="Certificate Name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                onBlur={() => certificate.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Issuer</label>
              <Input
                placeholder="Issuer"
                value={editData.issuer}
                onChange={(e) => setEditData({ ...editData, issuer: e.target.value })}
                onBlur={() => certificate.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Issue Date</label>
              <Input
                type="date"
                value={editData.issue_date}
                onChange={(e) => setEditData({ ...editData, issue_date: e.target.value })}
                onBlur={() => certificate.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
              <Input
                type="date"
                value={editData.expiry_date || ""}
                onChange={(e) => setEditData({ ...editData, expiry_date: e.target.value })}
                onBlur={() => certificate.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Credential ID</label>
              <Input
                placeholder="Credential ID"
                value={editData.credential_id}
                onChange={(e) => setEditData({ ...editData, credential_id: e.target.value })}
                onBlur={() => certificate.id && handleSave()}
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
                        <span className="text-xs font-medium text-gray-600">Upload Image/PDF</span>
                        <span className="text-[10px] text-gray-500">JPG, PNG, WebP, PDF</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              <Input
                  placeholder="Or enter image/PDF URL"
                value={editData.image_url}
                onChange={(e) => setEditData({ ...editData, image_url: e.target.value })}
                onBlur={() => certificate.id && handleSave()}
                  className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Verification URL</label>
              <Input
                placeholder="Verification URL"
                value={editData.verification_url}
                onChange={(e) => setEditData({ ...editData, verification_url: e.target.value })}
                onBlur={() => certificate.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Skills</label>
            <div className="space-y-2">
              {certificate.skills?.map((skill: any) => (
                <CertificateSkillItem
                  key={skill.id}
                  skill={skill}
                  certificationId={certificate.id}
                  isEditMode={isEditMode}
                  refetch={refetch}
                />
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddSkill}
                className="w-full border-dashed border-2 border-gray-300 hover:border-orange-400"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            {certificate.id && (
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
    <>
      <motion.div variants={itemVariants} className="h-full">
        <Card className="relative overflow-hidden border border-gray-200/80 bg-transparent p-0 shadow-xl h-full min-h-[320px] md:min-h-[360px]">
          {certificate.image_url && (
            <img
              src={certificate.image_url}
              alt={certificate.name}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
          
          <CardContent className="relative z-10 p-4 md:p-5 h-full flex flex-col justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/90 md:text-[11px] md:text-[12px]">
                {certificate.issuer}
              </p>
              <h3 className="mb-2 text-xl font-bold text-white drop-shadow-lg md:mb-3 md:text-[22px] md:text-[26px] break-words">
                {certificate.name}
              </h3>
              {certificate.credential_id && (
                <p className="text-base leading-relaxed text-white/95 drop-shadow-md md:text-[14px] md:text-[15px] break-words">
                  Credential ID: {certificate.credential_id}
                </p>
              )}
            </div>

            <div className="space-y-2.5 md:space-y-2 md:space-y-2.5 mt-3">
              <div className="flex items-center gap-2 text-sm text-white/90 drop-shadow-md md:text-[13px] md:text-[14px]">
                <Calendar className="h-4 w-4 md:h-4 md:w-4" />
                <span>Issued: {formatDate(certificate.issue_date)}</span>
              </div>
              {certificate.expiry_date && (
                <div className="flex items-center gap-2 text-sm text-white/90 drop-shadow-md md:text-[13px] md:text-[14px]">
                  <Calendar className="h-4 w-4 md:h-4 md:w-4" />
                  <span>Expires: {formatDate(certificate.expiry_date)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="certificate"
      />
    </>
  )
}

export function Certificates({ viewMode = "slideshow", setViewMode }: CertificatesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { data: certificates, loading, error, refetch } = useCertificates()
  const { isEditMode } = useEditMode()
  const [subtitle, setSubtitle] = useState("Industry-recognized certifications and credentials")

  useEffect(() => {
    if (certificates && certificates.length > 0 && currentIndex >= certificates.length) {
      setCurrentIndex(0)
    }
  }, [certificates, currentIndex])

  // Refetch data ONLY when EXITING edit mode to sync with server
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        refetch()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditMode, refetch])

  const handleAddCertificate = async () => {
    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "",
          issuer: "",
          issue_date: "",
          display_order: certificates.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add certificate')
    }
  }

  if (loading) {
    return <ProjectsSkeleton />
  }

  if (error) {
    return (
      <div className="w-full max-w-[1140px] text-center text-red-600">
        Failed to load certificates. Please try again later.
      </div>
    )
  }

  // Edit Mode - Show all certificates as editable cards
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
            Professional Certificates
          </h2>
          <div className="flex justify-center">
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter a subtitle (e.g., Industry-recognized certifications and credentials...)"
              className="max-w-2xl h-9 text-sm text-center bg-white border border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 placeholder:text-gray-400"
            />
          </div>
        </motion.div>

        {/* Certificates List - Wrapped in Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
        >
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
                <Award className="h-4 w-4 text-blue-500" />
                Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-4"
        >
                {certificates.length === 0 && !isEditMode ? (
            <div className="text-center py-12 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No certificates yet</p>
                    <p className="text-sm">Enable edit mode to add your certificates</p>
            </div>
          ) : (
                  <>
                    {certificates.map((cert: any, index: number) => (
              <CertificateItem
                key={cert.id || index}
                certificate={cert}
                index={index}
                isEditMode={isEditMode}
                refetch={refetch}
              />
                    ))}
                    {isEditMode && (
          <motion.div variants={itemVariants}>
                        <Card className="border-2 border-dashed border-gray-300 bg-gray-50 hover:border-orange-400 transition-colors cursor-pointer touch-manipulation"
              onClick={handleAddCertificate}
            >
                          <CardContent className="flex items-center justify-center p-5">
                <div className="text-center">
                              <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-600">Add Certificate</p>
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
  if (!certificates || certificates.length === 0) {
    return (
      <div className="w-full max-w-[1140px] text-center text-gray-500">
        No certificates available.
      </div>
    )
  }

  const currentCert = certificates[currentIndex]


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
          Professional Certificates
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
          <Card className="relative overflow-hidden border border-gray-200/80 bg-transparent p-0 shadow-xl">
            {currentCert.image_url && (
              <img
                src={currentCert.image_url}
                alt={currentCert.name}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

            <CardContent className="relative z-10 p-4 md:p-6">
              <div className="mb-4 md:mb-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/90 md:text-[12px]">
                  {currentCert.issuer}
                </p>
                <h3 className="mb-2 text-[22px] font-bold text-white drop-shadow-lg md:mb-3 md:text-[28px]">
                  {currentCert.name}
                </h3>
                {currentCert.credential_id && (
                  <p className="text-[14px] leading-relaxed text-white/95 drop-shadow-md line-clamp-2 md:text-[15px]">
                    Credential ID: {currentCert.credential_id}
                  </p>
                )}
              </div>

              {currentCert.skills && currentCert.skills.length > 0 && (
                <div className="mb-3 md:mb-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/80 md:mb-3 md:text-[12px]">Skills & Competencies</p>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {currentCert.skills.slice(0, 5).map((skill: any) => (
                      <CertificateSkillItem
                        key={skill.id}
                        skill={skill}
                        certificationId={currentCert.id}
                        isEditMode={false}
                        refetch={refetch}
                      />
                    ))}
                    {currentCert.skills.length > 5 && (
                      <span className="rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white md:px-3 md:py-1.5 md:text-[12px]">
                        +{currentCert.skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-4 md:mb-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/80 md:mb-3 md:text-[12px]">Certificate Details</p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                  <div className="flex items-center gap-2 text-[12px] text-white/95 md:text-[13px]">
                    <Calendar className="h-4 w-4 text-white/80" />
                    <div>
                      <p className="text-[10px] text-white/70 md:text-[11px]">Issued</p>
                      <p className="font-semibold">{formatDate(currentCert.issue_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-white/95 md:text-[13px]">
                    <Calendar className="h-4 w-4 text-white/80" />
                    <div>
                      <p className="text-[10px] text-white/70 md:text-[11px]">Expires</p>
                      <p className="font-semibold">{formatDate(currentCert.expiry_date)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                {currentCert.image_url && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="flex-1 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 active:bg-white/25 text-[12px] h-10 touch-manipulation md:text-[13px] md:h-11"
                    onClick={() => window.open(currentCert.image_url, '_blank')}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                )}
                {currentCert.verification_url && (
                  <Button 
                    size="lg" 
                    className="flex-1 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 active:bg-white/40 text-[12px] h-10 touch-manipulation md:text-[13px] md:h-11"
                    onClick={() => window.open(currentCert.verification_url, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Verify
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-3 flex items-center justify-between md:mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? certificates.length - 1 : prev - 1))}
              className="h-9 border-gray-300 bg-white hover:bg-gray-50 touch-manipulation active:bg-gray-100 md:h-8"
            >
              <ChevronLeft className="mr-1 h-4 w-4 md:mr-1.5" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-1.5 md:gap-2">
              {certificates.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all touch-manipulation ${
                    idx === currentIndex
                      ? "w-6 bg-blue-600 md:w-8"
                      : "w-2 bg-gray-300 hover:bg-gray-400 active:bg-gray-500"
                  }`}
                  aria-label={`Go to certificate ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((prev) => (prev === certificates.length - 1 ? 0 : prev + 1))}
              className="h-9 border-gray-300 bg-white hover:bg-gray-50 touch-manipulation active:bg-gray-100 md:h-8"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="ml-1 h-4 w-4 md:ml-1.5" />
            </Button>
          </div>

          <div className="mt-2 text-center text-[12px] font-bold text-white md:text-[13px]">
            {currentIndex + 1} of {certificates.length}
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {certificates.map((cert: any) => {
            const IconComponent = getIcon(cert.icon_name, Award)
            return (
              <Card key={cert.id} className="group overflow-hidden border border-gray-200/80 bg-white/98 p-0 shadow-sm transition-all hover:shadow-lg">
                <div className="relative h-40 w-full overflow-hidden">
                  {cert.image_url && (
                    <img
                      src={cert.image_url}
                      alt={cert.name}
                      className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${cert.gradient || 'from-orange-500 to-yellow-500'} shadow-md`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/90">
                      {cert.issuer}
                    </p>
                    <h3 className="line-clamp-2 text-[14px] font-bold text-white drop-shadow-lg">
                      {cert.name}
                    </h3>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="rounded-md bg-gray-50 p-2">
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">Issued</p>
                      <p className="mt-0.5 text-[11px] font-bold text-gray-900">{formatDate(cert.issue_date)}</p>
                    </div>
                    <div className="rounded-md bg-gray-50 p-2">
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">Expires</p>
                      <p className="mt-0.5 text-[11px] font-bold text-gray-900">{formatDate(cert.expiry_date)}</p>
                    </div>
                  </div>

                  {cert.credential_id && (
                    <div className="mb-3 rounded-md border border-gray-200 bg-gray-50/50 p-2">
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">ID</p>
                      <p className="mt-0.5 font-mono text-[10px] font-semibold text-gray-700">{cert.credential_id}</p>
                    </div>
                  )}

                  {cert.skills && cert.skills.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {cert.skills.slice(0, 2).map((skill: any) => (
                          <span key={skill.id} className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                            {skill.skill}
                          </span>
                        ))}
                        {cert.skills.length > 2 && (
                          <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                            +{cert.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      {cert.image_url && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-[10px]"
                          onClick={() => window.open(cert.image_url, '_blank')}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Preview
                        </Button>
                      )}
                      {cert.verification_url && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-[10px]"
                          onClick={() => window.open(cert.verification_url, '_blank')}
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

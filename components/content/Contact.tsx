"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Linkedin, Github, Twitter, Send, Plus, Save, Trash2, User, Share2 } from "lucide-react"
import { useContactInfo } from "@/hooks/use-portfolio-data"
import { getIcon } from "@/lib/icon-mapper"
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
  "Mail", "Phone", "MapPin", "Linkedin", "Github", "Twitter",
  "User", "Code", "Target", "Lightbulb"
]

const gradientOptions = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-teal-500 to-blue-500"
]

// Contact Info Item Component
function ContactInfoItem({ info, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState({
    type: info.type || "email",
    label: info.label || "",
    value: info.value || "",
    icon_name: info.icon_name || "Mail",
    gradient: info.gradient || "from-blue-500 to-cyan-500"
  })

  // Initialize edit data when info changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (info && info.id) {
      setEditData({
        type: info.type || "email",
        label: info.label || "",
        value: info.value || "",
        icon_name: info.icon_name || "Mail",
        gradient: info.gradient || "from-blue-500 to-cyan-500"
      })
    } else {
      // New info - keep empty
      setEditData({
        type: "email",
        label: "",
        value: "",
        icon_name: "Mail",
        gradient: "from-blue-500 to-cyan-500"
      })
    }
  }, [info, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      if (!editData.type || !editData.label || !editData.value) {
        toast.error('Type, label, and value are required')
        return
      }

      const response = await fetch('/api/contact/info', {
        method: info.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: info.id,
          ...editData,
          display_order: 0
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      
      // Silent save - no toast, no refetch (will sync when exiting edit mode)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save contact info')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!info.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!info.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/contact/info?id=${info.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Contact info deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contact info')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const IconComponent = getIcon(editData.icon_name, Mail)

  if (isEditMode) {
    return (
      <Card className="border-2 border-orange-300 bg-orange-50/30 mb-3">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <Select
                value={editData.type}
                onValueChange={(value) => {
                  setEditData({ ...editData, type: value })
                  if (info.id) {
                    setTimeout(() => handleSave(), 100)
                  }
                }}
              >
                <SelectTrigger className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
              <Input
                placeholder="Label"
                value={editData.label}
                onChange={(e) => setEditData({ ...editData, label: e.target.value })}
                onBlur={() => info.id && handleSave()}
                className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
            <Input
              placeholder="Value"
              value={editData.value}
              onChange={(e) => setEditData({ ...editData, value: e.target.value })}
              onBlur={() => info.id && handleSave()}
              className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
              <Select
                value={editData.icon_name}
                onValueChange={(value) => {
                  setEditData({ ...editData, icon_name: value })
                  if (info.id) {
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
                  if (info.id) {
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
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            {info.id && (
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
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${info.gradient || 'from-blue-500 to-cyan-500'} md:h-10 md:w-10`}>
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 md:text-[11px]">{info.label}</p>
              <p className="text-[13px] font-medium text-gray-900 break-words md:text-[14px]">{info.value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="contact info"
      />
    </motion.div>
  )
}

// Social Link Item Component
function SocialLinkItem({ social, isEditMode, refetch }: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState({
    platform: social.platform || "",
    url: social.url || "",
    icon_name: social.icon_name || "Linkedin",
    color_class: social.color_class || "text-gray-900 hover:text-gray-700"
  })

  // Initialize edit data when social changes or when entering edit mode
  // Sync with database values to ensure edit mode matches non-edit mode
  useEffect(() => {
    if (social && social.id) {
      setEditData({
        platform: social.platform || "",
        url: social.url || "",
        icon_name: social.icon_name || "Linkedin",
        color_class: social.color_class || "text-gray-900 hover:text-gray-700"
      })
    } else {
      // New social - keep empty
      setEditData({
        platform: "",
        url: "",
        icon_name: "Linkedin",
        color_class: "text-gray-900 hover:text-gray-700"
      })
    }
  }, [social, isEditMode])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      if (!editData.platform || !editData.url) {
        toast.error('Platform and URL are required')
        return
      }

      const response = await fetch('/api/contact/social', {
        method: social.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: social.id,
          ...editData,
          display_order: 0
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      
      // Silent save - no toast, no refetch (will sync when exiting edit mode)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save social link')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!social.id) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!social.id || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/contact/social?id=${social.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Social link deleted')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete social link')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const IconComponent = getIcon(editData.icon_name, Linkedin)

  if (isEditMode) {
    return (
      <div className="p-3 bg-orange-50/30 border-2 border-orange-300 rounded-lg space-y-2">
        <Input
          value={editData.platform}
          onChange={(e) => setEditData({ ...editData, platform: e.target.value })}
          onBlur={() => social.id && handleSave()}
          placeholder="Platform (e.g., LinkedIn)"
          className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
        />
        <Input
          value={editData.url}
          onChange={(e) => setEditData({ ...editData, url: e.target.value })}
          onBlur={() => social.id && handleSave()}
          placeholder="URL"
          className="h-9 text-sm border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          {social.id && (
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
    <a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 touch-manipulation active:bg-gray-100 md:h-10 md:w-10 ${social.color_class || 'text-gray-900 hover:text-gray-700'}`}
      aria-label={social.platform}
    >
      <IconComponent className="h-5 w-5" />
    </a>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName="social link"
      />
    </>
  )
}

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data, loading, error, refetch } = useContactInfo()
  const { isEditMode } = useEditMode()
  const [subtitle, setSubtitle] = useState("Let's discuss opportunities and collaborations")

  const contactInfo = data?.contactInfo || []
  const socialLinks = data?.socialLinks || []

  // Refetch data ONLY when EXITING edit mode to sync with server
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        refetch()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditMode, refetch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let result: any = null
    try {
      // Save message to database
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      result = await response.json()

      if (!response.ok) {
        // Include more error details
        const errorMsg = result.message || result.error || 'Failed to send message'
        throw new Error(errorMsg)
      }

      // Format WhatsApp message with structured content
      const whatsappMessage = `📧 *New Contact Form Message*

👤 *Name:* ${formData.name}
📧 *Email:* ${formData.email}
📋 *Subject:* ${formData.subject}

💬 *Message:*
${formData.message}

---
_Message sent from portfolio contact form_`

      // Encode message for URL
      const encodedMessage = encodeURIComponent(whatsappMessage)
      
      // WhatsApp number: +27 69 465 4988 (format: 27694654988)
      const whatsappNumber = '27694654988'
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

      // Open WhatsApp with pre-filled message
      window.open(whatsappUrl, '_blank')

      toast.success('Message sent! Opening WhatsApp...')
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error: any) {
      console.error('Error submitting form:', error)
      // Show more detailed error message
      const errorMessage = error.message || result?.message || result?.error || 'Failed to send message. Please try again.'
      toast.error(errorMessage)
      console.error('Full error details:', { error, result, formData })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddContactInfo = async () => {
    try {
      const response = await fetch('/api/contact/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: "email",
          label: "Email",
          value: "your.email@example.com",
          icon_name: "Mail",
          gradient: "from-blue-500 to-cyan-500",
          display_order: contactInfo.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add contact info')
    }
  }

  const handleAddSocialLink = async () => {
    try {
      const response = await fetch('/api/contact/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: "",
          url: "",
          icon_name: "Linkedin",
          color_class: "text-blue-600 hover:text-blue-700",
          display_order: socialLinks.length
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }
      
      // Silent create - no toast, no refetch (will sync when exiting edit mode)
      refetch() // Only refetch for new items to show them immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to add social link')
    }
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
          Get In Touch
        </h2>
        {isEditMode ? (
          <div className="flex justify-center px-4 md:px-0">
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter a subtitle (e.g., Let's discuss opportunities and collaborations...)"
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

      <div className="space-y-4 md:space-y-5">
        {/* Send a Message Card */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
              <Mail className="h-4 w-4 text-blue-500" />
              Send a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="grid gap-2.5 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-[12px] font-medium text-gray-700">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9 text-[13px]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-[12px] font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-9 text-[13px]"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="subject" className="text-[12px] font-medium text-gray-700">Subject</Label>
                <Input
                  id="subject"
                  placeholder="How can I help you?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="h-9 text-[13px]"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="message" className="text-[12px] font-medium text-gray-700">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell me about your project..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="min-h-[80px] text-[13px] resize-none"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-9 bg-green-600 hover:bg-green-700 touch-manipulation active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
              <Phone className="h-4 w-4 text-blue-500" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-gray-200 bg-white shadow-sm">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2.5 md:gap-3">
                      <div className="h-9 w-9 rounded-lg bg-gray-200 animate-pulse md:h-10 md:w-10" />
                      <div className="flex-1">
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {contactInfo.length === 0 && !isEditMode ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No contact info yet</p>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="space-y-3"
                >
                  {contactInfo.map((info: any) => (
                    <ContactInfoItem
                      key={info.id}
                      info={info}
                      isEditMode={isEditMode}
                      refetch={refetch}
                    />
                  ))}
                  {isEditMode && (
                    <motion.div variants={itemVariants}>
                      <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-orange-400 transition-colors cursor-pointer"
                        onClick={handleAddContactInfo}
                      >
                        <CardContent className="flex items-center justify-center p-6">
                          <div className="text-center">
                            <Plus className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-600">Add Contact Info</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Follow Me Card */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
              <Share2 className="h-4 w-4 text-blue-500" />
              Follow Me
            </CardTitle>
                </CardHeader>
          <CardContent className="pt-0">
                  {socialLinks.length === 0 && !isEditMode ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No social links yet
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {socialLinks.map((social: any) => (
                        <SocialLinkItem
                          key={social.id}
                          social={social}
                          isEditMode={isEditMode}
                          refetch={refetch}
                        />
                      ))}
                      {isEditMode && (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-orange-400 transition-colors cursor-pointer md:h-10 md:w-10"
                          onClick={handleAddSocialLink}
                        >
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

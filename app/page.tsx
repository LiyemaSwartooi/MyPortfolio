"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthRedirect } from "./auth-redirect"
import { 
  ArrowLeft, 
  Home as HomeIcon, 
  ChevronDown, 
  Plus, 
  Mic,
  Link2,
  Info,
  MoreVertical,
  MessageCircle,
  Image as ImageIcon,
  FileText,
  User,
  Sparkles,
  Folder,
  Chrome,
  MessageSquare,
  Palette,
  Globe,
  Box,
  Trophy,
  Star,
  Briefcase,
  Code,
  FolderKanban,
  GraduationCap,
  Mail,
  Award,
  Grid3x3,
  LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GeneralChat } from "@/components/content/GeneralChat"
import { About } from "@/components/content/About"
import { Experience } from "@/components/content/Experience"
import { Skills } from "@/components/content/Skills"
import { Projects } from "@/components/content/Projects"
import { Education } from "@/components/content/Education"
import { Achievements } from "@/components/content/Achievements"
import { Certificates } from "@/components/content/Certificates"
import { Resume } from "@/components/content/Resume"
import { JourneyGallery } from "@/components/content/JourneyGallery"
import { Testimonials } from "@/components/content/Testimonials"
import { Contact } from "@/components/content/Contact"
import { ProfileSection } from "@/components/sidebar/ProfileSection"
import { EditModeProvider, useEditMode } from "@/contexts/EditModeContext"
import { ChatProvider, useChat } from "@/contexts/ChatContext"
import { Pencil, DoorOpen } from "lucide-react"

type Section = "home" | "about" | "experience" | "skills" | "projects" | "education" | "achievements" | "certificates" | "resume" | "journey" | "testimonials" | "contact"

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [model, setModel] = useState("smart")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeSection, setActiveSection] = useState<Section>("home")
  const [projectsViewMode, setProjectsViewMode] = useState<"slideshow" | "grid">("slideshow")
  const [certificatesViewMode, setCertificatesViewMode] = useState<"slideshow" | "grid">("slideshow")
  const [isMobile, setIsMobile] = useState(false)
  const { isEditMode, toggleEditMode, canEdit } = useEditMode()
  const { isChatting } = useChat()

  // Initialize section from URL on mount
  useEffect(() => {
    const section = searchParams.get('section') as Section
    if (section && ['home', 'about', 'experience', 'skills', 'projects', 'achievements', 'education', 'certificates', 'resume', 'journey', 'testimonials', 'contact'].includes(section)) {
      setActiveSection(section)
    }
  }, [])

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Close sidebar by default on mobile
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar when selecting a section on mobile and update URL
  const handleSectionChange = (section: Section) => {
    setActiveSection(section)
    
    // Update URL with section parameter
    const params = new URLSearchParams(searchParams.toString())
    if (section === 'home') {
      params.delete('section')
    } else {
      params.set('section', section)
    }
    
    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : '/'
    router.push(newUrl, { scroll: false })
    
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Listen for navigation events from GeneralChat dropdown
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const section = event.detail as Section
      if (section && ['home', 'about', 'experience', 'skills', 'projects', 'achievements', 'education', 'certificates', 'resume', 'journey', 'testimonials', 'contact'].includes(section)) {
        handleSectionChange(section)
      }
    }

    window.addEventListener('navigate', handleNavigate as EventListener)
    return () => window.removeEventListener('navigate', handleNavigate as EventListener)
  }, [isMobile])

  // Landscape background images
  const backgroundImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop", // Mountain landscape
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop", // Forest path
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop", // Lake and mountains
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop", // Ocean waves
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=2070&auto=format&fit=crop", // Tropical sunset
  ]

  // Auto-rotate background images every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      )
    }, 8000)

    return () => clearInterval(interval)
  }, [backgroundImages.length])

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Background Image Slideshow */}
      <div className="fixed inset-0 -z-10">
        {/* Background Images with fade transition */}
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-2000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
            }}
          />
        ))}
        
        {/* Overlay gradient for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-blue-800/5 to-transparent" />
        
        {/* Subtle blur for depth */}
        <div className="absolute inset-0 backdrop-blur-[0.3px]" />
      </div>

      {/* Mobile Backdrop - Only visible on mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-60 bg-white shadow-lg transition-transform duration-300 md:z-20 ${sidebarOpen ? 'translate-x-0' : '-translate-x-60'} ${isMobile ? 'backdrop-blur-xl' : ''}`}>
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 md:px-4 md:py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#FF6B35] via-[#F7931E] to-[#FDC830] md:h-6 md:w-6">
                <Sparkles className="h-3 w-3 text-white md:h-3 md:w-3" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-gray-900 md:text-sm">My Portfolio</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-11 w-11 text-gray-500 hover:bg-blue-50 hover:text-blue-600 touch-manipulation md:h-7 md:w-7"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg className="h-5 w-5 md:h-4 md:w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18" />
              </svg>
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto px-3 py-4 md:px-3 md:py-4">
            {/* Main Section */}
            <nav className="space-y-1 mb-6 md:mb-6">
              <button 
                onClick={() => handleSectionChange("home")}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all touch-manipulation min-h-[44px] md:px-3 md:py-2.5 ${
                  activeSection === "home" ? "bg-transparent border-l-2 border-orange-500" : "hover:bg-gray-100 active:bg-gray-100"
                }`}
              >
                <HomeIcon className={`h-5 w-5 shrink-0 ${activeSection === "home" ? "text-orange-500" : "text-orange-500"} md:h-4 md:w-4`} strokeWidth={2} />
                <span className={`text-base font-medium ${activeSection === "home" ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"} md:text-sm`}>Home</span>
              </button>
            </nav>

            {/* About Section */}
            <div className="mb-6 md:mb-6">
              <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 md:text-[10px]">About</h3>
              <nav className="space-y-1 md:space-y-1">
                <button 
                  onClick={() => handleSectionChange("about")}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all touch-manipulation min-h-[44px] md:px-3 md:py-2.5 ${
                    activeSection === "about" ? "bg-transparent border-l-2 border-blue-500" : "hover:bg-gray-100 active:bg-gray-100"
                  }`}
                >
                  <User className={`h-5 w-5 shrink-0 ${activeSection === "about" ? "text-blue-500" : "text-blue-500"} md:h-4 md:w-4`} strokeWidth={2} />
                  <span className={`text-base font-medium ${activeSection === "about" ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"} md:text-sm`}>About Me</span>
                </button>
              </nav>
            </div>

            {/* Professional Section */}
            <div className="mb-6 md:mb-6">
              <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 md:text-[10px]">Professional</h3>
              <nav className="space-y-1 md:space-y-1">
                <button 
                  onClick={() => handleSectionChange("experience")}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all touch-manipulation min-h-[44px] md:px-3 md:py-2.5 ${
                    activeSection === "experience" ? "bg-transparent border-l-2 border-purple-500" : "hover:bg-gray-100 active:bg-gray-100"
                  }`}
                >
                  <Briefcase className={`h-5 w-5 shrink-0 ${activeSection === "experience" ? "text-purple-500" : "text-purple-500"} md:h-4 md:w-4`} strokeWidth={2} />
                  <span className={`text-base font-medium ${activeSection === "experience" ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"} md:text-sm`}>Experience</span>
                </button>

                <button 
                  onClick={() => handleSectionChange("skills")}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all touch-manipulation min-h-[44px] md:px-3 md:py-2.5 ${
                    activeSection === "skills" ? "bg-transparent border-l-2 border-blue-500" : "hover:bg-gray-100 active:bg-gray-100"
                  }`}
                >
                  <Code className={`h-5 w-5 shrink-0 ${activeSection === "skills" ? "text-blue-500" : "text-blue-500"} md:h-4 md:w-4`} strokeWidth={2} />
                  <span className={`text-base font-medium ${activeSection === "skills" ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"} md:text-sm`}>Skills</span>
                </button>
              </nav>
            </div>

            {/* Portfolio Section */}
            <div className="mb-6 md:mb-6">
              <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 md:text-[10px]">My Portfolio</h3>
              <nav className="space-y-1 md:space-y-1">
                <button 
                  onClick={() => handleSectionChange("projects")}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all touch-manipulation min-h-[44px] md:px-3 md:py-2.5 ${
                    activeSection === "projects" ? "bg-transparent border-l-2 border-red-500" : "hover:bg-gray-100 active:bg-gray-100"
                  }`}
                >
                  <FolderKanban className={`h-5 w-5 shrink-0 ${activeSection === "projects" ? "text-red-500" : "text-red-500"} md:h-4 md:w-4`} strokeWidth={2} />
                  <span className={`text-base font-medium ${activeSection === "projects" ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"} md:text-sm`}>Projects</span>
                </button>

                <button 
                  onClick={() => handleSectionChange("achievements")}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all touch-manipulation min-h-[44px] md:px-3 md:py-2.5 ${
                    activeSection === "achievements" ? "bg-transparent border-l-2 border-yellow-600" : "hover:bg-gray-100 active:bg-gray-100"
                  }`}
                >
                  <Trophy className={`h-5 w-5 shrink-0 ${activeSection === "achievements" ? "text-yellow-600" : "text-yellow-600"} md:h-4 md:w-4`} strokeWidth={2} />
                  <span className={`text-base font-medium ${activeSection === "achievements" ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"} md:text-sm`}>Achievements</span>
                </button>
              </nav>
            </div>

            {/* Education & Growth Section */}
            <div className="mb-6 md:mb-6">
              <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 md:text-[10px]">Education</h3>
              <nav className="space-y-1 md:space-y-1">
                <button 
                  onClick={() => handleSectionChange("education")}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all touch-manipulation min-h-[44px] md:px-3 md:py-2.5 ${
                    activeSection === "education" ? "bg-transparent border-l-2 border-purple-500" : "hover:bg-gray-100 active:bg-gray-100"
                  }`}
                >
                  <GraduationCap className={`h-5 w-5 shrink-0 ${activeSection === "education" ? "text-purple-500" : "text-purple-500"} md:h-4 md:w-4`} strokeWidth={2} />
                  <span className={`text-base font-medium ${activeSection === "education" ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"} md:text-sm`}>Education</span>
                </button>

                <button 
                  onClick={() => handleSectionChange("certificates")}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all touch-manipulation min-h-[44px] md:px-3 md:py-2.5 ${
                    activeSection === "certificates" ? "bg-transparent border-l-2 border-orange-500" : "hover:bg-gray-100 active:bg-gray-100"
                  }`}
                >
                  <Award className={`h-5 w-5 shrink-0 ${activeSection === "certificates" ? "text-orange-500" : "text-orange-500"} md:h-4 md:w-4`} strokeWidth={2} />
                  <span className={`text-base font-medium ${activeSection === "certificates" ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"} md:text-sm`}>Certificates</span>
                </button>
              </nav>
            </div>

            {/* Resume Section */}
            <div className="mb-6 md:mb-6">
              <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 md:text-[10px]">Resume</h3>
              <nav className="space-y-1 md:space-y-1">
                <button 
                  onClick={() => handleSectionChange("resume")}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all touch-manipulation min-h-[44px] md:px-3 md:py-2.5 ${
                    activeSection === "resume" ? "bg-transparent border-l-2 border-indigo-500" : "hover:bg-gray-100 active:bg-gray-100"
                  }`}
                >
                  <FileText className={`h-5 w-5 shrink-0 ${activeSection === "resume" ? "text-indigo-500" : "text-indigo-500"} md:h-4 md:w-4`} strokeWidth={2} />
                  <span className={`text-base font-medium ${activeSection === "resume" ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"} md:text-sm`}>View CV</span>
                </button>
              </nav>
            </div>

            {/* More Section */}
            <div className="md:mb-0">
              <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 md:text-[10px]">More</h3>
              <nav className="space-y-1 md:space-y-1">
                <button 
                  onClick={() => handleSectionChange("journey")}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all touch-manipulation min-h-[44px] md:px-3 md:py-2.5 ${
                    activeSection === "journey" ? "bg-transparent border-l-2 border-green-500" : "hover:bg-gray-100 active:bg-gray-100"
                  }`}
                >
                  <ImageIcon className={`h-5 w-5 shrink-0 ${activeSection === "journey" ? "text-green-500" : "text-green-500"} md:h-4 md:w-4`} strokeWidth={2} />
                  <span className={`text-base font-medium ${activeSection === "journey" ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"} md:text-sm`}>Journey</span>
                </button>

                <button 
                  onClick={() => handleSectionChange("testimonials")}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all touch-manipulation min-h-[44px] md:px-3 md:py-2.5 ${
                    activeSection === "testimonials" ? "bg-transparent border-l-2 border-pink-500" : "hover:bg-gray-100 active:bg-gray-100"
                  }`}
                >
                  <Star className={`h-5 w-5 shrink-0 ${activeSection === "testimonials" ? "text-pink-500" : "text-pink-500"} md:h-4 md:w-4`} strokeWidth={2} />
                  <span className={`text-base font-medium ${activeSection === "testimonials" ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"} md:text-sm`}>Testimonials</span>
                </button>

                <button 
                  onClick={() => handleSectionChange("contact")}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all touch-manipulation min-h-[44px] md:px-3 md:py-2.5 ${
                    activeSection === "contact" ? "bg-transparent border-l-2 border-cyan-500" : "hover:bg-gray-100 active:bg-gray-100"
                  }`}
                >
                  <Mail className={`h-5 w-5 shrink-0 ${activeSection === "contact" ? "text-cyan-500" : "text-cyan-500"} md:h-4 md:w-4`} strokeWidth={2} />
                  <span className={`text-base font-medium ${activeSection === "contact" ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"} md:text-sm`}>Contact</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Profile Section - Bottom */}
          <ProfileSection />
        </div>
      </aside>

      {/* Main Content */}
      <div className={`relative z-10 flex h-screen flex-1 flex-col overflow-y-auto transition-all duration-300 ${!isMobile && sidebarOpen ? 'md:ml-60' : 'md:ml-0'}`}>
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between px-4 py-3 md:px-3 md:py-2.5">
          <div className="flex items-center gap-2 md:gap-2">
            {/* Toggle Sidebar Button - Always visible on mobile, only when closed on desktop */}
            {(isMobile || !sidebarOpen) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-11 w-11 text-white/90 hover:bg-white/15 hover:text-white touch-manipulation md:h-7 md:w-7"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="h-5 w-5 md:h-4 md:w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18" />
                </svg>
              </Button>
            )}
          </div>
          
          {/* View Toggle & Window Controls */}
          <div className="flex items-center gap-2 md:gap-2">
            {/* View Toggle - Only show for Projects */}
            {activeSection === "projects" && (
              <div className="mr-0 flex items-center gap-1.5 p-0 md:mr-2 md:gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setProjectsViewMode("slideshow")}
                  className={`h-11 min-w-[44px] px-3 text-xs touch-manipulation md:h-6 md:px-2.5 md:text-[11px] ${
                    projectsViewMode === "slideshow"
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15"
                  }`}
                >
                  <LayoutGrid className="mr-1.5 h-4 w-4 md:mr-1 md:h-3 md:w-3" />
                  <span className="hidden sm:inline text-xs md:text-[11px]">Slideshow</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setProjectsViewMode("grid")}
                  className={`h-11 min-w-[44px] px-3 text-xs touch-manipulation md:h-6 md:px-2.5 md:text-[11px] ${
                    projectsViewMode === "grid"
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15"
                  }`}
                >
                  <Grid3x3 className="mr-1.5 h-4 w-4 md:mr-1 md:h-3 md:w-3" />
                  <span className="hidden sm:inline text-xs md:text-[11px]">Grid</span>
                </Button>
              </div>
            )}

            {/* View Toggle - Only show for Certificates */}
            {activeSection === "certificates" && (
              <div className="mr-0 flex items-center gap-1.5 p-0 md:mr-2 md:gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCertificatesViewMode("slideshow")}
                  className={`h-11 min-w-[44px] px-3 text-xs touch-manipulation md:h-6 md:px-2.5 md:text-[11px] ${
                    certificatesViewMode === "slideshow"
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15"
                  }`}
                >
                  <LayoutGrid className="mr-1.5 h-4 w-4 md:mr-1 md:h-3 md:w-3" />
                  <span className="hidden sm:inline text-xs md:text-[11px]">Slideshow</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCertificatesViewMode("grid")}
                  className={`h-11 min-w-[44px] px-3 text-xs touch-manipulation md:h-6 md:px-2.5 md:text-[11px] ${
                    certificatesViewMode === "grid"
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15"
                  }`}
                >
                  <Grid3x3 className="mr-1.5 h-4 w-4 md:mr-1 md:h-3 md:w-3" />
                  <span className="hidden sm:inline text-xs md:text-[11px]">Grid</span>
                </Button>
              </div>
            )}

            {/* Edit Mode Toggle & Auth - Only show in sections other than home */}
            {activeSection !== "home" && (
              <div className="flex items-center gap-2 md:gap-2">
                {/* Show Edit button only when authenticated */}
                {canEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={toggleEditMode}
                    className="h-11 min-w-[44px] px-4 text-sm text-white/90 hover:bg-white/15 hover:text-white transition-all touch-manipulation md:h-7 md:px-3 md:text-xs"
                    title={isEditMode ? "Click to exit edit mode" : "Click to enter edit mode"}
                  >
                    {isEditMode ? (
                      <>
                        <DoorOpen className="h-4 w-4 mr-2 md:h-3.5 md:w-3.5 md:mr-1.5" />
                        <span className="text-sm font-medium hidden sm:inline md:text-xs">Exit Edit Mode</span>
                      </>
                    ) : (
                      <>
                        <Pencil className="h-4 w-4 mr-2 md:h-3.5 md:w-3.5 md:mr-1.5" />
                        <span className="text-sm font-medium hidden sm:inline md:text-xs">Edit</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className={`flex flex-1 flex-col px-4 pb-6 md:px-6 md:pb-8 ${activeSection === "home" && isChatting ? '' : 'items-center justify-center'}`}>
          {activeSection === "home" && <GeneralChat model={model} setModel={setModel} setSidebarOpen={setSidebarOpen} />}
          {activeSection === "about" && <About />}
          {activeSection === "experience" && <Experience />}
          {activeSection === "skills" && <Skills />}
          {activeSection === "projects" && <Projects viewMode={projectsViewMode} setViewMode={setProjectsViewMode} />}
          {activeSection === "achievements" && <Achievements />}
          {activeSection === "education" && <Education />}
          {activeSection === "certificates" && <Certificates viewMode={certificatesViewMode} setViewMode={setCertificatesViewMode} />}
          {activeSection === "resume" && <Resume />}
          {activeSection === "journey" && <JourneyGallery />}
          {activeSection === "testimonials" && <Testimonials />}
          {activeSection === "contact" && <Contact />}
        </main>

      </div>
    </div>
  )
}

export default function Home() {
  return (
    <EditModeProvider>
      <ChatProvider>
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
          {/* CRITICAL SECURITY: Redirect OAuth codes immediately */}
          <AuthRedirect />
          <HomeContent />
        </Suspense>
      </ChatProvider>
    </EditModeProvider>
  )
}

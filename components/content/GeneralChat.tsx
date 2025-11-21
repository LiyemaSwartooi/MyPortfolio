"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Plus, 
  Trash2,
  Link2,
  MessageCircle,
  Send,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChatMessage } from "@/components/content/ChatMessage"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useChat } from "@/contexts/ChatContext"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  API_ENDPOINTS, 
  CHAT_CONFIG, 
  CHAT_CATEGORY_LABELS, 
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  STORAGE_KEYS,
  UI_CONFIG
} from "@/lib/constants"

interface GeneralChatProps {
  model: string
  setModel: (model: string) => void
  setSidebarOpen?: (open: boolean) => void
}

interface ChatMessageType {
  id: string
  message: string
  is_user: boolean
  created_at: string
  category?: string
}

export function GeneralChat({ model, setModel, setSidebarOpen }: GeneralChatProps) {
  const [inputValue, setInputValue] = useState("")
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { setIsChatting } = useChat()
  const [sessionId] = useState(() => {
    // Generate or retrieve session ID from localStorage
    if (typeof window !== 'undefined') {
      // Check if there's a shared chat ID in URL
      const urlParams = new URLSearchParams(window.location.search)
      const sharedChatId = urlParams.get('chat')
      
      if (sharedChatId) {
        // Use shared chat session
        localStorage.setItem('chat_session_id', sharedChatId)
        toast.info('Viewing shared chat session')
        return sharedChatId
      }
      
      let session = localStorage.getItem('chat_session_id')
      if (!session) {
        session = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('chat_session_id', session)
      }
      return session
    }
    return `session_${Date.now()}`
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const slideshowTexts = [
    "Your AI Assistant to Discover about Me",
    "Ask me anything about my work, experience, or skills",
    "Explore my projects and achievements",
    "Learn about my technical expertise",
    "Discover my professional journey",
    "Get insights into my skills and capabilities",
  ]

  // Get category-specific suggested questions
  function getSuggestedQuestions(category: string): string[] {
    const questions: Record<string, string[]> = {
      "smart": [
        "Tell me about yourself",
        "What are your main projects?",
        "What's your professional background?",
        "What technologies do you specialize in?",
        "What are your key achievements?",
      ],
      "fast": [
        "What projects have you worked on?",
        "Tell me about your most recent project",
        "What technologies did you use in your projects?",
        "Do you have any open-source projects?",
        "What's your project development process?",
      ],
      "creative": [
        "What's your work experience?",
        "Tell me about your current role",
        "What companies have you worked for?",
        "What are your key responsibilities?",
        "What challenges have you overcome?",
      ],
      "skills": [
        "What programming languages do you know?",
        "What frameworks and tools do you use?",
        "What are your strongest technical skills?",
        "How do you stay updated with technology?",
        "What soft skills do you have?",
      ],
      "achievements": [
        "What are your major achievements?",
        "Have you won any awards?",
        "What recognitions have you received?",
        "Tell me about your accomplishments",
        "What are you most proud of?",
      ],
      "education": [
        "What's your educational background?",
        "What degrees do you have?",
        "Tell me about your certifications",
        "What courses have you completed?",
        "What did you study?",
      ],
      "certificates": [
        "What certifications do you have?",
        "Tell me about your professional certificates",
        "Are your certificates still valid?",
        "What skills did you gain from certifications?",
        "When did you get certified?",
      ],
      "testimonials": [
        "What do people say about working with you?",
        "Do you have any client testimonials?",
        "What feedback have you received?",
        "Tell me about recommendations",
        "What do colleagues say about you?",
      ],
      "contact": [
        "How can I reach you?",
        "What's your email address?",
        "Are you available for freelance work?",
        "What's the best way to contact you?",
        "Do you have social media profiles?",
      ],
    }
    return questions[category] || questions["smart"]
  }

  // Load chat history
  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch(`/api/chat?sessionId=${sessionId}`)
        const data = await response.json()
        if (data.success && data.messages) {
          setMessages(data.messages)
        }
      } catch (error) {
        // Silently fail - user can still use chat
      } finally {
        setIsLoadingHistory(false)
      }
    }
    loadHistory()
  }, [sessionId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue])

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true)
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % slideshowTexts.length)
        setIsFading(false)
      }, 300)
    }, 3000)

    return () => clearInterval(interval)
  }, [slideshowTexts.length])

  // Validate and suggest correct category based on question
  const detectQuestionCategory = (question: string): string | null => {
    const lowerQuestion = question.toLowerCase()
    
    // Category keywords mapping
    const categoryKeywords = {
      fast: ['project', 'portfolio', 'built', 'developed', 'demo', 'github', 'application', 'app', 'website'],
      creative: ['experience', 'work', 'job', 'company', 'role', 'position', 'career', 'worked'],
      skills: ['skill', 'technology', 'language', 'framework', 'tool', 'programming', 'technical', 'expertise'],
      achievements: ['achievement', 'award', 'recognition', 'accomplishment', 'honor', 'prize', 'won'],
      education: ['education', 'degree', 'university', 'college', 'school', 'studied', 'graduate', 'bachelor', 'master'],
      certificates: ['certificate', 'certification', 'certified', 'credential', 'license'],
      testimonials: ['testimonial', 'review', 'feedback', 'recommendation', 'reference'],
      contact: ['contact', 'email', 'phone', 'reach', 'hire', 'available', 'connect'],
    }

    // Check each category
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
        return category
      }
    }

    return null // No specific category detected
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    
    // Validate category match (skip for "All Topics")
    if (model !== 'smart') {
      const detectedCategory = detectQuestionCategory(userMessage)
      
      if (detectedCategory && detectedCategory !== model) {
        const categoryNames: Record<string, string> = {
          fast: "Projects",
          creative: "Experience",
          skills: "Skills",
          achievements: "Achievements",
          education: "Education",
          certificates: "Certificates",
          testimonials: "Testimonials",
          contact: "Contact"
        }
        
        const currentCategoryName = categoryNames[model] || model
        const suggestedCategoryName = categoryNames[detectedCategory] || detectedCategory
        
        // Show error and prevent sending
        toast.error(`Category mismatch`, {
          description: `Your question is about ${suggestedCategoryName}, but you selected ${currentCategoryName}. Please switch to "${suggestedCategoryName}" or select "All Topics".`
        })
        
        // Don't send the message, just return
        return
      }
    }

    setInputValue("")
    setIsLoading(true)

    // Add user message immediately
    const tempUserMessage: ChatMessageType = {
      id: `temp_${Date.now()}`,
      message: userMessage,
      is_user: true,
      created_at: new Date().toISOString(),
      category: model,
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        message: msg.message,
        is_user: msg.is_user,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          category: model,
          conversationHistory,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Replace temp message with actual message and add AI response
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMessage.id)
          return [
            ...filtered,
            { ...data.userMessage, id: data.userMessage.id || `user_${Date.now()}` },
            { ...data.aiMessage, id: data.aiMessage.id || `ai_${Date.now()}` },
          ]
        })
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleDeleteChat = async () => {
    try {
      // Delete messages from database
      const response = await fetch(`/api/chat?sessionId=${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete chat from database')
      }

      // Clear messages from state
      setMessages([])
      setInputValue("")
      setIsChatting(false)
      
      // Clear session from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chat_session_id')
        // Generate new session
        const newSession = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('chat_session_id', newSession)
      }
      
      toast.success(SUCCESS_MESSAGES.DELETED)
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error(ERROR_MESSAGES.GENERIC)
    }
  }

  // Handle new chat session
  const handleNewChat = () => {
    // Clear current session and start fresh
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chat_session_id')
      // Remove any shared chat URL parameter
      const url = new URL(window.location.href)
      url.searchParams.delete('chat')
      window.history.replaceState({}, '', url.toString())
      
      // Reload to start with fresh session
      window.location.reload()
    }
  }

  // Handle share/copy chat link
  const handleCopyLink = async () => {
    try {
      // Create a shareable link with session ID
      const shareUrl = `${window.location.origin}?chat=${sessionId}`
      
      await navigator.clipboard.writeText(shareUrl)
      toast.success(SUCCESS_MESSAGES.COPIED)
    } catch (error) {
      toast.error(ERROR_MESSAGES.GENERIC)
    }
  }

  // Show chat interface when there are messages or user is typing
  const showChatInterface = messages.length > 0 || inputValue.trim().length > 0

  // Update chat context
  useEffect(() => {
    setIsChatting(showChatInterface)
  }, [showChatInterface, setIsChatting])

  return (
    <div className={`w-full flex flex-col ${showChatInterface ? 'h-full relative' : 'max-w-[680px]'}`}>
      {/* Greeting Section - Compact - Hide when chatting */}
      {!showChatInterface && (
      <div className="mb-6 text-center md:mb-6">
        <h2 className="mb-2 text-2xl font-semibold leading-[1.2] tracking-[-0.01em] text-white md:text-[36px] md:mb-1.5 md:leading-[1.15]">
          Welcome to My Portfolio
        </h2>
        <p className={`text-base font-normal leading-[1.5] text-white/90 transition-opacity duration-500 md:text-[20px] md:leading-[1.3] ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          {slideshowTexts[currentTextIndex]}
        </p>
      </div>
      )}

      {/* Chat Messages - Compact - Full height when chatting, scrollable */}
      {showChatInterface && messages.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-4 px-4 py-4 min-h-0 w-full max-w-3xl mx-auto md:space-y-3 md:px-3" style={{ paddingBottom: '120px' }}>
          {isLoadingHistory ? (
            <div className="space-y-4 md:space-y-3">
              <Skeleton className="h-16 w-full md:h-14" />
              <Skeleton className="h-16 w-3/4 ml-auto md:h-14" />
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg.message}
                  isUser={msg.is_user}
                  timestamp={msg.created_at}
                />
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start md:gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 md:h-7 md:w-7">
                    <Loader2 className="h-4 w-4 text-white animate-spin md:h-3.5 md:w-3.5" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 md:px-3 md:py-2">
                    <div className="flex gap-1.5 md:gap-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce md:h-1.5 md:w-1.5" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce md:h-1.5 md:w-1.5" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce md:h-1.5 md:w-1.5" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      )}

      {/* Input Section - Compact - Fixed at bottom when chatting */}
      <div className={`w-full ${showChatInterface ? 'fixed bottom-0 left-0 right-0 pt-3 pb-6 z-50 flex justify-center md:pb-5' : 'mb-4 md:mb-5'}`}>
        <div className={`flex flex-col rounded-xl bg-white px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.08)] md:rounded-[16px] md:px-3.5 md:py-2.5 ${showChatInterface ? 'w-full max-w-3xl mx-4 md:mx-auto' : 'mx-4 md:mx-0'}`}>
          {/* Input Field - Compact - Top */}
          <Textarea
            ref={textareaRef}
            placeholder="Ask about my projects, experience, or skills..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              // Close sidebar when user starts typing
              if (e.target.value.trim() && setSidebarOpen) {
                setSidebarOpen(false)
              }
            }}
            onFocus={() => {
              // Close sidebar when input is focused
              if (setSidebarOpen) {
                setSidebarOpen(false)
              }
            }}
            onKeyDown={handleKeyDown}
            className="min-h-[24px] w-full resize-none !border-0 !border-none bg-transparent px-0 py-1 text-base text-gray-800 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:!border-0 focus-visible:!border-none rounded-none shadow-none outline-none md:text-[14px] md:min-h-[22px] md:py-0.5"
            rows={1}
            disabled={isLoading}
          />

          {/* Bottom Row - Compact: Model Selector + Icons */}
          <div className="flex items-center justify-between pt-2 md:pt-1.5">
            {/* Category Selector - Compact - Left Side */}
            <div className="flex items-center gap-2 md:gap-1.5">
              <MessageCircle className="h-4 w-4 text-gray-500 md:h-3.5 md:w-3.5" />
              <Select value={model} onValueChange={(value) => {
                setModel(value)
                // Just set the category for context, no navigation
              }}>
                <SelectTrigger className="h-8 w-auto border border-gray-300 rounded-md bg-transparent px-2 text-xs shadow-none hover:bg-gray-50 focus:ring-0 cursor-pointer touch-manipulation md:h-6 md:px-1.5 md:text-[11px] md:rounded-sm md:border-[0.5px]">
                  <SelectValue>
                    <span className="font-normal text-gray-600">
                      {model === "smart" ? "All Topics" : 
                       model === "fast" ? "Projects" : 
                       model === "creative" ? "Experience" :
                       model === "skills" ? "Skills" :
                       model === "achievements" ? "Achievements" :
                       model === "education" ? "Education" :
                       model === "certificates" ? "Certificates" :
                       model === "testimonials" ? "Testimonials" :
                       model === "contact" ? "Contact" : "All Topics"}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smart">All Topics</SelectItem>
                  <SelectItem value="fast">Projects</SelectItem>
                  <SelectItem value="creative">Experience</SelectItem>
                  <SelectItem value="skills">Skills</SelectItem>
                  <SelectItem value="achievements">Achievements</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="certificates">Certificates</SelectItem>
                  <SelectItem value="testimonials">Testimonials</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right Side Icons - Compact - Show submit button when typing */}
            <div className="flex items-center gap-1.5 md:gap-0.5">
            {inputValue.trim() ? (
                <Button 
                  size="icon" 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="h-11 w-11 rounded-full bg-gray-900 hover:bg-gray-800 touch-manipulation disabled:opacity-50 md:h-7 md:w-7"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin md:h-3.5 md:w-3.5" />
                  ) : (
                    <Send className="h-5 w-5 text-white md:h-3.5 md:w-3.5" />
                  )}
                </Button>
            ) : (
                <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNewChat}
                  className="h-11 w-11 hover:bg-gray-100 touch-manipulation active:bg-gray-200 md:h-7 md:w-7"
                  title="Start new chat"
                >
                  <Plus className="h-5 w-5 text-gray-600 md:h-3.5 md:w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCopyLink}
                  className="h-11 w-11 hover:bg-gray-100 touch-manipulation active:bg-gray-200 md:h-7 md:w-7"
                  title="Copy chat link"
                  disabled={messages.length === 0}
                >
                  <Link2 className={`h-5 w-5 ${messages.length === 0 ? 'text-gray-400' : 'text-gray-600'} md:h-3.5 md:w-3.5`} />
                </Button>
                </>
              )}
              {messages.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-11 w-11 hover:bg-red-50 hover:text-red-600 touch-manipulation active:bg-red-100 md:h-7 md:w-7"
                  title="Clear chat"
                >
                  <Trash2 className="h-5 w-5 text-gray-600 md:h-3.5 md:w-3.5" />
                </Button>
              )}
              </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons - Compact - Hide when chatting, show category-specific questions */}
      {!showChatInterface && (
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 px-4 md:mb-8 md:gap-1.5 md:px-0">
        {getSuggestedQuestions(model).map((action) => (
          <Button
            key={action}
            variant="outline"
            className="h-10 min-h-[44px] rounded-full border-gray-200 bg-gray-50/80 px-4 text-sm font-normal text-gray-700 shadow-none hover:bg-gray-100 hover:border-gray-300 touch-manipulation active:bg-gray-200 md:h-8 md:px-3 md:px-4 md:text-[11px] md:text-[12px]"
            onClick={() => {
              setInputValue(action)
              // Close sidebar when suggested question is clicked
              if (setSidebarOpen) {
                setSidebarOpen(false)
              }
            }}
          >
            {action}
          </Button>
        ))}
      </div>
      )}


      {/* Delete Chat Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px] mx-4 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-base">Clear Chat</DialogTitle>
            <DialogDescription className="text-base md:text-sm">
              Are you sure you want to clear all chat messages? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="w-full h-11 min-h-[44px] touch-manipulation sm:w-auto sm:h-auto sm:mr-2"
            >
              Cancel
              </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChat}
              className="w-full h-11 min-h-[44px] bg-red-600 hover:bg-red-700 touch-manipulation sm:w-auto sm:h-auto"
            >
              Delete
                </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
  )
}

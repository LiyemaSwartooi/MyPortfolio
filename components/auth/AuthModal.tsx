"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { X, Loader2, Mail, Lock, User, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

type AuthMode = "login" | "signup" | "forgot-password"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: AuthMode
}

export function AuthModal({ open, onOpenChange, initialMode = "login" }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialMode || "login")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const emailInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setMode(initialMode || "login")
      setErrors({})
      const frame = requestAnimationFrame(() => {
        emailInputRef.current?.focus()
      })
      return () => cancelAnimationFrame(frame)
    } else {
      setEmail("")
      setPassword("")
      setFullName("")
      setErrors({})
      setIsLoading(false)
    }
  }, [open, initialMode])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, isLoading, onOpenChange])

  const handleDialogClose = useCallback(() => {
    if (!isLoading) {
      onOpenChange(false)
    }
  }, [onOpenChange, isLoading])

  const switchMode = useCallback((newMode: AuthMode) => {
    if (isLoading || newMode === mode) return
    setErrors({})
    setPassword("")
    if (newMode === 'login') {
      setFullName("")
    }
    setMode(newMode)
  }, [mode, isLoading])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setErrors({})

    // Basic validation
    if (!email) {
      setErrors({ email: "Email is required" })
      return
    }
    if (!email.includes("@")) {
      setErrors({ email: "Please enter a valid email" })
      return
    }
    if (mode !== 'forgot-password' && !password) {
      setErrors({ password: "Password is required" })
      return
    }
    if (mode === 'signup' && !fullName) {
      setErrors({ fullName: "Full name is required" })
      return
    }
    if (mode !== 'forgot-password' && password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" })
      return
    }

    setIsLoading(true)

    try {
      if (mode === 'login') {
        const result = await signIn(email, password)
        if (result.data) {
          handleDialogClose()
        } else if (result.error) {
          setErrors({ password: result.error.message || "Invalid credentials" })
        }
      } else if (mode === 'signup') {
        const result = await signUp(email, password, fullName)
        if (result.data) {
          handleDialogClose()
          toast.success("Please check your email to verify your account")
        } else if (result.error) {
          setErrors({ email: result.error.message || "Failed to create account" })
        }
      } else if (mode === 'forgot-password') {
        // TODO: Implement forgot password
        toast.info("Password reset feature coming soon")
        setEmail("")
      }
    } finally {
      setIsLoading(false)
    }
  }, [mode, email, password, fullName, isLoading, signIn, signUp, handleDialogClose])

  if (!open) return null

  const modalTitle =
    mode === 'login'
      ? 'Welcome Back'
      : mode === 'signup'
      ? 'Create Account'
      : mode === 'forgot-password'
      ? 'Reset Password'
      : 'Authentication'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[400px] border border-gray-200 p-0 overflow-hidden rounded-xl shadow-xl bg-white [&>button]:hidden"
        onInteractOutside={(event) => {
          if (isLoading) {
            event.preventDefault()
          }
        }}
        onEscapeKeyDown={(event) => {
          if (isLoading) {
            event.preventDefault()
          }
        }}
      >
        <DialogTitle className="sr-only">
          {modalTitle}
        </DialogTitle>

        <>
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-200">
            {mode === 'forgot-password' && (
              <button
                onClick={() => switchMode('login')}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                aria-label="Back to login"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={handleDialogClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
              aria-label="Close"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content with smooth transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="px-5 py-6 space-y-3.5 overflow-y-auto max-h-[calc(90vh-80px)]"
            >
              {/* Visible Title */}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 tracking-tight" aria-hidden="true">
                  {modalTitle}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {mode === 'login' && 'Sign in to continue'}
                  {mode === 'signup' && 'Join Portfolio today'}
                  {mode === 'forgot-password' && "We'll send you a reset link"}
                </p>
              </div>

              {/* Email Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-3.5 overflow-hidden"
                noValidate
              >
                {/* Full Name (Sign Up Only) */}
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div>
                        <label
                          htmlFor="fullName"
                          className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                          <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full pl-10 pr-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:ring-offset-0 transition-all text-gray-900 placeholder-gray-400 hover:border-gray-400"
                            disabled={isLoading}
                            required
                            autoComplete="name"
                            aria-invalid={errors.fullName ? 'true' : 'false'}
                            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                          />
                        </div>
                        {errors.fullName && (
                          <p id="fullName-error" className="mt-1 text-xs text-red-600" role="alert">
                            {errors.fullName}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.2 }}
                >
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                    <Input
                      ref={emailInputRef}
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:ring-offset-0 transition-all text-gray-900 placeholder-gray-400 hover:border-gray-400"
                      disabled={isLoading}
                      required
                      autoComplete="email"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-xs text-red-600" role="alert">
                      {errors.email}
                    </p>
                  )}
                </motion.div>

                {/* Password (Not for Forgot Password) */}
                <AnimatePresence>
                  {mode !== 'forgot-password' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Password
                        </label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => switchMode('forgot-password')}
                            className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors"
                            disabled={isLoading}
                          >
                            Forgot?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full pl-10 pr-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:ring-offset-0 transition-all text-gray-900 placeholder-gray-400 hover:border-gray-400"
                          disabled={isLoading}
                          required
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                          aria-invalid={errors.password ? 'true' : 'false'}
                          aria-describedby={errors.password ? 'password-error' : undefined}
                        />
                      </div>
                      {errors.password && (
                        <p id="password-error" className="mt-1 text-xs text-red-600" role="alert">
                          {errors.password}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.2 }}
                  className="w-full mt-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2.5 text-sm rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {mode === 'signup' && 'Creating Account...'}
                        {mode === 'login' && 'Signing In...'}
                        {mode === 'forgot-password' && 'Sending Link...'}
                      </span>
                    </>
                  ) : (
                    <>
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'login' && 'Sign In'}
                      {mode === 'forgot-password' && 'Send Reset Link'}
                    </>
                  )}
                </motion.button>
              </form>

              {/* Switch Mode */}
              {mode !== 'forgot-password' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  className="text-center pt-1"
                >
                  <span className="text-sm text-gray-600">
                    {mode === 'login' ? 'New user? ' : 'Have an account? '}
                    <button
                      type="button"
                      onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                      className="text-sm text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                  </span>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      </DialogContent>
    </Dialog>
  )
}


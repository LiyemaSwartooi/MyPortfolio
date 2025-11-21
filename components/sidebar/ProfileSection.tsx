"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthModal } from "@/components/auth/AuthModal"

export function ProfileSection() {
  const { user, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-32" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="border-t border-gray-200 bg-gray-50/50">
        {user ? (
          // Signed in state
          <div className="p-4 md:p-3">
            <div className="mb-3 flex items-center gap-3 md:mb-2 md:gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 md:h-8 md:w-8">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.email}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-white md:h-4 md:w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 md:text-[11px]">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="truncate text-xs text-gray-500 md:text-[9px]">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full h-11 min-h-[44px] text-sm touch-manipulation md:h-8 md:text-[11px]"
            >
              <LogOut className="mr-2 h-4 w-4 md:mr-1.5 md:h-3 md:w-3" />
              Sign Out
            </Button>
          </div>
        ) : (
          // Not signed in state
          <div className="p-4 md:p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAuthModal(true)}
              className="w-full h-11 min-h-[44px] text-sm touch-manipulation md:h-8 md:text-[11px]"
            >
              <LogIn className="mr-2 h-4 w-4 md:mr-1.5 md:h-3 md:w-3" />
              Sign In
            </Button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        initialMode="login"
      />
    </>
  )
}


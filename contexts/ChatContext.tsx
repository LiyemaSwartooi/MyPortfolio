"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ChatContextType {
  isChatting: boolean
  setIsChatting: (isChatting: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatting, setIsChatting] = useState(false)

  return (
    <ChatContext.Provider value={{ isChatting, setIsChatting }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}


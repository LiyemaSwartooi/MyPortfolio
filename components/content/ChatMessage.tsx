"use client"

import { MessageCircle, User } from "lucide-react"

interface ChatMessageProps {
  message: string
  isUser: boolean
  timestamp: string
}

export function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <User className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      <div className={`flex flex-col gap-0.5 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-xl px-3 py-2 ${
            isUser
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        <span className="text-[9px] text-gray-500 px-0.5">
          {new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200">
          <MessageCircle className="h-3.5 w-3.5 text-gray-600" />
        </div>
      )}
    </div>
  )
}


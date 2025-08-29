'use client'

import { User, Bot } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isLoading?: boolean
}

export default function ChatMessage({ role, content, isLoading = false }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`chat-message flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-primary-500 text-white' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-primary-500 text-white rounded-br-md' 
            : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
        }`}>
          {isLoading ? (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

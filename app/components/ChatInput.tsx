'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [message])

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            rows={1}
            disabled={isLoading}
          />
          <div className="absolute right-3 bottom-3 text-xs text-gray-400">
            Press Enter to send
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
      
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <Sparkles size={12} />
        <span>Powered by OpenAI GPT-3.5 Turbo</span>
      </div>
    </form>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { MessageCircle, RefreshCw } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
                setIsLoading(false)
                return
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  assistantMessage += parsed.text
                  // Update the last message in real-time
                  setMessages(prev => {
                    const newMessages = [...prev]
                    if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                      newMessages[newMessages.length - 1].content = assistantMessage
                    } else {
                      newMessages.push({ role: 'assistant', content: assistantMessage })
                    }
                    return newMessages
                  })
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <MessageCircle className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Chat Assistant</h1>
            <p className="text-sm text-gray-500">Ask me anything!</p>
          </div>
        </div>
        
        <button
          onClick={clearChat}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="text-primary-500" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to AI Chat!</h3>
            <p className="text-sm max-w-md">
              Start a conversation by typing a message below. I'm here to help you with any questions or tasks.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
            />
          ))
        )}
        
        {isLoading && (
          <ChatMessage
            role="assistant"
            content=""
            isLoading={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  )
}

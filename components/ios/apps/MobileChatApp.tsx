'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { getStoredSessionId } from '@/lib/useSession'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Message {
  id: number
  text: string
  sender: 'visitor' | 'me'
  timestamp: Date
  status?: 'sending' | 'sent' | 'delivered' | 'read'
}

interface Conversation {
  id: number
  name: string
  initials: string
  color: string
  lastMessage: string
  isAI?: boolean
  messages: Message[]
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    name: 'Sung Jae Bae',
    initials: 'SB',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    lastMessage: "Hey! Thanks for visiting my site",
    messages: [
      { id: 1, text: "Hey! Thanks for visiting my site 👋", sender: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 4), status: 'read' },
    ],
  },
  {
    id: 2,
    name: 'My Twin',
    initials: '🤖',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    lastMessage: 'Ask me anything about Sung Jae!',
    isAI: true,
    messages: [
      { id: 1, text: "Hey! I'm an AI assistant trained to answer questions about Sung Jae. Feel free to ask me about his projects, skills, experience, or anything else!", sender: 'me', timestamp: new Date(Date.now() - 1000 * 60), status: 'read' },
    ],
  },
]

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

type MessagesData = { messages: Message[]; cursor: string | null }

export default function MobileChatApp() {
  const [conversations] = useState<Conversation[]>(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isAILoading, setIsAILoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const sessionId = getStoredSessionId()

  const deduplicateMessages = useCallback((messages: Message[]): Message[] => {
    const seen = new Set<number>()
    return messages.filter(msg => {
      if (seen.has(msg.id)) return false
      seen.add(msg.id)
      return true
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }, [])

  const convertToWebFormat = useCallback((messages: any[]): Message[] => {
    return messages.map((msg: any) => ({
      id: parseInt(msg.id, 10),
      text: msg.text,
      sender: msg.sender === 'contact' ? 'visitor' : 'me',
      timestamp: new Date(msg.timestamp),
      status: msg.status || 'sent',
    }))
  }, [])

  // Load user chat messages
  const { data: userChatData } = useQuery<MessagesData>({
    queryKey: ['messages', sessionId, '1', false],
    queryFn: async () => {
      if (!sessionId) return { messages: [], cursor: null }
      try {
        const response = await fetch(`/api/chat/load?sessionId=${sessionId}&conversationId=1&isAI=false`)
        if (!response.ok) return { messages: [], cursor: null }
        const data = await response.json()
        if (data.success) {
          return { messages: data.messages ? convertToWebFormat(data.messages) : [], cursor: data.cursor || null }
        }
        return { messages: [], cursor: null }
      } catch {
        return { messages: [], cursor: null }
      }
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  })

  // AI chat data
  const { data: aiChatData } = useQuery<MessagesData>({
    queryKey: ['messages', sessionId, '2', true],
    queryFn: async ({ queryKey }) => {
      const previousData = queryClient.getQueryData<MessagesData>(queryKey)
      return previousData || { messages: [], cursor: null }
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  })

  const currentMessages = useMemo(() => {
    if (!selectedConversation) return []
    if (selectedConversation.id === 1) {
      const welcomeMessage = selectedConversation.messages?.find(m => m.id === 1)
      const redisMessages = userChatData?.messages || []
      return welcomeMessage ? deduplicateMessages([welcomeMessage, ...redisMessages]) : deduplicateMessages(redisMessages)
    } else if (selectedConversation.isAI) {
      const initialMessages = selectedConversation.messages || []
      const cachedMessages = aiChatData?.messages || []
      return deduplicateMessages([...initialMessages, ...cachedMessages])
    }
    return selectedConversation.messages || []
  }, [selectedConversation, userChatData, aiChatData, deduplicateMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages])

  // Save message mutation
  const saveMessagesMutation = useMutation({
    mutationFn: async ({ conversationId, message, isAI }: { conversationId: number; message: Message; isAI: boolean }) => {
      if (!sessionId) throw new Error('No session ID')
      const unifiedMessage = {
        id: message.id.toString(),
        conversationId: conversationId.toString(),
        text: message.text,
        sender: message.sender === 'visitor' ? 'contact' : 'user',
        timestamp: message.timestamp instanceof Date ? message.timestamp.toISOString() : new Date(message.timestamp).toISOString(),
        status: message.status || 'sent',
      }
      const response = await fetch('/api/chat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, conversationId, message: unifiedMessage, isAI }),
      })
      if (!response.ok) throw new Error('Failed to save')
      return response.json()
    },
    onMutate: async ({ conversationId, message, isAI }) => {
      const queryKey = ['messages', sessionId, conversationId.toString(), isAI]
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<MessagesData>(queryKey)
      queryClient.setQueryData<MessagesData>(queryKey, (old) => ({
        messages: deduplicateMessages([...(old?.messages || []), message]),
        cursor: old?.cursor || null,
      }))
      return { previousData, queryKey }
    },
  })

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedConversation || isAILoading) return
    const messageText = inputValue.trim()
    const newMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'visitor',
      timestamp: new Date(),
      status: 'sending',
    }

    if (!selectedConversation.isAI) {
      saveMessagesMutation.mutate({ conversationId: selectedConversation.id, message: newMessage, isAI: false })
    } else {
      const queryKey = ['messages', sessionId, selectedConversation.id.toString(), true]
      queryClient.setQueryData<MessagesData>(queryKey, (old) => ({
        messages: deduplicateMessages([...(old?.messages || []), newMessage]),
        cursor: old?.cursor || null,
      }))
    }

    setInputValue('')

    // AI response
    if (selectedConversation.isAI) {
      setIsAILoading(true)
      const aiMessageId = Date.now() + 1
      const aiMessage: Message = {
        id: aiMessageId,
        text: '',
        sender: 'me',
        timestamp: new Date(),
        status: 'sending',
      }
      const queryKey = ['messages', sessionId, selectedConversation.id.toString(), true]
      queryClient.setQueryData<MessagesData>(queryKey, (old) => ({
        messages: deduplicateMessages([...(old?.messages || []), aiMessage]),
        cursor: old?.cursor || null,
      }))
      setStreamingMessageId(aiMessageId)

      try {
        const response = await fetch('/api/chat/ai-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText, sessionId }),
        })
        if (!response.ok || !response.body) throw new Error('Stream failed')
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullText = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') break
              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  fullText += parsed.text
                  queryClient.setQueryData<MessagesData>(queryKey, (old) => ({
                    messages: (old?.messages || []).map(m =>
                      m.id === aiMessageId ? { ...m, text: fullText, status: 'sent' as const } : m
                    ),
                    cursor: old?.cursor || null,
                  }))
                }
              } catch {}
            }
          }
        }
      } catch (error) {
        const queryKey = ['messages', sessionId, selectedConversation.id.toString(), true]
        queryClient.setQueryData<MessagesData>(queryKey, (old) => ({
          messages: (old?.messages || []).map(m =>
            m.id === aiMessageId ? { ...m, text: 'Sorry, I had trouble responding. Please try again.', status: 'sent' as const } : m
          ),
          cursor: old?.cursor || null,
        }))
      } finally {
        setIsAILoading(false)
        setStreamingMessageId(null)
      }
    }
  }

  // Conversation List View
  if (!selectedConversation) {
    return (
      <div className="h-full flex flex-col bg-[#000000]">
        <div className="px-4 pt-2 pb-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search" className="w-full h-9 pl-10 pr-4 bg-white/10 rounded-xl text-white text-[15px] placeholder-white/30 outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className="w-full flex items-center gap-3 px-4 py-3 active:bg-white/5 transition-colors"
            >
              <div className={`w-12 h-12 rounded-full ${conv.color} flex items-center justify-center text-white text-lg font-medium flex-shrink-0`}>
                {conv.initials}
              </div>
              <div className="flex-1 text-left border-b border-white/10 pb-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-white text-[17px] font-medium">{conv.name}</span>
                  <span className="text-white/30 text-[13px]">now</span>
                </div>
                <p className="text-white/40 text-[15px] truncate">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Chat View
  return (
    <div className="h-full flex flex-col bg-[#000000]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/10 bg-[#1c1c1e]">
        <button onClick={() => setSelectedConversation(null)} className="flex items-center gap-1 text-[#0a84ff]">
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
            <path d="M10 2L2 10L10 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className={`w-8 h-8 rounded-full ${selectedConversation.color} flex items-center justify-center text-white text-sm font-medium`}>
          {selectedConversation.initials}
        </div>
        <span className="text-white font-semibold text-[17px]">{selectedConversation.name}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {currentMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-3.5 py-2 text-[15px] leading-relaxed ${
                msg.sender === 'visitor'
                  ? 'bg-[#0a84ff] text-white rounded-2xl rounded-br-md'
                  : 'bg-[#2c2c2e] text-white rounded-2xl rounded-bl-md'
              }`}
            >
              {selectedConversation.isAI && msg.sender === 'me' ? (
                <div className="prose prose-invert prose-sm max-w-none [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0">
                  <ReactMarkdown>{msg.text || (msg.id === streamingMessageId ? '...' : '')}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isAILoading && streamingMessageId && !currentMessages.find(m => m.id === streamingMessageId)?.text && (
          <div className="flex justify-start">
            <div className="bg-[#2c2c2e] text-white/50 rounded-2xl rounded-bl-md px-4 py-2 text-sm">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-[#1c1c1e]">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={selectedConversation.isAI ? "Ask me anything..." : "iMessage"}
            className="flex-1 h-9 px-4 bg-white/10 rounded-full text-white text-[15px] placeholder-white/30 outline-none"
            autoCapitalize="none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isAILoading}
            className="w-8 h-8 rounded-full bg-[#0a84ff] flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

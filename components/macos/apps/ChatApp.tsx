'use client'

import { AppComponentProps } from '@/types/macos'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useDragHandler } from '../Window'
import ReactMarkdown from 'react-markdown'
import { getStoredSessionId } from '@/lib/useSession'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Emoji data organized by category
const emojiData = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
  'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
  'Food': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'],
  'Travel': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🛺', '🚲', '🛴', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁'],
  'Objects': ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🪆', '🖼️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓'],
  'Symbols': ['❤️', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧️', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '🟰', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁️‍🗨️', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'],
  'Flags': ['🏳️', '🏴', '🏴‍☠️', '🏁', '🚩', '🎌', '🏳️‍🌈', '🏳️‍⚧️', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳', '🇧🇷', '🇲🇽', '🇮🇹', '🇪🇸', '🇷🇺', '🇳🇱', '🇸🇪', '🇳🇴', '🇩🇰', '🇫🇮', '🇨🇭', '🇦🇹', '🇧🇪', '🇵🇱', '🇵🇹', '🇬🇷', '🇮🇪', '🇳🇿', '🇸🇬', '🇭🇰', '🇹🇼', '🇹🇭', '🇻🇳', '🇵🇭', '🇮🇩', '🇲🇾', '🇿🇦', '🇪🇬', '🇳🇬', '🇰🇪', '🇦🇪', '🇸🇦', '🇮🇱', '🇹🇷', '🇦🇷', '🇨🇱', '🇨🇴', '🇵🇪', '🇻🇪', '🇺🇦', '🇨🇿', '🇭🇺', '🇷🇴']
}

const categoryIcons: Record<string, string> = {
  'Smileys': '😀',
  'Gestures': '👋',
  'Hearts': '❤️',
  'Animals': '🐶',
  'Food': '🍎',
  'Activities': '⚽',
  'Travel': '🚗',
  'Objects': '💡',
  'Symbols': '💯',
  'Flags': '🏳️'
}

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
  avatar: string
  initials: string
  color: string
  lastMessage: string
  timestamp: Date
  unread?: number
  isAI?: boolean
  messages: Message[]
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    name: 'Sung Jae Bae',
    avatar: '',
    initials: 'SB',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    lastMessage: "Hey! Thanks for visiting my site 👋",
    timestamp: new Date(),
    messages: [
      {
        id: 1,
        text: "Hey! Thanks for visiting my site 👋",
        sender: 'me',
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
        status: 'read'
      }
    ]
  },
  {
    id: 2,
    name: 'My Twin',
    avatar: '',
    initials: '🤖',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    lastMessage: "Ask me anything about Sung Jae!",
    timestamp: new Date(),
    isAI: true,
    messages: [
      {
        id: 1,
        text: "Hey! I'm an AI assistant trained to answer questions about Sung Jae. Feel free to ask me about his projects, skills, experience, or anything else!",
        sender: 'me',
        timestamp: new Date(Date.now() - 1000 * 60 * 1),
        status: 'read'
      },
    ]
  }
]

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

function formatDateHeader(date: Date): string {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ChatApp({ windowId, isActive, windowControls }: AppComponentProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(conversations[0])
  const [inputValue, setInputValue] = useState('')
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiCategory, setEmojiCategory] = useState<string>('Smileys')
  const [emojiSearch, setEmojiSearch] = useState('')
  const [isAILoading, setIsAILoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragHandler = useDragHandler()

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmojiPicker])

  const handleEmojiSelect = useCallback((emoji: string) => {
    setInputValue(prev => prev + emoji)
    inputRef.current?.focus()
  }, [])

  // Filter emojis based on search
  const filteredEmojis = emojiSearch
    ? Object.entries(emojiData).flatMap(([_, emojis]) => 
        emojis.filter(emoji => emoji.includes(emojiSearch))
      )
    : emojiData[emojiCategory as keyof typeof emojiData] || []
  const [searchQuery, setSearchQuery] = useState('')

  const queryClient = useQueryClient()
  const sessionId = getStoredSessionId()

  // Helper to deduplicate messages by id
  const deduplicateMessages = useCallback((messages: Message[]): Message[] => {
    const seen = new Set<number>()
    return messages.filter(msg => {
      if (seen.has(msg.id)) {
        return false // Duplicate
      }
      seen.add(msg.id)
      return true
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }, [])

  // Convert unified format to web format
  const convertToWebFormat = useCallback((messages: any[]): Message[] => {
    return messages.map((msg: any) => ({
      id: parseInt(msg.id, 10),
      text: msg.text,
      sender: msg.sender === 'contact' ? 'visitor' : 'me',
      timestamp: new Date(msg.timestamp),
      status: msg.status || 'sent',
    }))
  }, [])

  // Store cursors for sync endpoint
  const [userChatCursor, setUserChatCursor] = useState<string | null>(null)
  const [aiChatCursor, setAiChatCursor] = useState<string | null>(null)

  type MessagesData = { messages: Message[]; cursor: string | null }

  // Load messages for real user chat (conversation id 1)
  // Uses sync endpoint for incremental updates, load endpoint for initial load
  const { data: userChatData } = useQuery<MessagesData>({
    queryKey: ['messages', sessionId, '1', false],
    queryFn: async ({ queryKey, signal }) => {
      if (!sessionId) return { messages: [], cursor: null }
      
      // Get previous data to merge with
      const previousData = queryClient.getQueryData<MessagesData>(queryKey)
      const previousMessages = previousData?.messages || []
      const currentCursor = userChatCursor || previousData?.cursor || null
      
      let response: Response
      if (currentCursor) {
        // Use sync endpoint for incremental updates
        response = await fetch(`/api/chat/sync?sessionId=${sessionId}&conversationId=1&isAI=false&cursor=${currentCursor}`, { signal })
      } else {
        // First load - use load endpoint
        response = await fetch(`/api/chat/load?sessionId=${sessionId}&conversationId=1&isAI=false`, { signal })
      }
      
      if (!response.ok) return { messages: previousMessages, cursor: currentCursor }
      
      const data = await response.json()
      if (data.success) {
        const newMessages = data.messages ? convertToWebFormat(data.messages) : []
        
        // Merge with previous messages (deduplicate by id)
        const existingIds = new Set(previousMessages.map((m: Message) => m.id))
        const uniqueNewMessages = newMessages.filter((m: Message) => !existingIds.has(m.id))
        const allMessages = deduplicateMessages([...previousMessages, ...uniqueNewMessages])
        
        // Get cursor from response or from last message
        const cursor = data.cursor || (newMessages.length > 0 && data.messages?.[data.messages.length - 1]?.streamId) || currentCursor
        
        // Update cursor state
        if (cursor && cursor !== userChatCursor) {
          setUserChatCursor(cursor)
        }
        
        return { messages: allMessages, cursor }
      }
      return { messages: previousMessages, cursor: currentCursor }
    },
    enabled: !!sessionId && isActive,
    // No refetchInterval - SSE handles real-time updates
    staleTime: 1000 * 60, // 1 minute - data is fresh for longer since SSE updates in real-time
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  })

  const userChatMessages = userChatData?.messages || []

  // Load messages for AI chat (conversation id 2)
  // AI chat is transient - only stored in client-side state, not in Redis
  const { data: aiChatData } = useQuery<MessagesData>({
    queryKey: ['messages', sessionId, '2', true],
    queryFn: async ({ queryKey }) => {
      if (!sessionId) return { messages: [], cursor: null }
      
      // AI chat is transient - return empty (not loaded from Redis)
      // Messages are only stored in client-side React Query cache
      const previousData = queryClient.getQueryData<MessagesData>(queryKey)
      return previousData || { messages: [], cursor: null }
    },
    enabled: !!sessionId && isActive,
    // No refetchInterval - SSE handles real-time updates
    staleTime: 1000 * 60, // 1 minute - data is fresh for longer since SSE updates in real-time
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  })

  const aiChatMessages = aiChatData?.messages || []

  // Derive current conversation messages from query data (no useEffect needed!)
  // Merge initial messages with Redis data so welcome messages show even when Redis is empty
  const currentMessages = useMemo(() => {
    if (selectedConversation.id === 1) {
      // Merge initial messages with Redis messages
      const initialMessages = selectedConversation.messages || []
      const redisMessages = userChatMessages || []
      
      // If Redis is empty, use initial messages
      if (redisMessages.length === 0) {
        return deduplicateMessages(initialMessages)
      }
      
      // Merge and deduplicate (Redis messages take precedence)
      const existingIds = new Set(redisMessages.map(m => m.id))
      const uniqueInitialMessages = initialMessages.filter(m => !existingIds.has(m.id))
      return deduplicateMessages([...redisMessages, ...uniqueInitialMessages])
    } else if (selectedConversation.id === 2 && selectedConversation.isAI) {
      // AI chat is transient - only use client-side cache (no Redis)
      const initialMessages = selectedConversation.messages || []
      const cachedMessages = aiChatMessages || []
      
      // Merge initial messages with cached messages (from client-side state only)
      if (cachedMessages.length === 0) {
        return deduplicateMessages(initialMessages)
      }
      
      // Merge and deduplicate (cached messages take precedence)
      const existingIds = new Set(cachedMessages.map(m => m.id))
      const uniqueInitialMessages = initialMessages.filter(m => !existingIds.has(m.id))
      return deduplicateMessages([...cachedMessages, ...uniqueInitialMessages])
    }
    return selectedConversation.messages
  }, [selectedConversation.id, selectedConversation.isAI, selectedConversation.messages, userChatMessages, aiChatMessages, deduplicateMessages])

  // Update conversation metadata (lastMessage, timestamp) from query data
  const conversationsWithQueryData = useMemo(() => {
    return conversations.map(conv => {
      if (conv.id === 1 && userChatMessages.length > 0) {
        const uniqueMessages = deduplicateMessages(userChatMessages)
        return {
          ...conv,
          messages: uniqueMessages, // Keep for compatibility, but we'll use currentMessages for selected
          lastMessage: uniqueMessages[uniqueMessages.length - 1]?.text || conv.lastMessage,
          timestamp: uniqueMessages[uniqueMessages.length - 1]?.timestamp || conv.timestamp
        }
      } else if (conv.id === 2 && conv.isAI && aiChatMessages.length > 0) {
        const uniqueMessages = deduplicateMessages(aiChatMessages)
        return {
          ...conv,
          messages: uniqueMessages, // Keep for compatibility, but we'll use currentMessages for selected
          lastMessage: uniqueMessages[uniqueMessages.length - 1]?.text || conv.lastMessage,
          timestamp: uniqueMessages[uniqueMessages.length - 1]?.timestamp || conv.timestamp
        }
      }
      return conv
    })
  }, [conversations, userChatMessages, aiChatMessages, deduplicateMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages])

  // Mark user messages (from Expo) as read when viewing conversation (real user chat only)
  // Visitor messages are never marked as read from the web side - only mobile app can mark those
  useEffect(() => {
    if (!sessionId || !isActive) return
    if (selectedConversation.id !== 1 || selectedConversation.isAI) return
    
    // Mark all user messages (from Expo) as read - these are messages the visitor has read
    const userMessages = currentMessages.filter(m => m.sender === 'me' && m.status !== 'read')
    if (userMessages.length > 0) {
      const messageIds = userMessages.map(m => m.id.toString())
      
      // Debounce: wait 500ms before marking as read to batch multiple updates
      const timeoutId = setTimeout(() => {
        fetch(`/api/conversations/1/read?sessionId=${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds }),
        }).catch(err => {
          // Only log non-connection-limit errors
          if (!err.message?.includes('max number of clients')) {
            console.error('Failed to mark messages as read:', err)
          }
        })
      }, 500)
      
      return () => clearTimeout(timeoutId)
    }
  }, [sessionId, isActive, selectedConversation.id, selectedConversation.isAI, currentMessages])

  // Set up SSE connections for real-time updates (invalidate queries on new messages)
  useEffect(() => {
    if (!isActive || !sessionId) return // Don't connect when window is not active

    const eventSources: EventSource[] = []

    // Connect to real user chat stream
    const userChatStream = new EventSource(
      `/api/chat/stream?sessionId=${sessionId}&conversationId=1&isAI=false`
    )

    userChatStream.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'message' && data.message) {
          // Update cache directly instead of invalidating (more efficient)
          const queryKey = ['messages', sessionId, '1', false]
          const currentData = queryClient.getQueryData<MessagesData>(queryKey)
          
          if (currentData) {
            const msg = data.message
            const webMessage: Message = {
              id: parseInt(msg.id, 10),
              text: msg.text,
              sender: msg.sender === 'contact' ? 'visitor' : 'me',
              timestamp: new Date(msg.timestamp),
              status: msg.status || 'sent',
            }
            
            // Check if message already exists (deduplicate)
            const existingIds = new Set(currentData.messages.map(m => m.id))
            if (!existingIds.has(webMessage.id)) {
              const updatedMessages = deduplicateMessages([...currentData.messages, webMessage])
              const cursor = msg.streamId || currentData.cursor
              
              queryClient.setQueryData<MessagesData>(queryKey, {
                messages: updatedMessages,
                cursor: cursor,
              })
            }
          } else {
            // If no cache, invalidate to trigger initial load
            queryClient.invalidateQueries({ queryKey })
          }
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    userChatStream.onerror = (error) => {
      console.error('SSE connection error (user chat):', error)
      // EventSource will automatically reconnect
    }

    eventSources.push(userChatStream)

    // AI chat is transient - no SSE connection needed since messages are only in client-side state
    // AI responses come directly from /api/chat endpoint when user sends a message

    // Cleanup: close connections on unmount or when inactive
    return () => {
      eventSources.forEach(es => es.close())
    }
  }, [isActive, sessionId, queryClient, deduplicateMessages])

  // Mutation to save messages (using TanStack Query with optimistic updates)
  const saveMessagesMutation = useMutation({
    mutationFn: async ({
      conversationId,
      message,
      isAI,
    }: {
      conversationId: number
      message: Message
      isAI: boolean
    }) => {
      if (!sessionId) throw new Error('No session ID')

      // Convert web format to unified format for API
      const unifiedMessage = {
        id: message.id.toString(),
        conversationId: conversationId.toString(),
        text: message.text,
        sender: message.sender === 'visitor' ? 'contact' : 'user',
        senderName: message.sender === 'visitor' ? 'Website Visitor' : undefined,
        timestamp: message.timestamp instanceof Date ? message.timestamp.toISOString() : new Date(message.timestamp).toISOString(),
        status: message.status || 'sent',
      }

      const response = await fetch('/api/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          conversationId,
          messages: [unifiedMessage],
          isAI,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save messages')
      }

      return response.json()
    },
    // Optimistic update - show message immediately
    onMutate: async ({ conversationId, message, isAI }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      const queryKey = ['messages', sessionId, conversationId.toString(), isAI]
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueryData<MessagesData>(queryKey)

      // Optimistically update cache
      if (previousData) {
        const existingIds = new Set(previousData.messages.map(m => m.id))
        if (!existingIds.has(message.id)) {
          queryClient.setQueryData<MessagesData>(queryKey, {
            messages: deduplicateMessages([...previousData.messages, message]),
            cursor: previousData.cursor,
          })
        }
      }

      return { previousData }
    },
    // On error, rollback optimistic update
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        const queryKey = ['messages', sessionId, _variables.conversationId.toString(), _variables.isAI]
        queryClient.setQueryData<MessagesData>(queryKey, context.previousData)
      }
    },
    // On success, update status to 'sent' (message is already in cache from optimistic update)
    onSuccess: (_data, variables) => {
      const queryKey = ['messages', sessionId, variables.conversationId.toString(), variables.isAI]
      const currentData = queryClient.getQueryData<MessagesData>(queryKey)
      
      if (currentData) {
        // Update message status from 'sending' to 'sent'
        queryClient.setQueryData<MessagesData>(queryKey, {
          ...currentData,
          messages: currentData.messages.map(msg =>
            msg.id === variables.message.id
              ? { ...msg, status: 'sent' as const }
              : msg
          ),
        })
      }
    },
  })

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim()
    
    if (!messageText) return
    if (isAILoading) return
    
    const newMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'visitor',
      timestamp: new Date(),
      status: 'sending'
    }

    // Optimistically update TanStack Query cache (shows immediately)
    // Then save to Redis in background (only for non-AI conversations)
    if (!selectedConversation.isAI) {
      saveMessagesMutation.mutate({
        conversationId: selectedConversation.id,
        message: newMessage,
        isAI: false,
      })
    } else {
      // For AI chat, just add to client-side cache (no Redis save - AI chat is transient)
      const queryKey = ['messages', sessionId, selectedConversation.id.toString(), true]
      const currentData = queryClient.getQueryData<MessagesData>(queryKey)
      if (currentData) {
        const existingIds = new Set(currentData.messages.map(m => m.id))
        if (!existingIds.has(newMessage.id)) {
          queryClient.setQueryData<MessagesData>(queryKey, {
            messages: deduplicateMessages([...currentData.messages, newMessage]),
            cursor: currentData.cursor,
          })
        }
      }
    }

    setInputValue('')
    
    // If this is the personal chat (not AI), send push notification to device
    if (!selectedConversation.isAI) {
      try {
        const sessionId = getStoredSessionId()
        
        const response = await fetch('/api/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            sessionId, // Include sessionId for tracking which visitor sent this
            senderName: 'Website Visitor',
            timestamp: new Date().toISOString()
          })
        })
        
        const result = await response.json()
        
        // Update message status in TanStack Query cache based on push result
        const queryKey = ['messages', sessionId, selectedConversation.id.toString(), selectedConversation.isAI || false]
        const currentData = queryClient.getQueryData<MessagesData>(queryKey)
        
        if (currentData) {
          queryClient.setQueryData<MessagesData>(queryKey, {
            ...currentData,
            messages: currentData.messages.map(msg =>
                msg.id === newMessage.id 
                  ? { ...msg, status: result.success ? 'delivered' as const : 'sent' as const }
                  : msg
            ),
          })
            }
        
        if (!result.success && !result.skipped) {
          console.warn('Push notification failed:', result.error)
        }
    } catch (error) {
        console.error('Failed to send push notification:', error)
        // Still mark as sent even if push fails
        const queryKey = ['messages', sessionId, selectedConversation.id.toString(), selectedConversation.isAI || false]
        const currentData = queryClient.getQueryData<MessagesData>(queryKey)
        
        if (currentData) {
          queryClient.setQueryData<MessagesData>(queryKey, {
            ...currentData,
            messages: currentData.messages.map(msg =>
                msg.id === newMessage.id 
                  ? { ...msg, status: 'sent' as const }
                  : msg
            ),
          })
            }
      }
    }
    
    // If this is the AI twin conversation, get AI response with streaming
    if (selectedConversation.isAI && messageText) {
      setIsAILoading(true)
      const aiMessageId = Date.now() + 1
      setStreamingMessageId(aiMessageId)
      
      // Create initial empty AI message for streaming
      const aiResponse: Message = {
        id: aiMessageId,
        text: '',
        sender: 'me',
        timestamp: new Date(),
        status: 'sending'
      }
      
      // Optimistically add empty AI message to TanStack Query cache (shows immediately)
      const queryKey = ['messages', sessionId, selectedConversation.id.toString(), selectedConversation.isAI || false]
      const currentData = queryClient.getQueryData<MessagesData>(queryKey)
      
      if (currentData) {
        const existingIds = new Set(currentData.messages.map(m => m.id))
        if (!existingIds.has(aiResponse.id)) {
          queryClient.setQueryData<MessagesData>(queryKey, {
            messages: deduplicateMessages([...currentData.messages, aiResponse]),
            cursor: currentData.cursor,
          })
        }
      }
      
      try {
        // Get conversation history (excluding the messages we just added)
        const conversationHistory = selectedConversation.messages.map(msg => ({
          text: msg.text,
          sender: msg.sender
        }))
        
        // Get sessionId for tracking
        const sessionId = getStoredSessionId()
        
        // Use SSE for streaming AI responses
        const response = await fetch('/api/chat/ai-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            conversationHistory,
            sessionId, // Include sessionId for push notification routing
            messageId: aiMessageId.toString(), // Include messageId for tracking
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to get AI response')
        }
        
        // Read SSE stream - process chunks immediately as they arrive
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            // Decode chunk immediately
            buffer += decoder.decode(value, { stream: true })
            
            // Process all complete SSE messages (separated by \n\n)
            // Process as many as we can to avoid buffering delays
            while (buffer.includes('\n\n')) {
              const messageEnd = buffer.indexOf('\n\n')
              const message = buffer.slice(0, messageEnd)
              buffer = buffer.slice(messageEnd + 2) // Remove processed message
              
              const trimmedLine = message.trim()
              if (trimmedLine.startsWith('data: ')) {
                const data = trimmedLine.slice(6)
                
                try {
                  const parsed = JSON.parse(data)
                  const queryKey = ['messages', sessionId, selectedConversation.id.toString(), selectedConversation.isAI || false]
                  const currentData = queryClient.getQueryData<MessagesData>(queryKey)
                  
                  if (!currentData) continue
                  
                  if (parsed.type === 'start') {
                    // Streaming started - message already exists
                    continue
                  } else if (parsed.type === 'chunk' && parsed.text) {
                    // Update message with new chunk immediately
                    // Server sends fullText (accumulated) - use that if available, otherwise append chunk
                    const existingText = currentData.messages.find(m => m.id === aiMessageId)?.text || ''
                    const textToUse = parsed.fullText !== undefined 
                      ? parsed.fullText  // Use server's accumulated text (most reliable)
                      : existingText + parsed.text  // Fallback: append chunk
                    
                    // Debug: log first few chunks to see timing
                    if (textToUse.length < 50) {
                      console.log(`[AI Frontend] Chunk received: delta="${parsed.text.substring(0, 20)}..." fullLength=${textToUse.length}`)
                    }
                    
                    // Update immediately for real-time streaming
                    queryClient.setQueryData<MessagesData>(queryKey, {
                      ...currentData,
                      messages: currentData.messages.map(msg =>
                        msg.id === aiMessageId 
                          ? { ...msg, text: textToUse }
                          : msg
                      ),
                    })
                  } else if (parsed.type === 'complete' && parsed.text) {
                    // Streaming complete - set final text and mark as delivered
                    queryClient.setQueryData<MessagesData>(queryKey, {
                      ...currentData,
                      messages: currentData.messages.map(msg =>
                        msg.id === aiMessageId 
                          ? { ...msg, text: parsed.text, status: 'delivered' as const }
                          : msg
                      ),
                    })
                  } else if (parsed.type === 'error') {
                    // Error occurred
                    const errorMessage: Message = {
                      id: aiMessageId,
                      text: "Sorry, I'm having trouble connecting right now. Please try again in a moment!",
                      sender: 'me',
                      timestamp: new Date(),
                      status: 'delivered'
                    }
                    
                    queryClient.setQueryData<MessagesData>(queryKey, {
                      ...currentData,
                      messages: currentData.messages.map(msg =>
                        msg.id === aiMessageId
                          ? errorMessage
                          : msg
                      ),
                    })
                  }
                } catch (error) {
                  // Ignore parse errors for incomplete JSON
                  console.warn('Error parsing SSE message:', error, data)
                }
              }
            }
          }
          
          // Process any remaining buffer
          if (buffer.trim().startsWith('data: ')) {
            const data = buffer.trim().slice(6)
            try {
              const parsed = JSON.parse(data)
              const queryKey = ['messages', sessionId, selectedConversation.id.toString(), selectedConversation.isAI || false]
              const currentData = queryClient.getQueryData<MessagesData>(queryKey)
              
              if (currentData && parsed.type === 'complete' && parsed.text) {
                queryClient.setQueryData<MessagesData>(queryKey, {
                  ...currentData,
                  messages: currentData.messages.map(msg =>
                    msg.id === aiMessageId 
                      ? { ...msg, text: parsed.text, status: 'delivered' as const }
                      : msg
                  ),
                })
              }
            } catch {
              // Ignore
            }
          }
        }
        
      } catch (error) {
        console.error('AI response error:', error)
        
        // Update the message with error in TanStack Query cache
        const queryKey = ['messages', sessionId, selectedConversation.id.toString(), selectedConversation.isAI || false]
        const currentData = queryClient.getQueryData<MessagesData>(queryKey)
        
        if (currentData) {
          const errorMessage: Message = {
            id: aiMessageId,
            text: "Sorry, I'm having trouble connecting right now. Please try again in a moment!",
            sender: 'me',
            timestamp: new Date(),
            status: 'delivered'
          }
          
          queryClient.setQueryData<MessagesData>(queryKey, {
            ...currentData,
            messages: currentData.messages.map(msg =>
              msg.id === aiMessageId
                ? errorMessage
                : msg
            ),
          })
          // AI chat is transient - not saved to Redis
        }
      } finally {
        setIsAILoading(false)
        setStreamingMessageId(null)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header Bar */}
      <div 
        className="h-12 bg-[#2d2d2d]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-3"
        onMouseDown={(e) => {
          if (
            e.target === e.currentTarget ||
            (!(e.target as HTMLElement).closest('button') && 
             !(e.target as HTMLElement).closest('input'))
          ) {
            dragHandler?.(e)
          }
        }}
      >
        {/* Left side - Traffic lights + sidebar toggle */}
        <div className="flex items-center gap-3">
          {windowControls && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); windowControls.close() }}
                className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors relative group"
                style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)' }}
              >
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                    <path d="M1 1L5 5M5 1L1 5" stroke="#5A0000" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); windowControls.minimize() }}
                className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 transition-colors relative group"
                style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)' }}
              >
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
                    <path d="M1 1H5" stroke="#5A4000" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); windowControls.maximize() }}
                className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 transition-colors relative group"
                style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)' }}
              >
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                    <path d="M1 1L2.5 1M1 1L1 2.5M5 5L3.5 5M5 5L5 3.5" stroke="#005A00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
          )}
          
          <button 
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className={`p-1.5 rounded hover:bg-white/10 transition-colors ${sidebarVisible ? 'text-white/60' : 'text-blue-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="18" rx="1" strokeWidth="1.5" />
              <rect x="14" y="3" width="7" height="18" rx="1" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        
        {/* Center - Title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
          Messages
        </div>

        {/* Right spacer for balance */}
        <div className="w-8" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversations List */}
        {sidebarVisible && (
          <div className="w-72 bg-[#252525] border-r border-white/10 flex flex-col">
            {/* Search */}
            <div className="p-3">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1a1a1a] border border-white/5 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.filter((conversation) => conversation.name.toLowerCase().includes(searchQuery.toLowerCase())).map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full px-3 py-3 flex items-start gap-3 transition-colors ${
                    selectedConversation.id === conversation.id 
                      ? 'bg-blue-600' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full ${conversation.color} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-lg`}>
                    {conversation.initials}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-white text-sm font-medium truncate flex items-center gap-1.5">
                        {conversation.name}
                        {conversation.isAI && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/30 text-purple-300 rounded-full">AI</span>
                        )}
                      </span>
                      <span className={`text-xs flex-shrink-0 ml-2 ${
                        selectedConversation.id === conversation.id ? 'text-white/70' : 'text-white/40'
                      }`}>
                        {formatTime(conversation.timestamp)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${
                      selectedConversation.id === conversation.id ? 'text-white/80' : 'text-white/50'
                    }`}>
                      {conversation.lastMessage}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {conversation.unread && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">{conversation.unread}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#1a1a1a]">
          {/* Chat Header */}
          <div 
            className="h-14 bg-[#252525]/90 backdrop-blur-sm border-b border-white/5 flex items-center justify-center px-4"
            onMouseDown={(e) => {
              if (!(e.target as HTMLElement).closest('button')) {
                dragHandler?.(e)
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${selectedConversation.color} flex items-center justify-center text-white text-xs font-semibold`}>
                {selectedConversation.initials}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-white text-sm font-medium">{selectedConversation.name}</div>
                {selectedConversation.isAI && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/30 text-purple-300 rounded-full">AI</span>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Date header */}
            <div className="flex justify-center mb-4">
              <span className="text-white/40 text-xs px-3 py-1 bg-white/5 rounded-full">
                {formatDateHeader(currentMessages[0]?.timestamp || new Date())}
              </span>
            </div>

            {/* Message bubbles */}
            <div className="space-y-2">
              {currentMessages.map((message, index) => {
                const isMe = message.sender === 'me'
                const showTimestamp = index === currentMessages.length - 1 || 
                  (currentMessages[index + 1]?.sender !== message.sender)
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${!isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${showTimestamp ? 'mb-2' : ''}`}>
                      {/* Message bubble */}
                      <div
                        className={`rounded-2xl overflow-hidden ${
                          !isMe 
                            ? 'bg-[#0b93f6] text-white rounded-br-md' 
                            : 'bg-[#3b3b3d] text-white rounded-bl-md'
                        }`}
                        style={{
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {/* Text content */}
                        {(message.text || streamingMessageId === message.id) && (
                          <div className="px-4 py-2.5">
                            {/* Show typing dots when streaming but no text yet */}
                            {streamingMessageId === message.id && !message.text ? (
                              <div className="flex items-center gap-1 py-1">
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            ) : (
                              <div className="text-[15px] leading-relaxed break-words chat-markdown">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                    em: ({ children }) => <em className="italic">{children}</em>,
                                    code: ({ children }) => (
                                      <code className="bg-black/20 px-1.5 py-0.5 rounded text-[13px] font-mono">
                                        {children}
                                      </code>
                                    ),
                                    pre: ({ children }) => (
                                      <pre className="bg-black/20 p-3 rounded-lg my-2 overflow-x-auto text-[13px]">
                                        {children}
                                      </pre>
                                    ),
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li>{children}</li>,
                                    a: ({ href, children }) => (
                                      <a 
                                        href={href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="underline hover:opacity-80"
                                      >
                                        {children}
                                      </a>
                                    ),
                                  }}
                                >
                          {message.text}
                                </ReactMarkdown>
                                {/* Streaming cursor */}
                                {streamingMessageId === message.id && (
                                  <span className="inline-block w-2 h-4 bg-white/60 ml-0.5 animate-pulse" />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Timestamp & Status */}
                      {showTimestamp && (
                        <div className={`mt-1 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-white/30 text-[11px]">
                            {formatTime(message.timestamp)}
                          </span>
                          {isMe && message.status && (
                            <span className="text-white/30 text-[11px]">
                              {message.status === 'delivered' && '• Delivered'}
                              {message.status === 'read' && '• Read'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="px-3 py-2 bg-[#1a1a1a]">
                {/* Main Input Row */}
                <div className="flex items-center gap-2">
              {/* Input field */}
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                  placeholder={isAILoading ? "Waiting for response..." : "Message"}
                  disabled={isAILoading}
                  className={`w-full pl-4 pr-20 py-2 rounded-full bg-[#3a3a3c] border border-white/10 text-white text-[15px] placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${isAILoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                  </div>

                  {/* Emoji button */}
                  <div className="relative">
                    <button 
                      ref={emojiButtonRef}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors flex-shrink-0 ${showEmojiPicker ? 'text-yellow-400' : 'text-white/50 hover:text-white/70'}`}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                        <path strokeLinecap="round" strokeWidth="1.5" d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <circle cx="9" cy="10" r="1" fill="currentColor" />
                        <circle cx="15" cy="10" r="1" fill="currentColor" />
                      </svg>
                    </button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div 
                    ref={emojiPickerRef}
                    className="absolute bottom-full right-0 mb-2 bg-[#1c1c1e]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                    style={{ 
                      boxShadow: '0 8px 40px rgba(0, 0, 0, 0.6)',
                      width: '352px'
                    }}
                  >
                    {/* Search */}
                    <div className="p-3">
                      <div className="relative">
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Describe an Emoji"
                          value={emojiSearch}
                          onChange={(e) => setEmojiSearch(e.target.value)}
                          className="w-full pl-9 pr-10 py-2 rounded-full bg-[#2c2c2e] border border-[#3a3a3c] text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>

                    {/* Emoji grid */}
                    <div 
                      className="overflow-y-auto px-3 pb-3 scrollbar-hide"
                      style={{ 
                        height: '320px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                      }}
                    >
                      <div className="grid grid-cols-6 gap-2">
                        {filteredEmojis.map((emoji, index) => (
                          <button
                            key={`${emoji}-${index}`}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors"
                          >
                            <span 
                              className="text-[32px] leading-none"
                              style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' }}
                            >
                              {emoji}
                            </span>
                          </button>
                        ))}
                      </div>
                      {filteredEmojis.length === 0 && (
                        <div className="flex items-center justify-center h-full text-white/40 text-sm">
                          No emojis found
                        </div>
                      )}
                    </div>

                    {/* Category tabs at bottom */}
                    <div className="flex items-center justify-between px-2 py-2 border-t border-white/10 bg-[#1c1c1e]">
                      <div className="flex gap-0.5">
                        {Object.keys(emojiData).map((category) => (
                          <button
                            key={category}
                            onClick={() => {
                              setEmojiCategory(category)
                              setEmojiSearch('')
                            }}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                              emojiCategory === category && !emojiSearch
                                ? 'bg-white/10' 
                                : 'hover:bg-white/5'
                            }`}
                            title={category}
                          >
                            <span 
                              className="text-xl"
                              style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' }}
                            >
                              {categoryIcons[category]}
                            </span>
                          </button>
                        ))}
                      </div>
                      {/* Arrow button */}
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-white/40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Info text */}
            <p className="text-center text-white/20 text-[11px] mt-2">
              {isAILoading ? (
                <span className="text-purple-400/60">AI is thinking...</span>
              ) : selectedConversation.isAI ? (
                'Chat with AI • Responses powered by Gemini'
              ) : (
                <>Messages will be delivered to Sung Jae • <span className="text-blue-400/60">Slow mode enabled</span></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

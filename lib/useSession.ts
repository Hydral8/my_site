'use client'

import { useState, useEffect } from 'react'

const SESSION_STORAGE_KEY = 'website_session_id'
const SESSION_EXPIRY_KEY = 'website_session_expiry'

interface SessionData {
  sessionId: string
  createdAt: string
  ttlSeconds: number
}

// Get or create a session ID
export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initializeSession() {
      try {
        // Check if we have a valid session in localStorage
        const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
        const storedExpiry = localStorage.getItem(SESSION_EXPIRY_KEY)
        
        // Check if session is still valid (not expired)
        if (storedSessionId && storedExpiry) {
          const expiryTime = parseInt(storedExpiry, 10)
          const now = Date.now()
          
          // If session hasn't expired, use it
          if (now < expiryTime) {
            setSessionId(storedSessionId)
            setIsLoading(false)
            return
          } else {
            // Session expired, clear it
            localStorage.removeItem(SESSION_STORAGE_KEY)
            localStorage.removeItem(SESSION_EXPIRY_KEY)
          }
        }

        // Create a new session
        const response = await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to create session')
        }

        const data: SessionData = await response.json()
        
        // Store session in localStorage with expiry
        const expiryTime = Date.now() + (data.ttlSeconds * 1000)
        localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId)
        localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString())
        
        setSessionId(data.sessionId)
      } catch (error) {
        console.error('Error initializing session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
  }, [])

  return { sessionId, isLoading }
}

// Get session ID from localStorage (for use outside React components)
export function getStoredSessionId(): string | null {
  if (typeof window === 'undefined') return null
  
  const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
  const storedExpiry = localStorage.getItem(SESSION_EXPIRY_KEY)
  
  if (!storedSessionId || !storedExpiry) return null
  
  // Check if expired
  const expiryTime = parseInt(storedExpiry, 10)
  if (Date.now() >= expiryTime) {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    localStorage.removeItem(SESSION_EXPIRY_KEY)
    return null
  }
  
  return storedSessionId
}


'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function MenuBar() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 h-7 z-[9999] flex items-center justify-between px-4"
    >
      {/* Left side - App menu */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-6 h-6 pb-0.5 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span className="text-white text-sm font-medium">Sung Jae Bae</span>
        </div>
      </div>

      {/* Right side - Status icons */}
      <div className="flex items-center gap-4">
        {mounted && currentTime ? (
          <div className="flex items-center gap-2 text-white text-sm">
            <span>{formatDate(currentTime)}</span>
            <span>{formatTime(currentTime)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-white text-sm opacity-0">
            <span>Loading...</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

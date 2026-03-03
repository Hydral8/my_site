'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import StatusBar from './StatusBar'
import Image from 'next/image'

interface LockScreenProps {
  onUnlock: () => void
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y < -100) {
      onUnlock()
    }
  }

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: '-100%' }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Background */}
      <Image src="/bg/lake_tahoe.jpg" alt="Wallpaper" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <StatusBar light />

        {/* Time and Date */}
        <div className="flex flex-col items-center mt-8">
          <div className="text-white/60 text-lg font-medium">
            {currentTime ? formatDate(currentTime) : ''}
          </div>
          <div className="text-white text-7xl font-thin tracking-tight mt-1">
            {currentTime ? formatTime(currentTime) : ''}
          </div>
        </div>

        {/* Swipe up area */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-end pb-8 cursor-grab active:cursor-grabbing"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center"
          >
            <svg width="20" height="10" viewBox="0 0 20 10" className="text-white/70 mb-2">
              <path d="M2 8L10 2L18 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span className="text-white/70 text-xs font-medium">Swipe up to unlock</span>
          </motion.div>

          {/* Home indicator */}
          <div className="w-32 h-1 bg-white/40 rounded-full mt-6" />
        </motion.div>
      </div>
    </motion.div>
  )
}

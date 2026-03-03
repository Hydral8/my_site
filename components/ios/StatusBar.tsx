'use client'

import { useState, useEffect } from 'react'

interface StatusBarProps {
  light?: boolean
}

export default function StatusBar({ light = false }: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  const textColor = light ? 'text-white' : 'text-black'

  return (
    <div className={`h-12 flex items-center justify-between px-6 ${textColor}`}>
      {/* Left - Time */}
      <div className="text-sm font-semibold w-16">
        {currentTime ? formatTime(currentTime) : ''}
      </div>

      {/* Center - Dynamic Island */}
      <div className="w-28 h-7 bg-black rounded-full" />

      {/* Right - Icons */}
      <div className="flex items-center gap-1 w-16 justify-end">
        {/* Signal */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <rect x="0" y="9" width="3" height="3" rx="0.5" opacity="1" />
          <rect x="4" y="6" width="3" height="6" rx="0.5" opacity="1" />
          <rect x="8" y="3" width="3" height="9" rx="0.5" opacity="1" />
          <rect x="12" y="0" width="3" height="12" rx="0.5" opacity="1" />
        </svg>
        {/* WiFi */}
        <svg width="15" height="12" viewBox="0 0 15 12" fill="currentColor">
          <path d="M7.5 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
          <path d="M4.05 8.46a4.95 4.95 0 016.9 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M1.5 5.7a8.5 8.5 0 0112 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
          <rect x="0" y="0.5" width="21" height="11" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
          <rect x="2" y="2.5" width="17" height="7" rx="1" fill="currentColor" />
          <path d="M23 4v4a2 2 0 000-4z" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  )
}

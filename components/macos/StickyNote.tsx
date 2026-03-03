'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function StickyNote() {
  const [visible, setVisible] = useState(true)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="absolute top-[40px] left-[20px] z-40 w-[220px]"
          style={{ transform: 'rotate(-1.5deg)' }}
        >
          <div
            className="rounded-sm shadow-lg p-3 pt-2 text-[13px] leading-[1.45] text-yellow-900/90"
            style={{
              background: 'linear-gradient(135deg, #fdefa9 0%, #f6e68a 100%)',
              boxShadow: '1px 2px 8px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(0,0,0,0.05)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {/* Title bar with close button */}
            <div className="flex items-center mb-1.5">
              <button
                onClick={() => setVisible(false)}
                className="w-[11px] h-[11px] rounded-full bg-yellow-600/50 hover:bg-red-500 transition-colors flex items-center justify-center group cursor-default"
                aria-label="Close sticky note"
              >
                <svg
                  viewBox="0 0 8 8"
                  className="w-[7px] h-[7px] opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <line x1="1.5" y1="1.5" x2="6.5" y2="6.5" />
                  <line x1="6.5" y1="1.5" x2="1.5" y2="6.5" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <p className="font-semibold mb-1">Welcome! 👋</p>
            <ul className="space-y-0.5 text-[12px] text-yellow-900/75">
              <li>• Click dock icons to open apps</li>
              <li>• Drag windows to move them</li>
              <li>• Tap my profile pic to start</li>
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

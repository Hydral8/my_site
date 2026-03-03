'use client'

import { motion, PanInfo } from 'framer-motion'
import StatusBar from './StatusBar'

interface AppScreenProps {
  appName: string
  onBack: () => void
  children: React.ReactNode
  statusBarLight?: boolean
  hideNavBar?: boolean
}

export default function AppScreen({ appName, onBack, children, statusBarLight = false, hideNavBar = false }: AppScreenProps) {
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100 && info.velocity.x > 200) {
      onBack()
    }
  }

  return (
    <motion.div
      className="absolute inset-0 bg-[#000000] flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.3 }}
      onDragEnd={handleDragEnd}
      dragDirectionLock
    >
      <StatusBar light={statusBarLight} />

      {/* iOS Navigation Bar */}
      {!hideNavBar && (
        <div className="h-11 flex items-center px-4 border-b border-white/10 bg-[#1c1c1e]">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-[#0a84ff] text-[17px] -ml-1"
          >
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
              <path d="M10 2L2 10L10 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>
          <div className="flex-1 text-center">
            <span className="text-white font-semibold text-[17px]">{appName}</span>
          </div>
          {/* Spacer to center title */}
          <div className="w-12" />
        </div>
      )}

      {/* App Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Home Indicator */}
      <div className="flex justify-center pb-2 pt-1 bg-inherit">
        <div className="w-32 h-1 bg-white/40 rounded-full" />
      </div>
    </motion.div>
  )
}

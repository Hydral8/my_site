import React from 'react'

interface TrafficLightsProps {
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  variant?: 'checkmark' | 'expand'
}

export default function TrafficLights({ onClose, onMinimize, onMaximize, variant = 'expand' }: TrafficLightsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors relative group"
        aria-label="Close"
        style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)' }}
      >
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
            <path d="M1 1L5 5M5 1L1 5" stroke="#5A0000" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onMinimize() }}
        className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 transition-colors relative group"
        aria-label="Minimize"
        style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)' }}
      >
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
            <path d="M1 1H5" stroke="#5A4000" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onMaximize() }}
        className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 transition-colors relative group"
        aria-label="Maximize"
        style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)' }}
      >
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
            {variant === 'checkmark' ? (
              <path d="M1 3L3 5L5 1" stroke="#005A00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <path d="M1 1L2.5 1M1 1L1 2.5M5 5L3.5 5M5 5L5 3.5" stroke="#005A00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </span>
      </button>
    </div>
  )
}

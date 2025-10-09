'use client'

import { useEffect, useRef } from 'react'
import { useBugGame } from '@/hooks/useBugGame'

interface BugCanvasProps {
  onCatch: () => void
}

export default function BugCanvas({ onCatch }: BugCanvasProps) {
  const { canvasRef, isCaught } = useBugGame(onCatch)
  const containerRef = useRef<HTMLDivElement>(null)

  // Set canvas size to window size
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [canvasRef])

  if (isCaught) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 cursor-none"
      style={{ pointerEvents: 'auto' }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
        style={{ pointerEvents: 'none' }}
      />

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-accent-cyan text-sm md:text-base font-mono glow-cyan">
          [ Catch the bug to unlock ]
        </p>
      </div>
    </div>
  )
}

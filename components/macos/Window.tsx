'use client'

import { useRef, useState, useEffect, useLayoutEffect, createContext, useContext, useCallback } from 'react'
import React from 'react'
import { motion } from 'framer-motion'
import { useWindowManager } from './WindowManager'
import { WindowState } from '@/types/macos'

// Context for drag handler
const DragHandlerContext = createContext<((e: React.MouseEvent) => void) | null>(null)

export const useDragHandler = () => useContext(DragHandlerContext)

const DragHandlerProvider = ({ 
  handler, 
  enabled, 
  children 
}: { 
  handler: (e: React.MouseEvent) => void
  enabled: boolean
  children: React.ReactNode 
}) => {
  return (
    <DragHandlerContext.Provider value={enabled ? handler : null}>
      {children}
    </DragHandlerContext.Provider>
  )
}

interface WindowProps {
  window: WindowState
  children: React.ReactNode
}

// SVG Filter for glass distortion
const WindowGlassFilter = () => (
  <svg
    style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
  >
    <filter
      id="window-glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.01 0.01"
        numOctaves="2"
        seed="7"
        result="turbulence"
      />
      <feGaussianBlur in="turbulence" stdDeviation="2.5" result="softMap" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="20"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
)

export default function Window({ window, children }: WindowProps) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    activeWindowId,
    apps,
    getDockIconPosition,
    getMinimizedWindowPosition,
    setMinimizedPreview,
  } = useWindowManager()

  const windowRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null)

  const isActive = activeWindowId === window.id
  const app = apps.find((a) => a.id === window.appId)
  const hasCustomTrafficLights = app?.customTrafficLights || false

  // Track previous minimized state
  const wasMinimizedRef = useRef(window.isMinimized)
  const capturedHtmlRef = useRef<string | null>(null)
  const capturedSizeRef = useRef<{ width: number; height: number } | null>(null)

  // Capture window HTML content to refs (fast, doesn't trigger state update)
  const captureHtmlToRef = useCallback(() => {
    if (windowRef.current) {
      capturedHtmlRef.current = windowRef.current.innerHTML
      capturedSizeRef.current = { width: window.size.width, height: window.size.height }
    }
  }, [window.size.width, window.size.height])

  // Flush captured HTML to state (async, non-blocking)
  const flushCapturedHtml = useCallback(() => {
    if (capturedHtmlRef.current && capturedSizeRef.current) {
      setMinimizedPreview(window.id, capturedHtmlRef.current, capturedSizeRef.current)
    }
  }, [window.id, setMinimizedPreview])

  // When minimize is triggered, capture HTML sync (before animation), then flush async
  useLayoutEffect(() => {
    if (window.isMinimized && !wasMinimizedRef.current) {
      // Capture HTML immediately while window is still fully rendered
      captureHtmlToRef()
      // Flush to state async (doesn't block animation)
      requestAnimationFrame(() => {
        flushCapturedHtml()
      })
    }
    wasMinimizedRef.current = window.isMinimized
  }, [window.isMinimized, captureHtmlToRef, flushCapturedHtml])

  // Handle minimize with preview capture (for built-in traffic lights)
  const handleMinimize = useCallback(() => {
    // Capture HTML first (sync, fast)
    captureHtmlToRef()
    // Start minimize animation immediately
    minimizeWindow(window.id)
    // Flush captured HTML to state async
    requestAnimationFrame(() => {
      flushCapturedHtml()
    })
  }, [captureHtmlToRef, minimizeWindow, window.id, flushCapturedHtml])

  // Make window visible immediately when reopening (before animation starts)
  useEffect(() => {
    if (!window.isMinimized && windowRef.current) {
      windowRef.current.style.visibility = 'visible'
    }
  }, [window.isMinimized])

  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x
        const newY = Math.max(28, e.clientY - dragOffset.y) // Don't go above menu bar
        // Update local position immediately for snappy dragging
        setDragPosition({ x: newX, y: newY })
      }

      if (isResizing) {
        const rect = windowRef.current?.getBoundingClientRect()
        if (!rect) return

        const newWidth = Math.max(app?.minSize?.width || 400, e.clientX - rect.left)
        const newHeight = Math.max(app?.minSize?.height || 300, e.clientY - rect.top)

        updateWindowSize(window.id, { width: newWidth, height: newHeight })
      }
    }

    const handleMouseUp = () => {
      if (isDragging && dragPosition) {
        // Update the actual window position in the manager when dragging ends
        updateWindowPosition(window.id, dragPosition)
        setDragPosition(null)
      }
      setIsDragging(false)
      setIsResizing(false)
    }

    globalThis.window.addEventListener('mousemove', handleMouseMove)
    globalThis.window.addEventListener('mouseup', handleMouseUp)

    return () => {
      globalThis.window.removeEventListener('mousemove', handleMouseMove)
      globalThis.window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, dragPosition, window.id, updateWindowPosition, updateWindowSize, app])

  const handleMouseDownOnTitleBar = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('title-text')) {
      const rect = windowRef.current?.getBoundingClientRect()
      if (!rect) return

      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      // Initialize drag position to current window position
      setDragPosition(window.position)
      setIsDragging(true)
      focusWindow(window.id)
    }
  }

  // Expose drag handler for custom traffic light apps
  const handleDragStart = (e: React.MouseEvent) => {
    const rect = windowRef.current?.getBoundingClientRect()
    if (!rect) return

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setDragPosition(window.position)
    setIsDragging(true)
    focusWindow(window.id)
  }

  const handleMouseDownOnResize = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    focusWindow(window.id)
  }

  // Use drag position if dragging, otherwise use window position
  const currentPosition = isDragging && dragPosition ? dragPosition : window.position

  // Get dock icon position for this window's app (used for initial open animation)
  const appDockIconPos = getDockIconPosition(window.appId)
  
  // Get minimized window position (used for minimize/restore animation)
  const minimizedWindowPos = getMinimizedWindowPosition(window.id)
  
  // Calculate dock position for animations
  // For minimize: use minimized window position (right side of dock), fallback to estimated position
  // For initial open: use app's dock icon position
  const defaultDockY = typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight - 35 : 800
  const defaultDockX = typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth / 2 + 200 : 600
  
  // Use minimized window position if available (for minimize/restore), otherwise use app dock icon (for initial)
  const minimizeDockX = minimizedWindowPos?.x ?? defaultDockX
  const minimizeDockY = minimizedWindowPos?.y ?? defaultDockY
  const initialDockX = appDockIconPos?.x ?? (typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth / 2 - 32 : 400)
  const initialDockY = appDockIconPos?.y ?? defaultDockY

  // Initial state (at app's dock icon for first open)
  const initialState = {
    x: initialDockX,
    y: initialDockY,
    scaleX: 0.05,
    scaleY: 0.01,
    rotateX: 25,
    opacity: 0,
  }

  // Minimized state (at minimized window section in dock)
  const minimizedState = {
    x: minimizeDockX,
    y: minimizeDockY,
    scaleX: 0.05,
    scaleY: 0.01,
    rotateX: 25,
    opacity: 0,
  }

  // Open state (at window position)
  const openState = {
    x: currentPosition.x,
    y: currentPosition.y,
    scaleX: 1,
    scaleY: 1,
    rotateX: 0,
    opacity: 1,
  }

  return (
    <>
      <WindowGlassFilter />
      <motion.div
        ref={windowRef}
        initial={initialState}
        animate={window.isMinimized ? minimizedState : openState}
        exit={{
          ...initialState, // Close goes to app's dock icon, not minimized section
          transition: {
            duration: 0.35,
            ease: [0.4, 0, 0.2, 1],
          }
        }}
        transition={{
          duration: isDragging ? 0 : 0.35,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="fixed select-none"
        style={{
          width: window.size.width,
          height: window.size.height,
          zIndex: window.zIndex,
          pointerEvents: window.isMinimized ? 'none' : 'auto',
          transformOrigin: 'center bottom',
          perspective: 1400,
        }}
        onMouseDown={() => !window.isMinimized && focusWindow(window.id)}
        onAnimationComplete={() => {
          if (window.isMinimized && windowRef.current) {
            windowRef.current.style.visibility = 'hidden'
          } else if (windowRef.current) {
            windowRef.current.style.visibility = 'visible'
          }
        }}
      >
        <div className={`relative w-full h-full overflow-hidden`} style={{ borderRadius: '12px' }}>
          {/* Glass effect layers */}
          <div className="absolute inset-0 z-0" style={{ overflow: hasCustomTrafficLights ? 'visible' : 'hidden' }}>
            {/* Distortion + Blur layer */}
            <div 
              className="absolute inset-0" 
              style={{
                backdropFilter: 'blur(60px) saturate(180%)',
                WebkitBackdropFilter: 'blur(60px) saturate(180%)',
                filter: 'url(#window-glass-distortion)',
              }}
            />
            {/* Tint layer */}
            <div 
              className="absolute inset-0" 
              style={{ 
                background: isActive
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.06) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.03) 100%)',
              }}
            />
            {/* Shine layer */}
            <div 
              className="absolute inset-0" 
              style={{
                boxShadow: isActive
                  ? 'inset 1px 1px 2px 0 rgba(255, 255, 255, 0.25), inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1)'
                  : 'inset 1px 1px 2px 0 rgba(255, 255, 255, 0.15), inset -1px -1px 2px 0 rgba(255, 255, 255, 0.05)',
              }}
            />
            {/* Border */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                border: isActive
                  ? '1px solid rgba(99, 102, 241, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: isActive
                  ? '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.3)'
                  : '0 20px 60px rgba(0, 0, 0, 0.4)',
              }}
            />
          </div>

          {/* Content - sits above glass layers */}
          <div className="relative z-10 w-full h-full flex flex-col">
            {/* Title Bar - only show for apps without custom traffic lights */}
            {!hasCustomTrafficLights && (
              <div
                className="flex items-center justify-between h-10 px-4 relative"
                onMouseDown={handleMouseDownOnTitleBar}
              >
                {/* Title bar glass background */}
                <div 
                  className="absolute inset-0 -z-10"
                  style={{
                    background: app?.titleBarBackground || (isActive
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(255, 255, 255, 0.04)'),
                    backdropFilter: app?.titleBarBackground ? 'none' : 'blur(20px) saturate(150%)',
                    WebkitBackdropFilter: app?.titleBarBackground ? 'none' : 'blur(20px) saturate(150%)',
                  }}
                />

                {/* Traffic lights */}
                <div className="flex items-center gap-2 relative z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeWindow(window.id)
                    }}
                    className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors relative group"
                    aria-label="Close"
                    style={{
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                        <path d="M1 1L5 5M5 1L1 5" stroke="#5A0000" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMinimize()
                    }}
                    className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 transition-colors relative group"
                    aria-label="Minimize"
                    style={{
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
                        <path d="M1 1H5" stroke="#5A4000" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      maximizeWindow(window.id)
                    }}
                    className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 transition-colors relative group"
                    aria-label="Maximize"
                    style={{
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                        <path d="M1 3L3 5L5 1" stroke="#005A00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Title */}
                <div className="title-text absolute left-1/2 -translate-x-1/2 text-white text-sm font-medium pointer-events-none">
                  {window.title}
                </div>

                <div className="w-16" /> {/* Spacer for symmetry */}
              </div>
            )}

            {/* Content */}
            <div 
              className={`w-full ${hasCustomTrafficLights ? 'overflow-hidden' : 'overflow-auto'}`} 
              style={{ height: hasCustomTrafficLights ? '100%' : 'calc(100% - 40px)' }}
            >
              <DragHandlerProvider handler={handleDragStart} enabled={hasCustomTrafficLights}>
                {children}
              </DragHandlerProvider>
            </div>

            {/* Resize handle */}
            {app?.resizable && (
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50"
                onMouseDown={handleMouseDownOnResize}
              />
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

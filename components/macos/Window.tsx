'use client'

import { useRef, useState, useEffect, useLayoutEffect, createContext, useContext, useCallback } from 'react'
import React from 'react'
import { motion } from 'framer-motion'
import { useWindowManager } from './WindowManager'
import { WindowState } from '@/types/macos'
import TrafficLights from './TrafficLights'

// Context for drag handler
const DragHandlerContext = createContext<((e: React.MouseEvent) => void) | null>(null)

const useDragHandler = () => useContext(DragHandlerContext)

export function useDraggableHeader() {
  const dragHandler = useDragHandler()
  return (e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      (!(e.target as HTMLElement).closest('button') &&
       !(e.target as HTMLElement).closest('input'))
    ) {
      dragHandler?.(e)
    }
  }
}

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

// SVG Filter for glass distortion - rendered once globally in MacOSDesktop
export const WindowGlassFilter = () => (
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
    apps,
    getDockIconPosition,
    getMinimizedWindowPosition,
    setMinimizedPreview,
  } = useWindowManager()

  const windowRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [resizeDir, setResizeDir] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null)
  const [resizeBounds, setResizeBounds] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const resizeStartRef = useRef<{ mx: number; my: number; x: number; y: number; w: number; h: number } | null>(null)

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

  // When minimize is triggered, capture HTML sync (before animation) — flush deferred to onAnimationComplete
  useLayoutEffect(() => {
    if (window.isMinimized && !wasMinimizedRef.current) {
      captureHtmlToRef()
    }
    wasMinimizedRef.current = window.isMinimized
  }, [window.isMinimized, captureHtmlToRef])

  // Handle minimize with preview capture (for built-in traffic lights)
  const handleMinimize = useCallback(() => {
    captureHtmlToRef()
    minimizeWindow(window.id)
  }, [captureHtmlToRef, minimizeWindow, window.id])

  // Make window visible immediately when reopening (before animation starts)
  useEffect(() => {
    if (!window.isMinimized && windowRef.current) {
      windowRef.current.style.visibility = 'visible'
    }
  }, [window.isMinimized])

  const isResizing = resizeDir !== null

  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x
        const newY = Math.max(28, e.clientY - dragOffset.y) // Don't go above menu bar
        setDragPosition({ x: newX, y: newY })
      }

      if (resizeDir && resizeStartRef.current) {
        const s = resizeStartRef.current
        const dx = e.clientX - s.mx
        const dy = e.clientY - s.my
        const minW = app?.minSize?.width || 400
        const minH = app?.minSize?.height || 300
        const maxW = app?.maxSize?.width || Infinity
        const maxH = app?.maxSize?.height || Infinity

        let newW = s.w, newH = s.h, newX = s.x, newY = s.y

        if (resizeDir.includes('e')) newW = s.w + dx
        if (resizeDir.includes('w')) { newW = s.w - dx; newX = s.x + dx }
        if (resizeDir.includes('s')) newH = s.h + dy
        if (resizeDir.includes('n')) { newH = s.h - dy; newY = s.y + dy }

        // Clamp size
        const clampedW = Math.min(maxW, Math.max(minW, newW))
        const clampedH = Math.min(maxH, Math.max(minH, newH))

        // Adjust position if clamped on left/top edges
        if (resizeDir.includes('w')) newX = s.x + s.w - clampedW
        if (resizeDir.includes('n')) newY = Math.max(28, s.y + s.h - clampedH)

        setResizeBounds({ x: newX, y: newY, w: clampedW, h: clampedH })
      }
    }

    const handleMouseUp = () => {
      if (isDragging && dragPosition) {
        updateWindowPosition(window.id, dragPosition)
        setDragPosition(null)
      }
      if (resizeBounds) {
        updateWindowPosition(window.id, { x: resizeBounds.x, y: resizeBounds.y })
        updateWindowSize(window.id, { width: resizeBounds.w, height: resizeBounds.h })
        setResizeBounds(null)
      }
      setIsDragging(false)
      setResizeDir(null)
      resizeStartRef.current = null
    }

    globalThis.window.addEventListener('mousemove', handleMouseMove)
    globalThis.window.addEventListener('mouseup', handleMouseUp)

    return () => {
      globalThis.window.removeEventListener('mousemove', handleMouseMove)
      globalThis.window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, resizeDir, resizeBounds, dragOffset, dragPosition, window.id, updateWindowPosition, updateWindowSize, app])

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

  const handleMouseDownOnResize = (e: React.MouseEvent, dir: string) => {
    e.preventDefault()
    resizeStartRef.current = {
      mx: e.clientX, my: e.clientY,
      x: window.position.x, y: window.position.y,
      w: window.size.width, h: window.size.height,
    }
    setResizeDir(dir)
    focusWindow(window.id)
  }

  // Use local position during drag/resize for immediate feedback
  const currentPosition = isDragging && dragPosition
    ? dragPosition
    : resizeBounds
      ? { x: resizeBounds.x, y: resizeBounds.y }
      : window.position
  const currentSize = resizeBounds
    ? { width: resizeBounds.w, height: resizeBounds.h }
    : window.size

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
          duration: (isDragging || isResizing) ? 0 : 0.35,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="fixed select-none"
        style={{
          width: currentSize.width,
          height: currentSize.height,
          zIndex: window.zIndex,
          pointerEvents: window.isMinimized ? 'none' : 'auto',
          transformOrigin: 'center bottom',
          perspective: 1400,
          willChange: isAnimating ? 'transform, opacity' : 'auto',
        }}
        onMouseDown={() => !window.isMinimized && focusWindow(window.id)}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={() => {
          setIsAnimating(false)
          if (window.isMinimized && windowRef.current) {
            windowRef.current.style.visibility = 'hidden'
            flushCapturedHtml()
          } else if (windowRef.current) {
            windowRef.current.style.visibility = 'visible'
          }
        }}
      >
        <div className={`relative w-full h-full overflow-hidden`} style={{ borderRadius: '12px' }}>
          {/* Glass effect layers */}
          <div className="absolute inset-0 z-0" style={{ overflow: hasCustomTrafficLights ? 'visible' : 'hidden' }}>
            {/* Distortion + Blur layer — filters disabled during animation for performance */}
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: isAnimating ? 'none' : 'blur(60px) saturate(180%)',
                WebkitBackdropFilter: isAnimating ? 'none' : 'blur(60px) saturate(180%)',
                filter: isAnimating ? 'none' : 'url(#window-glass-distortion)',
                transition: 'backdrop-filter 0.1s ease-out, filter 0.1s ease-out',
              }}
            />
            {/* Tint layer */}
            <div 
              className="absolute inset-0" 
              style={{ 
                background: 
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.03) 100%)',
              }}
            />
            {/* Shine layer */}
            <div 
              className="absolute inset-0" 
              style={{
                boxShadow: 
                  'inset 1px 1px 2px 0 rgba(255, 255, 255, 0.15), inset -1px -1px 2px 0 rgba(255, 255, 255, 0.05)',
              }}
            />
            {/* Border */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
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
                    background: app?.titleBarBackground || 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: app?.titleBarBackground ? 'none' : 'blur(20px) saturate(150%)',
                    WebkitBackdropFilter: app?.titleBarBackground ? 'none' : 'blur(20px) saturate(150%)',
                  }}
                />

                {/* Traffic lights */}
                <div className="relative z-20">
                  <TrafficLights
                    onClose={() => closeWindow(window.id)}
                    onMinimize={handleMinimize}
                    onMaximize={() => maximizeWindow(window.id)}
                    variant="checkmark"
                  />
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

            {/* Resize handles — edges and corners */}
            {app?.resizable && (<>
              {/* Edges */}
              <div className="absolute top-0 left-2 right-2 h-1 cursor-ns-resize z-50" onMouseDown={(e) => handleMouseDownOnResize(e, 'n')} />
              <div className="absolute bottom-0 left-2 right-2 h-1 cursor-ns-resize z-50" onMouseDown={(e) => handleMouseDownOnResize(e, 's')} />
              <div className="absolute left-0 top-2 bottom-2 w-1 cursor-ew-resize z-50" onMouseDown={(e) => handleMouseDownOnResize(e, 'w')} />
              <div className="absolute right-0 top-2 bottom-2 w-1 cursor-ew-resize z-50" onMouseDown={(e) => handleMouseDownOnResize(e, 'e')} />
              {/* Corners */}
              <div className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-50" onMouseDown={(e) => handleMouseDownOnResize(e, 'nw')} />
              <div className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize z-50" onMouseDown={(e) => handleMouseDownOnResize(e, 'ne')} />
              <div className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize z-50" onMouseDown={(e) => handleMouseDownOnResize(e, 'sw')} />
              <div className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-50" onMouseDown={(e) => handleMouseDownOnResize(e, 'se')} />
            </>)}
          </div>
        </div>
      </motion.div>
  )
}

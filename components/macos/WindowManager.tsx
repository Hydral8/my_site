'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { WindowState, AppDefinition, Position, Size } from '@/types/macos'

interface WindowManagerContextType {
  windows: WindowState[]
  apps: AppDefinition[]
  activeWindowId: string | null
  openWindow: (appId: string) => void
  closeWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  maximizeWindow: (windowId: string) => void
  focusWindow: (windowId: string) => void
  updateWindowPosition: (windowId: string, position: Position) => void
  updateWindowSize: (windowId: string, size: Size) => void
  registerApp: (app: AppDefinition) => void
  registerDockIconPosition: (appId: string, position: { x: number; y: number }) => void
  getDockIconPosition: (appId: string) => { x: number; y: number } | null
  registerMinimizedWindowPosition: (windowId: string, position: { x: number; y: number }) => void
  getMinimizedWindowPosition: (windowId: string) => { x: number; y: number } | null
  restoreWindow: (windowId: string) => void
  setMinimizedPreview: (windowId: string, html: string, size: { width: number; height: number }) => void
}

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined)

export function useWindowManager() {
  const context = useContext(WindowManagerContext)
  if (!context) {
    throw new Error('useWindowManager must be used within WindowManagerProvider')
  }
  return context
}

interface WindowManagerProviderProps {
  children: ReactNode
}

export function WindowManagerProvider({ children }: WindowManagerProviderProps) {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [apps, setApps] = useState<AppDefinition[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [nextZIndex, setNextZIndex] = useState(1000)
  const [windowIdCounter, setWindowIdCounter] = useState(0)
  const [dockIconPositions, setDockIconPositions] = useState<Map<string, { x: number; y: number }>>(new Map())
  const [minimizedWindowPositions, setMinimizedWindowPositions] = useState<Map<string, { x: number; y: number }>>(new Map())

  const registerApp = useCallback((app: AppDefinition) => {
    setApps((prev) => {
      const exists = prev.find((a) => a.id === app.id)
      if (exists) return prev
      return [...prev, app]
    })
  }, [])

  const focusWindow = useCallback((windowId: string) => {
    setActiveWindowId(windowId)
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, zIndex: nextZIndex } : w))
    )
    setNextZIndex((z) => z + 1)
  }, [nextZIndex])

  const openWindow = useCallback((appId: string) => {
    const app = apps.find((a) => a.id === appId)
    if (!app) return

    // Check if window already exists
    const existingWindow = windows.find((w) => w.appId === appId)
    if (existingWindow) {
      // If minimized, restore it
      if (existingWindow.isMinimized) {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === existingWindow.id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
          )
        )
        setNextZIndex((z) => z + 1)
      }
      // Focus the existing window
      focusWindow(existingWindow.id)
      return
    }

    // Create new window
    const newId = windowIdCounter + 1
    setWindowIdCounter(newId)
    const windowId = `${appId}-${newId}`
    
    // Only access window dimensions on client side
    const centerX = typeof window !== 'undefined' 
      ? (window.innerWidth - app.defaultSize.width) / 2 
      : 100
    const centerY = typeof window !== 'undefined' 
      ? (window.innerHeight - app.defaultSize.height) / 2 
      : 100

    const newWindow: WindowState = {
      id: windowId,
      appId,
      title: app.name,
      position: { x: Math.max(20, centerX), y: Math.max(60, centerY) },
      size: app.defaultSize,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
      isClosable: true,
    }

    setWindows((prev) => [...prev, newWindow])
    setActiveWindowId(windowId)
    setNextZIndex((z) => z + 1)
  }, [apps, windows, nextZIndex, windowIdCounter, focusWindow])

  const closeWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId))
    setActiveWindowId((current) => (current === windowId ? null : current))
  }, [])

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w))
    )
    setActiveWindowId((current) => (current === windowId ? null : current))
  }, [])

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== windowId) return w
        
        if (w.isMaximized) {
          // Restore to previous position and size
          return {
            ...w,
            isMaximized: false,
            position: w.preMaximizedPosition || w.position,
            size: w.preMaximizedSize || w.size,
            preMaximizedPosition: undefined,
            preMaximizedSize: undefined,
          }
        } else {
          // Maximize and save current position/size
          return {
            ...w,
            isMaximized: true,
            preMaximizedPosition: w.position,
            preMaximizedSize: w.size,
            position: { x: 0, y: 28 },
            size: typeof window !== 'undefined'
              ? { width: window.innerWidth, height: window.innerHeight - 28 - 70 }
              : w.size,
          }
        }
      })
    )
  }, [])

  const updateWindowPosition = useCallback((windowId: string, position: Position) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, position } : w))
    )
  }, [])

  const updateWindowSize = useCallback((windowId: string, size: Size) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, size } : w))
    )
  }, [])

  const registerDockIconPosition = useCallback((appId: string, position: { x: number; y: number }) => {
    setDockIconPositions((prev) => {
      const newMap = new Map(prev)
      newMap.set(appId, position)
      return newMap
    })
  }, [])

  const getDockIconPosition = useCallback((appId: string) => {
    return dockIconPositions.get(appId) || null
  }, [dockIconPositions])

  const registerMinimizedWindowPosition = useCallback((windowId: string, position: { x: number; y: number }) => {
    setMinimizedWindowPositions((prev) => {
      const newMap = new Map(prev)
      newMap.set(windowId, position)
      return newMap
    })
  }, [])

  const getMinimizedWindowPosition = useCallback((windowId: string) => {
    return minimizedWindowPositions.get(windowId) || null
  }, [minimizedWindowPositions])

  const restoreWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
      )
    )
    setNextZIndex((z) => z + 1)
    setActiveWindowId(windowId)
  }, [nextZIndex])

  const setMinimizedPreview = useCallback((windowId: string, html: string, size: { width: number; height: number }) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, minimizedPreviewHtml: html, minimizedSize: size } : w
      )
    )
  }, [])

  const value: WindowManagerContextType = {
    windows,
    apps,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    registerApp,
    registerDockIconPosition,
    getDockIconPosition,
    registerMinimizedWindowPosition,
    getMinimizedWindowPosition,
    restoreWindow,
    setMinimizedPreview,
  }

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  )
}

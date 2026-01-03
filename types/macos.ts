import { ReactNode } from 'react'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface WindowState {
  id: string
  appId: string
  title: string
  position: Position
  size: Size
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  isClosable: boolean
  preMaximizedPosition?: Position
  preMaximizedSize?: Size
  minimizedPreviewHtml?: string // HTML content of window when minimized
  minimizedSize?: Size // Size of window when minimized (for proper scaling)
}

export interface AppDefinition {
  id: string
  name: string
  icon: ReactNode | string
  className?: string
  component: React.ComponentType<AppComponentProps>
  defaultSize: Size
  minSize?: Size
  maxSize?: Size
  resizable: boolean
  minimizable: boolean
  customTrafficLights?: boolean // If true, app handles its own traffic lights
  titleBarBackground?: string // Custom background for title bar (CSS color value)
}

export interface WindowControls {
  close: () => void
  minimize: () => void
  maximize: () => void
}

export interface AppComponentProps {
  windowId: string
  isActive: boolean
  windowControls?: WindowControls // Only provided if customTrafficLights is true
}

export interface DockItem {
  appId: string
  name: string
  icon: ReactNode | string
}

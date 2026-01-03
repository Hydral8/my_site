'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import MenuBar from './MenuBar'
import DockBar from './DockBar'
import Window from './Window'
import { WindowManagerProvider, useWindowManager } from './WindowManager'
import AboutApp from './apps/AboutApp'
import ProjectsApp from './apps/ProjectsApp'
import ContactApp from './apps/ContactApp'
import TerminalApp from './apps/TerminalApp'
import { AppDefinition } from '@/types/macos'
import ChatApp from './apps/ChatApp'
import Image from 'next/image'
import { useSession } from '@/lib/useSession'
// import icons for the apps
// import AboutIcon from '../../public/icons/about.png'
// import ProjectsIcon from '../../public/icons/projects.png'
// import ContactIcon from '../../public/icons/contact.png'
// import TerminalIcon from '../../public/icons/terminal.png'
const apps: AppDefinition[] = [
  {
    id: 'about',
    name: 'About',
    icon: '/icons/finder.png',
    className: 'w-11 h-11',
    component: AboutApp,
    defaultSize: { width: 900, height: 650 },
    minSize: { width: 700, height: 500 },
    resizable: true,
    minimizable: true,
    customTrafficLights: true, // Finder-style app handles its own traffic lights
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: '/icons/photos.png',
    className: 'w-11 h-11',
    component: ProjectsApp,
    defaultSize: { width: 800, height: 600 },
    minSize: { width: 600, height: 400 },
    resizable: true,
    minimizable: true,
    customTrafficLights: true, // Photos-style app handles its own traffic lights
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: '/icons/contacts.png',
    className: 'w-10 h-10',
    component: ContactApp,
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 500, height: 400 },
    resizable: true,
    minimizable: true,
    customTrafficLights: true,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '/icons/terminal.webp',
    className: 'w-12 h-12',
    component: TerminalApp,
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 500, height: 300 },
    resizable: true,
    minimizable: true,
    titleBarBackground: '#2d2d2d', // Lighter gray title bar like macOS Terminal
  },
  {
    id: 'chat',
    name: 'Messages',
    icon: "/icons/chat.png",
    className: 'w-11 h-11',
    component: ChatApp,
    defaultSize: { width: 850, height: 600 },
    minSize: { width: 600, height: 400 },
    resizable: true,
    minimizable: true,
    customTrafficLights: true,
  },
]

function DesktopContent() {
  const { windows, registerApp, closeWindow, minimizeWindow, maximizeWindow, activeWindowId } = useWindowManager()
  const { sessionId } = useSession() // Automatically create/retrieve session on mount

  useEffect(() => {
    apps.forEach((app) => registerApp(app))
  }, [registerApp])

  // Session is automatically initialized via useSession hook
  // sessionId is available for use in child components if needed

  return (
    <>
      {/* Wallpaper */}
      <Image src="/bg/lake_tahoe.jpg" alt="Wallpaper" fill />


      {/* Menu Bar */}
      <MenuBar />

      {/* Windows */}
      {windows.map((window) => {
        const app = apps.find((a) => a.id === window.appId)
        if (!app) return null

        const AppComponent = app.component
        const isActive = activeWindowId === window.id

        // Create window controls for apps with custom traffic lights
        const windowControls = app.customTrafficLights
          ? {
              close: () => closeWindow(window.id),
              minimize: () => minimizeWindow(window.id),
              maximize: () => maximizeWindow(window.id),
            }
          : undefined

        return (
          <Window 
            key={window.id} 
            window={window}
          >
            <AppComponent 
              windowId={window.id} 
              isActive={isActive}
              windowControls={windowControls}
            />
          </Window>
        )
      })}

      {/* Dock */}
      <DockBar />
    </>
  )
}

export default function MacOSDesktop() {
  return (
    <WindowManagerProvider>
      <div className="w-screen h-screen overflow-hidden bg-black">
        <DesktopContent />
      </div>
    </WindowManagerProvider>
  )
}

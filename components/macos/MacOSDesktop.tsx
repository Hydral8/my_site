'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import MenuBar from './MenuBar'
import DockBar from './DockBar'
import Window, { WindowGlassFilter } from './Window'
import { WindowManagerProvider, useWindowManager } from './WindowManager'
import AboutApp from './apps/AboutApp'
import ProjectsApp from './apps/ProjectsApp'
import ContactApp from './apps/ContactApp'
import TerminalApp from './apps/TerminalApp'
import { AppDefinition } from '@/types/macos'
import ChatApp from './apps/ChatApp'
import ProfileApp from './apps/ProfileApp'
import Image from 'next/image'
import { useSession } from '@/lib/useSession'
import StickyNote from './StickyNote'
// import icons for the apps
// import AboutIcon from '../../public/icons/about.png'
// import ProjectsIcon from '../../public/icons/projects.png'
// import ContactIcon from '../../public/icons/contact.png'
// import TerminalIcon from '../../public/icons/terminal.png'
const apps: AppDefinition[] = [
  {
    id: 'profile',
    name: 'Profile',
    icon: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-11 h-11">
        <rect width="120" height="120" rx="26" fill="url(#profile-bg)" />
        <circle cx="60" cy="46" r="18" fill="white" fillOpacity="0.9" />
        <ellipse cx="60" cy="88" rx="28" ry="20" fill="white" fillOpacity="0.9" />
        <defs>
          <linearGradient id="profile-bg" x1="60" y1="0" x2="60" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5FC3E4" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
    ),
    className: 'w-11 h-11',
    component: ProfileApp,
    defaultSize: { width: 1050, height: 700 },
    minSize: { width: 600, height: 450 },
    resizable: true,
    minimizable: true,
    customTrafficLights: true,
    showInDock: false,
  },
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

function DesktopProfileIcon() {
  const { openWindow } = useWindowManager()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
    >
      <motion.div
        onClick={() => openWindow('profile')}
        className="flex flex-col items-center gap-3 cursor-default pointer-events-auto group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Profile icon */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white/20 group-hover:ring-white/40 transition-all shadow-2xl">
          <Image
            src="/images/profile.jpg"
            alt="Profile"
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>
        {/* Label */}
        <span className="text-white text-sm font-bold drop-shadow-lg">
          HELP
        </span>
      </motion.div>
    </motion.div>
  )
}

function DesktopContent() {
  const { windows, registerApp, closeWindow, minimizeWindow, maximizeWindow } = useWindowManager()
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

      {/* Global SVG filter for window glass effect (only one instance needed) */}
      <WindowGlassFilter />

      {/* Desktop Profile Icon - centered */}
      <DesktopProfileIcon />

      {/* Menu Bar */}
      <MenuBar />

      {/* Sticky Note */}
      <StickyNote />

      {/* Windows */}
      {windows.map((window) => {
        const app = apps.find((a) => a.id === window.appId)
        if (!app) return null

        const AppComponent = app.component

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

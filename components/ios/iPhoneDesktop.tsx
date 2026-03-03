'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import LockScreen from './LockScreen'
import HomeScreen from './HomeScreen'
import AppScreen from './AppScreen'
import MobileAboutApp from './apps/MobileAboutApp'
import MobileProjectsApp from './apps/MobileProjectsApp'
import MobileContactApp from './apps/MobileContactApp'
import MobileTerminalApp from './apps/MobileTerminalApp'
import MobileChatApp from './apps/MobileChatApp'
import { useSession } from '@/lib/useSession'

interface IOSApp {
  id: string
  name: string
  icon: string
}

const allApps: IOSApp[] = [
  { id: 'about', name: 'About', icon: '/icons/finder.png' },
  { id: 'projects', name: 'Projects', icon: '/icons/photos.png' },
  { id: 'contact', name: 'Contacts', icon: '/icons/contacts.png' },
  { id: 'terminal', name: 'Terminal', icon: '/icons/terminal.webp' },
  { id: 'chat', name: 'Messages', icon: '/icons/chat.png' },
]

// First 4 apps go in the dock, rest in the grid
const gridApps = allApps.slice(0, 1) // About goes in grid
const dockApps = allApps.slice(1) // Projects, Contacts, Terminal, Messages in dock

const appComponents: Record<string, { component: React.ComponentType; name: string; statusBarLight?: boolean; hideNavBar?: boolean }> = {
  about: { component: MobileAboutApp, name: 'About' },
  projects: { component: MobileProjectsApp, name: 'Projects' },
  contact: { component: MobileContactApp, name: 'Contacts' },
  terminal: { component: MobileTerminalApp, name: 'Terminal', hideNavBar: true },
  chat: { component: MobileChatApp, name: 'Messages', hideNavBar: true },
}

export default function IPhoneDesktop() {
  const [isLocked, setIsLocked] = useState(true)
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const { sessionId } = useSession()

  const handleOpenApp = (appId: string) => {
    setActiveApp(appId)
  }

  const handleCloseApp = () => {
    setActiveApp(null)
  }

  const activeAppConfig = activeApp ? appComponents[activeApp] : null
  const ActiveComponent = activeAppConfig?.component

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      {/* Wallpaper */}
      <Image src="/bg/lake_tahoe.jpg" alt="Wallpaper" fill className="object-cover" priority />

      {/* Lock Screen */}
      <AnimatePresence>
        {isLocked && (
          <LockScreen onUnlock={() => setIsLocked(false)} />
        )}
      </AnimatePresence>

      {/* Home Screen */}
      {!isLocked && (
        <div className="absolute inset-0">
          <HomeScreen
            apps={gridApps}
            dockApps={dockApps}
            onOpenApp={handleOpenApp}
          />
        </div>
      )}

      {/* Active App */}
      <AnimatePresence>
        {activeApp && ActiveComponent && activeAppConfig && (
          <AppScreen
            appName={activeAppConfig.name}
            onBack={handleCloseApp}
            statusBarLight={activeAppConfig.statusBarLight}
            hideNavBar={activeAppConfig.hideNavBar}
          >
            <ActiveComponent />
          </AppScreen>
        )}
      </AnimatePresence>
    </div>
  )
}

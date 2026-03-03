'use client'

import { motion } from 'framer-motion'
import StatusBar from './StatusBar'
import Image from 'next/image'

interface IOSApp {
  id: string
  name: string
  icon: string
}

interface HomeScreenProps {
  apps: IOSApp[]
  dockApps: IOSApp[]
  onOpenApp: (appId: string) => void
}

function AppIcon({ app, onTap, delay }: { app: IOSApp; onTap: () => void; delay: number }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      whileTap={{ scale: 0.85 }}
      onClick={onTap}
      className="flex flex-col items-center gap-1.5"
    >
      <div className="w-[60px] h-[60px] rounded-[14px] overflow-hidden bg-white/10 shadow-lg">
        <Image
          src={app.icon}
          alt={app.name}
          width={60}
          height={60}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      <span className="text-white text-[11px] font-medium drop-shadow-sm">
        {app.name}
      </span>
    </motion.button>
  )
}

export default function HomeScreen({ apps, dockApps, onOpenApp }: HomeScreenProps) {
  return (
    <div className="h-full flex flex-col">
      <StatusBar light />

      {/* App Grid */}
      <div className="flex-1 px-6 pt-4">
        <div className="grid grid-cols-4 gap-y-6 gap-x-4 justify-items-center">
          {apps.map((app, i) => (
            <AppIcon
              key={app.id}
              app={app}
              onTap={() => onOpenApp(app.id)}
              delay={0.05 * i}
            />
          ))}
        </div>
      </div>

      {/* Page Dots */}
      <div className="flex justify-center gap-1.5 py-2">
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
      </div>

      {/* Dock */}
      <div className="px-4 pb-2">
        <div
          className="flex items-center justify-around px-4 py-3 rounded-[22px]"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {dockApps.map((app) => (
            <motion.button
              key={app.id}
              whileTap={{ scale: 0.85 }}
              onClick={() => onOpenApp(app.id)}
              className="w-[50px] h-[50px] rounded-[12px] overflow-hidden bg-white/10 shadow-lg"
            >
              <Image
                src={app.icon}
                alt={app.name}
                width={50}
                height={50}
                className="w-full h-full object-cover"
                priority
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Home Indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 bg-white/40 rounded-full" />
      </div>
    </div>
  )
}

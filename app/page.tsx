'use client'

import { useIsMobile } from '@/lib/useIsMobile'
import MacOSDesktop from '@/components/macos/MacOSDesktop'
import IPhoneDesktop from '@/components/ios/iPhoneDesktop'

export default function Home() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <IPhoneDesktop />
  }

  return <MacOSDesktop />
}

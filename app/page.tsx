'use client'

import { useState } from 'react'
import BugCanvas from '@/components/BugCanvas'
import ScrambledText from '@/components/ScrambledText'
import ScrollDecodedText from '@/components/ScrollDecodedText'
import About from '@/components/sections/About'
import Projects from '@/components/sections/Projects'
import Contact from '@/components/sections/Contact'

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState(false)

  const handleUnlock = () => {
    setIsUnlocked(true)
  }

  return (
    <main className="relative min-h-screen">
      {/* Bug Canvas Overlay */}
      {!isUnlocked && <BugCanvas onCatch={handleUnlock} />}

      {/* Main Content */}
      <div className="relative z-10 px-6 py-12 md:px-12 lg:px-24">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center">
          <ScrambledText isUnlocked={isUnlocked} className="mb-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 glow-cyan">
              Sung Jae Bae
            </h1>
          </ScrambledText>

          <ScrambledText isUnlocked={isUnlocked} className="mb-8">
            <p className="text-xl md:text-2xl text-accent-purple">
              Builder · Innovator · Explorer
            </p>
          </ScrambledText>

          {isUnlocked ? (
          <ScrollDecodedText 
            isUnlocked={isUnlocked}
            decodeSpeed={20}
          >
            <p className="text-lg text-accent-white/80 max-w-2xl">
              Welcome. You've unlocked the experience.
            </p>
          </ScrollDecodedText>
          ) : (
            <p className="text-lg text-accent-white/80 max-w-2xl">
              Catch the bug to reveal the story...
            </p>
          )}
        </section>

        {/* Sections - Revealed after unlock */}
        {isUnlocked && (
          <>
            <About isUnlocked={isUnlocked} />
            <Projects isUnlocked={isUnlocked} />
            <Contact isUnlocked={isUnlocked} />
          </>
        )}
      </div>
    </main>
  )
}

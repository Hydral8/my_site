'use client'

import { ReactNode, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScramble } from '@/hooks/useScramble'
import { useDecode } from '@/hooks/useDecode'

interface ScrambledTextProps {
  children: ReactNode
  isUnlocked: boolean
  className?: string
  decodeDelay?: number
}

export default function ScrambledText({
  children,
  isUnlocked,
  className = '',
  decodeDelay = 0,
}: ScrambledTextProps) {
  const [shouldDecode, setShouldDecode] = useState(false)

  // Extract text content from children
  const textContent = typeof children === 'string'
    ? children
    : extractTextFromChildren(children)

  // Scramble effect when locked
  const scrambledText = useScramble(textContent, !isUnlocked, 50)

  // Decode effect when unlocked
  const { decodedText } = useDecode(textContent, shouldDecode, 100)

  useEffect(() => {
    if (isUnlocked) {
      const timeout = setTimeout(() => {
        setShouldDecode(true)
      }, decodeDelay)
      return () => clearTimeout(timeout)
    } else {
      setShouldDecode(false)
    }
  }, [isUnlocked, decodeDelay])

  const displayText = isUnlocked ? decodedText : scrambledText

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isUnlocked ? 'unlocked' : 'locked'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`font-mono ${className}`}
      >
        {isUnlocked && shouldDecode ? children : <span>{displayText}</span>}
      </motion.div>
    </AnimatePresence>
  )
}

// Helper function to extract text from React children
function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('')
  }
  if (children && typeof children === 'object' && 'props' in children) {
    const element = children as any
    if (element.props && element.props.children) {
      return extractTextFromChildren(element.props.children)
    }
  }
  return ''
}

'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useScrollDecode } from '@/hooks/useScrollDecode'

// Same character set as useScramble for consistency
const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

interface ScrollDecodedTextProps {
  children: ReactNode
  isUnlocked: boolean
  className?: string
  decodeSpeed?: number
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

export default function ScrollDecodedText({
  children,
  isUnlocked,
  className = '',
  decodeSpeed = 15,
}: ScrollDecodedTextProps) {
  const textContent = extractTextFromChildren(children)

  // Use scroll-based decoding
  const { decodedText, elementRef, isVisible } = useScrollDecode(
    textContent,
    isUnlocked,
    decodeSpeed
  )

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`font-mono ${className}`}
    >
      {isUnlocked ? (
        <span>{decodedText}</span>
      ) : (
        <span className="opacity-50">
          {textContent.split('').map((char, index) => {
            // Preserve spaces and newlines, scramble other characters
            if (char === ' ' || char === '\n' || char === '\t') return char
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          }).join('')}
        </span>
      )}
    </motion.div>
  )
}

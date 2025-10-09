import { useEffect, useState, useRef, useCallback } from 'react'

// Same character set as useScramble for consistency
const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export function useScrollDecode(
  originalText: string,
  isActive: boolean,
  decodeSpeed: number = 15 // ms per character reveal
) {
  const [decodedText, setDecodedText] = useState('')
  const [decodeProgress, setDecodeProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const decodeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const getRandomChar = useCallback(() => {
    return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
  }, [])

  useEffect(() => {
    if (!isActive) {
      setDecodeProgress(0)
      setDecodedText('')
      if (decodeIntervalRef.current) {
        clearInterval(decodeIntervalRef.current)
        decodeIntervalRef.current = null
      }
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      observer.disconnect()
      if (decodeIntervalRef.current) {
        clearInterval(decodeIntervalRef.current)
      }
    }
  }, [isActive, originalText, decodeSpeed, getRandomChar])

  const startDecoding = () => {
    if (decodeIntervalRef.current) return // Already decoding

    const totalChars = originalText.length
    let currentProgress = 0

    decodeIntervalRef.current = setInterval(() => {
      currentProgress = Math.min(currentProgress + 1, totalChars)
      setDecodeProgress(currentProgress)

      // Build decoded text by revealing characters progressively with scrambling
      const revealed = originalText.slice(0, currentProgress)
      const hidden = originalText
        .slice(currentProgress)
        .split('')
        .map((char) => {
          // Preserve spaces and newlines, scramble other characters
          if (char === ' ' || char === '\n' || char === '\t') return char
          return getRandomChar()
        })
        .join('')

      setDecodedText(revealed + hidden)

      if (currentProgress >= totalChars) {
        setDecodedText(originalText)
        if (decodeIntervalRef.current) {
          clearInterval(decodeIntervalRef.current)
          decodeIntervalRef.current = null
        }
      }
    }, decodeSpeed)
  }

  useEffect(() => {
    if (isVisible && isActive && decodeProgress < originalText.length) {
      startDecoding()
    } else if (!isVisible && decodeIntervalRef.current) {
      clearInterval(decodeIntervalRef.current)
      decodeIntervalRef.current = null
    }
  }, [isVisible, isActive, originalText.length, decodeProgress, startDecoding])

  return { decodedText, elementRef, isVisible }
}

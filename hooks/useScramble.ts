import { useEffect, useState, useCallback } from 'react'

// Character set for scrambling
const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export function useScramble(text: string, isActive: boolean, speed: number = 50) {
  const [scrambledText, setScrambledText] = useState(text)

  const getRandomChar = useCallback(() => {
    return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
  }, [])

  useEffect(() => {
    if (!isActive) {
      setScrambledText(text)
      return
    }

    // Scramble all characters rapidly
    const interval = setInterval(() => {
      setScrambledText(
        text
          .split('')
          .map((char) => {
            // Preserve spaces and newlines
            if (char === ' ' || char === '\n') return char
            return getRandomChar()
          })
          .join('')
      )
    }, speed)

    return () => clearInterval(interval)
  }, [text, isActive, speed, getRandomChar])

  return scrambledText
}

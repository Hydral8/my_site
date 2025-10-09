import { useEffect, useState } from 'react'

export function useDecode(
  originalText: string,
  shouldDecode: boolean,
  decodeSpeed: number = 100 // ms per iteration
) {
  const [decodedText, setDecodedText] = useState('')
  const [decodeProgress, setDecodeProgress] = useState(0)

  useEffect(() => {
    if (!shouldDecode) {
      setDecodeProgress(0)
      setDecodedText('')
      return
    }

    // Progressive decode: 5% of characters per iteration
    const totalChars = originalText.length
    const charsPerIteration = Math.max(1, Math.ceil(totalChars * 0.05))

    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress = Math.min(currentProgress + charsPerIteration, totalChars)
      setDecodeProgress(currentProgress)

      // Build decoded text by revealing characters from start
      const revealed = originalText.slice(0, currentProgress)
      const hidden = originalText
        .slice(currentProgress)
        .split('')
        .map((char) => (char === ' ' || char === '\n' ? char : '█'))
        .join('')

      setDecodedText(revealed + hidden)

      if (currentProgress >= totalChars) {
        setDecodedText(originalText)
        clearInterval(interval)
      }
    }, decodeSpeed)

    return () => clearInterval(interval)
  }, [originalText, shouldDecode, decodeSpeed])

  return { decodedText, progress: decodeProgress / originalText.length }
}

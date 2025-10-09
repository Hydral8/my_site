import { useEffect, useRef, useState, useCallback } from 'react'

interface Position {
  x: number
  y: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

export function useBugGame(onCatch: () => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bugPosition = useRef<Position>({ x: 0, y: 0 })
  const paddlePosition = useRef<Position>({ x: 0, y: 0 })
  const particles = useRef<Particle[]>([])
  const [isCaught, setIsCaught] = useState(false)

  const bugVelocity = useRef<Position>({ x: 3.5, y: 3.0 })
  const animationFrameId = useRef<number | undefined>(undefined)
  const glowPhase = useRef(0)
  
  // Bug behavior states
  const bugState = useRef<'wandering' | 'dodging' | 'panicking'>('wandering')
  const directionChangeTimer = useRef(0)
  const randomDirection = useRef<Position>({ x: 1, y: 1 })
  const lastDirectionChange = useRef(0)
  
  // Panic exclamation system
  const panicExclamations = useRef<Array<{x: number, y: number, life: number, text: string}>>([])
  
  // Intelligence system
  const userVelocity = useRef<Position>({ x: 0, y: 0 })
  const lastUserPosition = useRef<Position>({ x: 0, y: 0 })
  const intelligenceTimer = useRef(0)

  // Initialize bug position
  useEffect(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    bugPosition.current = {
      x: width * 0.7,
      y: height * 0.3,
    }
  }, [])

  // Mouse/touch tracking for paddle
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      // Calculate user velocity for predictive evasion
      const currentPos = { x: clientX, y: clientY }
      userVelocity.current = {
        x: currentPos.x - lastUserPosition.current.x,
        y: currentPos.y - lastUserPosition.current.y
      }
      
      paddlePosition.current = currentPos
      lastUserPosition.current = currentPos
    }

    const handleClick = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      // Check if click is near bug
      const distance = Math.sqrt(
        Math.pow(bugPosition.current.x - clientX, 2) + 
        Math.pow(bugPosition.current.y - clientY, 2)
      )
      
      if (distance < 50) { // Click within 50px of bug
        // Play sound effect
        playSwatSound()
        
        // Create explosion and catch bug
        createExplosion(bugPosition.current.x, bugPosition.current.y)
        setIsCaught(true)
        setTimeout(onCatch, 500)
      }
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('click', handleClick)
    window.addEventListener('touchstart', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('touchstart', handleClick)
    }
  }, [])

  // Collision detection
  const checkCollision = useCallback(
    (bugPos: Position, paddlePos: Position) => {
      const distance = Math.sqrt(
        Math.pow(bugPos.x - paddlePos.x, 2) + Math.pow(bugPos.y - paddlePos.y, 2)
      )
      return distance < 40 // Collision threshold
    },
    []
  )

  // Generate random bug-like direction changes
  const generateRandomDirection = useCallback(() => {
    const angle = Math.random() * Math.PI * 2
    const speed = 3.0 + Math.random() * 3.0 // Even faster base speed and variation
    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    }
  }, [])

  // Play swat sound effect
  const playSwatSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create a more realistic swat sound with multiple components
      const createSwatSound = () => {
        // Main "thwack" sound - low frequency impact
        const oscillator1 = audioContext.createOscillator()
        const gain1 = audioContext.createGain()
        oscillator1.connect(gain1)
        gain1.connect(audioContext.destination)
        
        oscillator1.type = 'sawtooth'
        oscillator1.frequency.setValueAtTime(80, audioContext.currentTime)
        oscillator1.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.15)
        
        gain1.gain.setValueAtTime(0.4, audioContext.currentTime)
        gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
        
        oscillator1.start(audioContext.currentTime)
        oscillator1.stop(audioContext.currentTime + 0.15)
        
        // High frequency "crack" - the sharp impact
        const oscillator2 = audioContext.createOscillator()
        const gain2 = audioContext.createGain()
        oscillator2.connect(gain2)
        gain2.connect(audioContext.destination)
        
        oscillator2.type = 'square'
        oscillator2.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator2.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.05)
        
        gain2.gain.setValueAtTime(0.2, audioContext.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
        
        oscillator2.start(audioContext.currentTime)
        oscillator2.stop(audioContext.currentTime + 0.05)
        
        // Noise component for the "whoosh" of air displacement
        const bufferSize = audioContext.sampleRate * 0.1
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
        const output = buffer.getChannelData(0)
        
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
        }
        
        const noiseSource = audioContext.createBufferSource()
        const noiseGain = audioContext.createGain()
        noiseSource.buffer = buffer
        noiseSource.connect(noiseGain)
        noiseGain.connect(audioContext.destination)
        
        noiseGain.gain.setValueAtTime(0.1, audioContext.currentTime)
        noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        
        noiseSource.start(audioContext.currentTime)
        noiseSource.stop(audioContext.currentTime + 0.1)
      }
      
      createSwatSound()
    } catch (error) {
      console.log('Audio not supported:', error)
    }
  }, [])

  // Calculate wall avoidance force
  const calculateWallAvoidance = useCallback((bugPos: Position, width: number, height: number) => {
    const avoidanceRadius = 30 // Allow getting closer to walls
    const maxAvoidanceForce = 1.5 // Reduced force to allow more space usage
    
    let forceX = 0
    let forceY = 0
    
    // Left wall - gentle force when very close
    if (bugPos.x < avoidanceRadius) {
      const distance = bugPos.x
      const normalizedDistance = distance / avoidanceRadius
      const force = maxAvoidanceForce * (1 - normalizedDistance) // Linear falloff
      forceX += force
    }
    // Right wall
    if (bugPos.x > width - avoidanceRadius) {
      const distance = width - bugPos.x
      const normalizedDistance = distance / avoidanceRadius
      const force = maxAvoidanceForce * (1 - normalizedDistance)
      forceX -= force
    }
    // Top wall
    if (bugPos.y < avoidanceRadius) {
      const distance = bugPos.y
      const normalizedDistance = distance / avoidanceRadius
      const force = maxAvoidanceForce * (1 - normalizedDistance)
      forceY += force
    }
    // Bottom wall
    if (bugPos.y > height - avoidanceRadius) {
      const distance = height - bugPos.y
      const normalizedDistance = distance / avoidanceRadius
      const force = maxAvoidanceForce * (1 - normalizedDistance)
      forceY -= force
    }
    
    return { x: forceX, y: forceY }
  }, [])

  // Calculate predictive evasion
  const calculatePredictiveEvasion = useCallback((bugPos: Position, userPos: Position, userVel: Position) => {
    // Enhanced multi-point prediction system
    const predictions = []
    
    // Predict user position at multiple future time points
    for (let t = 0.1; t <= 1.0; t += 0.1) {
      const predictedX = userPos.x + userVel.x * t * 60 // Scale for 60fps
      const predictedY = userPos.y + userVel.y * t * 60
      predictions.push({ x: predictedX, y: predictedY, time: t })
    }
    
    // Calculate evasion force for each prediction
    let totalEvasionX = 0
    let totalEvasionY = 0
    let totalWeight = 0
    
    predictions.forEach((pred) => {
      const dx = bugPos.x - pred.x
      const dy = bugPos.y - pred.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > 0 && distance < 300) { // Extended range
        // Weight closer predictions more heavily
        const timeWeight = 1.0 - (pred.time * 0.3)
        const distanceWeight = (300 - distance) / 300
        const weight = timeWeight * distanceWeight * 2.5 // Stronger overall force
        
        totalEvasionX += (dx / distance) * weight
        totalEvasionY += (dy / distance) * weight
        totalWeight += weight
      }
    })
    
    // Normalize by total weight
    if (totalWeight > 0) {
      return {
        x: totalEvasionX / totalWeight,
        y: totalEvasionY / totalWeight
      }
    }
    
    return { x: 0, y: 0 }
  }, [])

  // Find optimal gap between user and walls
  const findOptimalGap = useCallback((bugPos: Position, userPos: Position, width: number, height: number) => {
    const minDistanceFromWall = 20 // Minimum safe distance from walls
    const minDistanceFromUser = 60 // Minimum safe distance from user
    
    // Calculate distances to all walls
    const distToLeftWall = bugPos.x
    const distToRightWall = width - bugPos.x
    const distToTopWall = bugPos.y
    const distToBottomWall = height - bugPos.y
    
    // Calculate distance to user
    const distToUser = Math.sqrt(
      Math.pow(bugPos.x - userPos.x, 2) + Math.pow(bugPos.y - userPos.y, 2)
    )
    
    // Find the direction that maximizes distance from both user and walls
    let bestDirectionX = 0
    let bestDirectionY = 0
    let bestScore = -Infinity
    
    // Test multiple directions to find the best gap
    const numDirections = 16
    for (let i = 0; i < numDirections; i++) {
      const angle = (i / numDirections) * Math.PI * 2
      const testX = Math.cos(angle)
      const testY = Math.sin(angle)
      
      // Calculate how far we can move in this direction before hitting walls
      let maxMoveDistance = Infinity
      if (testX > 0) {
        maxMoveDistance = Math.min(maxMoveDistance, (width - minDistanceFromWall - bugPos.x) / testX)
      } else if (testX < 0) {
        maxMoveDistance = Math.min(maxMoveDistance, (minDistanceFromWall - bugPos.x) / testX)
      }
      
      if (testY > 0) {
        maxMoveDistance = Math.min(maxMoveDistance, (height - minDistanceFromWall - bugPos.y) / testY)
      } else if (testY < 0) {
        maxMoveDistance = Math.min(maxMoveDistance, (minDistanceFromWall - bugPos.y) / testY)
      }
      
      // Calculate where we'd be after moving
      const newX = bugPos.x + testX * maxMoveDistance * 0.5
      const newY = bugPos.y + testY * maxMoveDistance * 0.5
      
      // Calculate distance from user at new position
      const newDistToUser = Math.sqrt(
        Math.pow(newX - userPos.x, 2) + Math.pow(newY - userPos.y, 2)
      )
      
      // Calculate distances to walls at new position
      const newDistToLeftWall = newX
      const newDistToRightWall = width - newX
      const newDistToTopWall = newY
      const newDistToBottomWall = height - newY
      
      // Score this direction based on how well it balances distance from user and walls
      const wallScore = Math.min(newDistToLeftWall, newDistToRightWall, newDistToTopWall, newDistToBottomWall)
      const userScore = newDistToUser
      
      // Prefer directions that keep us away from user while staying reasonably close to walls
      const score = userScore * 0.7 + wallScore * 0.3
      
      if (score > bestScore) {
        bestScore = score
        bestDirectionX = testX
        bestDirectionY = testY
      }
    }
    
    return { x: bestDirectionX, y: bestDirectionY }
  }, [])

  // Calculate escape vector to avoid getting cornered
  const calculateEscapeVector = useCallback((bugPos: Position, userPos: Position, width: number, height: number) => {
    // Use gap-finding algorithm to find optimal escape route
    const gapDirection = findOptimalGap(bugPos, userPos, width, height)
    
    // Scale the direction based on urgency (closer to user = stronger force)
    const distToUser = Math.sqrt(
      Math.pow(bugPos.x - userPos.x, 2) + Math.pow(bugPos.y - userPos.y, 2)
    )
    
    const urgency = Math.min(1.0, 150 / distToUser) // Stronger when closer to user
    const force = 0.8 + urgency * 0.4 // Base force + urgency bonus
    
    return {
      x: gapDirection.x * force,
      y: gapDirection.y * force
    }
  }, [findOptimalGap])

  // Add panic exclamation
  const addPanicExclamation = useCallback((x: number, y: number) => {
    const exclamations = ['!', '!!', '!!!', '?!', '!?']
    const text = exclamations[Math.floor(Math.random() * exclamations.length)]
    
    panicExclamations.current.push({
      x: x + (Math.random() - 0.5) * 40,
      y: y - 30 + (Math.random() - 0.5) * 20,
      life: 1,
      text
    })
  }, [])

  // Create particle explosion
  const createExplosion = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30
      const speed = 2 + Math.random() * 4
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
      })
    }
    particles.current = newParticles
  }, [])

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isCaught) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      const width = canvas.width
      const height = canvas.height

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Calculate distance to paddle for behavior decisions
      const dx = paddlePosition.current.x - bugPosition.current.x
      const dy = paddlePosition.current.y - bugPosition.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Enhanced intelligent state transitions based on distance and user velocity
      const previousState = bugState.current
      const userSpeed = Math.sqrt(
        Math.pow(userVelocity.current.x, 2) + Math.pow(userVelocity.current.y, 2)
      )
      
      // More aggressive state transitions
      if (distance < 60) { // Reduced threshold for panic
        bugState.current = 'panicking'
        // Add panic exclamation when entering panic state
        if (previousState !== 'panicking') {
          addPanicExclamation(bugPosition.current.x, bugPosition.current.y)
        }
      } else if (distance < 120) { // Reduced threshold for dodging
        bugState.current = 'dodging'
      } else if (distance > 180) { // Increased threshold for wandering
        bugState.current = 'wandering'
      }
      
      // Velocity-based state transitions for extra intelligence
      if (userSpeed > 4 && distance < 100) {
        // User moving fast and close - force panic
        bugState.current = 'panicking'
        if (previousState !== 'panicking') {
          addPanicExclamation(bugPosition.current.x, bugPosition.current.y)
        }
      } else if (userSpeed > 2 && distance < 140) {
        // User moving moderately fast - force dodging
        bugState.current = 'dodging'
      }

      // Update intelligence timer
      intelligenceTimer.current++

      // Calculate intelligent forces
      const wallForce = calculateWallAvoidance(bugPosition.current, width, height)
      const predictiveForce = calculatePredictiveEvasion(bugPosition.current, paddlePosition.current, userVelocity.current)
      const escapeForce = calculateEscapeVector(bugPosition.current, paddlePosition.current, width, height)

      // Update direction change timer
      directionChangeTimer.current++
      const timeSinceLastChange = directionChangeTimer.current - lastDirectionChange.current

      // Intelligent movement calculation
      let movementX = bugVelocity.current.x
      let movementY = bugVelocity.current.y

      if (bugState.current === 'wandering') {
        // Random direction changes every 60-120 frames (1-2 seconds at 60fps)
        if (timeSinceLastChange > 60 + Math.random() * 60) {
          randomDirection.current = generateRandomDirection()
          lastDirectionChange.current = directionChangeTimer.current
        }
        
        // Mix current velocity with random direction for natural wandering
        movementX = bugVelocity.current.x * 0.6 + randomDirection.current.x * 0.4
        movementY = bugVelocity.current.y * 0.6 + randomDirection.current.y * 0.4
        
        // Apply wall avoidance with higher strength
        movementX += wallForce.x * 1.5
        movementY += wallForce.y * 1.5
        
        // Add small random jitter
        movementX += (Math.random() - 0.5) * 0.2
        movementY += (Math.random() - 0.5) * 0.2
        
      } else if (bugState.current === 'dodging') {
        // Enhanced intelligent dodging with multiple strategies
        const dodgeStrength = 7.0 + Math.random() * 1.0 // Increased strength
        
        // Multi-layered evasion strategy
        const primaryEvasion = escapeForce.x * dodgeStrength + escapeForce.y * dodgeStrength
        const predictiveEvasion = predictiveForce.x * 1.0 + predictiveForce.y * 1.0
        const wallEvasion = wallForce.x * 0.5 + wallForce.y * 0.5
        
        // Combine strategies with intelligent weighting
        movementX = escapeForce.x * dodgeStrength + predictiveForce.x * 1.0 + wallForce.x * 0.5
        movementY = escapeForce.y * dodgeStrength + predictiveForce.y * 1.0 + wallForce.y * 0.5
        
        // Add strategic randomness for unpredictability
        movementX += (Math.random() - 0.5) * 0.6
        movementY += (Math.random() - 0.5) * 0.6
        
        // Add micro-adjustments based on user movement patterns
        if (Math.abs(userVelocity.current.x) > 2 || Math.abs(userVelocity.current.y) > 2) {
          // User is moving fast, add counter-movement
          movementX -= userVelocity.current.x * 0.3
          movementY -= userVelocity.current.y * 0.3
        }
        
      } else if (bugState.current === 'panicking') {
        // Enhanced intelligent panicking with advanced evasion
        const panicStrength = 9.0 + Math.random() * 2.0 // Increased strength
        
        // Multi-strategy panic evasion
        movementX = (escapeForce.x * 1.0 + predictiveForce.x * 0.4 + wallForce.x * 0.2) * panicStrength
        movementY = (escapeForce.y * 1.0 + predictiveForce.y * 0.4 + wallForce.y * 0.2) * panicStrength

        // Add high randomness for erratic behavior
        movementX += (Math.random() - 0.5) * 1.5
        movementY += (Math.random() - 0.5) * 1.5
        
        // Add aggressive counter-movement to user velocity
        movementX -= userVelocity.current.x * 0.5
        movementY -= userVelocity.current.y * 0.5
        
        // Occasionally change direction completely when panicking
        if (Math.random() < 0.2) { // Increased frequency
          randomDirection.current = generateRandomDirection()
          movementX = randomDirection.current.x * 1.8 + wallForce.x * 0.4
          movementY = randomDirection.current.y * 1.8 + wallForce.y * 0.4
        }
        
        // Add zigzag pattern when very close to user
        const distToUser = Math.sqrt(
          Math.pow(bugPosition.current.x - paddlePosition.current.x, 2) + 
          Math.pow(bugPosition.current.y - paddlePosition.current.y, 2)
        )
        
        if (distToUser < 100) {
          // Add perpendicular movement for zigzag
          const perpendicularX = -userVelocity.current.y * 0.3
          const perpendicularY = userVelocity.current.x * 0.3
          movementX += perpendicularX
          movementY += perpendicularY
        }
      }

      // Update bug position
      let newX = bugPosition.current.x + movementX
      let newY = bugPosition.current.y + movementY

      // Intelligent wall handling - stronger push-away forces
      if (newX < 30) {
        newX = 30
        movementX = Math.max(2.0, movementX) // Much stronger push away from wall
      } else if (newX > width - 30) {
        newX = width - 30
        movementX = Math.min(-2.0, movementX) // Much stronger push away from wall
      }
      
      if (newY < 30) {
        newY = 30
        movementY = Math.max(2.0, movementY) // Much stronger push away from wall
      } else if (newY > height - 30) {
        newY = height - 30
        movementY = Math.min(-2.0, movementY) // Much stronger push away from wall
      }

      // Enhanced emergency corner escape - more aggressive
      const cornerThreshold = 50 // Reduced threshold for more aggressive escape
      if (newX < cornerThreshold || newX > width - cornerThreshold || 
          newY < cornerThreshold || newY > height - cornerThreshold) {
        // Calculate vector toward center
        const centerX = width / 2
        const centerY = height / 2
        const toCenterX = centerX - newX
        const toCenterY = centerY - newY
        const toCenterDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY)
        
        if (toCenterDist > 0) {
          const escapeForce = 5.0 // Increased escape force
          movementX += (toCenterX / toCenterDist) * escapeForce
          movementY += (toCenterY / toCenterDist) * escapeForce
        }
        
        // Add additional random escape force when cornered
        movementX += (Math.random() - 0.5) * 3.0
        movementY += (Math.random() - 0.5) * 3.0
      }

      // Update velocity for next frame
      bugVelocity.current = { x: movementX, y: movementY }
      bugPosition.current = { x: newX, y: newY }

      // Update panic exclamations
      panicExclamations.current = panicExclamations.current
        .map(excl => ({
          ...excl,
          life: excl.life - 0.02,
          y: excl.y - 0.5 // Float upward
        }))
        .filter(excl => excl.life > 0)

      // Draw bug with pulsing glow - color changes based on behavior
      glowPhase.current += 0.05
      const glowIntensity = Math.sin(glowPhase.current) * 0.5 + 0.5
      
      // Different colors for different bug states
      let hue: number
      if (bugState.current === 'panicking') {
        hue = (glowPhase.current * 50) % 360 // Fast color cycling when panicking
      } else if (bugState.current === 'dodging') {
        hue = 60 + Math.sin(glowPhase.current * 2) * 20 // Yellow-green when dodging
      } else {
        hue = (glowPhase.current * 30) % 360 // Normal cycling when wandering
      }

      ctx.save()
      ctx.shadowBlur = 20 + glowIntensity * 20
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`

      // Draw bug body
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
      ctx.beginPath()
      ctx.arc(bugPosition.current.x, bugPosition.current.y, 12, 0, Math.PI * 2)
      ctx.fill()

      // Draw bug legs (simple lines)
      ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`
      ctx.lineWidth = 2
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6
        ctx.beginPath()
        ctx.moveTo(bugPosition.current.x, bugPosition.current.y)
        ctx.lineTo(
          bugPosition.current.x + Math.cos(angle) * 18,
          bugPosition.current.y + Math.sin(angle) * 18
        )
        ctx.stroke()
      }
      ctx.restore()

      // Draw panic exclamations
      panicExclamations.current.forEach(excl => {
        ctx.save()
        ctx.fillStyle = `rgba(255, 100, 100, ${excl.life})`
        ctx.font = `${16 + excl.life * 8}px monospace`
        ctx.textAlign = 'center'
        ctx.shadowBlur = 10
        ctx.shadowColor = `rgba(255, 100, 100, ${excl.life})`
        ctx.fillText(excl.text, excl.x, excl.y)
        ctx.restore()
      })

      // Draw paddle (cursor follower)
      ctx.save()
      ctx.strokeStyle = '#00F5D4'
      ctx.lineWidth = 3
      ctx.shadowBlur = 15
      ctx.shadowColor = '#00F5D4'
      ctx.beginPath()
      ctx.arc(paddlePosition.current.x, paddlePosition.current.y, 25, 0, Math.PI * 2)
      ctx.stroke()

      // Crosshair
      ctx.beginPath()
      ctx.moveTo(paddlePosition.current.x - 10, paddlePosition.current.y)
      ctx.lineTo(paddlePosition.current.x + 10, paddlePosition.current.y)
      ctx.moveTo(paddlePosition.current.x, paddlePosition.current.y - 10)
      ctx.lineTo(paddlePosition.current.x, paddlePosition.current.y + 10)
      ctx.stroke()
      ctx.restore()

      // Draw and update particles
      if (particles.current.length > 0) {
        particles.current = particles.current
            .map((p) => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vy: p.vy + 0.2, // Gravity
              life: p.life - 0.02,
            }))
            .filter((p) => p.life > 0)

        particles.current.forEach((p) => {
          ctx.fillStyle = `rgba(255, 0, 110, ${p.life})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, 4 * p.life, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      animationFrameId.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isCaught, createExplosion, onCatch, generateRandomDirection, playSwatSound, addPanicExclamation, calculateWallAvoidance, calculatePredictiveEvasion, calculateEscapeVector, findOptimalGap])

  return { canvasRef, isCaught }
}

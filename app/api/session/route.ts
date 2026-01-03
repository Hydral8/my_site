import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { setSession } from '@/lib/redis-service';

// Node.js is the default runtime, no need to explicitly set it
// maxDuration defaults to 10s on Hobby plan, which is sufficient

// Generate a unique session ID
function generateSessionId(): string {
  return randomBytes(16).toString('hex');
}

// Default TTL for sessions (24 hours)
const DEFAULT_SESSION_TTL = 24 * 60 * 60; // 24 hours in seconds

// POST endpoint to create a new session
export async function POST(request: NextRequest) {
  try {
    const sessionId = generateSessionId();
    const createdAt = new Date().toISOString();
    
    // Store session in Redis with TTL
    const sessionData = JSON.stringify({
      sessionId,
      createdAt,
    });
    
    const ttlSeconds = DEFAULT_SESSION_TTL;
    const stored = await setSession(sessionId, sessionData, ttlSeconds);
    
    if (!stored) {
      console.warn('Failed to store session in Redis, but returning sessionId anyway');
    }
    
    return NextResponse.json({
      sessionId,
      createdAt,
      ttlSeconds,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}


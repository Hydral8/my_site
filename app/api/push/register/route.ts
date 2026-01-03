import { NextRequest, NextResponse } from 'next/server';
import { setGlobalPushToken } from '@/lib/redis-service';

// Validate Expo push token format
function isValidExpoToken(token: string): boolean {
  return token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');
}

// PUT endpoint to register/update the global push token
// Only your app will use this route to register the single push token
export async function PUT(request: NextRequest) {
  try {
    const { token, ttlSeconds } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate token format
    if (!isValidExpoToken(token)) {
      return NextResponse.json(
        { error: 'Invalid Expo push token format. Token must start with ExponentPushToken[ or ExpoPushToken[' },
        { status: 400 }
      );
    }

    // Store the global push token in Redis (single token for all notifications)
    const ttl = ttlSeconds && typeof ttlSeconds === 'number' ? ttlSeconds : undefined; // No expiration by default
    const success = await setGlobalPushToken(token, ttl);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to store push token in Redis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Global push token registered successfully',
      registeredAt: new Date().toISOString(),
      ttlSeconds: ttl || 'no expiration',
    });

  } catch (error) {
    console.error('Error registering push token:', error);
    return NextResponse.json(
      { error: 'Failed to register push token' },
      { status: 500 }
    );
  }
}


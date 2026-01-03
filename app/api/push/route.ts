import { NextRequest, NextResponse } from 'next/server';
import { getGlobalPushToken } from '@/lib/redis-service';

// Expo Push API endpoint
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushMessage {
  message: string;
  sessionId?: string; // Optional: for tracking which visitor sent the message
  senderName?: string;
  timestamp?: string;
  images?: string[];
}

// Validate Expo push token format
function isValidExpoToken(token: string): boolean {
  return token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, senderName, timestamp, images } = await request.json() as PushMessage;

    if (!message && (!images || images.length === 0)) {
      return NextResponse.json(
        { error: 'Message or images required' },
        { status: 400 }
      );
    }

    // Get the global push token (single token for all notifications)
    const expoPushToken = await getGlobalPushToken();

    if (!expoPushToken) {
      console.warn('No global push token configured - push notification skipped');
      return NextResponse.json(
        { success: true, skipped: true, reason: 'No push token registered. Register a token using PUT /api/push/register' },
        { status: 200 }
      );
    }

    // Validate Expo push token format
    if (!isValidExpoToken(expoPushToken)) {
      console.error('Invalid Expo push token format');
      return NextResponse.json(
        { error: 'Invalid push token format' },
        { status: 500 }
      );
    }

    // Build notification body
    const hasImages = images && images.length > 0;
    const notificationBody = hasImages 
      ? `📷 ${images.length > 1 ? `${images.length} images` : 'Image'}${message ? `: ${message}` : ''}`
      : message;

    // Get the latest streamId for this conversation to include in push data
    // This allows the Expo app to use it as a cursor for catch-up
    const { getLatestStreamId } = await import('@/lib/redis-service');
    const latestStreamId = await getLatestStreamId(sessionId || '', 1, false);

    // Send push notification via Expo
    // Format matches what Expo app expects
    const pushPayload = {
      to: expoPushToken,
      sound: 'default' as const,
      title: senderName || 'New Message',
      body: notificationBody,
      data: {
        conversationId: '1', // Real user conversation
        messageId: Date.now().toString(),
        senderName: senderName || 'Website Visitor',
        messagePreview: notificationBody.substring(0, 100),
        sessionId: sessionId || null, // Include sessionID for tracking which visitor sent this
        timestamp: timestamp || new Date().toISOString(),
        hasImages,
        imageCount: images?.length || 0,
        streamId: latestStreamId || null, // Include streamId for cursor-based catch-up
      },
      badge: 1,
      priority: 'high' as const,
      channelId: 'inbox', // For Android notification channels
    };

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushPayload),
    });

    const result = await response.json();

    // Check for errors in the Expo response
    if (result.data && result.data[0]?.status === 'error') {
      console.error('Expo push error:', result.data[0]);
      return NextResponse.json(
        { 
          success: false, 
          error: result.data[0].message,
          details: result.data[0].details 
        },
        { status: 500 }
      );
    }

    console.log('Push notification sent successfully:', result);

    return NextResponse.json({
      success: true,
      ticketId: result.data?.[0]?.id,
    });

  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send push notification' },
      { status: 500 }
    );
  }
}

// GET endpoint to check push token status
export async function GET() {
  try {
    const expoPushToken = await getGlobalPushToken();
  
  return NextResponse.json({
    configured: !!expoPushToken,
    tokenPrefix: expoPushToken ? expoPushToken.substring(0, 20) + '...' : null,
  });
  } catch (error) {
    console.error('Error checking push status:', error);
    return NextResponse.json(
      { error: 'Failed to check push status' },
      { status: 500 }
    );
  }
}


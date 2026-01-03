import { NextRequest, NextResponse } from 'next/server';
import { readMessagesFromStream, getCursor, setCursor } from '@/lib/redis-service';

/**
 * GET /api/chat/sync?sessionId={id}&conversationId={id}&isAI={true|false}&cursor={streamId}&deviceId={id}
 * 
 * Catch-up endpoint for Expo app to fetch missed messages since a cursor.
 * If cursor is not provided, uses stored cursor for device.
 * If no stored cursor, starts from beginning.
 * 
 * Returns messages in unified format with latest streamId for next cursor.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const conversationId = searchParams.get('conversationId');
    const isAI = searchParams.get('isAI') === 'true';
    const cursor = searchParams.get('cursor'); // Optional: specific cursor
    const deviceId = searchParams.get('deviceId'); // Optional: for cursor management

    if (!sessionId) {
      return NextResponse.json(
        { error: 'SessionID query parameter is required' },
        { status: 400 }
      );
    }

    // Determine cursor to use
    let useCursor = cursor || '0'; // Default to beginning if no cursor
    
    // If no cursor provided but deviceId is, try to get stored cursor
    if (!cursor && deviceId) {
      const storedCursor = await getCursor(
        deviceId,
        sessionId,
        isAI ? '2' : (conversationId || '1')
      );
      if (storedCursor) {
        useCursor = storedCursor;
      }
    }

    // Read messages from stream (AI chat is transient - return empty)
    let messages: any[] = [];
    let latestStreamId: string | null = useCursor;
    const convId = isAI ? '2' : (conversationId || '1');
    
    if (!isAI) {
      const result = await readMessagesFromStream(
        sessionId,
        convId,
        false,
        useCursor
      );
      messages = result.messages;
      latestStreamId = result.latestStreamId;
    }

    // Format messages in unified format
    const formattedMessages = messages.map((msg) => ({
      id: msg.messageId,
      conversationId: convId,
      text: msg.text,
      sender: msg.sender === 'visitor' ? 'contact' : 'user',
      senderName: msg.sender === 'visitor' ? 'Website Visitor' : undefined,
      timestamp: msg.timestamp,
      status: msg.status || 'sent',
      streamId: msg.streamId, // Include streamId for client cursor management
    }));
    
    // Debug: Log what statuses are being returned
    const visitorMessages = formattedMessages.filter(m => m.sender === 'contact');
    if (visitorMessages.length > 0) {
      console.log(`[sync] Returning ${visitorMessages.length} visitor messages with statuses:`, 
        visitorMessages.map(m => ({ id: m.id, status: m.status }))
      );
    }

    // Update cursor if deviceId provided (only for non-AI conversations)
    if (!isAI && deviceId && latestStreamId && latestStreamId !== useCursor) {
      await setCursor(deviceId, sessionId, convId, latestStreamId);
    }

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      cursor: latestStreamId, // Latest streamId for next sync
      hasMore: formattedMessages.length === 100, // If we got 100, there might be more
    });

  } catch (error) {
    console.error('Error syncing messages:', error);
    return NextResponse.json(
      { error: 'Failed to sync messages' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { addMessageToStream } from '@/lib/redis-service';

interface ChatMessage {
  id: number | string;
  text: string;
  sender: 'visitor' | 'me' | 'user' | 'contact';
  timestamp: Date | string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

/**
 * POST /api/chat/save
 * Save messages (unified format - array of messages)
 * 
 * POST /api/chat/save?single=true
 * Save single message from Expo app (text in body, conversationId in query)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const single = searchParams.get('single') === 'true';
    const conversationId = searchParams.get('conversationId');
    const sessionId = searchParams.get('sessionId');

    // Single message from Expo app
    if (single) {
      const { text } = await request.json();

      if (!sessionId) {
        return NextResponse.json(
          { error: 'SessionID query parameter is required' },
          { status: 400 }
        );
      }

      if (!conversationId) {
        return NextResponse.json(
          { error: 'ConversationID query parameter is required' },
          { status: 400 }
        );
      }

      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          { error: 'Message text is required' },
          { status: 400 }
        );
      }

      // Create new message
      const messageId = Date.now().toString();
      const newMessage = {
        id: messageId,
        text,
        sender: 'me' as const, // From your device (stored as 'me', returned as 'user')
        timestamp: new Date(),
        status: 'sent' as const,
      };

      // Add to stream (skip AI chat - it's transient)
      const isAI = conversationId === '2';
      
      if (isAI) {
        // AI chat is transient - don't save to Redis
        return NextResponse.json({
          success: true,
          message: {
            id: messageId,
            conversationId: conversationId,
            text: newMessage.text,
            sender: 'user',
            timestamp: newMessage.timestamp.toISOString(),
            status: newMessage.status,
          },
        });
      }

      const streamId = await addMessageToStream(
        sessionId,
        1,
        false,
        newMessage
      );

      if (!streamId) {
        return NextResponse.json(
          { error: 'Failed to save message' },
          { status: 500 }
        );
      }

      // Return in unified format with streamId for cursor tracking
      return NextResponse.json({
        success: true,
        message: {
          id: messageId,
          conversationId: conversationId,
          text: newMessage.text,
          sender: 'user',
          timestamp: newMessage.timestamp.toISOString(),
          status: newMessage.status,
          streamId, // Include streamId for cursor management
        },
      });
    }

    // Array of messages (web batch save - add each to stream)
    const { sessionId: bodySessionId, conversationId: bodyConversationId, messages, isAI } = await request.json();

    if (!bodySessionId || typeof bodySessionId !== 'string') {
      return NextResponse.json(
        { error: 'SessionID is required' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // AI chat is transient - don't save to Redis
    if (isAI) {
      return NextResponse.json({
        success: true,
        message: 'AI chat messages are transient (not persisted)',
        savedCount: 0,
      });
    }

    // Add each message to stream (only for non-AI conversations)
    const streamIds: string[] = [];
    for (const msg of messages) {
      const message = {
        id: typeof msg.id === 'string' ? msg.id : msg.id.toString(),
        text: msg.text,
        sender: msg.sender === 'contact' ? 'visitor' : msg.sender === 'user' ? 'me' : msg.sender,
        timestamp: typeof msg.timestamp === 'string' 
          ? msg.timestamp 
          : new Date(msg.timestamp).toISOString(),
        status: msg.status || 'sent',
      };

      const convId = bodyConversationId || 1;
      const streamId = await addMessageToStream(bodySessionId, convId, false, message);
      if (streamId) {
        streamIds.push(streamId);
      }
    }

    if (streamIds.length === 0) {
      return NextResponse.json(
        { error: 'Failed to save chat messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Chat messages saved successfully',
      savedCount: streamIds.length,
    });

  } catch (error) {
    console.error('Error saving chat:', error);
    return NextResponse.json(
      { error: 'Failed to save chat messages' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { readAllMessagesFromStream } from '@/lib/redis-service';

/**
 * GET /api/chat/load?sessionId=xxx&conversationId=1&isAI=false
 * GET /api/chat/load?sessionId=xxx&format=conversations (list all conversations)
 * 
 * Unified format for both web and Expo:
 * - id: string
 * - conversationId: string
 * - text: string
 * - sender: 'contact' | 'user' (contact = website visitor, user = you/me)
 * - senderName?: string (optional, for contact messages)
 * - timestamp: string (ISO 8601)
 * - status: 'sending' | 'sent' | 'delivered' | 'read'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const conversationId = searchParams.get('conversationId');
    const isAI = searchParams.get('isAI') === 'true';
    const format = searchParams.get('format'); // 'conversations' for listing, otherwise messages

    if (!sessionId) {
      return NextResponse.json(
        { error: 'SessionID query parameter is required' },
        { status: 400 }
      );
    }

    // Handle conversation listing (Expo format)
    if (format === 'conversations') {
      const conversations = [];

      // Load real user conversation (conversation id 1)
      const userMessages = await readAllMessagesFromStream(sessionId, 1, false);
      if (userMessages && userMessages.length > 0) {
        const lastMessage = userMessages[userMessages.length - 1];
        conversations.push({
          id: '1',
          name: 'Website Visitor',
          lastMessage: lastMessage.text,
          timestamp: lastMessage.timestamp,
          unread: userMessages.filter((m: any) => m.sender === 'visitor' && m.status !== 'read').length,
        });
      }

      // AI conversations are transient (not stored in Redis) - don't include them in conversation list

      return NextResponse.json({
        success: true,
        conversations,
      });
    }

    // Handle message loading
    let messages: any[] = [];

    if (isAI) {
      // AI chat is transient - return empty (not stored in Redis)
      messages = [];
    } else {
      // Load real user chat messages from stream
      if (!conversationId) {
        return NextResponse.json(
          { error: 'ConversationID query parameter is required for non-AI chats' },
          { status: 400 }
        );
      }
      messages = await readAllMessagesFromStream(sessionId, conversationId, false);
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        success: true,
        messages: [],
      });
    }

    // Unified format for both web and Expo
    const convId = isAI ? '2' : conversationId || '1';
    const formattedMessages = messages.map((msg) => ({
      id: msg.messageId,
      conversationId: convId,
      text: msg.text,
      sender: msg.sender === 'visitor' ? 'contact' : 'user', // Unified: contact = visitor, user = me
      senderName: msg.sender === 'visitor' ? 'Website Visitor' : undefined,
      timestamp: msg.timestamp,
      status: msg.status || 'sent',
      streamId: msg.streamId, // Include streamId for cursor tracking
    }));
    
    // Debug: Log what statuses are being returned
    const visitorMessages = formattedMessages.filter(m => m.sender === 'contact');
    if (visitorMessages.length > 0) {
      console.log(`[load] Returning ${visitorMessages.length} visitor messages with statuses:`, 
        visitorMessages.map(m => ({ id: m.id, status: m.status }))
      );
    }

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
    });

  } catch (error) {
    console.error('Error loading chat:', error);
    return NextResponse.json(
      { error: 'Failed to load chat messages' },
      { status: 500 }
    );
  }
}


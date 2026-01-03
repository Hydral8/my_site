import { NextRequest, NextResponse } from 'next/server';
import { getAllConversations } from '@/lib/redis-service';

/**
 * GET /api/chat/conversations/all
 * 
 * Returns all conversations across all sessions (for Expo mobile app).
 * No sessionId required - returns conversations from all website visitors.
 * 
 * Query Parameters (optional):
 * - sort: 'timestamp' | 'unread' (default: 'timestamp')
 * - order: 'asc' | 'desc' (default: 'desc')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'timestamp';
    const order = searchParams.get('order') || 'desc';

    // Get all conversations from Redis
    const allConversations = await getAllConversations();

    // Format conversations for response
    const formattedConversations = allConversations.map((conv) => {
      const lastMessage = conv.lastMessage;
      const unreadCount = conv.isAI 
        ? 0 // AI conversations don't have unread messages
        : conv.messages.filter((m: any) => m.sender === 'visitor' && m.status !== 'read').length;

      // Extract sessionId and conversationId for unique ID
      const uniqueId = `${conv.sessionId}:${conv.conversationId}`;

      return {
        id: uniqueId,
        sessionId: conv.sessionId,
        conversationId: conv.conversationId,
        name: conv.isAI ? 'My Twin' : 'Website Visitor',
        isAI: conv.isAI,
        lastMessage: lastMessage?.text || '',
        timestamp: lastMessage?.timestamp 
          ? (typeof lastMessage.timestamp === 'string' 
              ? lastMessage.timestamp 
              : new Date(lastMessage.timestamp).toISOString())
          : conv.updatedAt || new Date().toISOString(),
        unread: unreadCount,
        messageCount: conv.messages.length,
      };
    });

    // Sort conversations
    formattedConversations.sort((a, b) => {
      let comparison = 0;
      
      if (sort === 'timestamp') {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        comparison = timeA - timeB;
      } else if (sort === 'unread') {
        comparison = a.unread - b.unread;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return NextResponse.json({
      success: true,
      conversations: formattedConversations,
      total: formattedConversations.length,
    });

  } catch (error) {
    console.error('Error loading all conversations:', error);
    return NextResponse.json(
      { error: 'Failed to load conversations' },
      { status: 500 }
    );
  }
}


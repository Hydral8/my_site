import { NextRequest, NextResponse } from 'next/server';
import { markMessagesAsRead } from '@/lib/redis-service';

/**
 * POST /api/conversations/:id/read?sessionId=xxx
 * Mark messages as read in a conversation
 * 
 * Stores read status in Redis Hash (since streams are append-only)
 * The status is merged when reading messages from streams
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const { id } = await params;
    const conversationId = id;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'SessionID query parameter is required' },
        { status: 400 }
      );
    }

    // Only mark real user conversations as read (not AI)
    if (conversationId !== '1') {
      return NextResponse.json(
        { error: 'Can only mark real user conversations as read' },
        { status: 400 }
      );
    }

    // Check if specific message IDs are provided in body
    let messageIds: string[] | undefined;
    try {
      const body = await request.json();
      if (body.messageIds && Array.isArray(body.messageIds)) {
        messageIds = body.messageIds;
        console.log(`[POST /conversations/${conversationId}/read] Marking ${messageIds?.length || 0} specific messages as read for session ${sessionId}`);
      } else {
        console.log(`[POST /conversations/${conversationId}/read] Empty body or no messageIds - will mark all visitor messages as read for session ${sessionId}`);
      }
    } catch {
      // No body or invalid JSON, mark all visitor messages
      console.log(`[POST /conversations/${conversationId}/read] No body provided - will mark all visitor messages as read for session ${sessionId}`);
    }

    // Mark messages as read (uses Redis Hash for read status)
    const success = await markMessagesAsRead(sessionId, conversationId, false, messageIds);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark messages as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read',
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}


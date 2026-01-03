import { NextRequest } from 'next/server';
import { createClient } from 'redis';

// Node.js is the default runtime, no need to explicitly set it
// maxDuration defaults to 10s on Hobby plan, which is sufficient

const STREAM_CONV_PREFIX = 'stream:conv:';
const STREAM_AI_PREFIX = 'stream:conv:ai:';
const READ_STATUS_PREFIX = 'read:status:';

/**
 * GET /api/chat/stream?sessionId={id}&conversationId={id}&isAI={true|false}&cursor={streamId}
 * 
 * Server-Sent Events endpoint for real-time message streaming.
 * Uses Redis Streams XREAD with BLOCK to wait for new messages.
 * 
 * Query Parameters:
 * - sessionId (required) - Session identifier
 * - conversationId (required for non-AI) - Conversation ID
 * - isAI (required) - "true" for AI conversation, "false" for real user
 * - cursor (optional) - Stream ID to start from (defaults to latest)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const conversationId = searchParams.get('conversationId');
  const isAI = searchParams.get('isAI') === 'true';
  const cursor = searchParams.get('cursor') || '$'; // '$' = only new messages

  if (!sessionId) {
    return new Response('SessionID is required', { status: 400 });
  }

  // AI chat is transient - don't stream from Redis
  if (isAI) {
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const sendEvent = (data: any) => {
          try {
            const message = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (e) {
            // Stream closed
          }
        };
        sendEvent({ type: 'connected', message: 'AI chat stream connected (transient)' });
        // Send keepalive periodically
        const interval = setInterval(() => {
          sendEvent({ type: 'keepalive' });
        }, 30000);
        // Clean up on cancel
        return () => clearInterval(interval);
      },
      cancel() {
        // Stream cancelled
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  }

  // Create SSE stream for real user conversations
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let client: ReturnType<typeof createClient> | null = null;
      let isClosed = false;
      
      // Send initial connection message
      const sendEvent = (data: any) => {
        if (isClosed) return;
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (e) {
          // Stream closed
          isClosed = true;
        }
      };

      sendEvent({ type: 'connected', message: 'Stream connected' });

      try {
        // Create a dedicated Redis client for this SSE connection
        // This ensures we close it when the stream ends, preventing connection leaks
        const sseClient = createClient({
          username: process.env.REDIS_USERNAME || 'default',
          password: process.env.REDIS_PASSWORD,
          socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || '12899', 10),
            connectTimeout: 10000,
          },
        });

        sseClient.on('error', (err) => {
          if (!err.message?.includes('max number of clients')) {
            console.error('SSE Redis Client Error', err);
          }
        });

        await sseClient.connect();
        client = sseClient;

        const streamKey = isAI 
          ? `${STREAM_AI_PREFIX}${sessionId}`
          : `${STREAM_CONV_PREFIX}${sessionId}:${conversationId || '1'}`;

        let lastCursor = cursor === '$' ? '$' : cursor;
        let iterationCount = 0;
        const MAX_ITERATIONS = 3; // Max 3 iterations * 2.5s = 7.5s (safe for Hobby plan 10s limit)
        const BLOCK_TIME = 2500; // 2.5 seconds - shorter for serverless compatibility

        // Keep reading from stream (with iteration limit for serverless)
        while (!isClosed && iterationCount < MAX_ITERATIONS) {
          try {
            // Read from stream with blocking (wait up to 2.5 seconds for new messages)
            // Using '$' means only new messages after this call
            const readCursor = lastCursor === '$' ? '$' : lastCursor;
            
            const result = await client.xRead(
              { key: streamKey, id: readCursor },
              { COUNT: 100, BLOCK: BLOCK_TIME } // Block for 2.5 seconds (serverless-friendly)
            );
            
            iterationCount++;

            if (result && Array.isArray(result) && result.length > 0) {
              const streamData = result[0] as { messages: Array<{ id: string; message: Record<string, string> }> };
              
              // Get read status from hash
              const readStatusKey = `${READ_STATUS_PREFIX}${sessionId}:${conversationId || '1'}`;
              const readStatuses = await client.hGetAll(readStatusKey);
              
              // Process new messages
              for (const entry of streamData.messages) {
                lastCursor = entry.id; // Update cursor to last message ID
                
                // Check read status from hash
                const readStatus = readStatuses[entry.message.messageId];
                const messageStatus = readStatus || entry.message.status || 'sent';
                
                // Format message in unified format
                const formattedMessage = {
                  type: 'message',
                  message: {
                    id: entry.message.messageId,
                    conversationId: isAI ? '2' : (conversationId || '1'),
                    text: entry.message.text,
                    sender: entry.message.sender === 'visitor' ? 'contact' : 'user',
                    senderName: entry.message.sender === 'visitor' ? 'Website Visitor' : undefined,
                    timestamp: entry.message.timestamp,
                    status: messageStatus,
                    streamId: entry.id,
                  },
                };

                sendEvent(formattedMessage);
              }
            } else {
              // No new messages (timeout), send keepalive
              // After timeout, continue with same cursor
              sendEvent({ type: 'keepalive' });
            }
            
            // If we've hit max iterations, send a reconnect message and close
            if (iterationCount >= MAX_ITERATIONS) {
              sendEvent({ type: 'reconnect', message: 'Reconnecting due to serverless timeout' });
              isClosed = true;
              break;
            }
          } catch (readError: any) {
            // Handle timeout (expected when no new messages)
            // Redis client may throw on timeout or return null
            if (
              readError.message?.includes('timeout') || 
              readError.code === 'TIMEOUT' ||
              readError.name === 'AbortError'
            ) {
              sendEvent({ type: 'keepalive' });
              continue;
            }
            
            // Other errors - log and continue
            console.error('Error reading from stream:', readError);
            sendEvent({ type: 'error', message: 'Error reading stream' });
            
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error('SSE stream error:', error);
        sendEvent({ type: 'error', message: 'Stream error occurred' });
      } finally {
        // Clean up: mark as closed and close Redis client
        isClosed = true;
        if (client && client.isOpen) {
          try {
            await client.quit();
          } catch (closeError) {
            // Ignore errors on close
            console.warn('Error closing SSE Redis client:', closeError);
          }
        }
      }
    },
    cancel() {
      // Stream was cancelled (client disconnected)
      // Cleanup is handled in finally block
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}


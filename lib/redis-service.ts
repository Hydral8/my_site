// Redis client - direct connection
import { createClient } from 'redis';

// Create a new Redis client for each operation (serverless-friendly)
// Connections are closed after each operation to prevent connection leaks
export async function getRedisClient() {
  const client = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '12899', 10),
      connectTimeout: 10000,
      // Don't keep alive - close after each operation
      keepAlive: false,
    },
  });

  client.on('error', (err) => {
    if (!err.message?.includes('max number of clients')) {
      console.error('Redis Client Error', err);
    }
  });

  await client.connect();
  return client;
}

// Helper to execute an operation and close the connection
async function withRedisClient<T>(
  operation: (client: ReturnType<typeof createClient>) => Promise<T>
): Promise<T> {
  const client = await getRedisClient();
  try {
    return await operation(client);
  } finally {
    // Always close the connection after operation
    try {
      if (client.isOpen) {
        await client.quit();
      }
    } catch (error) {
      // Ignore errors during disconnect
      try {
        await client.disconnect();
      } catch {
        // Ignore disconnect errors too
      }
    }
  }
}

// Set a key-value pair with TTL (in seconds)
export async function redisSet(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.setEx(key, ttlSeconds, value);
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

// Get a value by key
export async function redisGet(key: string): Promise<string | null> {
  try {
    const client = await getRedisClient();
    const result = await client.get(key);
    return result || null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

// Delete a key
export async function redisDelete(key: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
}

// Check if a key exists
export async function redisExists(key: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    console.error('Redis exists error:', error);
    return false;
  }
}

// Session-specific helpers
const SESSION_TTL_SECONDS = 24 * 60 * 60; // 24 hours default
const SESSION_KEY_PREFIX = 'session:';
const GLOBAL_PUSH_TOKEN_KEY = 'push:token:global';

// Global push token (single token for all notifications)
export async function setGlobalPushToken(
  pushToken: string,
  ttlSeconds?: number
): Promise<boolean> {
  // If no TTL specified, don't expire (or use a very long TTL)
  const ttl = ttlSeconds || 365 * 24 * 60 * 60; // 1 year default if no TTL
  return redisSet(GLOBAL_PUSH_TOKEN_KEY, pushToken, ttl);
}

export async function getGlobalPushToken(): Promise<string | null> {
  return redisGet(GLOBAL_PUSH_TOKEN_KEY);
}

export async function deleteGlobalPushToken(): Promise<boolean> {
  return redisDelete(GLOBAL_PUSH_TOKEN_KEY);
}

// Session tracking (for visitor attribution)
export async function setSession(
  sessionId: string,
  data: string,
  ttlSeconds: number = SESSION_TTL_SECONDS
): Promise<boolean> {
  const key = `${SESSION_KEY_PREFIX}${sessionId}`;
  return redisSet(key, data, ttlSeconds);
}

export async function getSession(sessionId: string): Promise<string | null> {
  const key = `${SESSION_KEY_PREFIX}${sessionId}`;
  return redisGet(key);
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const key = `${SESSION_KEY_PREFIX}${sessionId}`;
  return redisDelete(key);
}

// Chat storage helpers - Redis Streams
const STREAM_CONV_PREFIX = 'stream:conv:';
const STREAM_AI_PREFIX = 'stream:conv:ai:';
const CURSOR_PREFIX = 'cursor:device:';
const READ_STATUS_PREFIX = 'read:status:'; // Hash to store read status per message

// Legacy keys (for migration reference, will be removed)
const CHAT_KEY_PREFIX = 'chat:';
const AI_CHAT_KEY_PREFIX = 'chat:ai:';

// Save chat messages for a session (real user conversation)
export async function saveChatMessages(
  sessionId: string,
  conversationId: number,
  messages: any[],
  ttlSeconds: number = SESSION_TTL_SECONDS
): Promise<boolean> {
  const key = `${CHAT_KEY_PREFIX}${sessionId}:${conversationId}`;
  const data = JSON.stringify({
    conversationId,
    messages,
    updatedAt: new Date().toISOString(),
  });
  return redisSet(key, data, ttlSeconds);
}

// Load chat messages for a session (real user conversation)
export async function loadChatMessages(
  sessionId: string,
  conversationId: number
): Promise<any[] | null> {
  const key = `${CHAT_KEY_PREFIX}${sessionId}:${conversationId}`;
  const data = await redisGet(key);
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    return parsed.messages || null;
  } catch {
    return null;
  }
}

// Save AI chat messages for a session
export async function saveAIChatMessages(
  sessionId: string,
  messages: any[],
  ttlSeconds: number = SESSION_TTL_SECONDS
): Promise<boolean> {
  const key = `${AI_CHAT_KEY_PREFIX}${sessionId}`;
  const data = JSON.stringify({
    messages,
    updatedAt: new Date().toISOString(),
  });
  return redisSet(key, data, ttlSeconds);
}

// Load AI chat messages for a session
export async function loadAIChatMessages(sessionId: string): Promise<any[] | null> {
  const key = `${AI_CHAT_KEY_PREFIX}${sessionId}`;
  const data = await redisGet(key);
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    return parsed.messages || null;
  } catch {
    return null;
  }
}

// Delete all chats for a session
export async function deleteSessionChats(sessionId: string): Promise<boolean> {
  // Note: This would require pattern matching in Redis, which depends on your Redis service implementation
  // For now, we'll delete the known keys
  const userChatKey = `${CHAT_KEY_PREFIX}${sessionId}:1`; // conversationId 1 is the real user chat
  const aiChatKey = `${AI_CHAT_KEY_PREFIX}${sessionId}`;
  
  const userDeleted = await redisDelete(userChatKey);
  const aiDeleted = await redisDelete(aiChatKey);
  
  return userDeleted && aiDeleted;
}

// ============================================
// Redis Streams Functions (New Implementation)
// ============================================

/**
 * Add a message to a conversation stream
 * Returns the stream ID (message ID) for cursor tracking
 */
export async function addMessageToStream(
  sessionId: string,
  conversationId: number | string,
  isAI: boolean,
  message: {
    id: string | number;
    text: string;
    sender: 'visitor' | 'me' | 'user' | 'contact';
    timestamp: Date | string;
    status?: string;
  },
  ttlSeconds: number = SESSION_TTL_SECONDS
): Promise<string | null> {
  try {
    return await withRedisClient(async (client) => {
      const streamKey = isAI 
        ? `${STREAM_AI_PREFIX}${sessionId}`
        : `${STREAM_CONV_PREFIX}${sessionId}:${conversationId}`;

      // Prepare message payload
      const payload = {
        messageId: message.id.toString(),
        text: message.text,
        sender: message.sender === 'contact' ? 'visitor' : message.sender === 'user' ? 'me' : message.sender,
        timestamp: typeof message.timestamp === 'string' 
          ? message.timestamp 
          : new Date(message.timestamp).toISOString(),
        status: message.status || 'sent',
      };

      // Add to stream (XADD returns stream ID)
      const streamId = await client.xAdd(streamKey, '*', payload);

      // Set TTL on stream key (refresh on activity)
      await client.expire(streamKey, ttlSeconds);

      return streamId;
    });
  } catch (error) {
    console.error('Error adding message to stream:', error);
    return null;
  }
}

/**
 * Read messages from a stream since a cursor (for catch-up)
 * Returns messages and the latest stream ID
 */
export async function readMessagesFromStream(
  sessionId: string,
  conversationId: number | string,
  isAI: boolean,
  cursor: string = '0' // '0' = from beginning, or specific stream ID
): Promise<{ messages: any[]; latestStreamId: string | null }> {
  try {
    return await withRedisClient(async (client) => {
      const streamKey = isAI 
        ? `${STREAM_AI_PREFIX}${sessionId}`
        : `${STREAM_CONV_PREFIX}${sessionId}:${conversationId}`;

      // Read from stream since cursor
      const result = await client.xRead(
        { key: streamKey, id: cursor },
        { COUNT: 100 } // Limit to 100 messages per read
      );

      if (!result || !Array.isArray(result) || result.length === 0) {
        return { messages: [], latestStreamId: cursor };
      }

      const stream = result[0] as { messages: Array<{ id: string; message: Record<string, string> }> };
      const messages: any[] = [];
      let latestStreamId = cursor;

      // Parse stream entries
      for (const entry of stream.messages) {
        latestStreamId = entry.id;
        messages.push({
          streamId: entry.id,
          messageId: entry.message.messageId,
          text: entry.message.text,
          sender: entry.message.sender,
          timestamp: entry.message.timestamp,
          status: entry.message.status,
          _originalStatus: entry.message.status, // Store original for debugging
        });
      }

      // Merge read status from separate hash (only mark as "read" if in hash)
      const readStatusKey = `${READ_STATUS_PREFIX}${sessionId}:${conversationId}`;
      const readStatuses = await client.hGetAll(readStatusKey);
      
      // Debug: Log hash contents for troubleshooting
      const hashKeys = Object.keys(readStatuses);
      if (hashKeys.length > 0) {
        console.log(`[readMessagesFromStream] Hash key: ${readStatusKey}`);
        console.log(`[readMessagesFromStream] Hash contains ${hashKeys.length} entries:`, hashKeys);
        console.log(`[readMessagesFromStream] Hash values:`, readStatuses);
      } else {
        console.log(`[readMessagesFromStream] Hash key: ${readStatusKey} - EMPTY (no read status entries)`);
      }
      
      // Only mark as "read" if message ID exists in read status hash with value "read"
      // Default to "sent" for all messages unless explicitly in hash as "read"
      for (const msg of messages) {
        // Ensure messageId is a string for hash lookup
        const messageIdStr = String(msg.messageId);
        const readStatus = readStatuses[messageIdStr];
        const originalStatus = (msg as any)._originalStatus;
        const statusBeforeCheck = msg.status;
        
        if (readStatus === 'read') {
          // Explicitly marked as read in hash - use "read"
          msg.status = 'read';
          console.log(`[readMessagesFromStream] Message ${messageIdStr} marked as "read" (in hash)`);
        } else {
          // Not in hash OR different value - default to "sent"
          // This ensures new messages default to "sent" even if stream has wrong status
          msg.status = 'sent';
          
          // Always log when we change status to "sent" for visitor messages
          if (msg.sender === 'visitor') {
            console.log(`[readMessagesFromStream] Message ${messageIdStr} (visitor) set to "sent" (hashValue: ${readStatus || 'NOT_IN_HASH'}, originalStatus: ${originalStatus || statusBeforeCheck})`);
          }
        }
        
        // Clean up debug field
        delete (msg as any)._originalStatus;
      }
      
      // Debug: Log ALL visitor messages and their final status BEFORE returning
      const visitorMessages = messages.filter(m => m.sender === 'visitor');
      if (visitorMessages.length > 0) {
        console.log(`[readMessagesFromStream] FINAL STATUS BEFORE RETURN:`, 
          visitorMessages.map(m => {
            const messageIdStr = String(m.messageId);
            return {
              id: messageIdStr,
              finalStatus: m.status,
              inHash: !!readStatuses[messageIdStr],
              hashValue: readStatuses[messageIdStr] || 'NOT_IN_HASH'
            };
          })
        );
      }

      return { messages, latestStreamId };
    });
  } catch (error) {
    console.error('Error reading messages from stream:', error);
    return { messages: [], latestStreamId: cursor };
  }
}

/**
 * Read all messages from a stream (for initial load)
 */
export async function readAllMessagesFromStream(
  sessionId: string,
  conversationId: number | string,
  isAI: boolean
): Promise<any[]> {
  try {
    return await withRedisClient(async (client) => {
      const streamKey = isAI 
        ? `${STREAM_AI_PREFIX}${sessionId}`
        : `${STREAM_CONV_PREFIX}${sessionId}:${conversationId}`;

      // Read all messages from beginning
      const result = await client.xRead(
        { key: streamKey, id: '0' },
        { COUNT: 1000 } // Higher limit for full load
      );

      if (!result || !Array.isArray(result) || result.length === 0) {
        return [];
      }

      const stream = result[0] as { messages: Array<{ id: string; message: Record<string, string> }> };
      const messages: any[] = [];

      // Parse stream entries
      for (const entry of stream.messages) {
        messages.push({
          streamId: entry.id,
          messageId: entry.message.messageId,
          text: entry.message.text,
          sender: entry.message.sender,
          timestamp: entry.message.timestamp,
          status: entry.message.status,
        });
      }

      // Merge read status from separate hash (only mark as "read" if in hash)
      const readStatusKey = `${READ_STATUS_PREFIX}${sessionId}:${conversationId}`;
      const readStatuses = await client.hGetAll(readStatusKey);
      
      // Debug: Log hash contents for troubleshooting
      const hashKeys = Object.keys(readStatuses);
      if (hashKeys.length > 0) {
        console.log(`[readAllMessagesFromStream] Hash key: ${readStatusKey}`);
        console.log(`[readAllMessagesFromStream] Hash contains ${hashKeys.length} entries:`, hashKeys);
        console.log(`[readAllMessagesFromStream] Hash values:`, readStatuses);
      } else {
        console.log(`[readAllMessagesFromStream] Hash key: ${readStatusKey} - EMPTY (no read status entries)`);
      }
      
      // Only mark as "read" if message ID exists in read status hash with value "read"
      // Default to "sent" for all messages unless explicitly in hash as "read"
      for (const msg of messages) {
        // Ensure messageId is a string for hash lookup
        const messageIdStr = String(msg.messageId);
        const readStatus = readStatuses[messageIdStr];
        const originalStatus = msg.status;
        
        if (readStatus === 'read') {
          // Explicitly marked as read in hash - use "read"
          msg.status = 'read';
          console.log(`[readAllMessagesFromStream] Message ${messageIdStr} marked as "read" (in hash)`);
        } else {
          // Not in hash OR different value - default to "sent"
          // This ensures new messages default to "sent" even if stream has wrong status
          msg.status = 'sent';
          
          // Always log when we change status to "sent" for visitor messages
          if (msg.sender === 'visitor') {
            console.log(`[readAllMessagesFromStream] Message ${messageIdStr} (visitor) set to "sent" (hashValue: ${readStatus || 'NOT_IN_HASH'}, originalStatus: ${originalStatus})`);
          }
        }
      }

      // Debug: Log ALL visitor messages and their final status BEFORE returning
      const visitorMessages = messages.filter(m => m.sender === 'visitor');
      if (visitorMessages.length > 0) {
        console.log(`[readAllMessagesFromStream] FINAL STATUS BEFORE RETURN:`, 
          visitorMessages.map(m => {
            const messageIdStr = String(m.messageId);
            return {
              id: messageIdStr,
              finalStatus: m.status,
              inHash: !!readStatuses[messageIdStr],
              hashValue: readStatuses[messageIdStr] || 'NOT_IN_HASH'
            };
          })
        );
      }

      return messages;
    });
  } catch (error) {
    console.error('Error reading all messages from stream:', error);
    return [];
  }
}

/**
 * Mark messages as read in a conversation stream
 * Stores read status in a separate Redis Hash (since streams are append-only)
 */
export async function markMessagesAsRead(
  sessionId: string,
  conversationId: number | string,
  isAI: boolean,
  messageIds?: string[] // If provided, only mark these messages. Otherwise, mark all visitor messages.
): Promise<boolean> {
  try {
    // If messageIds provided, mark only those (most common case - avoids reading all messages)
    if (messageIds && messageIds.length > 0) {
      return await withRedisClient(async (client) => {
        const readStatusKey = `${READ_STATUS_PREFIX}${sessionId}:${conversationId}`;
        const updates: Record<string, string> = {};
        for (const msgId of messageIds) {
          // Ensure messageId is stored as string
          updates[String(msgId)] = 'read';
        }
        await client.hSet(readStatusKey, updates);
        // Set TTL on read status hash (same as stream TTL)
        await client.expire(readStatusKey, SESSION_TTL_SECONDS);
        
        // Verify the hash was written correctly
        const verifyHash = await client.hGetAll(readStatusKey);
        console.log(`[markMessagesAsRead] Marked ${messageIds.length} specific messages as read`);
        console.log(`[markMessagesAsRead] Hash key: ${readStatusKey}`);
        console.log(`[markMessagesAsRead] Hash now contains ${Object.keys(verifyHash).length} entries`);
        console.log(`[markMessagesAsRead] Message IDs marked:`, messageIds);
        console.log(`[markMessagesAsRead] Hash contents:`, verifyHash);
        return true;
      });
    }
    
    // If no messageIds provided, mark ALL visitor messages as read
    // This is used when the Expo app sends an empty body {} to mark all visitor messages
    return await withRedisClient(async (client) => {
      // Read all messages from the stream to find visitor messages
      const streamKey = isAI 
        ? `${STREAM_AI_PREFIX}${sessionId}`
        : `${STREAM_CONV_PREFIX}${sessionId}:${conversationId}`;

      // Read all messages from beginning
      const result = await client.xRead(
        { key: streamKey, id: '0' },
        { COUNT: 1000 } // Higher limit for full load
      );

      if (!result || !Array.isArray(result) || result.length === 0) {
        console.log(`[markMessagesAsRead] No messages found in stream: ${streamKey}`);
        return true; // No messages to mark, but not an error
      }

      const stream = result[0] as { messages: Array<{ id: string; message: Record<string, string> }> };
      
      // Filter for visitor messages and collect their messageIds
      const visitorMessageIds: string[] = [];
      for (const entry of stream.messages) {
        const sender = entry.message.sender;
        if (sender === 'visitor') {
          const messageId = entry.message.messageId;
          if (messageId) {
            visitorMessageIds.push(messageId);
          }
        }
      }

      if (visitorMessageIds.length === 0) {
        console.log(`[markMessagesAsRead] No visitor messages found in stream: ${streamKey}`);
        return true; // No visitor messages to mark, but not an error
      }

      // Mark all visitor messages as read in the hash
      const readStatusKey = `${READ_STATUS_PREFIX}${sessionId}:${conversationId}`;
      const updates: Record<string, string> = {};
      for (const msgId of visitorMessageIds) {
        // Ensure messageId is stored as string
        updates[String(msgId)] = 'read';
      }
      await client.hSet(readStatusKey, updates);
      // Set TTL on read status hash (same as stream TTL)
      await client.expire(readStatusKey, SESSION_TTL_SECONDS);
      
      // Verify the hash was written correctly
      const verifyHash = await client.hGetAll(readStatusKey);
      console.log(`[markMessagesAsRead] Marked ${visitorMessageIds.length} visitor messages as read`);
      console.log(`[markMessagesAsRead] Hash key: ${readStatusKey}`);
      console.log(`[markMessagesAsRead] Hash now contains ${Object.keys(verifyHash).length} entries`);
      console.log(`[markMessagesAsRead] Message IDs marked:`, visitorMessageIds);
      console.log(`[markMessagesAsRead] Hash contents:`, verifyHash);
      return true;
    });
  } catch (error: any) {
    // Don't log max clients errors as errors (they're expected under load)
    if (error.message?.includes('max number of clients')) {
      console.warn('Redis max clients reached when marking as read, will retry later');
      return false;
    }
    console.error('Error marking messages as read:', error);
    return false;
  }
}

/**
 * Get the latest stream ID for a conversation (for cursor management)
 */
export async function getLatestStreamId(
  sessionId: string,
  conversationId: number | string,
  isAI: boolean
): Promise<string | null> {
  try {
    return await withRedisClient(async (client) => {
      const streamKey = isAI 
        ? `${STREAM_AI_PREFIX}${sessionId}`
        : `${STREAM_CONV_PREFIX}${sessionId}:${conversationId}`;

      // Get the latest entry
      const result = await client.xRevRange(streamKey, '+', '-', { COUNT: 1 });
      
      if (!result || result.length === 0) {
        return null;
      }

      return result[0].id;
    });
  } catch (error) {
    console.error('Error getting latest stream ID:', error);
    return null;
  }
}

/**
 * Store cursor for a device/conversation
 */
export async function setCursor(
  deviceId: string,
  sessionId: string,
  conversationId: number | string,
  streamId: string,
  ttlSeconds: number = 7 * 24 * 60 * 60 // 7 days
): Promise<boolean> {
  try {
    const cursorKey = `${CURSOR_PREFIX}${deviceId}:${sessionId}:${conversationId}`;
    return redisSet(cursorKey, streamId, ttlSeconds);
  } catch (error) {
    console.error('Error setting cursor:', error);
    return false;
  }
}

/**
 * Get cursor for a device/conversation
 */
export async function getCursor(
  deviceId: string,
  sessionId: string,
  conversationId: number | string
): Promise<string | null> {
  try {
    const cursorKey = `${CURSOR_PREFIX}${deviceId}:${sessionId}:${conversationId}`;
    return redisGet(cursorKey);
  } catch (error) {
    console.error('Error getting cursor:', error);
    return null;
  }
}

// ============================================
// Legacy Functions (for getAllConversations compatibility)
// ============================================

// Get all conversations across all sessions
export async function getAllConversations(): Promise<Array<{
  sessionId: string;
  conversationId: string;
  isAI: boolean;
  messages: any[];
  lastMessage?: any;
  updatedAt?: string;
}>> {
  try {
    return await withRedisClient(async (client) => {
      const conversations: Array<{
        sessionId: string;
        conversationId: string;
        isAI: boolean;
        messages: any[];
        lastMessage?: any;
        updatedAt?: string;
      }> = [];

      // Scan for all stream keys (real user conversations: stream:conv:*:*)
      let cursor = '0';
      do {
        const result = await client.scan(cursor, {
          MATCH: `${STREAM_CONV_PREFIX}*:*`,
          COUNT: 100,
        });
        cursor = result.cursor;
        
        for (const key of result.keys) {
          // Parse key: stream:conv:{sessionId}:{conversationId}
          const parts = key.replace(STREAM_CONV_PREFIX, '').split(':');
          if (parts.length === 2) {
            const [sessionId, conversationId] = parts;
            const messages = await readAllMessagesFromStream(sessionId, conversationId, false);
            if (messages.length > 0) {
              conversations.push({
                sessionId,
                conversationId,
                isAI: false,
                messages,
                lastMessage: messages[messages.length - 1],
                updatedAt: messages[messages.length - 1]?.timestamp,
              });
            }
          }
        }
      } while (cursor !== '0');

      // Scan for all AI stream keys (stream:conv:ai:*)
      cursor = '0';
      do {
        const result = await client.scan(cursor, {
          MATCH: `${STREAM_AI_PREFIX}*`,
          COUNT: 100,
        });
        cursor = result.cursor;
        
        for (const key of result.keys) {
          // Parse key: stream:conv:ai:{sessionId}
          const sessionId = key.replace(STREAM_AI_PREFIX, '');
          const messages = await readAllMessagesFromStream(sessionId, '2', true);
          if (messages.length > 0) {
            conversations.push({
              sessionId,
              conversationId: '2', // AI conversations always have ID 2
              isAI: true,
              messages,
              lastMessage: messages[messages.length - 1],
              updatedAt: messages[messages.length - 1]?.timestamp,
            });
          }
        }
      } while (cursor !== '0');

      return conversations;
    });
  } catch (error) {
    console.error('Error getting all conversations:', error);
    return [];
  }
}


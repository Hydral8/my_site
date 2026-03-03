import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';
import { SUNG_JAE_CONTEXT } from '@/lib/constants';

/**
 * POST /api/chat/ai-stream
 * Stream AI chat responses via SSE
 * 
 * Body:
 * - message: string (required) - User's message
 * - conversationHistory: Array<{text: string, sender: string}> (optional) - Previous messages
 * - sessionId: string (optional) - Session ID (not used for push notifications - AI chat doesn't send push)
 * - messageId: string (required) - Client-generated message ID for the AI response
 */

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, sessionId, messageId } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!messageId) {
      return new Response(JSON.stringify({ error: 'Message ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // AI chat messages should not trigger push notifications
    // Push notifications are only for real user conversations (conversationId === '1')

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build conversation history for context
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    
    // Add previous messages if any
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.sender === 'visitor' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Create SSE stream for AI response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial message indicating streaming has started
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', messageId })}\n\n`));

          // Generate AI response with streaming
          const response = await ai.models.generateContentStream({
            model: 'gemini-3-flash-preview',
            contents,
            config: {
              systemInstruction: SUNG_JAE_CONTEXT,
              maxOutputTokens: 512,
              temperature: 0.7,
            }
          });

          let fullText = '';
          
          // Stream chunks as they arrive
          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              fullText += text;
              // Send each chunk via SSE
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', messageId, text })}\n\n`));
            }
          }

          // Send completion message with full text
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', messageId, text: fullText })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('AI streaming error:', error);
          // Send error message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', messageId, error: 'Failed to generate response' })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      }
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


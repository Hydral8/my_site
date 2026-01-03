import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';

// System prompt with comprehensive information about Sung Jae
const SUNG_JAE_CONTEXT = `You are an AI digital twin of Sung Jae Bae. You should respond as if you ARE Sung Jae, speaking in first person. Be friendly, professional, and authentic.

## About Sung Jae

My goal is to build world-changing products that meaningfully change how people live and work, while being incredibly interesting to me.

### Long-term Goals:
- Solve / Reduce aging
- Silicon Photonics
- Intelligence / Robotics
- High Bandwidth Neural Interfaces
- Consumer Fashion Apps

### Education:
- **Sidney Kimmel Medical College** (2025 - Present): MS1 - Exploring new frontiers in healthcare and health technology, looking to augment medicine with tech.
- **University of Rochester** (2021 - 2025): B.S. Neuroscience with minors in Computer Science and Psychology. Explored the intersection of brain science, technology, and human behavior.

### Work Experience:
- **Remote Roofing** (2020 - 2021): Machine Learning Lead - Led development of AI-powered computer vision roof inspection systems, reducing manual assessment time by 80% and reducing user costs by $3000.

### Companies Founded:
- **Magi** (2025 - Present): Founder - Shopping reimagined. Magi is a semantic fashion product editor that lets users modify and generate clothing designs using natural-language like 'make this shirt cropped'. It understands garments at a conceptual level (fit, fabric, silhouette, details) and applies edits directly to products, personalized, consumer fashion transformations. Website: https://usemagi.com

- **Meural** (2025 - Present): Founder - Making general robotics a modern reality. Website: https://meural.com

- **Livv** (2021 - 2025): Co-Founder - Co-founded emergency medical services platform, streamlining ambulance dispatch and patient care coordination for faster response times. Website: https://livve.us

- **Queue**: An intelligent, on-device assistant natively integrated into the user's device. Instantly understands user intent and relevant context, enabling automation of tasks including replying to emails, debugging, managing meetings, and more.

### Club:
- **RocLab** (2021 - 2025): Co-Founder - Taking 20 exceptional students each semester to solve real-world campus problems at the University of Rochester using technology.

### Other things I like:
- Music production
- Soccer
- Most music (pop, r&b, hip hop, kpop, house, etc.). Depends on the rotation.
- Shorter TV shows
- Content Creation
- Gaming

### Things I'm ass at but need to get better:
- Cooking
- Gym
- Soccer (even more, kind of good)
- Reading
- Bunch of other stuff I'm tryna learn (advanced math, stats, physics, engineering, content creation, bunch of other stuff)

### Technical Skills:
- **Languages**: TypeScript, Python, JavaScript, Rust, Go
- **Frontend**: React, Next.js, Vue, Tailwind CSS, Framer Motion
- **Backend**: Node.js, GraphQL, PostgreSQL, MongoDB, Redis
- **AI/ML**: TensorFlow, PyTorch, Computer Vision, NLP, LLMs
- **Tools**: Docker, Kubernetes, AWS, Git, CI/CD

### Contact Information:
- Email: hello@sungjae.dev
- LinkedIn: https://www.linkedin.com/in/sungjaebae
- GitHub: https://github.com/hydral8
- X/Twitter: https://x.com/sunjaebae

## Instructions:
1. Respond naturally as Sung Jae would - friendly, enthusiastic about technology and building things, curious, authentic, sarcastic, genz, loves cool shit but also very normal in other ways. 
2. When asked about projects, skills, or experience, provide specific details from the context above.
3. Be helpful and engaging - I'm always happy to discuss my work, share insights, or help visitors.
4. If asked something not covered in the context, you can say you'd be happy to discuss it further via email.
5. Keep responses conversational and not too long unless detailed information is specifically requested.
6. Show genuine passion for technology, medicine, and building impactful products.
7. Dont be repetitive. Do not say "that's a great question" or anything like that.
8. You can use markdown formatting like **bold**, *italic*, \`code\`, and bullet points to make responses clearer.

Keep responses short and concise. Try to keep responses under 100 words, messaging style.
`;

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


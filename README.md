# My Site

An interactive personal website with a macOS-style desktop interface, featuring real-time chat functionality and a glassmorphism aesthetic.

## Features

- **macOS-Style Desktop**: Immersive desktop experience with dock, menu bar, and window management
- **Real-Time Chat**: Web and mobile chat integration with Redis Streams
- **Interactive Applications**:
  - **About App**: Personal bio and journey timeline
  - **Projects App**: Portfolio showcase with project cards
  - **Contact App**: Contact information and social links
  - **Chat App**: Real-time messaging interface
  - **Terminal App**: Interactive terminal experience
- **Glassmorphism UI**: Modern translucent design with backdrop blur effects
- **Expo Mobile Integration**: Native mobile app support for chat functionality

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: Redis (Streams for messaging)
- **AI**: Google Generative AI
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- Redis instance (local or remote)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my_site
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password
REDIS_USERNAME=your-redis-username
GOOGLE_GENAI_API_KEY=your-google-genai-api-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:redis` - Test Redis connection

## Project Structure

```
my_site/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Chat endpoints
│   │   └── conversations/ # Conversation management
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   └── macos/             # macOS-style components
│       ├── apps/          # Application components
│       ├── DockBar.tsx    # Dock component
│       ├── MenuBar.tsx    # Menu bar component
│       ├── Window.tsx     # Window component
│       └── WindowManager.tsx
├── lib/                   # Utility functions
│   ├── redis-service.ts   # Redis operations
│   └── utils.ts           # Helper functions
├── public/                # Static assets
└── types/                 # TypeScript types
```

## API Endpoints

### Chat Endpoints
- `POST /api/chat/save` - Save messages
- `GET /api/chat/load` - Load messages
- `GET /api/chat/stream` - Server-sent events stream
- `GET /api/chat/sync` - Sync messages since cursor

### Conversation Endpoints
- `POST /api/conversations/[id]/read` - Mark messages as read
- `GET /api/conversations/all` - Get all conversations

See `EXPO_API_DOCUMENTATION.md` for detailed API documentation.

## Redis Configuration

The application uses Redis Streams for real-time messaging:
- **Stream Keys**: `stream:conv:{sessionId}:{conversationId}`
- **Read Status**: `read:status:{sessionId}:{conversationId}` (Hash)
- **Cursors**: `cursor:device:{deviceId}:{sessionId}:{conversationId}`

## Development

### Testing Redis Connection
```bash
npm run test:redis
```

### Adding New Apps
1. Create a new component in `components/macos/apps/`
2. Add the app icon to `public/icons/`
3. Register the app in `MacOSDesktop.tsx`

## License

Private project - All rights reserved


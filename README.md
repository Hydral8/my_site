# Encrypted Reality - Interactive Personal Website

An immersive, encrypted interactive experience that reveals content through gameplay.

## Features

- 🎮 **Interactive Bug Catching Game** - Catch the moving bug to unlock the site
- 🔐 **Encrypted Text Effect** - All content scrambles until unlocked
- ✨ **Smooth Animations** - Powered by Framer Motion
- 🎨 **Cyberpunk Aesthetic** - Dark gradient background with cyan/purple accents
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Performance Optimized** - 60fps canvas animations with RAF

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Fonts:** Google Fonts (Inter, JetBrains Mono)

## Getting Started

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production
```bash
npm run build
npm start
```

## Project Structure

```
my_site/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with fonts
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── BugCanvas.tsx     # Canvas overlay with bug game
│   ├── ScrambledText.tsx # Text scrambling component
│   └── sections/         # Page sections
│       ├── About.tsx
│       ├── Projects.tsx
│       └── Contact.tsx
├── hooks/                # Custom React hooks
│   ├── useScramble.ts   # Text scrambling logic
│   ├── useDecode.ts     # Progressive decode
│   └── useBugGame.ts    # Bug movement & collision
├── lib/                  # Utility functions
├── types/               # TypeScript definitions
└── public/              # Static assets
```

## How It Works

1. **Initial State:** Page loads with all text scrambling rapidly
2. **Bug Spawns:** A glowing bug appears and moves across the screen
3. **Player Interaction:** User moves cursor/finger to catch the bug
4. **Bug Behavior:** Bug dodges when player gets close, making it challenging
5. **Collision:** When caught, particle explosion triggers unlock
6. **Decode:** Text progressively reveals (5% characters per 100ms)
7. **Full Reveal:** All sections appear with smooth animations

## Deployment

Deploy to Vercel with one click:

```bash
npm run build
```

Or use the Vercel CLI:
```bash
vercel
```

## Performance Notes

- Canvas animations use `requestAnimationFrame` for 60fps
- Components are memoized to prevent unnecessary re-renders
- Images are lazy-loaded
- Tailwind CSS is purged in production for minimal bundle size

## Customization

### Update Personal Info
Edit the data in:
- `components/sections/About.tsx` - Timeline
- `components/sections/Projects.tsx` - Project cards
- `components/sections/Contact.tsx` - Social links

### Adjust Colors
Modify the color palette in `tailwind.config.ts`

### Change Animations
Tweak timing and effects in individual component files

## License

MIT

## Author

Sung Jae Bae

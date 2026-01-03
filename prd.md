# PRD: macOS-Style Liquid Glass Display for Personal Website

## Overview
Transform the personal website into an immersive macOS-style desktop experience with a liquid glass aesthetic (mimicking the modern macOS translucent UI). The experience begins encrypted/locked and progressively unlocks through interactive elements.

## Core Concept
A virtual macOS desktop that serves as a portfolio interface where:
- Each application represents different sections of personal information
- The desktop has a liquid glass/frosted glass aesthetic with glassmorphism effects
- Content begins encrypted and unlocks through interactive engagement (bug catching game)
- Applications can be clicked to open "windows" displaying portfolio content

## Technical Architecture

### Phase 1: macOS Desktop Foundation
**Components to Create:**
- `MacOSDesktop.tsx` - Main desktop container with wallpaper and dock
- `DockBar.tsx` - Bottom dock with app icons (Finder, About, Projects, Contact, etc.)
- `MenuBar.tsx` - Top menu bar with time, system icons, and user name
- `Window.tsx` - Draggable, resizable window component with glassmorphism
- `WindowManager.tsx` - Context for managing open windows, z-index, minimize/maximize

**Design System:**
- Glassmorphism effects: `backdrop-blur`, semi-transparent backgrounds
- macOS-accurate animations: smooth scale, fade, and slide transitions
- Color palette: Translucent panels, subtle gradients, cyan/purple accents
- Typography: System font stack (SF Pro-like), monospace for code

### Phase 2: Application Windows
**Applications to Build:**

1. **Finder.app** - File browser showing portfolio structure
   - Displays "folders" for different life areas (Work, Education, Projects, etc.)
   - Clicking folders reveals timeline/journey content from About section

2. **About.app** - Terminal-style window showing bio and journey
   - Animated text decode effect
   - Timeline visualization with company/role information
   - Links to company websites

3. **Projects.app** - Grid view of project cards
   - Card-based layout with hover effects
   - Tech stack tags
   - Expandable descriptions
   - External links to live projects

4. **Contact.app** - Contact form or social links display
   - Social media icons grid
   - Email contact
   - Animated link cards

5. **Terminal.app** - Interactive terminal with easter eggs
   - Can run commands to reveal hidden content
   - Shows system "stats" (fun facts about the individual)
   - ASCII art elements

6. **Gallery.app** (Future) - Photo/media gallery
   - Screenshots, demos, visual work

### Phase 3: Initial Experience
**Clean macOS Boot:**
- Desktop loads with smooth fade-in animation
- Wallpaper renders with subtle parallax/gradient
- Dock icons animate in with sequential spring effect
- Menu bar fades in elegantly
- Optional: Welcome notification appears bottom-right

**Load States:**
- **Loading:** Smooth fade from dark to desktop
- **Ready:** Full glassmorphism, all apps clickable, vibrant colors

### Phase 4: Interactions & Polish
**User Interactions:**
- Draggable windows with smooth momentum
- Minimize to dock with genie effect
- Maximize/fullscreen windows
- Close windows with fade animation
- Dock magnification on hover
- Right-click context menus (optional)
- Keyboard shortcuts (Cmd+W to close, Cmd+M to minimize, etc.)

**Animations:**
- Window open: Scale from dock icon with spring
- Window close: Scale back to dock with momentum
- Dock hover: Icon magnification with neighboring icons affected
- App launch: Bounce effect on dock icon
- Desktop unlock: Cascading blur removal with particle effects

## Data Structure

### Window State
```typescript
interface WindowState {
  id: string
  appId: string
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  isClosable: boolean
}
```

### App Definition
```typescript
interface AppDefinition {
  id: string
  name: string
  icon: string | ReactNode
  component: ComponentType<any>
  defaultSize: { width: number; height: number }
  minSize?: { width: number; height: number }
  resizable: boolean
}
```

## File Structure
```
components/
  macos/
    MacOSDesktop.tsx
    MenuBar.tsx
    DockBar.tsx
    Window.tsx
    WindowManager.tsx
    apps/
      Finder.tsx
      AboutApp.tsx
      ProjectsApp.tsx
      ContactApp.tsx
      TerminalApp.tsx
  shared/
    GlassCard.tsx
    ScrollDecodedText.tsx (existing)
    ScrambledText.tsx (existing)
hooks/
  useBugGame.ts (existing)
  useWindowManager.ts
  useDraggable.ts
  useResizable.ts
styles/
  glassmorphism.css
types/
  macos.ts
```

## Design Tokens

### Colors
- Primary glass: `rgba(255, 255, 255, 0.15)`
- Dark glass: `rgba(0, 0, 0, 0.3)`
- Accent cyan: `#00F5D4`
- Accent purple: `#B26DFF`
- Border: `rgba(255, 255, 255, 0.2)`

### Blur Levels
- Desktop locked: `blur(20px)`
- Desktop unlocked: `blur(0px)`
- Window glass: `backdrop-blur(40px)`
- Heavy glass: `backdrop-blur(60px)`

### Animations
- Spring: `{ type: "spring", stiffness: 300, damping: 25 }`
- Smooth: `{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }`
- Bounce: `{ type: "spring", stiffness: 400, damping: 10 }`

## Content Mapping

### Existing Content → Apps
- **Hero Section** → Desktop wallpaper + initial encrypted state
- **About/Journey** → Finder.app + About.app
- **Projects** → Projects.app
- **Contact** → Contact.app
- **Bug Game** → Unlock mechanism

## MCP Servers Needed

You may want to consider these MCP servers:
1. **@modelcontextprotocol/server-filesystem** - If you need to read/write config files or manage assets
2. **@modelcontextprotocol/server-fetch** - If integrating external APIs for dynamic content
3. **Custom MCP for portfolio data** - Could serve project data, blog posts, or other dynamic content

Note: These are optional. Current implementation can work entirely with local files and components.

## Success Criteria
- [ ] Desktop looks and feels like macOS with liquid glass aesthetic
- [ ] All existing content is accessible through app windows
- [ ] Bug game successfully unlocks the experience with dramatic effect
- [ ] Windows are draggable, resizable, and feel responsive
- [ ] Dock and menu bar behave like macOS
- [ ] Glassmorphism effects work across all components
- [ ] Mobile responsive (fallback to simplified view)
- [ ] Performance: 60fps animations, smooth interactions
- [ ] Accessibility: Keyboard navigation, screen reader support

## Future Enhancements
- Blog.app for articles/writing
- Music.app with Spotify integration
- Photos.app for visual portfolio
- Settings.app for theme customization
- Multiple desktop workspaces
- Widgets on desktop
- Notification system
- Spotlight-style search (Cmd+Space)

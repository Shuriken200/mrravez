# MrRavez

Personal portfolio website for **MrRavez**

Built with Next.js, TypeScript, and modern web technologies, featuring an interactive physics-based orb field visualisation and glassmorphism UI components.

## Features

### Interactive Orb Field Visualisation
A canvas-based particle system with real-time physics simulation:
- **Spatial Grid System**: Efficient collision detection using spatial partitioning
- **Physics Simulation**: Orb-to-orb collision, soft avoidance, mouse repulsion, wall bouncing
- **Dynamic Spawning**: Continuous orb generation scaled to screen size (600 orbs at 4K, ~150 at 1080p)
- **Layer Attraction**: Orbs gravitate toward their depth layer for 3D effect
- **Parallax Movement**: Grid responds to scroll progress and device tilt
- **Burst Animation**: Initial explosion effect with configurable patterns

### Glassmorphism Component Library
Reusable glass-effect UI components with 3D animations:
- `GlassCard`: Animated cards with tilt effects and entry/exit animations
- `GlassButton`: Interactive buttons with hover states
- `GlassSlider`: Touch-friendly toggle slider with smooth animations
- `HoverablePhoto`: Photo component with mouse proximity effects

### Scroll-Based Navigation
Smooth scroll experience with snap points:
- **Desktop**: Wheel-based navigation with momentum and snap behaviour
- **Mobile**: Touch/swipe horizontal carousel with 3D wheel transform
- **Progressive Reveal**: Cards fade in/out based on scroll progress
- **Greeting Sequence**: Animated "Hi!" greeting followed by welcome text

### Comprehensive Debug Mode
Access via `/debug` route for development and troubleshooting:
- Real-time orb count and physics parameters
- Toggle collision areas, avoidance zones, velocity vectors
- Grid layer visualisation and hover cell highlighting
- Spawn orbs on click for testing
- Physics pause, collision/avoidance toggles
- Mobile-responsive glass debug panel

### Responsive Design
Mobile-first approach with device-specific optimisations:
- Touch/swipe gestures for navigation
- Device orientation support with calibration
- Hover detection for pointer-based devices
- Viewport-aware component sizing

## Project Architecture

```
src/
├── app/
│   ├── homepage/              # Homepage logic with scroll-based sections
│   │   ├── calculations.ts    # Pure visibility calculation functions
│   │   ├── constants.ts       # Animation timing, scroll zones, thresholds
│   │   ├── config/            # Transition configuration
│   │   ├── components/        # CardCarousel, GreetingSection
│   │   ├── hooks/             # Navigation, animation, visibility hooks
│   │   └── services/          # DebugModeService, IntroStorageService
│   ├── about/                 # About page route
│   ├── contact/               # Contact page route
│   ├── debug/                 # Debug mode routes
│   └── links/                 # Links page route
│
├── components/
│   ├── orb-field/             # Physics-based orb visualisation
│   │   ├── collision/         # Collision detection modules
│   │   ├── grid/              # Spatial grid system
│   │   │   ├── core/          # GridConfigFactory, SpatialGrid
│   │   │   └── visuals/       # Grid rendering and animations
│   │   ├── orb/               # Orb lifecycle, config, rendering
│   │   │   ├── config/        # Burst, spawn, wander configurations
│   │   │   ├── core/          # Orb behaviours, movement, marking
│   │   │   ├── hooks/         # useOrbManager, useOrbSpawning
│   │   │   └── visuals/       # Orb rendering with glow effects
│   │   ├── physics/           # Physics simulation phases
│   │   ├── hooks/             # React hooks for orb field
│   │   └── shared/            # Shared config and types
│   │
│   ├── glass/                 # Glassmorphism component library
│   │   ├── components/        # GlassCard, GlassButton, GlassSlider
│   │   ├── hooks/             # Animation, tilt, visibility hooks
│   │   │   ├── animation/     # Entry/exit, spring, tilt animations
│   │   │   ├── interaction/   # Drag, mouse proximity, 3D interaction
│   │   │   ├── tilt/          # Card tilt and orientation effects
│   │   │   └── visibility/    # Delayed and opacity visibility
│   │   └── styles/            # Glass style constants
│   │
│   ├── debug/                 # Debug tools and context
│   │   ├── DebugContext.tsx   # Global debug state management
│   │   ├── DebugMenu.tsx      # Mobile/desktop debug menu
│   │   ├── GlassDebugMenu/    # Glass-styled debug panel
│   │   └── useDebugUrlSync.ts # URL parameter synchronization
│   │
│   ├── cards/                 # AboutCard, LinksCard, ContactCard
│   ├── icons/                 # Icon components
│   ├── ui/                    # Base UI components (buttons, sheets, etc.)
│   └── providers/             # React Query and other providers
│
├── config/
│   ├── cards.config.tsx       # Card content configuration
│   └── site.config.ts         # Site identity and links
│
├── lib/
│   ├── storage/               # Storage abstractions (DIP)
│   │   └── debugStorage.ts    # localStorage abstraction for debug mode
│   └── utils.ts               # Utility functions
│
└── hooks/                     # Shared hooks
    ├── device/                # Device detection hooks
    └── orientation/           # Device orientation handling
```

## Configuration Files

All configurable values are centralised in these files:

- **Site Configuration**: [`src/config/site.config.ts`](src/config/site.config.ts)
  - Identity, role, organisation, contact information, social links

- **Homepage Constants**: [`src/app/homepage/constants.ts`](src/app/homepage/constants.ts)
  - Scroll zones, resting points, section thresholds, animation timings

- **Transition Config**: [`src/app/homepage/config/transitionConfig.ts`](src/app/homepage/config/transitionConfig.ts)
  - Snap behaviour, scroll sensitivity, animation durations

- **Orb Field Config**: [`src/components/orb-field/shared/config.ts`](src/components/orb-field/shared/config.ts)
  - Grid system, reveal animation, visual styles, parallax behaviour

- **Orb Behaviour Configs**: `src/components/orb-field/orb/config/`
  - `BurstConfig.ts` - Initial burst animation parameters
  - `ContinuousSpawnConfig.ts` - Continuous spawning rules
  - `WanderConfig.ts` - Random movement behaviour
  - `LayerAttractionConfig.ts` - Depth layer attraction
  - `SpeedLimitConfig.ts` - Velocity constraints

- **Glass Styles**: [`src/components/glass/styles/glassStyles.ts`](src/components/glass/styles/glassStyles.ts)
  - Background, border, shadow, backdrop blur configurations

- **Debug Menu Config**: [`src/components/debug/GlassDebugMenu/config/debugMenuConfig.ts`](src/components/debug/GlassDebugMenu/config/debugMenuConfig.ts)
  - Dimensions, z-index, spacing, typography, colours, transitions

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Package manager: npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/ljbdb/MrRavez.git
cd MrRavez

# Install dependencies
bun install
# or
npm install
```

### Development

```bash
# Start the development server
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Debug Mode

Access the debug interface at [http://localhost:3000/debug](http://localhost:3000/debug) to:
- View real-time orb physics
- Toggle collision/avoidance visualisation
- Spawn orbs on click
- Adjust physics parameters
- Simply have fun

### Environment Variables

No environment variables required for local development. The project uses static configuration files.

## Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: CSS Modules + Tailwind CSS
- **UI Components**: Custom components
- **State Management**: React Context API
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) (React Query)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Package Manager**: [Bun](https://bun.sh/)
- **3D Calculations** [Three.js](https://threejs.org/)

## Deployment

The project is configured for deployment to Cloudflare Pages using Open Next.js:

- **`wrangler.toml`**: Cloudflare Workers configuration
- **`open-next.config.ts`**: Open Next.js build configuration
- **`Dockerfile`**: Container deployment option

```bash
# Build for production
bun run build

# Preview production build locally
bun run start
```

- **Website**: [mrravez.no](https://mrravez.no)

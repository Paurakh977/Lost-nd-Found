# GOTUS Splash Screen & Transition System Documentation

This documentation provides a comprehensive guide to understanding how the splash screen and transition animations work in the GOTUS Next.js application.

## Overview

The splash screen and transition system is designed to provide a premium user experience with:
- **SplashScreen**: Appears only on initial visits/refreshes
- **TransitionPage**: Smooth transitions between page navigations
- **Zero configuration**: Automatically works with any new pages

## Architecture Flow

```
RootLayout (layout.tsx)
    ↓
SplashLayout (SplashLayout.tsx)
    ├── SplashScreen (initial visit)
    ├── TransitionPage (navigation)
    └── Page Content (Navbar + actual page)
```

## File Structure & Responsibilities

### 1. Root Level Integration (`src/app/layout.tsx`)
- **Purpose**: Wraps the entire application with SplashLayout
- **Key Integration**: SplashLayout wraps both Navbar and page content
- **Automatic Behavior**: All pages inherit splash/transition behavior

### 2. SplashLayout (`src/components/SplashLayout.tsx`)
**The orchestrator that manages both splash and transition states**

#### Key Features:
- **Initial Visit Detection**: Uses localStorage to distinguish fresh visits
- **Route Change Detection**: Monitors pathname changes via usePathname()
- **State Management**: Prevents splash/transition overlap
- **Smart Timing**: 100ms delay to ensure proper sequencing

#### Behavior Matrix:
| User Action | Result |
|-------------|---------|
| First visit to any page | SplashScreen → Page content |
| Refresh current page | SplashScreen → Page content |
| Navbar navigation | TransitionPage → Page content |
| Browser back/forward | TransitionPage → Page content |
| Manual URL entry | SplashScreen → Page content |

### 3. SplashScreen (`src/components/SplashScreen.tsx`)
**Premium branded animation for initial visits**

#### Animation Sequence:
1. **Logo Assembly** (0-2.5s): Premium pin SVG builds with staggered animations
2. **Text Reveal** (2.5-3.5s): "GOTUS" appears with gradual spacing
3. **Subtitle Fade** (3.5-5.5s): "Global Online Tracking..." fades in
4. **Exit Animation** (5.5-6.2s): Smooth fade-out and blur effect

#### Technical Details:
- **Duration**: 6.2 seconds total
- **CSS Animations**: Keyframe-based SVG animations
- **Framer Motion**: Text effects with GradualSpacing and TextEffect components
- **Responsive**: Scales for mobile devices

### 4. TransitionPage (`src/components/TransitionPage.tsx`)
**Smooth page transition for navigation**

#### Animation Mechanics:
- **Panel Count**: 12 vertical panels
- **Phases**:
  1. **Cover** (0-1.2s): Panels slide down with staggered timing
  2. **Hold** (1.2s): Brief pause with content hidden
  3. **Reveal** (1.2-2.5s): Panels slide up in reverse order
- **Visual Effects**: Multi-layer shine effects, gradients, and shadows
- **Duration**: ~2.5 seconds total

#### Technical Features:
- **CSS Grid**: Flexible panel layout
- **Cubic Bezier**: Smooth easing functions
- **Performance**: GPU-accelerated transforms
- **Accessibility**: Reduced motion support

### 5. Navigation (`src/components/Navbar.tsx`)
- **Client-side routing**: Uses Next.js Link components
- **Active states**: Visual feedback for current page
- **Responsive**: Mobile hamburger menu
- **Automatic**: All navigation triggers TransitionPage

## Usage Examples

### Adding New Pages
The system requires zero configuration for new pages:

```typescript
// src/app/new-feature/page.tsx
export default function NewFeature() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center">
      <h1>New Feature Page</h1>
      {/* Content automatically gets splash/transition behavior */}
    </main>
  );
}
```

### Navigation Patterns

#### Standard Navigation (Triggers Transition):
```typescript
// In any component
import Link from 'next/link';

<Link href="/about">About Us</Link>
// → Triggers TransitionPage animation
```

#### Programmatic Navigation:
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/contact');
// → Triggers TransitionPage animation
```

## Advanced Configuration

### Customizing Splash Duration
Modify the timing in `SplashScreen.tsx`:
```typescript
// Line ~175: Change exit timing
const exitTimer = setTimeout(() => {
  setIsExiting(true);
}, 5500); // Adjust duration (ms)

const completeTimer = setTimeout(() => {
  setIsVisible(false);
  onComplete();
}, 6200); // Adjust total duration (ms)
```

### Customizing Transition Speed
Modify timing in `TransitionPage.tsx`:
```typescript
// Constants at top
const STAGGER_DELAY = 45;    // Panel stagger timing
const COVER_DURATION = 1200; // Cover phase duration
const REVEAL_STAGGER = 35;   // Reveal stagger timing
```

### Behavior Modification
To change splash behavior (e.g., show only once per session):
```typescript
// In SplashLayout.tsx, modify localStorage logic
const lastVisit = localStorage.getItem('lastVisit');
const hasSeenSplash = localStorage.getItem('hasSeenSplash');

if (!hasSeenSplash) {
  setShowSplash(true);
  localStorage.setItem('hasSeenSplash', 'true');
}
```

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Actions                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ First Visit │    │   Refresh   │    │  Navigation │ │
│  └─────┬───────┘    └─────┬───────┘    └─────┬───────┘ │
│        │                  │                  │         │
│  ┌─────▼──────┐    ┌─────▼──────┐    ┌─────▼──────┐   │
│  │ SplashScreen│    │ SplashScreen│    │TransitionPage│ │
│  │  (6.2s)   │    │  (6.2s)   │    │  (2.5s)   │ │
│  └─────┬───────┘    └─────┬───────┘    └─────┬───────┘ │
│        │                  │                  │         │
│  ┌─────▼──────────────────▼──────────────────▼───────┐ │
│  │              Page Content Loads                   │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Key Takeaways

1. **Automatic**: Works with any new pages without configuration
2. **Smart Detection**: Distinguishes between initial visits and navigation
3. **Premium UX**: Smooth, professional animations throughout
4. **Responsive**: Optimized for all device sizes
5. **Performance**: GPU-accelerated animations with accessibility support
6. **Scalable**: Future-proof with Next.js App Router

## Testing Checklist

- [ ] First visit shows SplashScreen
- [ ] Refresh shows SplashScreen
- [ ] Navbar navigation shows TransitionPage
- [ ] Browser back/forward shows TransitionPage
- [ ] Manual URL entry shows SplashScreen
- [ ] New pages automatically inherit behavior
- [ ] Mobile responsive animations
- [ ] Reduced motion preferences respected

This system provides a seamless, premium user experience that scales with your application's growth while maintaining zero configuration overhead.
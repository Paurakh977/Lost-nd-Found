# Quick Reference Guide

## Instant Setup Guide

### 1. Adding New Pages (Zero Configuration)

```typescript
// src/app/your-page/page.tsx
export default function YourPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center">
      <h1>Your Page Content</h1>
      {/* Automatically gets splash + transition behavior */}
    </main>
  );
}
```

### 2. Navigation Patterns

```typescript
// Always triggers TransitionPage
import Link from 'next/link';
<Link href="/your-page">Go to Page</Link>

// Programmatic navigation (also triggers TransitionPage)
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/your-page');
```

## Configuration Cheat Sheet

### Timing Adjustments

| Component | File | Variable | Default | Range |
|-----------|------|----------|---------|--------|
| **Splash Duration** | `SplashScreen.tsx` | `exitTimer` | 5500ms | 2000-8000ms |
| **Transition Speed** | `TransitionPage.tsx` | `STAGGER_DELAY` | 45ms | 20-100ms |
| **Cover Duration** | `TransitionPage.tsx` | `COVER_DURATION` | 1200ms | 500-2000ms |

### Quick Customization

#### Faster Splash (3.5s total)
```typescript
// In SplashScreen.tsx
const exitTimer = setTimeout(() => setIsExiting(true), 3000);
const completeTimer = setTimeout(() => onComplete(), 3500);
```

#### Faster Transitions (1.5s total)
```typescript
// In TransitionPage.tsx
const STAGGER_DELAY = 25;
const COVER_DURATION = 600;
const REVEAL_STAGGER = 15;
```

## Visual Examples

### 1. SplashScreen Flow

```
┌─────────────────────────────────────┐
│           SplashScreen              │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      Premium Pin Logo       │    │ 0-2.5s
│  │         (Builds)            │    │
│  └─────────────────────────────┘    │
│                                     │
│           G O T U S                 │ 2.5-3.5s
│                                     │
│  Global Online Tracking...          │ 3.5-5.5s
│                                     │
└─────────────────────────────────────┘
```

### 2. TransitionPage Flow

```
┌─────────────────────────────────────┐
│         TransitionPage              │
│                                     │
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐         │ 0-1.2s
│  │█│ │█│ │█│ │█│ │█│ │█│         │ (Cover)
│  └─┘ └─┘ └─┘ └─┘ └─┘ └─┘         │
│                                     │
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐         │ 1.2-2.5s
│  │░│ │░│ │░│ │░│ │░│ │░│         │ (Reveal)
│  └─┘ └─┘ └─┘ └─┘ └─┘ └─┘         │
│                                     │
└─────────────────────────────────────┘
```

## Common Issues & Quick Fixes

### Issue: Splash appears too frequently
```typescript
// In SplashLayout.tsx - Increase threshold
const currentTime = Date.now();
if (!lastVisit || currentTime - parseInt(lastVisit) > 5000) { // Was 1000ms
  setShowSplash(true);
}
```

### Issue: Transitions feel sluggish
```typescript
// In TransitionPage.tsx - Reduce panel count
const PANEL_COUNT = 8; // Was 12
const STAGGER_DELAY = 30; // Was 45
```

### Issue: Mobile performance
```css
/* In TransitionPage.tsx - Add mobile optimizations */
@media (max-width: 768px) {
  .transition-panel {
    transition-duration: 0.5s;
  }
  
  .shine-layer-1,
  .shine-layer-2,
  .shine-layer-3 {
    display: none; /* Disable effects on mobile */
  }
}
```

## Testing Commands

### Manual Testing Checklist

1. **First Visit Test**
   ```bash
   # Open new tab and navigate to localhost:3000
   # Should see: SplashScreen → Content
   ```

2. **Navigation Test**
   ```bash
   # Click navbar links
   # Should see: TransitionPage → Content
   ```

3. **Refresh Test**
   ```bash
   # Press F5 on any page
   # Should see: SplashScreen → Content
   ```

### Browser DevTools Testing

```javascript
// Test localStorage behavior
localStorage.setItem('lastVisit', Date.now() - 2000); // 2 seconds ago
// Refresh page - should show SplashScreen

localStorage.setItem('lastVisit', Date.now()); // Now
// Navigate within site - should show TransitionPage
```

## File Structure Map

```
src/
├── app/
│   ├── layout.tsx          # Root wrapper (SplashLayout)
│   ├── page.tsx            # Home (auto-inherits behavior)
│   ├── about/page.tsx      # About (auto-inherits behavior)
│   └── contact/page.tsx    # Contact (auto-inherits behavior)
├── components/
│   ├── SplashLayout.tsx    # Orchestrator
│   ├── SplashScreen.tsx    # Initial visit animation
│   ├── TransitionPage.tsx  # Navigation animation
│   └── Navbar.tsx          # Navigation trigger
docs/
├── README.md               # Complete system overview
├── component-breakdown.md  # Technical deep dive
├── transition-behavior.md  # Navigation behavior
└── quick-reference.md      # This file
```

## Copy-Paste Templates

### Adding New Route with Navigation

```typescript
// src/app/new-feature/page.tsx
export default function NewFeature() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">New Feature</h1>
        <p className="text-gray-600">Your content here...</p>
      </div>
    </main>
  );
}
```

### Custom Navigation Link

```typescript
// In any component
import Link from 'next/link';

export function NavigationLink() {
  return (
    <Link 
      href="/new-feature"
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
    >
      Go to New Feature
    </Link>
  );
}
```

## Emergency Reset

If you need to completely reset the system:

```typescript
// In browser console
localStorage.removeItem('lastVisit');
// Refresh page - will show SplashScreen as first visit
```

This quick reference provides everything you need to work with the splash screen and transition system effectively.
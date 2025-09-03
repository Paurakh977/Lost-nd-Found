# Transition Page Behavior & Flow Documentation

## Understanding Navigation Behavior

The transition system distinguishes between **initial visits** and **in-app navigation** through sophisticated detection mechanisms. This document explains the exact behavior patterns you can expect.

## Behavior Matrix

| Action | Triggers | Animation | Duration | User Experience |
|--------|----------|-----------|----------|-----------------|
| **First visit to any page** | SplashScreen | Premium logo + text | 6.2s | Full brand experience |
| **Browser refresh** | SplashScreen | Same as first visit | 6.2s | Re-engagement |
| **Navbar click** | TransitionPage | Panel slide animation | 2.5s | Smooth transition |
| **Browser back/forward** | TransitionPage | Panel slide animation | 2.5s | Consistent UX |
| **Manual URL entry** | SplashScreen | Full splash | 6.2s | Fresh session |
| **Programmatic navigation** | TransitionPage | Panel slide animation | 2.5s | Seamless flow |

## Technical Detection Logic

### Client vs Server Navigation

```typescript
// How the system determines navigation type

// Client-side navigation (TransitionPage)
// Triggered by: <Link>, router.push(), browser back/forward
// Detection: pathname changes without full page reload
// Result: Smooth transition animation

// Server-side navigation (SplashScreen)
// Triggered by: Direct URL entry, refresh, new tab
// Detection: Full page reload detected via localStorage
// Result: Full splash screen experience
```

### Real-World Examples

#### Scenario 1: User Journey
```
User opens site → /home
├── SplashScreen shows (6.2s)
└── Home page loads

User clicks "About" in navbar → /about
├── TransitionPage shows (2.5s)
└── About page loads

User clicks browser back → /home
├── TransitionPage shows (2.5s)
└── Home page loads

User refreshes page → /home
├── SplashScreen shows (6.2s)
└── Home page loads
```

#### Scenario 2: Deep Linking
```
User visits /about directly from external link
├── SplashScreen shows (6.2s)
└── About page loads

User navigates to /contact via navbar
├── TransitionPage shows (2.5s)
└── Contact page loads
```

## Performance Considerations

### Animation Timing

| Component | GPU Accelerated | Memory Usage | Impact |
|-----------|-----------------|--------------|---------|
| SplashScreen | ✅ SVG + CSS | ~2MB | Minimal |
| TransitionPage | ✅ CSS transforms | ~500KB | Minimal |

### Optimization Features

```typescript
// Automatic cleanup in TransitionPage
const cleanup = useCallback(() => {
  timeoutsRef.current.forEach(id => window.clearTimeout(id));
  timeoutsRef.current = [];
}, []);

// Performance hints
.transition-panel {
  will-change: transform; /* GPU acceleration */
  backface-visibility: hidden;
  perspective: 1000px;
}
```

## Customization Guide

### Adjusting Transition Speed

```typescript
// In TransitionPage.tsx
const STAGGER_DELAY = 45;    // Faster = smaller number
const COVER_DURATION = 1200; // Cover phase duration
const REVEAL_STAGGER = 35;   // Reveal timing

// Example: Faster transitions
const STAGGER_DELAY = 25;
const COVER_DURATION = 800;
const REVEAL_STAGGER = 20;
```

### Modifying Splash Duration

```typescript
// In SplashScreen.tsx
useEffect(() => {
  const exitTimer = setTimeout(() => {
    setIsExiting(true);
  }, 4000); // Faster exit (was 5500)

  const completeTimer = setTimeout(() => {
    setIsVisible(false);
    onComplete();
  }, 4700); // Faster completion (was 6200)
}, [onComplete]);
```

## Troubleshooting Common Issues

### Issue: Transitions not triggering

**Symptoms**: Navigation between pages shows no animation
**Diagnosis**:
```typescript
// Add debug logging in SplashLayout.tsx
console.log('Debug:', {
  pathname,
  previousPath,
  showSplash,
  showTransition,
  hasShownSplash: hasShownSplash.current
});
```

**Solutions**:
1. Check if `showSplash === true` is blocking transitions
2. Verify `pathname` is actually changing
3. Ensure localStorage is accessible

### Issue: Splash appears on every navigation

**Symptoms**: Every page change shows full splash screen
**Root Cause**: localStorage detection failing
**Fix**: Check browser privacy settings, incognito mode

### Issue: Animations feel slow on mobile

**Solutions**:
```css
@media (max-width: 768px) {
  .transition-panel {
    transition-duration: 0.75s; /* Faster on mobile */
  }
}
```

## Advanced Usage Patterns

### Conditional Splash Behavior

```typescript
// Show splash only once per session
// In SplashLayout.tsx
useEffect(() => {
  if (isFirstMount.current) {
    isFirstMount.current = false;
    
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (!hasSeenSplash) {
      setShowSplash(true);
      sessionStorage.setItem('hasSeenSplash', 'true');
    }
  }
}, []);
```

### Route-Specific Transitions

```typescript
// Different transitions for different routes
// In SplashLayout.tsx
useEffect(() => {
  if (pathname !== previousPath && previousPath !== '') {
    // Custom logic based on route
    if (pathname === '/admin') {
      // Maybe skip transitions for admin
      setShowTransition(false);
    } else {
      setShowTransition(true);
    }
    setPreviousPath(pathname);
  }
}, [pathname, previousPath]);
```

## Testing Checklist

### Manual Testing

- [ ] **First Visit**: Open site in new tab → should show SplashScreen
- [ ] **Navigation**: Click navbar links → should show TransitionPage
- [ ] **Refresh**: Press F5 → should show SplashScreen
- [ ] **Back/Forward**: Use browser buttons → should show TransitionPage
- [ ] **Direct URL**: Type URL directly → should show SplashScreen
- [ ] **Mobile**: Test on mobile device → animations should adapt
- [ ] **Performance**: Check DevTools → no layout thrashing

### Automated Testing

```typescript
// Example test for transition detection
const testNavigation = () => {
  cy.visit('/');
  cy.get('[data-testid="splash-screen"]').should('be.visible');
  
  cy.get('[data-testid="navbar-about"]').click();
  cy.get('[data-testid="transition-page"]').should('be.visible');
  
  cy.url().should('include', '/about');
  cy.get('[data-testid="transition-page"]').should('not.exist');
};
```

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|--------|
| Chrome 90+ | ✅ Full | All features supported |
| Firefox 88+ | ✅ Full | All features supported |
| Safari 14+ | ✅ Full | All features supported |
| Edge 90+ | ✅ Full | All features supported |
| IE 11 | ❌ None | Uses modern CSS/JS features |

## Accessibility Features

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .transition-panel,
  .splash-animation {
    transition-duration: 0.3s;
    animation-duration: 0.3s;
  }
}
```

### Screen Reader Considerations

```typescript
// In SplashScreen.tsx
<div 
  aria-label="Loading GOTUS application"
  role="status"
  aria-live="polite"
>
  <span className="sr-only">Loading...</span>
  {/* Visual content */}
</div>
```

This comprehensive documentation ensures you understand exactly how the transition system behaves in all scenarios and provides the foundation for customization and troubleshooting.
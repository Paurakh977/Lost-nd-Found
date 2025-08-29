'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface TransitionPageProps {
  onComplete: () => void;
  onPhaseChange?: (phase: 'closing' | 'closed' | 'opening') => void;
}

const PANEL_COUNT = 12;
const STAGGER_DELAY = 45;
const COVER_DURATION = 1200; 
const REVEAL_STAGGER = 35;

const TransitionPage: React.FC<TransitionPageProps> = ({ onComplete, onPhaseChange }) => {
  const [isVisible, setIsVisible] = useState(true);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const cleanup = useCallback(() => {
    timeoutsRef.current.forEach(id => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const panels = Array.from(
      overlay.querySelectorAll<HTMLDivElement>('.transition-panel')
    );

    // Enable interaction blocking
    overlay.classList.add('active');

    // Notify that panels are starting to close
    onPhaseChange?.('closing');

    // Phase 1: Slide down panels with staggered timing
    panels.forEach((panel, index) => {
      const timeout = window.setTimeout(() => {
        panel.classList.add('slide-down');
      }, index * STAGGER_DELAY);
      timeoutsRef.current.push(timeout);
    });

    // Phase 2: Hold covered state, then reveal
    const revealTimeout = window.setTimeout(() => {
      // Notify when panels are fully closed (this is when navigation should happen)
      onPhaseChange?.('closed');
      
      // Small delay to ensure navigation completes before panels start opening
      setTimeout(() => {
        panels.forEach((panel, index) => {
          const timeout = window.setTimeout(() => {
            panel.classList.remove('slide-down');
            panel.classList.add('slide-up');
          }, (panels.length - 1 - index) * REVEAL_STAGGER);
          timeoutsRef.current.push(timeout);
        });

        // Notify that panels are starting to open
        onPhaseChange?.('opening');
      }, 50); // Small delay to ensure navigation is complete

      // Phase 3: Complete transition and cleanup - FIXED TIMING
      const completeTimeout = window.setTimeout(() => {
        overlay.classList.remove('active');
        setIsVisible(false);
        onComplete();
      }, panels.length * REVEAL_STAGGER + 600);
      timeoutsRef.current.push(completeTimeout);
    }, COVER_DURATION);

    timeoutsRef.current.push(revealTimeout);

    return cleanup;
  }, [onComplete, cleanup, onPhaseChange]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      <div ref={overlayRef} className="transition-overlay">
        {Array.from({ length: PANEL_COUNT }).map((_, i) => (
          <div 
            key={i} 
            className="transition-panel"
            style={{
              '--panel-index': i,
              '--total-panels': PANEL_COUNT,
            } as React.CSSProperties}
          >
            <div className="panel-inner">
              <div className="shine-layer-1"></div>
              <div className="shine-layer-2"></div>
              <div className="shine-layer-3"></div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .transition-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 10000;
          pointer-events: none;
          display: flex;
          overflow: hidden;
          background: transparent;
          will-change: transform;
        }

        .transition-overlay.active {
          pointer-events: all;
        }

        .transition-panel {
          flex: 1;
          height: 100%;
          position: relative;
          transform: scaleY(0);
          transform-origin: var(--transform-origin, bottom);
          transition: transform 0.85s cubic-bezier(0.23, 1, 0.32, 1);
          min-width: calc(100% / var(--total-panels));
          will-change: transform;
          overflow: hidden;
        }

        /* Dynamic transform origins for wave effect */
        .transition-panel:nth-child(odd) {
          --transform-origin: bottom;
        }
        .transition-panel:nth-child(even) {
          --transform-origin: top;
        }

        /* Panel inner container with base gradients */
        .panel-inner {
          width: 100%;
          height: 100%;
          position: relative;
          background: var(--panel-bg);
        }

        /* Enhanced gradient backgrounds with more depth */
        .transition-panel:nth-child(12n+1) { 
          --panel-bg: linear-gradient(180deg, #000000 0%, #0f0f0f 30%, #1a1a1a 70%, #000000 100%); 
        }
        .transition-panel:nth-child(12n+2) { 
          --panel-bg: linear-gradient(0deg, #000000 0%, #1a1a1a 30%, #0f0f0f 70%, #000000 100%); 
        }
        .transition-panel:nth-child(12n+3) { 
          --panel-bg: linear-gradient(180deg, #111111 0%, #000000 30%, #222222 70%, #111111 100%); 
        }
        .transition-panel:nth-child(12n+4) { 
          --panel-bg: linear-gradient(0deg, #000000 0%, #0a0a0a 30%, #1f1f1f 70%, #000000 100%); 
        }
        .transition-panel:nth-child(12n+5) { 
          --panel-bg: linear-gradient(180deg, #000000 0%, #222222 30%, #0f0f0f 70%, #000000 100%); 
        }
        .transition-panel:nth-child(12n+6) { 
          --panel-bg: linear-gradient(0deg, #0f0f0f 0%, #000000 30%, #1a1a1a 70%, #0f0f0f 100%); 
        }
        .transition-panel:nth-child(12n+7) { 
          --panel-bg: linear-gradient(180deg, #1a1a1a 0%, #000000 30%, #111111 70%, #1a1a1a 100%); 
        }
        .transition-panel:nth-child(12n+8) { 
          --panel-bg: linear-gradient(0deg, #000000 0%, #111111 30%, #0a0a0a 70%, #000000 100%); 
        }
        .transition-panel:nth-child(12n+9) { 
          --panel-bg: linear-gradient(180deg, #000000 0%, #0a0a0a 30%, #1f1f1f 70%, #000000 100%); 
        }
        .transition-panel:nth-child(12n+10) { 
          --panel-bg: linear-gradient(0deg, #222222 0%, #000000 30%, #111111 70%, #222222 100%); 
        }
        .transition-panel:nth-child(12n+11) { 
          --panel-bg: linear-gradient(180deg, #0f0f0f 0%, #000000 30%, #1a1a1a 70%, #0f0f0f 100%); 
        }
        .transition-panel:nth-child(12n+12) { 
          --panel-bg: linear-gradient(0deg, #000000 0%, #1a1a1a 30%, #0f0f0f 70%, #000000 100%); 
        }

        /* Layer 1: Primary shine effect */
        .shine-layer-1 {
          position: absolute;
          top: 0;
          left: -200%;
          width: 200%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 15%,
            rgba(255, 255, 255, 0.3) 35%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0.3) 65%,
            rgba(255, 255, 255, 0.05) 85%,
            transparent 100%
          );
          z-index: 3;
          transition: left 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }

        /* Layer 2: Secondary shimmer overlay */
        .shine-layer-2 {
          position: absolute;
          top: 0;
          right: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          z-index: 2;
          transition: right 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s;
          will-change: transform;
        }

        /* Layer 3: Vertical streak effect */
        .shine-layer-3 {
          position: absolute;
          top: -150%;
          left: 0;
          width: 100%;
          height: 150%;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 40%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.08) 60%,
            transparent 100%
          );
          z-index: 1;
          transition: top 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s;
          will-change: transform;
        }

        /* Active state - slide down with all layer effects */
        .transition-panel.slide-down {
          transform: scaleY(1);
          box-shadow: 
            inset 0 0 30px rgba(255, 255, 255, 0.04),
            0 0 40px rgba(0, 0, 0, 0.6),
            0 0 80px rgba(0, 0, 0, 0.3);
        }

        .transition-panel.slide-down .shine-layer-1 {
          left: 200%;
        }

        .transition-panel.slide-down .shine-layer-2 {
          right: 100%;
        }

        .transition-panel.slide-down .shine-layer-3 {
          top: 150%;
        }

        /* Opening state - slide back up with improved easing */
        .transition-panel.slide-up {
          transform: scaleY(0);
          transition: transform 0.9s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .transition-panel.slide-up .shine-layer-1 {
          left: -200%;
          transition: left 0.4s ease-out;
        }

        .transition-panel.slide-up .shine-layer-2 {
          right: -100%;
          transition: right 0.3s ease-out;
        }

        .transition-panel.slide-up .shine-layer-3 {
          top: -150%;
          transition: top 0.3s ease-out;
        }

        /* Enhanced depth with staggered layer animations */
        .transition-panel:nth-child(odd) .shine-layer-1 {
          transition-delay: calc(var(--panel-index) * 0.02s);
        }

        .transition-panel:nth-child(even) .shine-layer-1 {
          transition-delay: calc(var(--panel-index) * 0.01s);
        }

        .transition-panel:nth-child(odd) .shine-layer-2 {
          transition-delay: calc(0.3s + var(--panel-index) * 0.015s);
        }

        .transition-panel:nth-child(even) .shine-layer-2 {
          transition-delay: calc(0.25s + var(--panel-index) * 0.02s);
        }

        .transition-panel:nth-child(odd) .shine-layer-3 {
          transition-delay: calc(0.5s + var(--panel-index) * 0.01s);
        }

        .transition-panel:nth-child(even) .shine-layer-3 {
          transition-delay: calc(0.45s + var(--panel-index) * 0.015s);
        }

        /* Performance optimizations */
        .transition-overlay * {
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Additional layer effects for enhanced visual depth */
        .transition-panel.slide-down .panel-inner {
          filter: brightness(1.1) contrast(1.05);
          transition: filter 0.6s ease-out 0.2s;
        }

        .transition-panel.slide-up .panel-inner {
          filter: brightness(1) contrast(1);
          transition: filter 0.3s ease-out;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .transition-panel {
            transition: transform 0.75s cubic-bezier(0.23, 1, 0.32, 1);
          }
          
          .transition-panel.slide-up {
            transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
          }

          .panel-shimmer,
          .panel-streak {
            transition-duration: 0.6s;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .transition-panel,
          .shine-layer-1,
          .shine-layer-2,
          .shine-layer-3,
          .panel-inner {
            transition-duration: 0.3s;
          }
        }
      `}</style>
    </div>
  );
};

export default TransitionPage;
/**
 * GPU Warmup Utility
 * 
 * Pre-warms the browser's GPU compositor by creating and animating
 * invisible elements that mimic the transition panel structure.
 * This ensures smooth animations on first navigation.
 */

export const warmupGPUForTransitions = (): Promise<void> => {
  return new Promise((resolve) => {
    // Create a hidden container
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 100vw;
      height: 100vh;
      display: flex;
      pointer-events: none;
      z-index: -1;
      opacity: 0;
    `;
    
    // Create 12 panels (same as TransitionPage)
    const panels: HTMLDivElement[] = [];
    for (let i = 0; i < 12; i++) {
      const panel = document.createElement('div');
      panel.style.cssText = `
        flex: 1;
        height: 100%;
        position: relative;
        transform: scaleY(0) translateZ(0);
        transform-origin: ${i % 2 === 0 ? 'bottom' : 'top'};
        transition: transform 0.85s cubic-bezier(0.23, 1, 0.32, 1);
        will-change: transform, opacity;
        backface-visibility: hidden;
        perspective: 1000px;
        contain: layout style paint;
      `;
      
      // Add inner content for more realistic GPU layer creation
      const inner = document.createElement('div');
      inner.style.cssText = `
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, #000000 0%, #0f0f0f 50%, #000000 100%);
      `;
      panel.appendChild(inner);
      
      container.appendChild(panel);
      panels.push(panel);
    }
    
    document.body.appendChild(container);
    
    // Force layout calculation
    container.offsetHeight;
    
    // Force GPU layer creation for each panel
    panels.forEach(panel => {
      const style = window.getComputedStyle(panel);
      style.transform;
      style.willChange;
      panel.offsetHeight;
      panel.offsetWidth;
      panel.getBoundingClientRect();
    });
    
    // Trigger a quick animation sequence to fully initialize GPU layers
    requestAnimationFrame(() => {
      // Animate panels down
      panels.forEach((panel, index) => {
        setTimeout(() => {
          panel.style.transform = 'scaleY(1) translateZ(0)';
        }, index * 10);
      });
      
      // Wait for animations to process
      setTimeout(() => {
        // Animate panels back up
        panels.forEach((panel, index) => {
          setTimeout(() => {
            panel.style.transform = 'scaleY(0) translateZ(0)';
          }, (panels.length - 1 - index) * 10);
        });
        
        // Cleanup after animations complete
        setTimeout(() => {
          document.body.removeChild(container);
          console.log('[GPU Warmup] GPU layers warmed up successfully');
          resolve();
        }, 300);
      }, 200);
    });
  });
};

/**
 * Check if GPU warmup has been done in this session
 */
let isGPUWarmedUp = false;

export const isGPUReady = (): boolean => {
  return isGPUWarmedUp;
};

export const markGPUAsWarmedUp = (): void => {
  isGPUWarmedUp = true;
};

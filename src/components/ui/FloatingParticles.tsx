"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeProvider';

interface FloatingParticlesProps {
  count: number;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({ count }) => {
  const { isDark, mounted } = useTheme();

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 5 + 2;
      const duration = Math.random() * 20 + 15; // Long duration for slow, gradual movement
      const delay = Math.random() * 5; // Short initial delay to ensure particles appear quickly
      
      const xTarget = Math.random() * 200 - 100;
      const yTarget = Math.random() * 200 - 100;

      return {
        id: `particle-${i}-${isDark ? 'dark' : 'light'}`,
        x: `${Math.random() * 100}vw`,
        y: `${Math.random() * 100}vh`,
        size,
        duration,
        delay,
        xTarget,
        yTarget,
      };
    });
  }, [count, isDark]);

  if (!mounted) {
    return null;
  }

  const particleColor = isDark ? "#FFFFFF" : "#334155";
  const particleGlow = isDark 
    ? "0 0 10px 3px rgba(255, 255, 255, 0.6)" 
    : "0 0 8px 2px rgba(51, 65, 85, 0.5)";

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particleColor,
            boxShadow: particleGlow,
          }}
          initial={{ opacity: 0 }}
          animate={{
            x: [0, particle.xTarget, 0],
            y: [0, particle.yTarget, 0],
            opacity: [0, isDark ? 0.7 : 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;

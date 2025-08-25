'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, Variants } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

// Gradual Spacing Component
interface GradualSpacingProps {
  text: string;
  duration?: number;
  delayMultiple?: number;
  framerProps?: Variants;
  className?: string;
  delay?: number;
}

function GradualSpacing({
  text,
  duration = 0.5,
  delayMultiple = 0.04,
  framerProps = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  className,
  delay = 0,
}: GradualSpacingProps) {
  return (
    <div className="flex justify-center space-x-1">
      <AnimatePresence>
        {text.split("").map((char, i) => (
          <motion.h1
            key={i}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={framerProps}
            transition={{ 
              duration, 
              delay: delay + (i * delayMultiple) 
            }}
            className={className}
          >
            {char === " " ? <span>&nbsp;</span> : char}
          </motion.h1>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Text Effect Component
type PresetType = 'blur' | 'shake' | 'scale' | 'fade' | 'slide';

type TextEffectProps = {
  children: string;
  per?: 'word' | 'char' | 'line';
  as?: keyof React.JSX.IntrinsicElements;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  className?: string;
  preset?: PresetType;
  delay?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
};

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const presetVariants: Record<
  PresetType,
  { container: Variants; item: Variants }
> = {
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(12px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(12px)' },
    },
  },
  shake: {
    container: defaultContainerVariants,
    item: {
      hidden: { x: 0 },
      visible: { x: [-5, 5, -5, 5, 0], transition: { duration: 0.5 } },
      exit: { x: 0 },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0 },
    },
  },
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
  },
};

function TextEffect({
  children,
  per = 'word',
  as = 'p',
  variants,
  className,
  preset,
  delay = 0,
  trigger = true,
  onAnimationComplete,
}: TextEffectProps) {
  const segments = per === 'word' ? children.split(/(\s+)/) : children.split('');
  
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  const selectedVariants = preset
    ? presetVariants[preset]
    : { container: defaultContainerVariants, item: { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } } };
  const containerVariants = variants?.container || selectedVariants.container;
  const itemVariants = variants?.item || selectedVariants.item;

  const delayedContainerVariants: Variants = {
    hidden: containerVariants.hidden,
    visible: {
      ...containerVariants.visible,
      transition: {
        ...(containerVariants.visible as any)?.transition,
        staggerChildren: (containerVariants.visible as any)?.transition?.staggerChildren || 0.05,
        delayChildren: delay,
      },
    },
    exit: containerVariants.exit,
  };

  return (
    <AnimatePresence mode='popLayout'>
      {trigger && (
        <MotionTag
          initial='hidden'
          animate='visible'
          exit='exit'
          variants={delayedContainerVariants}
          className={className}
          onAnimationComplete={onAnimationComplete}
        >
          {segments.map((segment, index) => (
            <motion.span
              key={`${per}-${index}-${segment}`}
              variants={itemVariants}
              className={per === 'word' ? 'inline-block whitespace-pre' : 'inline-block'}
            >
              {segment}
            </motion.span>
          ))}
        </MotionTag>
      )}
    </AnimatePresence>
  );
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 5500);

    // Complete and unmount
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 6200);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center min-h-screen w-full overflow-hidden transition-all duration-700 ease-in-out ${
      isExiting 
        ? 'opacity-0 scale-95 blur-sm' 
        : 'opacity-100 scale-100 blur-0'
    }`}>
      {/* Pin Animation with exit animation */}
      <div className={`flex items-center justify-center mb-6 transition-all duration-700 ease-out ${
        isExiting 
          ? 'transform -translate-y-8 opacity-0 scale-90' 
          : 'transform translate-y-0 opacity-100 scale-100'
      }`}>
        <svg 
          id="site-pin"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 319 415"
          style={{
            width: '250px',
            height: '325px'
          }}
        >
          <defs>
            <radialGradient id="finalGlowEffect" cx="50%" cy="40%" r="60%">
                <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 0.6}} />
                <stop offset="100%" style={{stopColor: '#ffffff', stopOpacity: 0}} />
            </radialGradient>
        </defs>

          {/* Dark sections (fill first) */}
          <path className="dark-section" stroke="none" d="
            M 158.41 63.62
            L 158.82 86.91
            Q 119.54 87.61 92.22 115.24
            C 65.23 142.54 57.96 184.86 74.43 219.50
            Q 76.30 223.45 88.52 243.32
            Q 105.21 270.49 121.94 297.55
            Q 139.95 326.67 158.71 355.78
            Q 159.08 380.01 158.82 392.00
            Q 158.75 395.16 159.65 396.77
            Q 159.50 397.97 158.92 398.21
            Q 157.88 398.62 157.26 397.66
            Q 147.88 382.95 142.44 374.07
            Q 133.08 358.76 76.33 267.68
            Q 62.15 244.92 58.02 237.96
            C 32.17 194.42 38.87 138.75 73.03 101.51
            Q 93.46 79.24 122.68 69.44
            Q 140.76 63.37 158.41 63.62
            Z
          "/>

          <path className="dark-section" stroke="none" d="
            M 172.77 257.16
            Q 173.89 256.35 176.18 255.81
            L 176.71 254.84
            L 169.67 235.35
            Q 140.76 239.27 119.22 221.24
            C 105.12 209.43 97.39 190.89 98.27 172.79
            C 99.31 151.05 111.11 132.34 130.41 122.17
            C 147.82 113.01 169.81 113.45 186.72 122.39
            C 211.90 135.69 226.09 166.13 216.35 193.89
            Q 208.10 217.38 186.19 228.88
            L 185.90 229.63
            L 191.93 246.33
            L 192.63 247.21
            L 193.65 247.87
            Q 214.76 306.06 218.07 316.66
            C 220.49 324.40 216.22 331.46 208.22 332.49
            C 202.85 333.18 197.61 329.43 195.87 324.61
            Q 191.60 312.77 172.40 258.35
            Q 172.77 257.16 172.77 257.16
            Z
            M 202.97 175.57
            A 44.30 44.30 0.0 0 0 158.67 131.27
            A 44.30 44.30 0.0 0 0 114.37 175.57
            A 44.30 44.30 0.0 0 0 158.67 219.87
            A 44.30 44.30 0.0 0 0 202.97 175.57
            Z
          "/>

          {/* Blue sections (fill second) */}
          <path className="blue-section" stroke="none" d="
            M 158.82 86.91
            L 158.41 63.62
            Q 193.11 63.81 220.83 81.91
            C 247.48 99.30 266.67 127.12 272.74 158.58
            Q 278.91 190.57 266.97 222.11
            Q 263.80 230.48 257.42 241.21
            C 249.11 255.16 237.50 271.99 231.99 280.55
            Q 226.45 267.72 222.63 256.12
            C 221.92 253.94 222.93 252.68 224.04 250.90
            C 228.26 244.08 236.31 232.45 241.67 222.16
            C 264.85 177.66 248.08 124.59 205.13 99.61
            Q 183.57 87.07 158.82 86.91
            Z
          "/>

          <path className="blue-section" stroke="none" d="
            M 159.65 396.77
            Q 158.75 395.16 158.82 392.00
            Q 159.08 380.01 158.71 355.78
            L 175.32 329.00
            L 175.90 329.04
            L 186.73 353.38
            Q 176.03 371.93 162.26 393.51
            Q 161.24 395.10 159.65 396.77
            Z
          "/>

          {/* Dark outline */}
          <path className="pin-outline-dark" d="
            M 158.41 63.62
            Q 140.76 63.37 122.68 69.44
            Q 93.46 79.24 73.03 101.51
            C 38.87 138.75 32.17 194.42 58.02 237.96
            Q 62.15 244.92 76.33 267.68
            Q 133.08 358.76 142.44 374.07
            Q 147.88 382.95 157.26 397.66
            Q 159.50 397.97 159.65 396.77
            Q 158.75 395.16 158.82 392.00
            Q 159.08 380.01 158.71 355.78
            Q 139.95 326.67 121.94 297.55
            Q 105.21 270.49 88.52 243.32
            Q 76.30 223.45 74.43 219.50
            C 57.96 184.86 65.23 142.54 92.22 115.24
            Q 119.54 87.61 158.82 86.91
            L 158.41 63.62
            Z
          "/>

          {/* Blue outline */}
          <path className="blue-section" stroke="#4799c1" strokeWidth="2" d="
            M 158.82 86.91
            Q 183.57 87.07 205.13 99.61
            C 248.08 124.59 264.85 177.66 241.67 222.16
            C 236.31 232.45 228.26 244.08 224.04 250.90
            C 222.93 252.68 221.92 253.94 222.63 256.12
            Q 226.45 267.72 231.99 280.55
            C 237.50 271.99 249.11 255.16 257.42 241.21
            Q 263.80 230.48 266.97 222.11
            Q 278.91 190.57 272.74 158.58
            C 266.67 127.12 247.48 99.30 220.83 81.91
            Q 193.11 63.81 158.41 63.62
            L 158.82 86.91
            Z
          "/>

          {/* White magnifying glass */}
          <circle className="glass-white" stroke="none" cx="158.67" cy="175.57" r="44.30"/>

          {/* Blue highlight */}
          <path className="glass-highlight" stroke="none" d="
            M 176.27 142.22
            Q 175.97 141.85 175.62 141.69
            Q 168.54 138.59 160.50 138.30
            C 146.23 137.78 133.42 144.14 126.13 156.75
            C 119.74 167.79 118.99 184.04 127.48 194.25
            Q 127.92 194.78 128.59 194.97
            C 129.64 187.77 129.79 181.97 131.89 176.54
            Q 135.41 167.45 140.43 161.89
            Q 154.66 146.15 175.98 142.98
            Q 176.27 142.22 176.27 142.22
            Z
          "/>

          {/* Final glow effect */}
          <circle className="final-glow" cx="159" cy="200" r="80" fill="url(#finalGlowEffect)"/>
        </svg>
      </div>

      {/* GOTUS Text with Gradual Spacing and exit animation */}
      <div className={`mb-4 transition-all duration-500 ease-out delay-100 ${
        isExiting 
          ? 'transform translate-y-4 opacity-0' 
          : 'transform translate-y-0 opacity-100'
      }`}>
        <GradualSpacing
          text="GOTUS"
          duration={0.6}
          delayMultiple={0.1}
          delay={2.5} // Start later in pin animation
          className="font-display text-5xl font-bold tracking-widest text-gray-800 drop-shadow-lg md:text-7xl"
          framerProps={{
            hidden: { opacity: 0, x: -30, scale: 0.8 },
            visible: { opacity: 1, x: 0, scale: 1 },
          }}
        />
      </div>

      {/* Subtitle with Text Effect and exit animation */}
      <div className={`max-w-5xl text-center px-4 transition-all duration-400 ease-out delay-200 ${
        isExiting 
          ? 'transform translate-y-6 opacity-0' 
          : 'transform translate-y-0 opacity-100'
      }`}>
        <TextEffect
            per="word"
            preset="fade"
            delay={3.5}
            className="text-4xl font-normal text-gray-600 tracking-wide leading-relaxed md:text-6xl font-sans"
            >
            Global Online Tracking for Unclaimed Stuff
        </TextEffect>

      </div>

      <style jsx global>{`
        #site-pin {
          width: 250px;
          height: 325px;
          transform: scale(0);
          animation: pinEntrance 4.5s cubic-bezier(0.23, 1, 0.320, 1) forwards;
        }

        .pin-outline-dark {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          fill: transparent;
          stroke: #121e27;
          stroke-width: 2;
          animation: drawOutline 1.5s ease-out 0.5s forwards;
        }

        .dark-section {
          fill: transparent;
          stroke: none;
          animation: fillDark 0.8s ease-out 1.8s forwards;
        }

        .blue-section {
          fill: transparent;
          stroke: none;
          animation: fillBlueMinimal 1.0s ease-in-out 2.1s forwards;
        }

        .glass-white {
          fill: transparent;
          stroke: none;
          animation: fillWhite 0.4s ease-out 2.8s forwards;
        }

        .glass-highlight {
          fill: transparent;
          stroke: none;
          animation: fillHighlight 0.3s ease-out 3.1s forwards;
        }

        .final-glow {
          opacity: 0;
          animation: finalGlow 0.5s ease-out 3.3s forwards;
        }

        @keyframes pinEntrance {
          0% {
            transform: scale(0) rotate(180deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes drawOutline {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fillDark {
          to { fill: #121e27; }
        }

        @keyframes fillBlueMinimal {
          0% { 
            fill: transparent;
          }
          100% { 
            fill: #4799c1;
          }
        }

        @keyframes fillWhite {
          to { fill: #ffffff; }
        }

        @keyframes fillHighlight {
          to { fill: #4799c1; }
        }

        @keyframes finalGlow {
          0% { opacity: 0; }
          50% { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
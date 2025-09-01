'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from 'framer-motion';
import { Search, CheckCircle, Zap, Globe, Shield, Star, ArrowRight, Users, BarChart3, TrendingUp, Award } from 'lucide-react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const cn = (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' ');

// Cosmic Particles Component
const CosmicParticles = ({ density = 'medium', className = '' }: { density?: 'low' | 'medium' | 'high' | 'ultra', className?: string }) => {
  const particleCounts = {
    low: 8,
    medium: 15,
    high: 25,
    ultra: 40
  };
  
  const particleCount = particleCounts[density];
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Floating Orbs */}
      {Array.from({ length: Math.floor(particleCount * 0.3) }).map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/40 to-indigo-400/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
      
      {/* Cosmic Dust */}
      {Array.from({ length: Math.floor(particleCount * 0.4) }).map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          className="absolute w-0.5 h-0.5 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            opacity: [0.1, 0.6, 0.1],
          }}
          transition={{
            duration: 12 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}
      
      {/* Floating Stars */}
      {Array.from({ length: Math.floor(particleCount * 0.2) }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-px h-px bg-gradient-to-r from-cyan-400/50 to-blue-400/50 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        />
      ))}
      
      {/* Energy Wisps */}
      {Array.from({ length: Math.floor(particleCount * 0.1) }).map((_, i) => (
        <motion.div
          key={`wisp-${i}`}
          className="absolute w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
          animate={{
            x: [0, Math.random() * 40 - 20],
            opacity: [0, 0.7, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15 + Math.random() * 5,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}
    </div>
  );
};

// Aurora Background Component
const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  showRadialGradient?: boolean;
} & React.HTMLProps<HTMLDivElement>) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 transition-colors duration-300",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              `
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert dark:invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-50 will-change-transform`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};

interface CounterHookResult {
  count: number;
  ref: React.RefObject<HTMLDivElement | null>;
}

const useCounter = (end: number, duration: number = 2000, start: number = 0): CounterHookResult => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView && !isVisible) {
      setIsVisible(true);
      let startTime: number;
      const animate = (timestamp: number): void => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * (end - start) + start));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [inView, isVisible, end, duration, start]);

  return { count, ref };
};

// Hero section with Aurora Background
const HeroSection = () => {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-6 items-center justify-center px-4 max-w-5xl mx-auto text-center"
      >
        <motion.span
          className="inline-flex items-center px-3 py-1.5 bg-zinc-100/10 dark:bg-zinc-800/20 text-zinc-700 dark:text-zinc-300 rounded-full text-sm font-medium backdrop-blur-sm border border-zinc-200/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Global Asset Recovery Platform
        </motion.span>

        <div className="text-4xl md:text-7xl font-light tracking-tight dark:text-white text-zinc-900 leading-[1.1] gsap-reveal">
          Discover Hidden{' '}
          <motion.span
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            Assets
          </motion.span>
        </div>

        <motion.p
          className="text-lg md:text-xl font-light dark:text-zinc-200 text-zinc-700 max-w-2xl leading-relaxed tracking-wide gsap-reveal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          AI-powered global tracking system for unclaimed assets. 
          Secure, fast, and comprehensive recovery solutions.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <motion.button
            className="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-full font-medium flex items-center justify-center gap-2 group hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Free Search
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
          
          <motion.button
            className="px-8 py-3 border border-zinc-300/30 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 rounded-full font-medium hover:bg-zinc-200/20 dark:hover:bg-zinc-800/30 transition-all backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Watch Demo
          </motion.button>
        </motion.div>

        <motion.div
          className="flex items-center gap-8 text-sm text-zinc-500 dark:text-zinc-400 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Free 30-day trial
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            No credit card required
          </div>
        </motion.div>
      </motion.div>
    </AuroraBackground>
  );
};

// Ultra Minimal Stats Section with enhanced cosmic particles
const StatsSection = () => {
  const stats = [
    { value: 25000, label: 'Items Reunited', suffix: '+' },
    { value: 8500, label: 'Active Users', suffix: '+' },
    { value: 92, label: 'Success Rate', suffix: '%' },
    { value: 45, label: 'Cities Covered', suffix: '+' }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-zinc-50/95 via-zinc-50/90 via-blue-50/15 to-zinc-50/85 dark:from-zinc-900/95 dark:via-zinc-900/90 dark:via-blue-950/8 dark:to-zinc-900/85 overflow-hidden">
      {/* Enhanced aurora continuation */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_1200px_600px_at_50%_-50%,rgba(99,102,241,0.03),transparent),radial-gradient(ellipse_800px_400px_at_20%_80%,rgba(139,92,246,0.02),transparent)] dark:bg-[radial-gradient(ellipse_1200px_600px_at_50%_-50%,rgba(99,102,241,0.04),transparent),radial-gradient(ellipse_800px_400px_at_20%_80%,rgba(139,92,246,0.03),transparent)]"></div>
      
      {/* Cosmic Particles */}
      <div className="cosmic-parallax">
        <CosmicParticles density="high" />
      </div>
      
      {/* Additional floating cosmic elements */}
      <motion.div 
        className="absolute top-1/4 left-1/6 w-16 h-16 bg-gradient-to-br from-blue-500/8 to-indigo-500/8 rounded-full blur-xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/6 w-12 h-12 bg-gradient-to-br from-purple-500/6 to-pink-500/6 rounded-full blur-lg"
        animate={{ 
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.5, 0.2],
          rotate: [360, 180, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      
      <div className="relative max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 gsap-stagger-parent">
          {stats.map((stat, i) => {
            const { count, ref } = useCounter(stat.value, 2500);
            
            return (
              <motion.div
                key={i}
                ref={ref}
                className="text-center group"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Minimal glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="relative bg-white/60 dark:bg-zinc-800/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-zinc-700/20 group-hover:border-blue-200/40 dark:group-hover:border-blue-700/40 transition-all duration-500">
                    <motion.div 
                      className="text-3xl lg:text-4xl font-extralight text-zinc-800 dark:text-zinc-50 mb-2 gsap-counter"
                      data-value={stat.value}
                      animate={{ scale: count > 0 ? [1, 1.05, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {count.toLocaleString()}<span className="text-blue-500 dark:text-blue-300 font-light">{stat.suffix}</span>
                    </motion.div>
                    <div className="text-zinc-600 dark:text-zinc-300 text-sm font-normal tracking-wider uppercase letter-spacing-wide">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Enhanced Features Section with cosmic atmosphere
const FeaturesSection = () => {
  const features = [
    { icon: Search, title: 'Smart Matching', description: 'AI analyzes descriptions to match lost and found items.' },
    { icon: Zap, title: 'Instant Alerts', description: 'Get notified immediately when matches are found.' },
    { icon: Shield, title: 'Secure Platform', description: 'Your data protected with enterprise-grade security.' },
    { icon: Globe, title: 'Global Network', description: 'Search across cities and expand your reach.' },
    { icon: Users, title: 'Community', description: 'Powered by helpful community members.' },
    { icon: CheckCircle, title: 'Easy Recovery', description: 'Simple verification and return process.' }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-zinc-50/85 via-zinc-50/80 via-indigo-50/25 to-zinc-50/75 dark:from-zinc-900/85 dark:via-zinc-900/80 dark:via-indigo-950/12 dark:to-zinc-900/75 overflow-hidden">
      {/* Enhanced flowing aurora */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_1500px_800px_at_50%_100%,rgba(79,70,229,0.02),transparent),radial-gradient(ellipse_1000px_500px_at_80%_20%,rgba(168,85,247,0.015),transparent)] dark:bg-[radial-gradient(ellipse_1500px_800px_at_50%_100%,rgba(79,70,229,0.03),transparent),radial-gradient(ellipse_1000px_500px_at_80%_20%,rgba(168,85,247,0.025),transparent)]"></div>
      
      {/* Ultra-dense cosmic particles */}
      <div className="cosmic-parallax">
        <CosmicParticles density="ultra" />
      </div>
      
      {/* Floating cosmic nebulae */}
      <motion.div 
        className="absolute top-1/5 left-1/12 w-40 h-40 bg-gradient-to-br from-indigo-500/6 to-purple-500/6 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 360]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-2/3 right-1/12 w-32 h-32 bg-gradient-to-br from-purple-500/6 to-pink-500/6 rounded-full blur-2xl"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.5, 0.2],
          rotate: [360, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div 
        className="absolute bottom-1/6 left-1/3 w-28 h-28 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.25, 0.4, 0.25],
          x: [0, 30, 0]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 7 }}
      />
      
      <div className="relative max-w-6xl mx-auto px-6">
        {/* Minimal header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl lg:text-4xl font-extralight text-zinc-800 dark:text-zinc-50 mb-4 tracking-wide gsap-reveal"
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: 1.2 }}
          >
            Engineered for <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Simplicity</span>
          </motion.h2>
        </motion.div>

        {/* Floating grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 gsap-stagger-parent">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="group relative"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="relative p-8 rounded-3xl bg-white/40 dark:bg-zinc-800/30 backdrop-blur-md border border-white/30 dark:border-zinc-700/30 hover:bg-white/60 dark:hover:bg-zinc-800/50 transition-all duration-700 group-hover:border-blue-200/50 dark:group-hover:border-blue-700/50"
                whileHover={{ y: -12, rotateX: 5 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-indigo-500/3 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <motion.div 
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-6 group-hover:from-blue-500/30 group-hover:to-indigo-500/30 transition-all duration-500"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <feature.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </motion.div>
                
                <h3 className="text-lg font-normal text-zinc-800 dark:text-zinc-50 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed font-normal tracking-wide">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced Testimonials with cosmic ambiance
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Maria Rodriguez',
      content: 'Found my iPhone within 2 days. The AI matching was incredibly accurate.',
      rating: 5
    },
    {
      name: 'James Wilson', 
      content: 'Helped reunite a lost wallet with its owner in just hours. So simple.',
      rating: 5
    },
    {
      name: 'Lisa Zhang',
      content: 'Lost my car keys downtown. Found them through this amazing platform.',
      rating: 5
    }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-zinc-50/75 via-zinc-50/70 via-purple-50/18 to-zinc-50/65 dark:from-zinc-900/75 dark:via-zinc-900/70 dark:via-purple-950/10 dark:to-zinc-900/65 overflow-hidden">
      {/* Enhanced aurora waves */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_1200px_600px_at_50%_0%,rgba(139,92,246,0.02),transparent),radial-gradient(ellipse_800px_400px_at_20%_100%,rgba(59,130,246,0.015),transparent)] dark:bg-[radial-gradient(ellipse_1200px_600px_at_50%_0%,rgba(139,92,246,0.03),transparent),radial-gradient(ellipse_800px_400px_at_20%_100%,rgba(59,130,246,0.025),transparent)]"></div>
      
      {/* Dense cosmic particles */}
      <div className="cosmic-parallax">
        <CosmicParticles density="high" />
      </div>
      
      {/* Floating cosmic formations */}
      <motion.div 
        className="absolute top-1/5 right-1/8 w-20 h-20 bg-gradient-to-br from-purple-500/8 to-violet-500/8 rounded-full blur-2xl"
        animate={{ 
          scale: [1, 1.6, 1],
          opacity: [0.4, 0.7, 0.4],
          y: [0, -20, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-1/8 w-24 h-24 bg-gradient-to-br from-violet-500/6 to-pink-500/6 rounded-full blur-xl"
        animate={{ 
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 15, 0]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl lg:text-4xl font-extralight text-zinc-800 dark:text-zinc-50 mb-4 tracking-wide gsap-reveal"
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: 1.2 }}
          >
            Trusted by <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Thousands</span>
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 gsap-stagger-parent">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              className="relative group"
              initial={{ opacity: 0, y: 80, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.15, duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="relative p-8 rounded-3xl bg-white/50 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/40 dark:border-zinc-700/30 hover:bg-white/70 dark:hover:bg-zinc-800/60 transition-all duration-700"
                whileHover={{ y: -16, scale: 1.02, rotateY: 3 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {/* Subtle glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Floating stars */}
                <motion.div 
                  className="flex items-center justify-center gap-1 mb-6"
                  whileHover={{ scale: 1.1 }}
                >
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <motion.div
                      key={starIndex}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.15 + starIndex * 0.05, type: "spring" }}
                    >
                      <Star className="w-3 h-3 text-amber-400 fill-current" />
                    </motion.div>
                  ))}
                </motion.div>
                
                <motion.p 
                  className="text-zinc-800 dark:text-zinc-200 mb-8 leading-relaxed font-normal italic tracking-wide"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.15 + 0.3 }}
                >
                  "{testimonial.content}"
                </motion.p>
                
                <motion.div 
                  className="flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/80 to-pink-500/80 flex items-center justify-center"
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-[10px] font-medium text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </motion.div>
                  <h4 className="font-normal text-zinc-700 dark:text-zinc-300 text-sm tracking-wide">{testimonial.name}</h4>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced Ethereal Pricing Section
const PricingSection = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for individuals',
      features: ['Basic search', 'Email notifications', 'Community access'],
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      description: 'Enhanced recovery tools',
      features: ['Advanced AI', 'Priority support', 'Multiple tracking', 'Analytics', 'Mobile app'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For organizations',
      features: ['Bulk management', 'API access', 'Custom integrations', 'Dedicated support'],
      popular: false
    }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-zinc-50/65 via-zinc-50/60 via-emerald-50/20 to-zinc-50/55 dark:from-zinc-900/65 dark:via-zinc-900/60 dark:via-emerald-950/12 dark:to-zinc-900/55 overflow-hidden">
      {/* Enhanced ethereal aurora flows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_1000px_500px_at_20%_50%,rgba(16,185,129,0.025),transparent),radial-gradient(ellipse_800px_400px_at_80%_50%,rgba(59,130,246,0.02),transparent),radial-gradient(ellipse_600px_300px_at_50%_0%,rgba(168,85,247,0.015),transparent)] dark:bg-[radial-gradient(ellipse_1000px_500px_at_20%_50%,rgba(16,185,129,0.035),transparent),radial-gradient(ellipse_800px_400px_at_80%_50%,rgba(59,130,246,0.03),transparent),radial-gradient(ellipse_600px_300px_at_50%_0%,rgba(168,85,247,0.025),transparent)]"></div>
      
      {/* Ultra-dense cosmic field */}
      <div className="cosmic-parallax">
        <CosmicParticles density="ultra" />
      </div>
      
      {/* Floating cosmic storms */}
      <motion.div 
        className="absolute top-1/6 left-1/12 w-36 h-36 bg-gradient-to-br from-emerald-500/6 to-blue-500/6 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.7, 0.3],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/6 right-1/12 w-28 h-28 bg-gradient-to-br from-blue-500/7 to-purple-500/7 rounded-full blur-2xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.6, 0.4],
          rotate: [360, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-cyan-500/4 to-emerald-500/4 rounded-full blur-xl"
        animate={{ 
          scale: [1, 1.6, 1],
          opacity: [0.2, 0.5, 0.2],
          x: [0, -40, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 10 }}
      />
      
      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl lg:text-4xl font-extralight text-zinc-800 dark:text-zinc-50 mb-4 tracking-wide gsap-reveal"
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: 1.2 }}
          >
            Simple <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Pricing</span>
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 gsap-stagger-parent">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className="relative group"
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              {plan.popular && (
                <motion.div 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500/90 to-blue-500/90 text-white text-xs font-light rounded-full backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0, y: 10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3, type: "spring" }}
                >
                  Most Popular
                </motion.div>
              )}
              
              <motion.div 
                className={cn(
                  "relative p-8 rounded-3xl backdrop-blur-xl border transition-all duration-700 overflow-hidden",
                  plan.popular 
                    ? "bg-white/60 dark:bg-zinc-800/50 border-emerald-200/50 dark:border-emerald-700/50 hover:border-emerald-300/60 dark:hover:border-emerald-600/60" 
                    : "bg-white/50 dark:bg-zinc-800/40 border-white/40 dark:border-zinc-700/30 hover:border-zinc-200/60 dark:hover:border-zinc-600/50"
                )}
                whileHover={{ y: -16, scale: 1.02, rotateY: 2 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {/* Subtle aurora glow */}
                <div className={cn(
                  "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700",
                  plan.popular 
                    ? "bg-gradient-to-br from-emerald-500/4 via-transparent to-blue-500/4"
                    : "bg-gradient-to-br from-zinc-500/3 via-transparent to-slate-500/3"
                )}></div>
                
                <div className="relative text-center">
                  <h3 className="text-xl font-normal text-zinc-800 dark:text-zinc-50 mb-2 tracking-wide">
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-3xl font-extralight text-zinc-800 dark:text-zinc-50">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-zinc-600 dark:text-zinc-300 text-sm font-normal">/mo</span>}
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm font-normal mb-8 tracking-wide">
                    {plan.description}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex}
                        className="flex items-center justify-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + featureIndex * 0.05 }}
                      >
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                        <span className="text-zinc-700 dark:text-zinc-300 text-sm font-normal tracking-wide">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.button
                    className={cn(
                      "w-full py-3 rounded-2xl font-light tracking-wide transition-all backdrop-blur-sm",
                      plan.popular
                        ? "bg-gradient-to-r from-emerald-500/90 to-blue-500/90 text-white hover:from-emerald-600/90 hover:to-blue-600/90"
                        : "border border-zinc-300/50 dark:border-zinc-600/50 text-zinc-700 dark:text-zinc-300 hover:bg-white/30 dark:hover:bg-zinc-700/30"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced How It Works with cosmic energy streams
const HowItWorksSection = () => {
  const steps = [
    {
      step: '01',
      title: 'Report',
      description: 'Describe your lost item with simple details.',
      icon: Search
    },
    {
      step: '02',
      title: 'Match',
      description: 'AI finds potential matches automatically.',
      icon: Zap
    },
    {
      step: '03',
      title: 'Connect',
      description: 'Get securely connected with the finder.',
      icon: Users
    }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-zinc-50/55 via-zinc-50/50 via-blue-50/25 to-zinc-50/45 dark:from-zinc-900/55 dark:via-zinc-900/50 dark:via-blue-950/15 dark:to-zinc-900/45 overflow-hidden">
      {/* Enhanced flowing aurora streams */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_1400px_700px_at_50%_-100%,rgba(59,130,246,0.02),transparent),radial-gradient(ellipse_1000px_500px_at_50%_200%,rgba(168,85,247,0.015),transparent),radial-gradient(ellipse_600px_300px_at_20%_50%,rgba(99,102,241,0.012),transparent)] dark:bg-[radial-gradient(ellipse_1400px_700px_at_50%_-100%,rgba(59,130,246,0.03),transparent),radial-gradient(ellipse_1000px_500px_at_50%_200%,rgba(168,85,247,0.025),transparent),radial-gradient(ellipse_600px_300px_at_20%_50%,rgba(99,102,241,0.02),transparent)]"></div>
      
      {/* High-density cosmic field */}
      <div className="cosmic-parallax">
        <CosmicParticles density="high" />
      </div>
      
      {/* Enhanced energy streams */}
      <motion.div 
        className="absolute top-0 left-1/2 w-px h-40 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"
        animate={{ 
          opacity: [0.3, 0.8, 0.3],
          scaleY: [1, 1.2, 1]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-0 left-1/3 w-px h-32 bg-gradient-to-t from-transparent via-purple-500/30 to-transparent"
        animate={{ 
          opacity: [0.2, 0.7, 0.2],
          scaleY: [1, 1.3, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div 
        className="absolute top-1/2 right-1/4 w-px h-28 bg-gradient-to-b from-transparent via-cyan-500/25 to-transparent"
        animate={{ 
          opacity: [0.15, 0.6, 0.15],
          scaleY: [1, 1.4, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      
      {/* Floating cosmic vortex */}
      <motion.div 
        className="absolute top-1/3 left-1/6 w-24 h-24 bg-gradient-to-br from-blue-500/8 to-indigo-500/8 rounded-full blur-xl"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 360]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl lg:text-4xl font-extralight text-zinc-800 dark:text-zinc-50 tracking-wider gsap-reveal"
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: 1.2 }}
          >
            Three <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Steps</span>
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-16 gsap-stagger-parent">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative text-center group"
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              {/* Connection line to next step */}
              {i < steps.length - 1 && (
                <motion.div 
                  className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 w-12 lg:w-16 h-px bg-gradient-to-r from-blue-500/30 to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: i * 0.2 + 0.5, duration: 0.8 }}
                />
              )}
              
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                <motion.div 
                  className="w-16 h-16 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/40 dark:border-zinc-700/40 flex items-center justify-center mx-auto mb-8 group-hover:border-blue-300/60 dark:group-hover:border-blue-600/60 transition-all duration-500"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <span className="text-zinc-600 dark:text-zinc-400 text-xs font-light tracking-widest">{step.step}</span>
                </motion.div>
                
                <h3 className="text-lg font-normal text-zinc-800 dark:text-zinc-50 mb-4 tracking-wide">
                  {step.title}
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm font-normal leading-relaxed max-w-xs mx-auto tracking-wide">
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced CTA with cosmic convergence
const CTASection = () => {
  return (
    <section className="relative py-32 bg-gradient-to-b from-zinc-50/45 via-zinc-50/40 via-indigo-50/30 to-zinc-200/95 dark:from-zinc-900/45 dark:via-zinc-900/40 dark:via-indigo-950/18 dark:to-zinc-800/95 overflow-hidden">
      {/* Enhanced flowing aurora conclusion */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_1200px_500px_at_50%_50%,rgba(99,102,241,0.015),transparent),radial-gradient(ellipse_800px_400px_at_50%_50%,rgba(59,130,246,0.02),transparent),radial-gradient(ellipse_600px_300px_at_80%_20%,rgba(168,85,247,0.012),transparent)] dark:bg-[radial-gradient(ellipse_1200px_500px_at_50%_50%,rgba(99,102,241,0.025),transparent),radial-gradient(ellipse_800px_400px_at_50%_50%,rgba(59,130,246,0.03),transparent),radial-gradient(ellipse_600px_300px_at_80%_20%,rgba(168,85,247,0.02),transparent)]"></div>
      
      {/* Ultra-dense cosmic convergence */}
      <div className="cosmic-parallax">
        <CosmicParticles density="ultra" />
      </div>
      
      {/* Cosmic energy convergence */}
      <motion.div 
        className="absolute top-1/5 left-1/8 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl"
        animate={{ 
          scale: [1, 1.4, 1],
          opacity: [0.4, 0.7, 0.4],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/5 right-1/8 w-28 h-28 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [360, 180, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-br from-cyan-500/6 to-blue-500/6 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.6, 1],
          opacity: [0.25, 0.5, 0.25],
          x: [0, -30, 0],
          y: [0, -15, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.h2 
            className="text-3xl lg:text-4xl font-light text-zinc-900 dark:text-white mb-6 tracking-wide leading-tight"
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: 1.5 }}
          >
            Ready to <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Begin?</span>
          </motion.h2>
          
          <motion.p 
            className="text-lg text-zinc-600 dark:text-zinc-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Join thousands discovering their lost assets through intelligent matching.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.button
              className="px-10 py-4 bg-white/80 dark:bg-zinc-100/90 text-zinc-900 rounded-2xl font-light tracking-wide backdrop-blur-sm border border-white/50 hover:bg-white/95 hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-blue-500/20"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Free Search
            </motion.button>
            
            <motion.button
              className="px-10 py-4 border border-zinc-300/40 dark:border-zinc-600/40 text-zinc-700 dark:text-zinc-300 rounded-2xl font-light tracking-wide hover:bg-white/20 dark:hover:bg-zinc-800/20 hover:scale-105 transition-all duration-500 backdrop-blur-sm"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* Minimal stats */}
          <motion.div 
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {[
              { value: '< 24h', label: 'Avg Match' },
              { value: 'Free', label: 'Always' },
              { value: '92%', label: 'Success' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                className="text-center group"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-xl font-light text-zinc-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-zinc-500 dark:text-zinc-400 text-xs font-light tracking-wider uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Enhanced Footer with cosmic fade
const Footer = () => (
  <footer className="relative bg-gradient-to-b from-zinc-200/95 via-zinc-700/90 to-zinc-900 dark:from-zinc-800/95 dark:via-zinc-850/90 dark:to-zinc-900 text-white py-16 overflow-hidden">
    {/* Enhanced final aurora glow */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_1000px_300px_at_50%_0%,rgba(79,70,229,0.03),transparent),radial-gradient(ellipse_600px_200px_at_20%_0%,rgba(99,102,241,0.025),transparent),radial-gradient(ellipse_600px_200px_at_80%_0%,rgba(168,85,247,0.02),transparent)] dark:bg-[radial-gradient(ellipse_1000px_300px_at_50%_0%,rgba(79,70,229,0.04),transparent),radial-gradient(ellipse_600px_200px_at_20%_0%,rgba(99,102,241,0.035),transparent),radial-gradient(ellipse_600px_200px_at_80%_0%,rgba(168,85,247,0.03),transparent)]"></div>
    
    {/* Final cosmic particles */}
    <div className="cosmic-parallax">
      <CosmicParticles density="medium" />
    </div>
    
    {/* Enhanced light constellation */}
    <motion.div 
      className="absolute top-0 left-1/5 w-px h-20 bg-gradient-to-b from-blue-500/40 to-transparent"
      animate={{ 
        opacity: [0.4, 0.8, 0.4],
        scaleY: [1, 1.3, 1]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div 
      className="absolute top-0 right-1/5 w-px h-16 bg-gradient-to-b from-indigo-500/35 to-transparent"
      animate={{ 
        opacity: [0.3, 0.7, 0.3],
        scaleY: [1, 1.4, 1]
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
    <motion.div 
      className="absolute top-0 left-1/2 w-px h-12 bg-gradient-to-b from-purple-500/30 to-transparent"
      animate={{ 
        opacity: [0.2, 0.6, 0.2],
        scaleY: [1, 1.5, 1]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
    />
    
    <div className="relative max-w-5xl mx-auto px-6">
      <motion.div 
        className="grid md:grid-cols-4 gap-8 mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
        >
          <motion.div 
            className="text-xl font-light mb-4 flex items-center gap-2"
            whileHover={{ x: 3 }}
          >
            <motion.div 
              className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500/80 to-indigo-600/80"
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.8 }}
            />
            GOTUS
          </motion.div>
          <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-xs">
            Connecting lost items with their owners through intelligent technology.
          </p>
        </motion.div>
        
        {[
          { title: 'Platform', items: ['Search', 'Report', 'Connect'] },
          { title: 'Support', items: ['Help', 'Contact', 'Guide'] },
          { title: 'Legal', items: ['Privacy', 'Terms', 'Security'] }
        ].map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h4 className="font-light mb-4 text-white/90 text-sm tracking-wider uppercase">{section.title}</h4>
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <motion.a 
                  key={item} 
                  href="#" 
                  className="block text-zinc-400 hover:text-zinc-200 transition-all duration-300 text-sm font-light"
                  whileHover={{ x: 4, color: '#e4e4e7' }}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        className="border-t border-zinc-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <p className="text-zinc-500 text-sm font-light">
          © 2025 LostFound. Crafted with care.
        </p>
        <div className="flex items-center gap-6">
          <motion.a 
            href="#" 
            className="text-zinc-300 hover:text-white dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors text-sm font-normal tracking-wide"
            whileHover={{ scale: 1.05 }}
          >
            Privacy
          </motion.a>
          <motion.a 
            href="#" 
            className="text-zinc-300 hover:text-white dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors text-sm font-normal tracking-wide"
            whileHover={{ scale: 1.05 }}
          >
            Terms
          </motion.a>
        </div>
      </motion.div>
    </div>
  </footer>
);

// Main App Component
export default function App() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Initialize premium Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t: number) => 1 - Math.pow(1 - t, 4), // Premium easing curve
      lerp: 0.08, // Smoother interpolation
      wheelMultiplier: 0.8, // More controlled wheel scrolling
    });

    // Premium scroll animation function
    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update(); // Sync with GSAP
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // GSAP Premium Scroll Animations
    const initScrollAnimations = () => {
      // Parallax effect for cosmic particles
      gsap.utils.toArray('.cosmic-parallax').forEach((element: any) => {
        gsap.to(element, {
          yPercent: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // Smooth reveal animations for sections
      gsap.utils.toArray('section').forEach((section: any, index: number) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse',
          },
        });

        tl.from(section.querySelectorAll('.gsap-reveal'), {
          y: 60,
          opacity: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out',
        });
      });

      // Premium stagger animations for cards/items
      gsap.utils.toArray('.gsap-stagger-parent').forEach((parent: any) => {
        gsap.from(parent.children, {
          y: 80,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: parent,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      // Smooth counter animations
      gsap.utils.toArray('.gsap-counter').forEach((counter: any) => {
        const finalValue = parseInt(counter.dataset.value || '0');
        const obj = { value: 0 };
        
        gsap.to(obj, {
          value: finalValue,
          duration: 2.5,
          ease: 'power2.out',
          onUpdate: () => {
            counter.textContent = Math.round(obj.value).toLocaleString();
          },
          scrollTrigger: {
            trigger: counter,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      // Floating elements with physics-based movement
      gsap.utils.toArray('.gsap-float').forEach((element: any) => {
        gsap.to(element, {
          y: -30,
          rotation: 360,
          duration: 8 + Math.random() * 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    };

    // Initialize animations after a short delay
    setTimeout(initScrollAnimations, 100);
    
    // Add custom CSS for enhanced effects
    const style = document.createElement('style');
    style.textContent = `
      @keyframes aurora {
        from {
          background-position: 50% 50%, 50% 50%;
        }
        to {
          background-position: 350% 50%, 350% 50%;
        }
      }
      .animate-aurora {
        animation: aurora 60s linear infinite;
      }
      
      /* Premium smooth scrolling setup */
      html {
        scroll-behavior: auto; /* Let Lenis handle it */
      }
      
      html, body {
        overflow-x: hidden;
      }

      /* Smooth transitions for all elements */
      * {
        will-change: auto;
      }

      /* Enhanced text rendering */
      body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
      }

      /* Premium scroll indicator */
      ::-webkit-scrollbar {
        width: 6px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, rgba(59, 130, 246, 0.6), rgba(99, 102, 241, 0.6));
        border-radius: 3px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, rgba(59, 130, 246, 0.8), rgba(99, 102, 241, 0.8));
      }

      /* Focus states for accessibility */
      button:focus-visible, 
      a:focus-visible {
        outline: 2px solid rgba(59, 130, 246, 0.5);
        outline-offset: 2px;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 overflow-x-hidden">
      <AnimatePresence>
        {!isLoaded ? (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-zinc-50 via-blue-50/30 to-zinc-50 dark:from-zinc-900 dark:via-blue-950/20 dark:to-zinc-900 flex items-center justify-center z-50"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          > 
            <motion.div
              className="flex flex-col items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <motion.div
                className="w-8 h-8 border border-blue-600/30 rounded-full relative overflow-hidden"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-600/40 to-transparent animate-pulse"></div>
              </motion.div>
              <motion.p
                className="mt-4 text-zinc-900 dark:text-zinc-100 font-light text-sm tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Loading...
              </motion.p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <HeroSection />
            <StatsSection />
            <FeaturesSection />
            <TestimonialsSection />
            <PricingSection />
            <HowItWorksSection />
            <CTASection />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Minimal scroll to top */}
      <motion.button
        className="fixed bottom-8 right-8 w-8 h-8 bg-white/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 rounded-full backdrop-blur-sm border border-white/60 dark:border-zinc-700/60 hover:bg-white/95 dark:hover:bg-zinc-800/95 transition-all z-40"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowRight size={14} className="rotate-[-90deg]" />
      </motion.button>
    </div>
  );
}
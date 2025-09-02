'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Search, Shield, Globe, Users, Award, Target, ArrowRight, CheckCircle, Zap, BarChart3, Clock, Sparkles, TrendingUp, Lock, Headphones, FileCheck } from 'lucide-react';
import Link from 'next/link';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const cn = (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' ');

// Optimized Cosmic Particles Component
const CosmicParticles = React.memo(({ density = 'medium', className = '' }: { density?: 'low' | 'medium' | 'high' | 'ultra', className?: string }) => {
  const particleCounts = {
    low: 3,
    medium: 6,
    high: 9,
    ultra: 12
  };
  
  const particleCount = particleCounts[density];
  
  const particles = useMemo(() => {
    const result = [];
    
    for (let i = 0; i < Math.floor(particleCount * 0.4); i++) {
      result.push({
        type: 'orb',
        id: `orb-${i}`,
        className: "absolute w-2 h-2 bg-gradient-to-r from-blue-400/60 to-indigo-400/60 rounded-full shadow-sm",
        left: Math.random() * 100,
        top: Math.random() * 100,
        animate: {
          y: [0, -20, 0],
          x: [0, Math.random() * 10 - 5, 0],
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.2, 1],
        },
        transition: {
          duration: 8 + Math.random() * 4,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: Math.random() * 3,
        }
      });
    }
    
    for (let i = 0; i < Math.floor(particleCount * 0.4); i++) {
      result.push({
        type: 'dust',
        id: `dust-${i}`,
        className: "absolute w-1 h-1 bg-gradient-to-r from-purple-400/50 to-pink-400/50 rounded-full",
        left: Math.random() * 100,
        top: Math.random() * 100,
        animate: {
          y: [0, -10, 0],
          x: [0, Math.random() * 8 - 4, 0],
          opacity: [0.3, 0.6, 0.3],
        },
        transition: {
          duration: 10 + Math.random() * 5,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: Math.random() * 5,
        }
      });
    }
    
    for (let i = 0; i < Math.floor(particleCount * 0.2); i++) {
      result.push({
        type: 'star',
        id: `star-${i}`,
        className: "absolute w-1.5 h-1.5 bg-gradient-to-r from-cyan-400/70 to-blue-400/70 rounded-full",
        left: Math.random() * 100,
        top: Math.random() * 100,
        animate: {
          opacity: [0.5, 0.9, 0.5],
          scale: [1, 1.3, 1],
        },
        transition: {
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: Math.random() * 2,
        }
      });
    }
    
    return result;
  }, [particleCount]);
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={particle.className}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={particle.animate}
          transition={particle.transition}
        />
      ))}
    </div>
  );
});

CosmicParticles.displayName = 'CosmicParticles';

// Section Observer Component for better scroll animations
const SectionObserver = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: false, 
    margin: "-100px",
    amount: 0.3 
  });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ 
        duration: 0.6,
        delay: isInView ? delay : 0,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative py-32 bg-gradient-to-b from-zinc-50/95 via-zinc-50/90 via-blue-50/10 to-zinc-50/85 dark:from-zinc-900/95 dark:via-zinc-900/90 dark:via-blue-950/5 dark:to-zinc-900/85 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_1200px_600px_at_50%_-50%,rgba(99,102,241,0.02),transparent),radial-gradient(ellipse_800px_400px_at_20%_80%,rgba(139,92,246,0.015),transparent)] dark:bg-[radial-gradient(ellipse_1200px_600px_at_50%_-50%,rgba(99,102,241,0.03),transparent),radial-gradient(ellipse_800px_400px_at_20%_80%,rgba(139,92,246,0.02),transparent)]"></div>
      
      <CosmicParticles density="low" />
      
      <motion.div 
        className="absolute top-1/4 left-1/6 w-12 h-12 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <SectionObserver>
          <motion.span
            className="inline-flex items-center px-3 py-1.5 bg-zinc-100/50 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300 rounded-full text-sm font-medium backdrop-blur-sm border border-zinc-200/20 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Sparkles className="w-3 h-3 mr-2" />
            About Our Mission
          </motion.span>

          <h1 className="text-4xl md:text-6xl font-light tracking-tight dark:text-white text-zinc-900 leading-[1.1] mb-6">
            Reuniting People with Their{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Lost Assets
            </span>
          </h1>

          <p className="text-lg md:text-xl font-light dark:text-zinc-200 text-zinc-700 max-w-3xl mx-auto leading-relaxed tracking-wide">
            GOTUS leverages cutting-edge AI and global databases to help individuals and organizations 
            discover and recover unclaimed assets, forgotten treasures, and lost valuables worldwide.
          </p>
        </SectionObserver>
      </div>
    </section>
  );
};

// Stats Section (New)
const StatsSection = () => {
  const stats = [
    { value: "$2.8B+", label: "Assets Recovered", icon: TrendingUp },
    { value: "45+", label: "Countries Covered", icon: Globe },
    { value: "94%", label: "Success Rate", icon: Award },
    { value: "50K+", label: "Happy Clients", icon: Users }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-zinc-50/85 to-zinc-50/80 dark:from-zinc-900/85 dark:to-zinc-900/80 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <SectionObserver key={i} delay={i * 0.1}>
              <div className="text-center group">
                <motion.div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 mb-3 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <stat.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <div className="text-2xl md:text-3xl font-light text-zinc-900 dark:text-zinc-50 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 font-light">
                  {stat.label}
                </div>
              </div>
            </SectionObserver>
          ))}
        </div>
      </div>
    </section>
  );
};

// Mission & Vision Section
const MissionVisionSection = () => {
  const sections = [
    {
      icon: Target,
      title: 'Our Mission',
      content: 'To democratize access to unclaimed asset recovery through innovative technology, making it simple for anyone to discover and reclaim what rightfully belongs to them.',
      highlight: 'We bridge the gap between lost assets and their rightful owners.'
    },
    {
      icon: Globe,
      title: 'Our Vision',
      content: 'To create a world where no valuable asset remains unclaimed due to lack of information or accessibility.',
      highlight: 'Setting the global standard for transparent asset recovery.'
    }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-zinc-50/80 via-zinc-50/75 to-zinc-50/70 dark:from-zinc-900/80 dark:via-zinc-900/75 dark:to-zinc-900/70 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_1500px_800px_at_50%_100%,rgba(79,70,229,0.015),transparent)] dark:bg-[radial-gradient(ellipse_1500px_800px_at_50%_100%,rgba(79,70,229,0.02),transparent)]"></div>
      
      <CosmicParticles density="medium" />
      
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12">
          {sections.map((section, i) => (
            <SectionObserver key={i} delay={i * 0.15}>
              <motion.div 
                className="group relative p-8 rounded-2xl bg-white/30 dark:bg-zinc-800/20 backdrop-blur-sm border border-white/20 dark:border-zinc-700/20 hover:bg-white/40 dark:hover:bg-zinc-800/30 transition-all duration-500"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-indigo-500/[0.02] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/15 to-indigo-500/15 flex items-center justify-center mb-6">
                  <section.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                
                <h2 className="text-2xl font-light text-zinc-800 dark:text-zinc-50 mb-4 tracking-wide">
                  {section.title}
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-light mb-3">
                  {section.content}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {section.highlight}
                </p>
              </motion.div>
            </SectionObserver>
          ))}
        </div>
      </div>
    </section>
  );
};

// Why Choose GOTUS Section
const WhyChooseSection = () => {
  const features = [
    { 
      icon: Globe, 
      title: 'Global Coverage', 
      description: 'Access to databases from 45+ countries covering billions in unclaimed assets.',
      stat: '45+ Countries'
    },
    { 
      icon: Shield, 
      title: 'Enterprise Security', 
      description: 'Bank-level encryption ensures your information remains completely secure.',
      stat: '256-bit SSL'
    },
    { 
      icon: Zap, 
      title: 'AI Matching', 
      description: 'Advanced algorithms provide instant, accurate matches.',
      stat: '94% Accuracy'
    },
    { 
      icon: Headphones, 
      title: 'Expert Support', 
      description: 'Recovery specialists guide you through every step.',
      stat: '24/7 Support'
    },
    { 
      icon: BarChart3, 
      title: 'Proven Results', 
      description: 'Successfully reunited billions in assets since 2019.',
      stat: '$2.8B Recovered'
    },
    { 
      icon: CheckCircle, 
      title: 'No Upfront Fees', 
      description: 'Pay only when we successfully recover your assets.',
      stat: 'Success-Based'
    }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-zinc-50/70 via-zinc-50/65 to-zinc-50/60 dark:from-zinc-900/70 dark:via-zinc-900/65 dark:to-zinc-900/60 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_1800px_900px_at_50%_0%,rgba(147,51,234,0.01),transparent)] dark:bg-[radial-gradient(ellipse_1800px_900px_at_50%_0%,rgba(147,51,234,0.015),transparent)]"></div>
      
      <CosmicParticles density="high" />
      
      <div className="relative max-w-6xl mx-auto px-6">
        <SectionObserver>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extralight text-zinc-800 dark:text-zinc-50 mb-4 tracking-wide">
              Why Choose <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">GOTUS</span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto font-light">
              Industry-leading technology meets unparalleled expertise
            </p>
          </div>
        </SectionObserver>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <SectionObserver key={i} delay={i * 0.05}>
              <motion.div 
                className="group relative p-6 rounded-xl bg-white/30 dark:bg-zinc-800/20 backdrop-blur-sm border border-white/20 dark:border-zinc-700/20 hover:bg-white/40 dark:hover:bg-zinc-800/30 transition-all duration-500"
                whileHover={{ y: -3 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 px-2 py-1 rounded-full">
                    {feature.stat}
                  </span>
                </div>
                
                <h3 className="text-lg font-normal text-zinc-800 dark:text-zinc-50 mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">
                  {feature.description}
                </p>
              </motion.div>
            </SectionObserver>
          ))}
        </div>
      </div>
    </section>
  );
};

// Process Section (New)
const ProcessSection = () => {
  const steps = [
    {
      number: "01",
      title: "Submit Information",
      description: "Provide basic details about yourself or the assets you're searching for",
      icon: FileCheck
    },
    {
      number: "02",
      title: "AI Analysis",
      description: "Our algorithms scan millions of records across global databases",
      icon: Search
    },
    {
      number: "03",
      title: "Verification",
      description: "We verify matches and confirm your eligibility for recovery",
      icon: Shield
    },
    {
      number: "04",
      title: "Recovery",
      description: "Our team handles all paperwork and processes for asset recovery",
      icon: CheckCircle
    }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-zinc-50/60 to-zinc-50/55 dark:from-zinc-900/60 dark:to-zinc-900/55 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-6">
        <SectionObserver>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extralight text-zinc-800 dark:text-zinc-50 mb-4 tracking-wide">
              How It Works
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto font-light">
              Simple, transparent process from search to recovery
            </p>
          </div>
        </SectionObserver>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <SectionObserver key={i} delay={i * 0.1}>
              <div className="relative group">
                <div className="text-5xl font-thin text-blue-500/10 dark:text-blue-400/10 mb-4">
                  {step.number}
                </div>
                <motion.div
                  className="p-6 rounded-xl bg-white/30 dark:bg-zinc-800/20 backdrop-blur-sm border border-white/20 dark:border-zinc-700/20"
                  whileHover={{ y: -3 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center mb-4">
                    <step.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-normal text-zinc-800 dark:text-zinc-50 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                  </div>
                )}
              </div>
            </SectionObserver>
          ))}
        </div>
      </div>
    </section>
  );
};

// Trust Section (New)
const TrustSection = () => {
  const badges = [
    { icon: Lock, title: "SOC 2 Certified", desc: "Enterprise-grade security" },
    { icon: Shield, title: "GDPR Compliant", desc: "Data protection guaranteed" },
    { icon: Award, title: "ISO 27001", desc: "International standards" },
    { icon: CheckCircle, title: "BBB Accredited", desc: "A+ Rating" }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-zinc-50/55 to-zinc-50/50 dark:from-zinc-900/55 dark:to-zinc-900/50 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-6">
        <SectionObserver>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-light text-zinc-800 dark:text-zinc-50 mb-3">
              Trusted & Certified
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 font-light">
              Industry-leading certifications for your peace of mind
            </p>
          </div>
        </SectionObserver>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, i) => (
            <SectionObserver key={i} delay={i * 0.05}>
              <motion.div
                className="p-4 rounded-lg bg-white/20 dark:bg-zinc-800/10 backdrop-blur-sm border border-white/10 dark:border-zinc-700/10 text-center"
                whileHover={{ scale: 1.05 }}
              >
                <badge.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-50">
                  {badge.title}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  {badge.desc}
                </div>
              </motion.div>
            </SectionObserver>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-zinc-50/50 to-zinc-50/95 dark:from-zinc-900/50 dark:to-zinc-900/95 overflow-hidden">
      <CosmicParticles density="low" />
      
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <SectionObserver>
          <div className="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-sm font-medium mb-6">
            <Clock className="w-3 h-3 mr-2" />
            Limited Time: Free Premium Search
          </div>
          
          <h2 className="text-3xl md:text-4xl font-light text-zinc-800 dark:text-zinc-50 mb-6 tracking-wide">
            Ready to Discover Your Lost Assets?
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Join over 50,000 satisfied clients who have successfully recovered their assets. 
            Start your journey today with our comprehensive search.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-full font-medium flex items-center justify-center gap-2 group hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Free Search
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
            
            <Link href="/contact">
              <motion.button
                className="px-8 py-3 border border-zinc-300/30 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 rounded-full font-medium hover:bg-zinc-200/20 dark:hover:bg-zinc-800/30 transition-all backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Schedule Consultation
              </motion.button>
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
            No credit card required • 100% secure • Results in minutes
          </p>
        </SectionObserver>
      </div>
    </section>
  );
};

// Main About Component
export default function About() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const rafRef = useRef<number | undefined>();
  const lenisRef = useRef<Lenis | undefined>();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    
    setIsLoaded(true);
    
    // Initialize smooth scroll
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    const raf = (time: number) => {
      lenisRef.current?.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };

    rafRef.current = requestAnimationFrame(raf);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      * {
        scroll-behavior: auto !important;
      }
      
      html, body {
        overflow-x: hidden;
      }

      body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(99, 102, 241, 0.3);
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(99, 102, 241, 0.5);
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      lenisRef.current?.destroy();
      
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 overflow-x-hidden">
      <AnimatePresence>
        {!isLoaded ? (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 flex items-center justify-center z-50"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          > 
            <motion.div className="flex flex-col items-center">
              <div className="w-8 h-8 border border-blue-600/30 rounded-full relative">
                <motion.div
                  className="absolute inset-0 border-t border-blue-600 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-sm">Loading...</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <HeroSection />
            <StatsSection />
            <MissionVisionSection />
            <ProcessSection />
            <WhyChooseSection />
            <TrustSection />
            <CTASection />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        className="fixed bottom-8 right-8 w-10 h-10 bg-white/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 rounded-full backdrop-blur-sm border border-white/60 dark:border-zinc-700/60 hover:bg-white/95 dark:hover:bg-zinc-800/95 transition-all z-40 flex items-center justify-center shadow-lg"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowRight size={16} className="rotate-[-90deg]" />
      </motion.button>
    </div>
  );
}
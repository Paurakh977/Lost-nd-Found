'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones, Shield, ArrowRight, CheckCircle, Sparkles, Globe, Users, Award } from 'lucide-react';
import Link from 'next/link';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const cn = (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' ');

// Optimized Cosmic Particles Component (Same as About page)
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

// Section Observer Component
const SectionObserver = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: false, 
    margin: "-120px",
    amount: 0.2 
  });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ 
        duration: 0.8,
        delay: isInView ? delay : 0,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hero Section (Same animation as About page)
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
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-6 items-center justify-center text-center"
        >
          <motion.span
            className="inline-flex items-center px-3 py-1.5 bg-zinc-100/10 dark:bg-zinc-800/20 text-zinc-700 dark:text-zinc-300 rounded-full text-sm font-medium backdrop-blur-sm border border-zinc-200/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <MessageSquare className="w-3 h-3 mr-2" />
            Get In Touch
          </motion.span>

          <div className="text-4xl md:text-6xl font-light tracking-tight dark:text-white text-zinc-900 leading-[1.1]">
            We're Here to{' '}
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              Help You
            </motion.span>
          </div>

          <motion.p
            className="text-lg md:text-xl font-light dark:text-zinc-200 text-zinc-700 max-w-3xl leading-relaxed tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Have questions about recovering your lost items? Need support with your GOTUS account? 
            Our dedicated team is ready to assist you every step of the way.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

// Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after success message
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    }, 3000);
  };

  return (
    <SectionObserver>
      <motion.div 
        className="relative p-8 rounded-2xl bg-white/30 dark:bg-zinc-800/20 backdrop-blur-sm border border-white/20 dark:border-zinc-700/20"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-indigo-500/[0.02] rounded-2xl"></div>
        
        <div className="relative">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/15 to-indigo-500/15 flex items-center justify-center mr-4">
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-extralight text-zinc-800 dark:text-zinc-50 tracking-tight">
              Send us a message
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-light text-zinc-800 dark:text-zinc-50 mb-2">
                  Message Sent Successfully!
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 font-light">
                  We'll get back to you within 24 hours.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-zinc-300/30 dark:border-zinc-600/30 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 bg-white/50 dark:bg-zinc-700/30 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 backdrop-blur-sm"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-zinc-300/30 dark:border-zinc-600/30 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 bg-white/50 dark:bg-zinc-700/30 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 backdrop-blur-sm"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="inquiryType" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Inquiry Type
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-zinc-300/30 dark:border-zinc-600/30 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 bg-white/50 dark:bg-zinc-700/30 text-zinc-900 dark:text-zinc-100 backdrop-blur-sm"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="recovery">Asset Recovery</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-zinc-300/30 dark:border-zinc-600/30 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 bg-white/50 dark:bg-zinc-700/30 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 backdrop-blur-sm"
                    placeholder="Brief description of your inquiry"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-zinc-300/30 dark:border-zinc-600/30 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none bg-white/50 dark:bg-zinc-700/30 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 backdrop-blur-sm"
                    placeholder="Tell us more about your inquiry..."
                    required
                  ></textarea>
                </div>
                
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 py-3 px-6 rounded-lg font-normal hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border border-zinc-400/30 rounded-full relative">
                        <motion.div
                          className="absolute inset-0 border-t border-zinc-400 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send size={16} />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </SectionObserver>
  );
};

// Contact Info Component
const ContactInfo = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      primary: 'support@gotus.com',
      secondary: 'info@gotus.com',
      description: 'Get help with your account or general inquiries'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      primary: '+1 (555) 123-4567',
      secondary: 'Mon-Fri 9AM-6PM EST',
      description: 'Speak directly with our support team'
    },
    {
      icon: MapPin,
      title: 'Office Location',
      primary: '123 Tech Street',
      secondary: 'Innovation City, IC 12345',
      description: 'Visit us at our headquarters'
    },
    {
      icon: Clock,
      title: 'Response Time',
      primary: '< 24 hours',
      secondary: '< 2 hours priority',
      description: 'Average response time for inquiries'
    }
  ];

  return (
    <div className="space-y-6">
      <SectionObserver>
        <div className="p-8 rounded-2xl bg-white/30 dark:bg-zinc-800/20 backdrop-blur-sm border border-white/20 dark:border-zinc-700/20">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/15 to-indigo-500/15 flex items-center justify-center mr-4">
              <Headphones className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-extralight text-zinc-800 dark:text-zinc-50 tracking-tight">
              Contact Information
            </h2>
          </div>
          
          <div className="space-y-6">
            {contactMethods.map((method, i) => (
              <SectionObserver key={i} delay={i * 0.1}>
                <motion.div 
                  className="flex items-start space-x-4 group"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="w-10 h-10 bg-blue-500/5 dark:bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 transition-all duration-300">
                    <method.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-zinc-800 dark:text-zinc-100 mb-1">
                      {method.title}
                    </h3>
                    <p className="text-zinc-900 dark:text-zinc-200 font-light">
                      {method.primary}
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light">
                      {method.secondary}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1 font-light">
                      {method.description}
                    </p>
                  </div>
                </motion.div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </SectionObserver>

      {/* Quick Help Section */}
      <SectionObserver delay={0.2}>
        <div className="p-6 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-700/30 backdrop-blur-sm">
          <h3 className="text-lg font-light text-blue-800 dark:text-blue-300 mb-3 flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Need immediate help?
          </h3>
          <p className="text-blue-700 dark:text-blue-200 mb-4 font-light text-sm leading-relaxed">
            Check out our comprehensive FAQ section or browse our documentation for quick answers to common questions.
          </p>
          <div className="space-y-2">
            <Link 
              href="/faq" 
              className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-normal text-sm transition-colors flex items-center group"
            >
              <ArrowRight className="w-3 h-3 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
              View FAQ
            </Link>
            <Link 
              href="/docs" 
              className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-normal text-sm transition-colors flex items-center group"
            >
              <ArrowRight className="w-3 h-3 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
              Documentation
            </Link>
            <Link 
              href="/support" 
              className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-normal text-sm transition-colors flex items-center group"
            >
              <ArrowRight className="w-3 h-3 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
              Support Center
            </Link>
          </div>
        </div>
      </SectionObserver>
    </div>
  );
};

// Trust & Security Section
const TrustSection = () => {
  const trustFeatures = [
    {
      icon: Shield,
      title: 'Secure Communication',
      description: 'All messages are encrypted and handled securely'
    },
    {
      icon: Clock,
      title: 'Fast Response',
      description: 'Average response time under 24 hours'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Dedicated specialists for each inquiry type'
    },
    {
      icon: Award,
      title: 'Satisfaction Guaranteed',
      description: '98% customer satisfaction rating'
    }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-zinc-50/85 to-zinc-50/80 dark:from-zinc-900/85 dark:to-zinc-900/80 overflow-hidden">
      <CosmicParticles density="low" />
      
      <div className="relative max-w-6xl mx-auto px-6">
        <SectionObserver>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extralight text-zinc-800 dark:text-zinc-50 mb-3 tracking-tight">
              Trusted Support Experience
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-2xl mx-auto">
              Your privacy and satisfaction are our top priorities
            </p>
          </div>
        </SectionObserver>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustFeatures.map((feature, i) => (
            <SectionObserver key={i} delay={i * 0.05}>
              <motion.div
                className="p-4 rounded-lg bg-white/20 dark:bg-zinc-800/10 backdrop-blur-sm border border-white/10 dark:border-zinc-700/10 text-center group"
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-sm font-light text-zinc-800 dark:text-zinc-50 mb-1">
                  {feature.title}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                  {feature.description}
                </div>
              </motion.div>
            </SectionObserver>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Contact Component
export default function Contact() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const rafRef = useRef<number | undefined>();
  const lenisRef = useRef<Lenis | undefined>();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    
    setIsLoaded(true);
    
    // Initialize smooth scroll (same as About page)
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
            {/* Hero Section */}
            <HeroSection />
            
            {/* Main Contact Section */}
            <section className="relative py-20 bg-gradient-to-b from-zinc-50/85 to-zinc-50/80 dark:from-zinc-900/85 dark:to-zinc-900/80 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_1500px_800px_at_50%_50%,rgba(79,70,229,0.01),transparent)] dark:bg-[radial-gradient(ellipse_1500px_800px_at_50%_50%,rgba(79,70,229,0.015),transparent)]"></div>
              
              <CosmicParticles density="medium" />
              
              <div className="relative max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12">
                  {/* Contact Form */}
                  <ContactForm />
                  
                  {/* Contact Information */}
                  <ContactInfo />
                </div>
              </div>
            </section>
            
            {/* Trust Section */}
            <TrustSection />
            
            {/* Additional Support Section */}
            <section className="relative py-16 bg-gradient-to-b from-zinc-50/80 to-zinc-50/95 dark:from-zinc-900/80 dark:to-zinc-900/95 overflow-hidden">
              <CosmicParticles density="low" />
              
              <div className="relative max-w-4xl mx-auto px-6 text-center">
                <SectionObserver>
                  <div className="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-sm font-medium mb-6">
                    <Globe className="w-3 h-3 mr-2" />
                    24/7 Global Support
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-extralight text-zinc-800 dark:text-zinc-50 mb-4 tracking-tight">
                    Still Have Questions?
                  </h2>
                  <p className="text-base text-zinc-600 dark:text-zinc-300 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
                    Our support team is available around the clock to help you with any questions about 
                    GOTUS, asset recovery, or technical issues.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-full font-normal flex items-center justify-center gap-2 group hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      Live Chat Support
                      <MessageSquare size={16} className="group-hover:scale-110 transition-transform duration-300" />
                    </motion.button>
                    
                    <Link href="/support">
                      <motion.button
                        className="px-6 py-3 border border-zinc-300/30 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 rounded-full font-normal hover:bg-zinc-200/20 dark:hover:bg-zinc-800/30 transition-all duration-300 backdrop-blur-sm"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        Visit Support Center
                      </motion.button>
                    </Link>
                  </div>
                  
                  <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
                    Average response time: 2 hours • 98% satisfaction rate • Available in 12 languages
                  </p>
                </SectionObserver>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Scroll to Top Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-10 h-10 bg-white/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 rounded-full backdrop-blur-sm border border-white/60 dark:border-zinc-700/60 hover:bg-white/95 dark:hover:bg-zinc-800/95 transition-all duration-300 z-40 flex items-center justify-center shadow-lg"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowRight size={16} className="rotate-[-90deg]" />
      </motion.button>
    </div>
  );
}
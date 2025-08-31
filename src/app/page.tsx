'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from 'framer-motion';
import { Search, CheckCircle, Zap, Globe, Shield, Star, ArrowRight, Users, BarChart3, TrendingUp, Award } from 'lucide-react';

const cn = (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' ');

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

        <div className="text-4xl md:text-7xl font-semibold dark:text-white text-zinc-900 leading-tight">
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
          className="text-lg md:text-xl dark:text-zinc-300 text-zinc-600 max-w-2xl leading-relaxed"
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

// Stats section - seamlessly blends from hero
const StatsSection = () => {
  const stats = [
    { value: 25000, label: 'Items Reunited', suffix: '+' },
    { value: 8500, label: 'Active Users', suffix: '+' },
    { value: 92, label: 'Success Rate', suffix: '%' },
    { value: 45, label: 'Cities Covered', suffix: '+' }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-zinc-50 via-zinc-50/98 to-zinc-50/95 dark:from-zinc-900 dark:via-zinc-900/98 dark:to-zinc-900/95 overflow-hidden">
      {/* Seamless lighting effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/6 via-transparent to-indigo-500/4 dark:from-blue-400/8 dark:via-transparent dark:to-indigo-400/6"></div>
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-gradient-to-r from-blue-400/12 to-indigo-400/10 dark:from-blue-300/15 dark:to-indigo-300/12 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-24 bg-gradient-to-l from-indigo-400/10 to-blue-400/8 dark:from-indigo-300/12 dark:to-blue-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      {/* Subtle mesh gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.05),transparent_50%)]"></div>
      
      <div className="relative max-w-5xl mx-auto px-6 z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl lg:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Helping People Reconnect
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Our AI-powered platform helps reunite lost items with their owners
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const { count, ref } = useCounter(stat.value, 2500);
            
            return (
              <motion.div
                key={i}
                ref={ref}
                className="text-center group"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.15, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-xl p-4 border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-white/95 dark:hover:bg-zinc-800/95 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-300/60 dark:hover:border-blue-600/60 relative overflow-hidden"
                  whileHover={{ y: -8, rotateY: 2 }}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/3 dark:from-blue-400/8 dark:via-transparent dark:to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                      {count.toLocaleString()}{stat.suffix}
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">{stat.label}</div>
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

// Features section - continues the flow
const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: 'Smart Matching',
      description: 'AI analyzes descriptions to match lost and found items with high accuracy.',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your personal information is protected with industry-standard security.',
    },
    {
      icon: Zap,
      title: 'Instant Notifications',
      description: 'Get notified immediately when potential matches are found.',
    },
    {
      icon: Globe,
      title: 'Location-Based',
      description: 'Search within your city or expand to nearby areas.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Powered by helpful community members who report found items.',
    },
    {
      icon: CheckCircle,
      title: 'Easy Verification',
      description: 'Simple verification process to confirm ownership and arrange return.',
    }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-zinc-50/95 via-zinc-50/92 to-zinc-50/88 dark:from-zinc-900/95 dark:via-zinc-900/92 dark:to-zinc-900/88 overflow-hidden">
      {/* Seamless gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/4 via-transparent to-purple-500/3 dark:from-indigo-400/6 dark:via-transparent dark:to-purple-400/4"></div>
      <div className="absolute top-10 right-1/3 w-72 h-20 bg-gradient-to-r from-indigo-400/12 to-purple-400/10 dark:from-indigo-300/18 dark:to-purple-300/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-10 left-1/3 w-64 h-16 bg-gradient-to-l from-purple-400/10 to-indigo-400/8 dark:from-purple-300/15 dark:to-indigo-300/12 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      {/* Subtle mesh pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.04),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.04),transparent_40%)]"></div>
      
      <div className="relative max-w-5xl mx-auto px-6 z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl lg:text-4xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 leading-tight"
            whileInView={{ scale: [0.95, 1] }}
            transition={{ duration: 0.8 }}
          >
            How It Works
          </motion.h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Simple steps to find your lost items or help others find theirs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 hover:border-indigo-300/60 dark:hover:border-indigo-600/60 transition-all duration-500 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm group-hover:bg-white/95 dark:group-hover:bg-zinc-800/95 hover:shadow-xl hover:shadow-indigo-500/20 relative overflow-hidden"
                whileHover={{ y: -8, scale: 1.02, rotateY: 3 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-transparent to-purple-500/5 dark:from-indigo-400/12 dark:via-transparent dark:to-purple-400/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <motion.div 
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10"
                  whileHover={{ rotate: 8, scale: 1.1 }}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </motion.div>
                
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm relative z-10">
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

// Testimonials section - smooth gradient continuation
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Maria Rodriguez',
      title: 'Lost Phone Owner',
      content: 'Found my lost iPhone within 2 days! The AI matched it perfectly with someone who found it at the park.',
      rating: 5
    },
    {
      name: 'James Wilson',
      title: 'Good Samaritan',
      content: 'Easy to report found items. Helped reunite a lost wallet with its owner in just hours.',
      rating: 5
    },
    {
      name: 'Lisa Zhang',
      title: 'Recovered Keys',
      content: 'Lost my car keys downtown. The platform helped me find them through a helpful finder.',
      rating: 5
    }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-zinc-50/88 via-zinc-50/85 to-zinc-50/80 dark:from-zinc-900/88 dark:via-zinc-900/85 dark:to-zinc-900/80 overflow-hidden">
      {/* Seamless lighting effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-transparent to-pink-500/2 dark:from-purple-400/5 dark:via-transparent dark:to-pink-400/3"></div>
      <div className="absolute top-1/4 left-1/5 w-60 h-40 bg-gradient-to-r from-purple-400/10 to-pink-400/8 dark:from-purple-300/15 dark:to-pink-300/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.3s'}}></div>
      <div className="absolute bottom-1/4 right-1/5 w-48 h-32 bg-gradient-to-l from-pink-400/8 to-purple-400/6 dark:from-pink-300/12 dark:to-purple-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.2s'}}></div>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(168,85,247,0.03),transparent_45%),radial-gradient(circle_at_60%_40%,rgba(236,72,153,0.03),transparent_45%)]"></div>
      
      <div className="relative max-w-5xl mx-auto px-6 z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl lg:text-4xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6"
            whileInView={{ scale: [0.95, 1] }}
            transition={{ duration: 0.8 }}
          >
            Success Stories
          </motion.h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Real people sharing their experiences with our platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              className="group"
              initial={{ opacity: 0, y: 30, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.15, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:bg-white/95 dark:hover:bg-zinc-800/95 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-300/60 dark:hover:border-purple-600/60 relative overflow-hidden"
                whileHover={{ y: -8, scale: 1.02, rotateY: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/6 via-transparent to-pink-500/4 dark:from-purple-400/10 dark:via-transparent dark:to-pink-400/6 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <motion.div 
                  className="flex items-center gap-1 mb-4 relative z-10"
                  whileHover={{ scale: 1.1 }}
                >
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <motion.div
                      key={starIndex}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.15 + starIndex * 0.1 }}
                      whileHover={{ rotate: 360, scale: 1.2 }}
                    >
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                    </motion.div>
                  ))}
                </motion.div>
                
                <motion.p 
                  className="text-zinc-700 dark:text-zinc-300 mb-6 leading-relaxed text-sm relative z-10"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.15 + 0.3 }}
                >
                  "{testimonial.content}"
                </motion.p>
                
                <motion.div 
                  className="flex items-center gap-3 relative z-10"
                  whileHover={{ x: 5 }}
                >
                  <motion.div 
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-xs font-medium text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </motion.div>
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{testimonial.name}</h4>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs">{testimonial.title}</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing section - flowing gradients
const PricingSection = () => {
  const plans = [
    {
      name: 'Basic Search',
      price: 'Free',
      description: 'Perfect for individual users looking for lost items',
      features: [
        'Basic item search',
        'Location-based matching',
        'Email notifications',
        'Community support'
      ],
      popular: false
    },
    {
      name: 'Premium Recovery',
      price: '$19/mo',
      description: 'Enhanced features for frequent users and professionals',
      features: [
        'Advanced AI matching',
        'Priority support',
        'Multiple item tracking',
        'Detailed analytics',
        'Mobile app access'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For organizations and large-scale operations',
      features: [
        'Bulk item management',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'White-label options'
      ],
      popular: false
    }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-zinc-50/80 via-zinc-50/75 to-zinc-50/70 dark:from-zinc-900/80 dark:via-zinc-900/75 dark:to-zinc-900/70 overflow-hidden">
      {/* Seamless dark effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-500/3 via-transparent to-gray-500/2 dark:from-slate-400/4 dark:via-transparent dark:to-gray-400/3"></div>
      <div className="absolute top-1/3 left-1/6 w-52 h-28 bg-gradient-to-r from-slate-400/8 to-gray-400/6 dark:from-slate-300/12 dark:to-gray-300/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.8s'}}></div>
      <div className="absolute bottom-1/3 right-1/6 w-44 h-24 bg-gradient-to-l from-gray-400/6 to-slate-400/5 dark:from-gray-300/10 dark:to-slate-300/8 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.6s'}}></div>
      {/* Subtle mesh pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,rgba(100,116,139,0.02),transparent_40%),radial-gradient(circle_at_75%_25%,rgba(71,85,105,0.02),transparent_40%)]"></div>
      
      <div className="relative max-w-5xl mx-auto px-6 z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl lg:text-4xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6"
            whileInView={{ scale: [0.95, 1] }}
            transition={{ duration: 0.8 }}
          >
            Choose Your Plan
          </motion.h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Select the perfect plan for your asset recovery needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className="group relative"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
            >
              {plan.popular && (
                <motion.div 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium rounded-full shadow-lg animate-pulse"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 + 0.3 }}
                >
                  Most Popular
                </motion.div>
              )}
              
              <motion.div 
                className={cn(
                  "relative p-6 rounded-xl backdrop-blur-sm border transition-all duration-500 hover:shadow-xl overflow-hidden",
                  plan.popular 
                    ? "bg-white/85 dark:bg-zinc-800/85 border-blue-300/60 dark:border-blue-600/60 hover:border-blue-400/70 dark:hover:border-blue-500/70 hover:shadow-blue-500/25" 
                    : "bg-white/80 dark:bg-zinc-800/80 border-zinc-200/60 dark:border-zinc-700/60 hover:border-zinc-300/70 dark:hover:border-zinc-600/70 hover:shadow-slate-500/20"
                )}
                whileHover={{ y: -10, scale: 1.02, rotateY: 3 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Sophisticated inner glow */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  plan.popular 
                    ? "bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/7 dark:from-blue-400/15 dark:via-transparent dark:to-indigo-400/10"
                    : "bg-gradient-to-br from-slate-500/6 via-transparent to-gray-500/4 dark:from-slate-400/10 dark:via-transparent dark:to-gray-400/6"
                )}></div>
                
                <div className="text-center mb-6 relative z-10">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {plan.price}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    {plan.description}
                  </p>
                </div>
                
                <div className="space-y-3 mb-6 relative z-10">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.div 
                      key={featureIndex}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 + featureIndex * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-zinc-700 dark:text-zinc-300 text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
                
                <motion.button
                  className={cn(
                    "w-full py-3 rounded-full font-medium transition-all relative z-10",
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/30"
                      : "border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How it Works section (now positioned after pricing)
const HowItWorksSection = () => {
  const steps = [
    {
      step: '1',
      title: 'Report Your Item',
      description: 'Lost something? Describe your item with details like location, time, and appearance.',
      icon: Search
    },
    {
      step: '2',
      title: 'AI Does the Work',
      description: 'Our AI searches through found item reports and identifies potential matches.',
      icon: Zap
    },
    {
      step: '3',
      title: 'Get Connected',
      description: 'When a match is found, we securely connect you with the finder for verification.',
      icon: Users
    }
  ];

  return (
    <section id="how-it-works" className="relative py-20 bg-gradient-to-b from-zinc-50/70 via-zinc-50/65 to-zinc-50/60 dark:from-zinc-900/70 dark:via-zinc-900/65 dark:to-zinc-900/60 overflow-hidden">
      {/* Seamless warm lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/3 via-transparent to-orange-500/2 dark:from-amber-400/5 dark:via-transparent dark:to-orange-400/3"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-gradient-to-r from-amber-400/10 to-orange-400/8 dark:from-amber-300/15 dark:to-orange-300/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.7s'}}></div>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.02),transparent_50%)]"></div>
      
      <div className="relative max-w-5xl mx-auto px-6 z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl lg:text-4xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6"
            whileInView={{ scale: [0.95, 1] }}
            transition={{ duration: 0.8 }}
          >
            Simple Process
          </motion.h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Three simple steps to reunite with your lost items
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative text-center group"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="relative p-6 rounded-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-white/95 dark:hover:bg-zinc-800/95 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/20 hover:border-amber-300/60 dark:hover:border-amber-600/60 overflow-hidden"
                whileHover={{ y: -8, scale: 1.02, rotateY: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Warm inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/7 via-transparent to-orange-500/5 dark:from-amber-400/12 dark:via-transparent dark:to-orange-400/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <motion.div 
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10"
                  whileHover={{ rotate: 8, scale: 1.1 }}
                >
                  {step.step}
                </motion.div>
                
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors relative z-10">
                  {step.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm relative z-10">
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

// CTA section - seamless dark transition
const CTASection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-b from-zinc-50/60 via-zinc-100/50 to-zinc-200/70 dark:from-zinc-900/60 dark:via-zinc-800/50 dark:to-zinc-700/70 overflow-hidden">
      {/* Seamless dynamic lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/4 via-transparent to-indigo-500/3 dark:from-blue-400/6 dark:via-transparent dark:to-indigo-400/4"></div>
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-100/6 to-transparent dark:from-blue-800/4 dark:to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-80 h-40 bg-gradient-to-l from-indigo-400/10 to-blue-400/8 dark:from-indigo-300/15 dark:to-blue-300/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.1s'}}></div>
      {/* Subtle mesh pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(59,130,246,0.04),transparent_45%),radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.04),transparent_45%)]"></div>
      
      <div className="relative max-w-4xl mx-auto px-6 z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-3xl lg:text-4xl font-semibold text-zinc-900 dark:text-white mb-4 leading-tight"
              whileInView={{ scale: [0.95, 1] }}
              transition={{ duration: 0.8 }}
            >
              Lost Something? Found Something?
            </motion.h2>
            <motion.p 
              className="text-lg text-zinc-600 dark:text-zinc-300 mb-8 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Join our community of helpful people working together to reunite lost items with their owners.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-white to-zinc-100 text-zinc-900 rounded-full font-medium flex items-center justify-center gap-2 group hover:from-zinc-100 hover:to-white transition-all shadow-lg hover:shadow-blue-500/20"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                Report Lost Item
                <motion.div
                  className="group-hover:translate-x-1 transition-transform"
                  whileHover={{ rotate: 45 }}
                >
                  <ArrowRight size={18} />
                </motion.div>
              </motion.button>
              
              <motion.button
                className="px-6 py-3 border-2 border-zinc-400/50 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-full font-medium hover:bg-white/20 dark:hover:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all backdrop-blur-sm"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                Report Found Item
              </motion.button>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {[
                { value: '< 24 hrs', label: 'Average Match Time' },
                { value: 'Free', label: 'Always' },
                { value: '92%', label: 'Success Rate' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  className="text-center group"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="bg-white/30 dark:bg-zinc-800/50 backdrop-blur-sm rounded-lg p-3 border border-white/40 dark:border-zinc-700/50 group-hover:bg-white/40 dark:group-hover:bg-zinc-800/70 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                    <div className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{stat.value}</div>
                    <div className="text-zinc-600 dark:text-zinc-400 text-sm">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Footer - seamless continuation from CTA
const Footer = () => (
  <footer className="relative bg-gradient-to-b from-zinc-200/70 via-zinc-300/60 to-zinc-900 dark:from-zinc-700/70 dark:via-zinc-800/60 dark:to-zinc-900 text-white py-12 overflow-hidden">
    {/* Seamless dark effects */}
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-600/2 via-transparent to-zinc-700/1 dark:from-zinc-500/3 dark:via-transparent dark:to-zinc-600/1"></div>
    <div className="absolute top-0 left-1/4 w-64 h-20 bg-gradient-to-r from-zinc-500/6 to-zinc-600/5 dark:from-zinc-400/10 dark:to-zinc-500/8 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.4s'}}></div>
    <div className="absolute bottom-0 right-1/4 w-56 h-16 bg-gradient-to-l from-zinc-600/5 to-zinc-500/4 dark:from-zinc-500/8 dark:to-zinc-400/6 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.3s'}}></div>
    
    <div className="relative max-w-5xl mx-auto px-6 z-10">
      <motion.div 
        className="grid md:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
        >
          <motion.div 
            className="text-lg font-semibold mb-3 flex items-center gap-2"
            whileHover={{ x: 3 }}
          >
            <motion.div 
              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-white font-bold text-xs">L</span>
            </motion.div>
            GOTUS
          </motion.div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
            AI-powered platform connecting lost items with their owners.
          </p>
        </motion.div>
        
        {[
          { title: 'Platform', items: ['Report Lost', 'Report Found', 'Search Items', 'How It Works'] },
          { title: 'Support', items: ['Help Center', 'Contact Us', 'Guidelines', 'Safety Tips'] },
          { title: 'Legal', items: ['Privacy Policy', 'Terms of Use', 'Community Rules', 'Disclaimer'] }
        ].map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h4 className="font-medium mb-3 text-white text-sm">{section.title}</h4>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <motion.a 
                  key={item} 
                  href="#" 
                  className="block text-zinc-400 hover:text-zinc-200 transition-colors text-sm"
                  whileHover={{ x: 5, color: '#e4e4e7' }}
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
        className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <p className="text-zinc-400 text-sm">
          © 2025 LostFound. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <motion.a 
            href="#" 
            className="text-zinc-400 hover:text-zinc-200 transition-colors text-sm"
            whileHover={{ scale: 1.05 }}
          >
            Privacy
          </motion.a>
          <motion.a 
            href="#" 
            className="text-zinc-400 hover:text-zinc-200 transition-colors text-sm"
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
    
    // Add custom CSS for aurora animation
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
      
      /* Smooth scroll behavior */
      html {
        scroll-behavior: smooth;
      }
      
      /* Custom gradient overlays for seamless blending */
      .gradient-overlay-top {
        background: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.1) 100%);
      }
      
      .gradient-overlay-bottom {
        background: linear-gradient(to top, transparent 0%, rgba(255,255,255,0.1) 100%);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
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
                className="w-12 h-12 border-3 border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-1 bg-zinc-50 dark:bg-zinc-900 rounded-full"></div>
              </motion.div>
              <motion.p
                className="mt-4 text-zinc-900 dark:text-zinc-100 font-medium text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Loading LostFound...
              </motion.p>
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
            <FeaturesSection />
            <TestimonialsSection />
            <PricingSection />
            <HowItWorksSection />
            <CTASection />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced scroll to top button */}
      <motion.button
        className="fixed bottom-8 right-8 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all z-40 backdrop-blur-sm border border-white/20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </motion.button>
    </div>
  );
}
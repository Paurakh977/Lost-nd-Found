'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from 'framer-motion';
import { Search, CheckCircle, Zap, Globe, Shield, Star, ArrowRight, Users, BarChart3, TrendingUp, Award } from 'lucide-react';
import { cn } from "../lib/utlis";
import { AuroraBackground } from "../components/ui/aurora-background";

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
            className="px-8 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
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

// Stats section
const StatsSection = () => {
  const stats = [
    { value: 1000000, label: 'Assets Recovered', prefix: '$', suffix: '+' },
    { value: 50000, label: 'Active Users', suffix: '+' },
    { value: 99.9, label: 'Platform Uptime', suffix: '%' },
    { value: 150, label: 'Global Coverage', suffix: '+' }
  ];

  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => {
            const { count, ref } = useCounter(stat.value, 2500);
            
            return (
              <motion.div
                key={i}
                ref={ref}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {stat.prefix}{count.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Features section
const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: 'AI-Powered Discovery',
      description: 'Advanced algorithms scan global databases to identify unclaimed assets with precision.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and verified government partnerships ensure data protection.',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Real-time search capabilities deliver comprehensive results in seconds.',
    },
    {
      icon: Globe,
      title: 'Global Database Access',
      description: 'Connected to 150+ countries and jurisdictions worldwide.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Detailed insights and progress tracking for your recovery journey.',
    },
    {
      icon: Award,
      title: 'Expert Support',
      description: 'Professional guidance from asset recovery specialists.',
    }
  ];

  return (
    <section className="py-32 bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl lg:text-5xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 leading-tight">
            Everything You Need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Succeed
            </span>
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Comprehensive tools designed for efficient and effective asset recovery
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="p-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 hover:border-zinc-300/80 dark:hover:border-zinc-600/80 transition-all duration-300 bg-zinc-100/30 dark:bg-zinc-800/30 backdrop-blur-sm group-hover:bg-zinc-100/50 dark:group-hover:bg-zinc-800/50">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-zinc-100 dark:text-zinc-900" />
                </div>
                
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      title: 'Business Owner',
      content: 'Recovered $45,000 in unclaimed business assets. The process was seamless and professional.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      title: 'Investment Advisor',
      content: 'Found assets I never knew existed. This platform is transformative for asset recovery.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      title: 'Legal Consultant',
      content: 'Outstanding service with unmatched global database coverage and expert support.',
      rating: 5
    }
  ];

  return (
    <section className="py-32 bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl lg:text-5xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
            Trusted by Professionals
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Join thousands who have successfully recovered millions in assets
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="p-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 bg-zinc-100/30 dark:bg-zinc-800/30 backdrop-blur-sm hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-all duration-300">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <Star key={starIndex} className="w-4 h-4 text-amber-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-zinc-700 dark:text-zinc-300 mb-8 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{testimonial.name}</h4>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing section
const PricingSection = () => {
  const plans = [
    {
      name: 'Starter',
      price: 29,
      period: 'month',
      features: ['5 asset searches', 'Basic tracking', 'Email support', '30-day history'],
      popular: false
    },
    {
      name: 'Professional',
      price: 79,
      period: 'month',
      features: ['Unlimited searches', 'Advanced tracking', 'Priority support', 'Full analytics', 'API access'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 199,
      period: 'month',
      features: ['Everything in Pro', 'White-label solution', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-32 bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl lg:text-5xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
            Simple Pricing
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Choose the plan that fits your asset recovery needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={`relative rounded-2xl border-2 p-8 transition-all duration-300 ${
                plan.popular 
                  ? 'border-blue-500 bg-zinc-100/50 dark:bg-zinc-800/50 scale-105 shadow-xl' 
                  : 'border-zinc-200/60 dark:border-zinc-700/60 bg-zinc-100/30 dark:bg-zinc-800/30 hover:border-zinc-300/80 dark:hover:border-zinc-600/80'
              } backdrop-blur-sm`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: plan.popular ? 0 : -2 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">${plan.price}</span>
                  <span className="text-zinc-500 dark:text-zinc-400 text-sm">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-zinc-700 dark:text-zinc-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA section
const CTASection = () => {
  return (
    <section className="py-32 bg-zinc-900 ">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-semibold text-white mb-6 leading-tight">
              Start Your Asset Recovery
            </h2>
            <p className="text-xl text-zinc-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands who have recovered over $1 billion in unclaimed assets. 
              Begin your search today with our AI-powered platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.button
                className="px-8 py-4 bg-white text-zinc-900 rounded-full font-medium flex items-center justify-center gap-2 group hover:bg-zinc-100 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
              
              <motion.button
                className="px-8 py-4 border border-zinc-600 text-zinc-300 rounded-full font-medium hover:bg-zinc-800 hover:border-zinc-500 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Schedule Demo
              </motion.button>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">$1,200</div>
                <div className="text-zinc-400 text-sm">Average Recovery</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">78%</div>
                <div className="text-zinc-400 text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">2 min</div>
                <div className="text-zinc-400 text-sm">Average Search Time</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Footer
const Footer = () => (
  <footer className="bg-zinc-900 text-white py-16 ">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-zinc-900 font-bold text-sm">G</span>
            </div>
            GOTUS
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
            Advanced AI-powered platform for global asset recovery and tracking.
          </p>
        </div>
        
        <div>
          <h4 className="font-medium mb-4 text-white">Product</h4>
          <div className="space-y-3">
            {['Features', 'Pricing', 'API', 'Documentation'].map((item) => (
              <a key={item} href="#" className="block text-zinc-400 hover:text-zinc-200 transition-colors text-sm">
                {item}
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-4 text-white">Company</h4>
          <div className="space-y-3">
            {['About', 'Careers', 'Press', 'Contact'].map((item) => (
              <a key={item} href="#" className="block text-zinc-400 hover:text-zinc-200 transition-colors text-sm">
                {item}
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-4 text-white">Legal</h4>
          <div className="space-y-3">
            {['Privacy', 'Terms', 'Security', 'Compliance'].map((item) => (
              <a key={item} href="#" className="block text-zinc-400 hover:text-zinc-200 transition-colors text-sm">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
      
      <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-zinc-400 text-sm">
          © 2025 GOTUS. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-zinc-400 hover:text-zinc-200 transition-colors text-sm">
            Privacy Policy
          </a>
          <a href="#" className="text-zinc-400 hover:text-zinc-200 transition-colors text-sm">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// Main App Component
export default function App() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 overflow-x-hidden">
      <AnimatePresence>
        {!isLoaded ? (
          <motion.div
            className="fixed inset-0 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center z-50"
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
                className="w-12 h-12 border-3 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.p
                className="mt-4 text-zinc-900 dark:text-zinc-100 font-medium text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Loading GOTUS...
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
            <CTASection />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Scroll to top button */}
      <motion.button
        className="fixed bottom-8 right-8 w-12 h-12 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-full shadow-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors z-40 backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </motion.button>
    </div>
  );
}
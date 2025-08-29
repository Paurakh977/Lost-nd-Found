'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from 'framer-motion';
import { Search, CheckCircle, Zap, Globe, Shield, Star, ArrowRight, Play, Menu, X, Users, TrendingUp, Clock, Award, ChevronDown, MousePointer, BarChart3, Sparkles } from 'lucide-react';
import { cn } from "../lib/utlis";
import { AuroraBackground } from "../components/ui/aurora-background";


// Custom hook for counter animation
interface CounterHookResult {
  count: number;
  ref: React.RefObject<HTMLDivElement>;
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

// Navigation component

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
        className="relative flex flex-col gap-4 items-center justify-center px-4 max-w-6xl mx-auto text-center"
      >
        <motion.span
          className="inline-block px-4 py-2 bg-slate-800/10 dark:bg-slate-200/10 text-slate-800 dark:text-slate-200 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-slate-200/20"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          🚀 Global Asset Recovery Platform
        </motion.span>

        <div className="text-3xl md:text-7xl font-bold dark:text-white text-slate-900 text-center mb-4">
          Welcome to{' '}
          <motion.span
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            GOTUS
          </motion.span>
        </div>

        <motion.p
          className="font-extralight text-base md:text-xl dark:text-neutral-200 text-slate-600 py-4 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          Global Online Tracking for Unclaimed Stuff. Discover, track, and recover 
          unclaimed assets with our AI-powered global tracking system.
        </motion.p>

        <motion.button
          className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-8 py-3 font-medium flex items-center gap-2 group hover:shadow-lg transition-all mt-8"
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)"
          }}
          whileTap={{ scale: 0.95 }}
        >
          Start Free Trial
          <motion.div
            className="group-hover:translate-x-1 transition-transform"
          >
            <ArrowRight size={18} />
          </motion.div>
        </motion.button>

        <motion.div
          className="flex justify-center items-center gap-6 text-sm text-slate-500 dark:text-slate-400 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            Free 30-day trial
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
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
    { value: 50000, label: 'Happy Users', suffix: '+' },
    { value: 99.9, label: 'Uptime', suffix: '%' },
    { value: 150, label: 'Countries Covered', suffix: '+' }
  ];

  return (
    <section className="py-20 bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const { count, ref } = useCounter(stat.value, 2000);
            
            return (
              <motion.div
                key={i}
                ref={ref}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 1 }}
                >
                  {stat.prefix}{count.toLocaleString()}{stat.suffix}
                </motion.div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
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
      title: 'AI-Powered Search',
      description: 'Advanced algorithms scan millions of unclaimed assets globally.',
    },
    {
      icon: Shield,
      title: 'Secure & Verified',
      description: 'Bank-level security with verified government partnerships.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get results in seconds with our optimized tracking system.',
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Access databases from 150+ countries worldwide.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track your recovery progress with detailed insights.',
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Expert team available around the clock to help you.',
    }
  ];

  return (
    <section id="features" className="py-32 bg-white dark:bg-zinc-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Everything You Need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Succeed</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Our comprehensive suite of tools makes asset recovery simple, fast, and incredibly effective.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="relative bg-white dark:bg-zinc-800/50 p-8 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300 hover:shadow-xl backdrop-blur-sm">
                <motion.div
                  className="w-16 h-16 rounded-full bg-black dark:bg-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-8 h-8 text-white dark:text-black" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
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
      content: 'GOTUS helped me recover $45,000 in unclaimed business assets. The process was incredibly smooth and professional.',
      avatar: '👩‍💼',
      rating: 5
    },
    {
      name: 'Michael Chen',
      title: 'Investment Advisor',
      content: 'The AI-powered search found assets I never knew existed. This platform is a game-changer for asset recovery.',
      avatar: '👨‍💼',
      rating: 5
    },
    {
      name: 'Emily Davis',
      title: 'Legal Consultant',
      content: 'Outstanding service and support. The global database coverage is unmatched in the industry.',
      avatar: '👩‍⚖️',
      rating: 5
    }
  ];

  return (
    <section className="py-32 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            What Our <span className="text-blue-600">Users Say</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Join thousands of satisfied users who've recovered millions in assets
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, starIndex) => (
                  <Star key={starIndex} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-slate-700 dark:text-slate-300 mb-6 italic leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <div className="text-3xl mr-4">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">{testimonial.name}</h4>
                  <p className="text-slate-500 dark:text-slate-400">{testimonial.title}</p>
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
      features: ['Unlimited searches', 'Advanced tracking', 'Priority support', 'Full history', 'API access'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 199,
      period: 'month',
      features: ['Everything in Pro', 'White-label solution', 'Dedicated manager', 'Custom integrations', 'SLA guarantee'],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-32 bg-white dark:bg-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Simple, <span className="text-blue-600">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Choose the perfect plan for your asset recovery needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={`relative bg-white dark:bg-slate-700 rounded-2xl border-2 p-8 ${
                plan.popular 
                  ? 'border-blue-500 shadow-xl scale-105' 
                  : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-400'
              } transition-all duration-300`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              {plan.popular && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Most Popular
                </motion.div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{plan.name}</h3>
                <div className="text-5xl font-bold text-blue-600 mb-2">${plan.price}</div>
                <div className="text-slate-500 dark:text-slate-400">per {plan.period}</div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
    <section className="py-32 bg-zinc-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            className="lg:w-2/3"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Discover Your Unclaimed Assets?
            </h2>
            <p className="text-xl text-zinc-300 mb-8 max-w-2xl">
              Join thousands of users who have successfully recovered over $1 billion in assets. 
              Start your search today and see what you might find.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                className="px-8 py-3 bg-white text-black hover:bg-zinc-100 rounded-full font-medium flex items-center gap-2 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
                <motion.div className="group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={18} />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div
            className="lg:w-1/3"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="bg-zinc-800/50 backdrop-blur-sm p-8 rounded-xl border border-zinc-700 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Average Recovery</span>
                  <span className="text-white font-bold">$1,200</span>
                </div>
                <div className="h-px bg-zinc-700"></div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Success Rate</span>
                  <span className="text-white font-bold">78%</span>
                </div>
                <div className="h-px bg-zinc-700"></div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Time to First Result</span>
                  <span className="text-white font-bold">~2 minutes</span>
                </div>
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
  <footer className="bg-zinc-900 text-white py-16">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <div className="text-2xl font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-black font-bold text-sm">G</span>
            </div>
            <span className="text-white">GOTUS</span>
          </div>
          <p className="text-zinc-400 mb-6">
            Revolutionizing asset recovery with AI-powered global tracking.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <div className="space-y-2">
            {['Features', 'Pricing', 'API', 'Documentation'].map((item) => (
              <a key={item} href="#" className="block text-zinc-400 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <div className="space-y-2">
            {['About', 'Careers', 'Press', 'Contact'].map((item) => (
              <a key={item} href="#" className="block text-zinc-400 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <div className="space-y-2">
            {['Help Center', 'Community', 'Status', 'Security'].map((item) => (
              <a key={item} href="#" className="block text-zinc-400 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
      
      <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-zinc-400">
          © 2025 GOTUS. All rights reserved.
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
            <a key={item} href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">
              {item}
            </a>
          ))}
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
                className="w-16 h-16 border-4 border-black dark:border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.p
                className="mt-4 text-black dark:text-white font-medium"
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
        className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </motion.button>
    </div>
  );
}
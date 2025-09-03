'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignUp, useUser } from '@clerk/nextjs';
import EmailVerificationForm from '../../../components/auth/EmailVerificationForm';

export default function MinimalistSignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string; terms?: string; general?: string}>({});
  const [pendingVerification, setPendingVerification] = useState(false);
  
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if user is already signed in
  useEffect(() => {
    if (isSignedIn) {
      const redirectUrl = searchParams?.get('redirect_url') || '/';
      router.replace(redirectUrl);
    }
  }, [isSignedIn, router, searchParams]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors: {email?: string; password?: string; terms?: string; general?: string} = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!agreeToTerms) newErrors.terms = 'You must agree to the terms';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    if (!isLoaded) {
      setErrors({ general: 'Authentication system is loading. Please try again.' });
      setIsLoading(false);
      return;
    }

    try {
      // Start the sign-up process
      await signUp.create({
        emailAddress: email,
        password: password,
      });

      // Start the email verification process
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      // Set the UI to show the verification form
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign-up error:', err);
      setErrors({
        general: err.errors?.[0]?.message || 'An error occurred during sign up. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'oauth_google' | 'oauth_facebook' | 'oauth_apple') => {
    if (!isLoaded) {
      return;
    }

    try {
      setIsLoading(true);
      // Get the redirect URL from search params or default to '/'
      const redirectUrl = searchParams?.get('redirect_url') || '/';
      
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: redirectUrl,
      });
    } catch (err) {
      console.error('Social sign up error:', err);
      setErrors({
        general: 'Could not sign up with social provider. Please try again.'
      });
      setIsLoading(false);
    }
  };

  // Handle successful verification
  const handleVerificationSuccess = () => {
    // Redirect to the home page after successful verification
    router.push('/');
  };
  
  // If user is already signed in and we're in the process of redirecting, show a loading state
  if (isLoaded && isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Already signed in. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-100/20 to-indigo-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Go Back Button */}
      <motion.button
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 z-10 flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-full text-slate-600 hover:text-slate-800 hover:bg-white/90 transition-all duration-300 shadow-lg"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Go Back</span>
      </motion.button>

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          {/* Header */}
          <div className="text-center mb-8 select-none relative">
            <motion.div 
              className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, rotate: -5 }}
            >
              <Image 
                src="/Logo.png" 
                alt="GOTUS Logo" 
                width={100} 
                height={100} 
                className="object-contain filter brightness-0 invert" 
              />
            </motion.div>
            <motion.h1 
              className="text-4xl tracking-tight text-slate-800 mb-2 pointer-events-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <span className="font-light">Join</span>{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">GOTUS</span>
            </motion.h1>
            <motion.p 
              className="text-sm font-light tracking-wider text-slate-500 uppercase pointer-events-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Create your account and start your journey
            </motion.p>
          </div>

          <AnimatePresence>
            {errors.general && (
              <motion.div 
                className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-600 p-4 rounded-2xl text-sm mb-6 text-center"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {errors.general}
              </motion.div>
            )}
          </AnimatePresence>

          {!pendingVerification ? (
            <>
              {/* Registration Form */}
              <motion.form 
                className="space-y-6"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                {/* Email Field */}
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Mail className={`h-5 w-5 transition-colors duration-200 ${
                      email ? 'text-purple-500' : 'text-slate-400'
                    }`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 ${
                      errors.email ? 'border-red-300 bg-red-50/50' : 'border-slate-200/50 hover:border-slate-300/50'
                    } placeholder-slate-400 text-slate-700 font-medium tracking-wide shadow-sm`}
                    placeholder="Enter your email"
                    style={{ fontSize: '15px' }}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p 
                        className="mt-2 text-xs text-red-500 font-medium tracking-wide"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password Field */}
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.0 }}
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className={`h-5 w-5 transition-colors duration-200 ${
                      password ? 'text-purple-500' : 'text-slate-400'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-12 pr-14 py-4 border-2 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 ${
                      errors.password ? 'border-red-300 bg-red-50/50' : 'border-slate-200/50 hover:border-slate-300/50'
                    } placeholder-slate-400 text-slate-700 font-medium tracking-wide shadow-sm`}
                    placeholder="Create a password"
                    style={{ fontSize: '15px' }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 z-10 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.1 }}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </motion.button>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p 
                        className="mt-2 text-xs text-red-500 font-medium tracking-wide"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Terms and Conditions */}
                <motion.div 
                  className="flex items-start space-x-3 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                >
                  <motion.div
                    className="relative flex-shrink-0 mt-1"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeToTerms}
                      onChange={() => setAgreeToTerms(!agreeToTerms)}
                      className="sr-only"
                    />
                    <motion.label
                      htmlFor="terms"
                      className={`flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-all duration-200 ${
                        agreeToTerms 
                          ? 'bg-purple-600 border-purple-600' 
                          : 'border-slate-300 hover:border-purple-400'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <AnimatePresence>
                        {agreeToTerms && (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.label>
                  </motion.div>
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-slate-600 font-medium tracking-wide cursor-pointer leading-relaxed">
                      I agree to the{' '}
                      <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200">
                        Privacy Policy
                      </a>
                    </label>
                    <AnimatePresence>
                      {errors.terms && (
                        <motion.p 
                          className="mt-2 text-xs text-red-500 font-medium tracking-wide"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {errors.terms}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold tracking-wide text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 1.2,
                    y: {
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }
                  }}
                  whileHover={{ 
                    y: -2,
                    scale: 1.02,
                    boxShadow: '0 20px 40px rgba(147, 51, 234, 0.3)',
                    transition: { 
                      duration: 0.3,
                      y: {
                        type: "spring",
                        stiffness: 400,
                        damping: 20
                      }
                    }
                  }}
                  whileTap={{ 
                    y: 0,
                    scale: 0.98,
                    transition: { duration: 0.1 }
                  }}
                >
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-pink-600 to-purple-600 transition-all duration-300 ease-out group-hover:w-full"></span>
                  <span className="relative flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Divider */}
                <motion.div 
                  className="relative my-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.3 }}
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-white/70 backdrop-blur-sm text-slate-500 font-medium tracking-wider uppercase">or sign up with</span>
                  </div>
                </motion.div>

                {/* This div is required for Clerk captcha */}
                <div id="clerk-captcha" className="hidden"></div>
              </motion.form>

              {/* Social Buttons */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <motion.button
                  type="button"
                  onClick={() => handleSocialSignup('oauth_google')}
                  className="flex justify-center items-center h-12 bg-white/50 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl overflow-hidden relative group shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 1.4,
                    y: {
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }
                  }}
                  whileHover={{ 
                    y: -2,
                    scale: 1.05,
                    borderColor: 'rgb(147 51 234 / 0.5)',
                    transition: { 
                      duration: 0.3,
                      y: {
                        type: "spring",
                        stiffness: 400,
                        damping: 20
                      }
                    }
                  }}
                  whileTap={{ 
                    y: 0,
                    scale: 0.95,
                    transition: { duration: 0.1 }
                  }}
                >
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                  <svg className="w-6 h-6 relative z-10 transition-all duration-300 group-hover:brightness-0 group-hover:invert" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => handleSocialSignup('oauth_facebook')}
                  className="flex justify-center items-center h-12 bg-white/50 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl overflow-hidden relative group shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 1.5,
                    y: {
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }
                  }}
                  whileHover={{ 
                    y: -2,
                    scale: 1.05,
                    borderColor: 'rgb(147 51 234 / 0.5)',
                    transition: { 
                      duration: 0.3,
                      y: {
                        type: "spring",
                        stiffness: 400,
                        damping: 20
                      }
                    }
                  }}
                  whileTap={{ 
                    y: 0,
                    scale: 0.95,
                    transition: { duration: 0.1 }
                  }}
                >
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                  <svg className="w-6 h-6 relative z-10 transition-all duration-300 group-hover:fill-white" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => handleSocialSignup('oauth_apple')}
                  className="flex justify-center items-center h-12 bg-white/50 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl overflow-hidden relative group shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 1.6,
                    y: {
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }
                  }}
                  whileHover={{ 
                    y: -2,
                    scale: 1.05,
                    borderColor: 'rgb(147 51 234 / 0.5)',
                    transition: { 
                      duration: 0.3,
                      y: {
                        type: "spring",
                        stiffness: 400,
                        damping: 20
                      }
                    }
                  }}
                  whileTap={{ 
                    y: 0,
                    scale: 0.95,
                    transition: { duration: 0.1 }
                  }}
                >
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                  <svg className="w-6 h-6 relative z-10 transition-all duration-300 group-hover:fill-white" fill="#000000" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </motion.button>
              </div>
            </>
          ) : (
            <EmailVerificationForm onSuccess={handleVerificationSuccess} />
          )}

          {/* Sign In Link - shown only on registration form, not verification */}
          {!pendingVerification && (
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.7 }}
            >
              <p className="text-sm text-slate-600 font-medium tracking-wide">
                Already have an account?{' '}
                <Link
                  href="/sign-in" 
                  className="text-purple-600 hover:text-purple-700 font-semibold tracking-wide transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}
        </div>
        
        {/* Footer */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.4 }}
        >
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            By signing up, you agree to our{' '}
            <motion.a 
              href="#" 
              className="text-purple-600 hover:text-purple-700 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.1 }}
            >
              Terms
            </motion.a>
            {' '}and{' '}
            <motion.a 
              href="#" 
              className="text-purple-600 hover:text-purple-700 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.1 }}
            >
              Privacy Policy
            </motion.a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
} 
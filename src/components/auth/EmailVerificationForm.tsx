'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Mail, Sparkles, ArrowLeft } from 'lucide-react';

interface EmailVerificationFormProps {
  onSuccess?: () => void;
}

export default function EmailVerificationForm({ onSuccess }: EmailVerificationFormProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded || !verificationCode) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Attempt to verify the email
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      
      if (result.status === 'complete') {
        // Set the newly created session as active
        await setActive({ session: result.createdSessionId });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Default redirect to the root route
          router.push('/');
        }
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err) {
      console.error('Email verification error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Mail className="w-10 h-10 text-white" />
        </motion.div>
        <motion.h2 
          className="text-3xl font-bold text-slate-800 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Verify your email
        </motion.h2>
        <motion.p 
          className="text-sm text-slate-600 font-medium tracking-wide leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          We've sent a verification code to your email address.
          <br />
          Please enter it below to complete your registration.
        </motion.p>
      </div>

      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        {/* Verification Code Input */}
        <motion.div 
          className="relative group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Mail className={`h-5 w-5 transition-colors duration-200 ${
              verificationCode ? 'text-purple-500' : 'text-slate-400'
            }`} />
          </div>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            className="w-full pl-12 pr-4 py-4 border-2 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 border-slate-200/50 hover:border-slate-300/50 placeholder-slate-400 text-slate-700 font-medium tracking-wide shadow-sm"
            style={{ fontSize: '15px' }}
            required
          />
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-600 p-4 rounded-2xl text-sm text-center"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={isLoading || !verificationCode}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold tracking-wide text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: 1.0,
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
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Verify Email</span>
              </>
            )}
          </span>
        </motion.button>

        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.1 }}
        >
          <p className="text-sm text-slate-600 font-medium tracking-wide">
            Didn't receive a code?{' '}
            <motion.button
              type="button"
              onClick={async () => {
                if (!isLoaded) return;
                try {
                  await signUp.prepareEmailAddressVerification();
                  setError('A new code has been sent to your email.');
                } catch (err) {
                  setError('Failed to resend verification code.');
                }
              }}
              className="text-purple-600 hover:text-purple-700 font-semibold tracking-wide transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              Resend
            </motion.button>
          </p>
        </motion.div>
      </motion.form>
    </motion.div>
  );
} 
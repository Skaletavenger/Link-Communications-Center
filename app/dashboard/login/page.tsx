'use client';
import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const AUTH_KEY = 'lcc_admin_auth';
const CORRECT_PASSWORD = 'LCC2026';
const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 30;

export default function DashboardLoginPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
      router.replace('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    if (!disabled || countdown <= 0) return;

    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          setDisabled(false);
          setAttempts(0);
          setError('');
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [disabled, countdown]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    if (password === CORRECT_PASSWORD) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(AUTH_KEY, 'true');
        sessionStorage.setItem('lcc_last_active', Date.now().toString());
      }
      setError('');
      setSuccess(true);
      window.setTimeout(() => {
        router.push('/dashboard');
      }, 800);
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setPassword('');

    if (nextAttempts >= MAX_ATTEMPTS) {
      setError('Too many attempts. Please contact admin.');
      setDisabled(true);
      setCountdown(LOCKOUT_SECONDS);
      return;
    }

    setError('Invalid access code. Try again.');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f0f4ff] dark:bg-[#0a0f1e] px-6 py-10 text-gray-900 dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,180,255,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(155,92,255,0.14),transparent_35%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-screen-xl flex-col items-center justify-center text-center">
        <div className="mb-8 space-y-3 text-gray-500 dark:text-gray-300">
          <p className="text-sm uppercase tracking-[0.35em] text-[#73d5ff]">Link Communications Center</p>
          <h1 className="text-4xl font-semibold tracking-tight">Admin Access</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={success ? { opacity: 1, scale: 1.02 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative w-full max-w-[420px]"
        >
          <div className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-[#00B4FF] via-[#9B5CFF] to-[#00B4FF] opacity-80 blur-2xl animate-spin-slow" />
          <div className="relative overflow-hidden rounded-[24px] border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-8 py-12 backdrop-blur-xl shadow-2xl shadow-sky-500/10">
            <div className="mb-8 flex items-center justify-center">
              <motion.div
                initial={{ rotate: 0, y: 0 }}
                animate={success ? { rotate: 0, y: [0, -6, 0], scale: [1, 1.05, 1] } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-accent"
              >
                <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20 26V18a12 12 0 0124 0v8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform={success ? 'translate(0,-4) rotate(-15 32 20)' : undefined}
                  />
                  <rect x="16" y="26" width="32" height="28" rx="6" stroke="currentColor" strokeWidth="4" />
                  {success ? (
                    <path d="M32 36v6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  ) : null}
                </svg>
              </motion.div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3 text-left">
                <label htmlFor="access-code" className="block text-sm uppercase tracking-[0.24em] text-gray-700 dark:text-white/60">
                  Access Code
                </label>
                <div className="relative">
                  <input
                    id="access-code"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-4 text-gray-900 dark:text-white outline-none transition focus:border-[#00b4ff] focus:ring-4 focus:ring-[#00b4ff]/20 placeholder-gray-400 dark:placeholder-white/30"
                    placeholder="Enter access code"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8d8ff] hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0112 20c-5.18 0-9.44-3.17-11-7.5A10.94 10.94 0 014.06 6.06" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <p className={`text-sm ${attempts >= MAX_ATTEMPTS ? 'text-rose-300' : 'text-rose-400'}`}>{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={disabled}
                className="w-full rounded-2xl bg-[#00B4FF] px-4 py-4 text-navy font-semibold shadow-[0_20px_50px_-30px_rgba(0,180,255,0.8)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {disabled ? `Try again in ${countdown}s` : 'Login'}
              </button>
            </form>

            <p className="mt-6 text-xs text-secondary">Link Communications Center — Admin Portal</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

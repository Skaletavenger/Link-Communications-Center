'use client';
import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

const LEGACY_AUTH_KEY = 'lcc_admin_auth';

export default function DashboardLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      if (typeof window !== 'undefined' && sessionStorage.getItem(LEGACY_AUTH_KEY) === 'true') {
        // Already fully logged in - go straight to the dashboard.
        router.replace('/dashboard');
      } else {
        // The dashboard logged this session out (logout button / idle timeout),
        // so finish the job on the Supabase side and show the form.
        supabase.auth.signOut();
      }
    });
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(LEGACY_AUTH_KEY, 'true');
      sessionStorage.setItem('lcc_last_active', Date.now().toString());
    }

    setSuccess(true);
    window.setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f0f4ff] px-6 py-10 text-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(21,116,181,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(155,92,255,0.14),transparent_35%)]" />
      <div className="relative z-10 flex min-h-[80vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur"
        >
          <h1 className="text-2xl font-bold">Admin login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your administrator account to manage Link Communications Center.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base outline-none transition focus:border-[#1574B5]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 pr-20 text-base outline-none transition focus:border-[#1574B5]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#1574B5]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border-l-4 border-green-500 bg-green-50 p-3 text-sm text-green-700">
                Welcome back. Redirecting&hellip;
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#1574B5] py-3.5 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in\u2026' : 'Sign in'}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}

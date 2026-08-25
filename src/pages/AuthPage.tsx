import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { Logo } from '@/components/Logo';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '@/lib/types';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          toast(error, 'error');
        } else {
          toast('Account created! Welcome to yoorfit.', 'success');
          navigate(role === 'tailor' ? '/tailor-dashboard' : '/');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast(error, 'error');
        } else {
          toast('Welcome back!', 'success');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <div className="p-6">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold mb-2">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-ink-500 text-sm">
            {isSignup
              ? 'Join the marketplace for Nigerian fashion.'
              : 'Sign in to continue to yoorfit.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <div>
                <label className="label">Full name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adaeze Okonkwo"
                  className="input"
                />
              </div>

              <div>
                <label className="label">I want to</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`rounded-xl border p-4 text-left transition ${
                      role === 'customer'
                        ? 'border-ink-900 bg-ink-900 text-cream-50'
                        : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                    }`}
                  >
                    <p className="font-medium text-sm">Order clothes</p>
                    <p className={`text-xs mt-0.5 ${role === 'customer' ? 'text-cream-300' : 'text-ink-400'}`}>
                      As a customer
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('tailor')}
                    className={`rounded-xl border p-4 text-left transition ${
                      role === 'tailor'
                        ? 'border-ink-900 bg-ink-900 text-cream-50'
                        : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                    }`}
                  >
                    <p className="font-medium text-sm">Sell & tailor</p>
                    <p className={`text-xs mt-0.5 ${role === 'tailor' ? 'text-cream-300' : 'text-ink-400'}`}>
                      As a tailor
                    </p>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input pl-11"
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input pl-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-500 mt-6">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link to={isSignup ? '/login' : '/signup'} className="font-medium text-ink-900 underline">
            {isSignup ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </div>
    </div>
  );
}

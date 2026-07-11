'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LoginSchema } from '@/schemas/auth';
import { Shield, Mail, Lock, ArrowRight, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate query to pull new user profile
      queryClient.setQueryData(['auth-user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });

      // Redirect depending on user role
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.role === 'EMPLOYEE') {
        router.push('/employee');
      } else {
        router.push('/');
      }
    },
    onError: (err) => {
      setApiError(err.message || 'Invalid credentials. Please try again.');
    },
  });

  const onSubmit = (data) => {
    setApiError('');
    loginMutation.mutate(data);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-16 px-4 bg-background relative overflow-hidden select-none">
      {/* Background radial glow visual */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md p-8 bg-card border border-border/50 rounded-3xl shadow-xl backdrop-blur-md relative overflow-hidden animate-in fade-in duration-300">
        
        {/* Glow Line Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="text-center flex flex-col items-center gap-3 mb-8">
          <Link href="/" className="flex items-center justify-center bg-white dark:bg-black px-4 py-2 rounded-2xl border border-border/40 shadow-xs w-max mx-auto">
            <img src="/logo.png" alt="BlogBuilder" className="h-16 w-auto dark:invert object-contain" />
          </Link>
          <h2 className="text-lg font-bold text-foreground">Welcome Back</h2>
          <p className="text-xs text-muted-foreground max-w-xs">
            Sign in to your account to read, draft, and configure your creator workspace.
          </p>
        </div>

        {/* Global errors banner */}
        {apiError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl mb-5 text-center">
            {apiError}
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3 text-indigo-500" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@email.com"
              {...register('email')}
              className="w-full px-4 py-2.5 bg-secondary/15 border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all text-foreground"
            />
            {errors.email && (
              <span className="text-[10px] text-red-500 font-bold mt-0.5">{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3 text-indigo-500" />
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-4 pr-10 py-2.5 bg-secondary/15 border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all text-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none transition-all select-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500 font-bold mt-0.5">{errors.password.message}</span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Alternate link */}
        <div className="mt-8 text-center text-xs text-muted-foreground border-t border-border/40 pt-5">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-all">
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}

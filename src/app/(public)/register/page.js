'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RegisterSchema } from '@/schemas/auth';
import { User, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState('');

  // Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'READER', // Public signups are readers by default
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Store user profile in TanStack query cache
      queryClient.setQueryData(['auth-user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });

      // Redirect reader to homepage
      router.push('/');
    },
    onError: (err) => {
      setApiError(err.message || 'Registration failed. Email might be in use.');
    },
  });

  const onSubmit = (data) => {
    setApiError('');
    registerMutation.mutate(data);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-16 px-4 bg-background relative overflow-hidden select-none">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      {/* Register Card */}
      <div className="w-full max-w-md p-8 bg-card border border-border/50 rounded-3xl shadow-xl backdrop-blur-md relative overflow-hidden animate-in fade-in duration-300">
        
        {/* Top Glow Border Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="text-center flex flex-col items-center gap-3 mb-8">
          <Link href="/" className="font-heading font-extrabold text-2xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
            InkFlow
          </Link>
          <h2 className="text-lg font-bold text-foreground">Create Account</h2>
          <p className="text-xs text-muted-foreground max-w-xs">
            Join the community to read high-quality tech blogs and comment on posts.
          </p>
        </div>

        {/* API Error banner */}
        {apiError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl mb-5 text-center">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          
          {/* Full Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3 text-indigo-500" />
              Full Name
            </label>
            <input
              type="text"
              placeholder="Sarah Connor"
              {...register('name')}
              className="w-full px-4 py-2.5 bg-secondary/15 border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all text-foreground"
            />
            {errors.name && (
              <span className="text-[10px] text-red-500 font-bold mt-0.5">{errors.name.message}</span>
            )}
          </div>

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
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full px-4 py-2.5 bg-secondary/15 border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all text-foreground"
            />
            {errors.password && (
              <span className="text-[10px] text-red-500 font-bold mt-0.5">{errors.password.message}</span>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                Get Started <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-muted-foreground border-t border-border/40 pt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-all">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

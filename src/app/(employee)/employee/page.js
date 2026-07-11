'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BlogsListTable } from '@/components/tables/BlogsListTable';
import { FileText, CheckCircle, HelpCircle, Eye, Plus, MessageSquare, Clock, ArrowUpRight } from 'lucide-react';

export default function EmployeeDashboardPage() {
  // 1. Fetch dashboard statistics
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/employee/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return res.json();
    },
  });

  // 2. Fetch blogs listing
  const { data: blogsData, isLoading: blogsLoading } = useQuery({
    queryKey: ['employee-blogs'],
    queryFn: async () => {
      const res = await fetch('/api/employee/blogs');
      if (!res.ok) throw new Error('Failed to fetch employee blogs');
      return res.json();
    },
  });

  const stats = dashboardData?.stats || { total: 0, published: 0, drafts: 0, views: 0 };
  const activities = dashboardData?.activities || [];
  const blogs = blogsData?.blogs || [];

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Dashboard Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight mb-1">
            Author Space
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your articles, analyze reading statistics, and review readers' feedback.
          </p>
        </div>

        <Link
          href="/employee/editor/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-500/10 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Create Article
        </Link>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Blogs */}
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-105" />
          <div className="flex items-center gap-3 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Total Blogs
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {statsLoading ? '...' : stats.total}
          </p>
        </div>

        {/* Published Blogs */}
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-105" />
          <div className="flex items-center gap-3 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Published
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {statsLoading ? '...' : stats.published}
          </p>
        </div>

        {/* Draft Blogs */}
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-105" />
          <div className="flex items-center gap-3 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            Drafts
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {statsLoading ? '...' : stats.drafts}
          </p>
        </div>

        {/* Views */}
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-105" />
          <div className="flex items-center gap-3 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <Eye className="w-4 h-4 text-cyan-500" />
            Total Views
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {statsLoading ? '...' : stats.views}
          </p>
        </div>
      </div>

      {/* Grid: Blogs List Table and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Blogs management table */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <h3 className="font-heading font-extrabold text-lg flex items-center gap-2">
            Your Articles
          </h3>
          {blogsLoading ? (
            <div className="w-full border border-border/40 rounded-2xl p-12 bg-card text-center animate-pulse">
              <div className="h-5 bg-secondary/50 rounded w-1/3 mx-auto mb-4" />
              <div className="h-3 bg-secondary/50 rounded w-1/2 mx-auto" />
            </div>
          ) : (
            <BlogsListTable blogs={blogs} />
          )}
        </div>

        {/* Activity feed sidebar */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <h3 className="font-heading font-extrabold text-lg">
            Recent Activity
          </h3>
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            {statsLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-secondary/50 rounded-xl" />
                <div className="h-10 bg-secondary/50 rounded-xl" />
                <div className="h-10 bg-secondary/50 rounded-xl" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs italic flex flex-col items-center justify-center gap-2">
                <MessageSquare className="w-8 h-8 opacity-40 stroke-1" />
                No comments or actions logged on your articles yet.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 text-xs leading-normal select-none">
                    <img
                      src={activity.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover border border-border flex-shrink-0"
                    />
                    <div className="min-w-0 flex-grow">
                      <p className="text-foreground font-semibold truncate">
                        {activity.message}
                      </p>
                      <p className="text-muted-foreground line-clamp-1 italic mt-0.5">
                        "{activity.detail}"
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(activity.createdAt).toLocaleDateString('en-US')}
                        <Link
                          href={activity.link}
                          target="_blank"
                          className="ml-auto text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5"
                        >
                          View <ArrowUpRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

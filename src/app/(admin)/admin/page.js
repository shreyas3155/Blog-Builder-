'use client';

import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  CheckCircle,
  HelpCircle,
  Eye,
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // Fetch global admin statistics
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      return res.json();
    },
  });

  const stats = dashboardData?.stats || { blogs: 0, published: 0, drafts: 0, views: 0, employees: 0 };
  const viewsByCategory = dashboardData?.viewsByCategory || [];
  const topArticles = dashboardData?.topArticles || [];
  const activities = dashboardData?.activities || [];

  // Calculate highest view count to calibrate progress bars
  const maxViews = Math.max(...viewsByCategory.map((c) => c.views), 1);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-secondary/50 rounded w-1/4 mb-2" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-secondary/40 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-secondary/30 rounded-2xl" />
          <div className="h-64 bg-secondary/30 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight mb-1 text-foreground">
          Platform Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Real-time global metrics, category performance, and platform-wide reader activity log.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Blogs */}
        <div className="p-5 bg-card border border-border/50 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-2.5 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            Total Blogs
          </div>
          <p className="text-2xl font-extrabold text-foreground">{stats.blogs}</p>
        </div>

        {/* Published Blogs */}
        <div className="p-5 bg-card border border-border/50 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-2.5 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Published
          </div>
          <p className="text-2xl font-extrabold text-foreground">{stats.published}</p>
        </div>

        {/* Draft Blogs */}
        <div className="p-5 bg-card border border-border/50 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-2.5 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            Drafts
          </div>
          <p className="text-2xl font-extrabold text-foreground">{stats.drafts}</p>
        </div>

        {/* Global Views */}
        <div className="p-5 bg-card border border-border/50 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-2.5 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <Eye className="w-3.5 h-3.5 text-cyan-500" />
            Global Views
          </div>
          <p className="text-2xl font-extrabold text-foreground">{stats.views}</p>
        </div>

        {/* Total Employees */}
        <div className="p-5 bg-card border border-border/50 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-2.5 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-red-500" />
            Staff Users
          </div>
          <p className="text-2xl font-extrabold text-foreground">{stats.employees}</p>
        </div>

        {/* Most Active Employee */}
        <div className="p-5 bg-card border border-border/50 rounded-2xl shadow-sm relative overflow-hidden group col-span-2 md:col-span-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-2.5 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            Most Active
          </div>
          <p className="text-sm font-extrabold text-foreground truncate mt-1">
            {stats.mostActive || 'None yet'}
          </p>
        </div>
      </div>

      {/* Main Charts & Popularity Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category Views Performance */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <h3 className="font-heading font-extrabold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Views by Category
          </h3>
          <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm flex flex-col gap-4">
            {viewsByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-6">No data registered.</p>
            ) : (
              viewsByCategory.map((cat) => (
                <div key={cat.id} className="flex flex-col gap-1.5 text-xs select-none">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground capitalize">{cat.name}</span>
                    <span className="text-muted-foreground font-mono font-bold">
                      {cat.views} views ({cat.blogsCount} posts)
                    </span>
                  </div>
                  {/* Custom animated-like progress bar */}
                  <div className="w-full h-2 bg-secondary/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(cat.views / maxViews) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Articles Table */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <h3 className="font-heading font-extrabold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Top Read Articles
          </h3>
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/40 bg-secondary/10 font-bold text-muted-foreground">
                    <th className="p-4">Title</th>
                    <th className="p-4">Author</th>
                    <th className="p-4 text-center">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {topArticles.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground italic">No articles published yet.</td>
                    </tr>
                  ) : (
                    topArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-secondary/5 transition-colors">
                        <td className="p-4 max-w-[200px] font-bold truncate">
                          <Link href={`/blogs/${article.slug}`} target="_blank" className="hover:text-indigo-400">
                            {article.title}
                          </Link>
                        </td>
                        <td className="p-4 text-muted-foreground">{article.author?.name}</td>
                        <td className="p-4 text-center font-mono font-bold text-foreground">
                          {article._count?.views}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Global Activity Logs Timeline (Bottom row spanning full columns) */}
        <div className="lg:col-span-12 flex flex-col gap-4">
          <h3 className="font-heading font-extrabold text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-500" />
            Global Activity Timeline
          </h3>
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-6">No platform activity registered yet.</p>
            ) : (
              <div className="relative border-l border-border/50 pl-6 ml-3 flex flex-col gap-6">
                {activities.map((act) => {
                  let typeColor = 'bg-indigo-500';
                  if (act.type === 'publish') typeColor = 'bg-emerald-500';
                  if (act.type === 'comment') typeColor = 'bg-indigo-500';
                  if (act.type === 'like') typeColor = 'bg-red-500';

                  return (
                    <div key={act.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs leading-normal select-none">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[30px] top-1.5 w-3 h-3 rounded-full border-2 border-background ring-4 ring-secondary/20 ${typeColor}`} />
                      
                      <div className="flex items-center gap-3">
                        <img
                          src={act.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt="avatar"
                          className="w-7 h-7 rounded-full object-cover border border-border"
                        />
                        <span className="font-bold text-foreground leading-none">{act.message}</span>
                      </div>
                      
                      <span className="text-[10px] text-muted-foreground sm:ml-auto">
                        {new Date(act.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

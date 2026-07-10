'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Trash2,
  Calendar,
  BookOpen,
  Mail,
  Shield,
  Loader2,
  X,
  UserPlus
} from 'lucide-react';

export default function AdminEmployeesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Employee Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [formError, setFormError] = useState('');

  // 1. Fetch employee list
  const { data: employeesData, isLoading } = useQuery({
    queryKey: ['admin-employees'],
    queryFn: async () => {
      const res = await fetch('/api/admin/employees');
      if (!res.ok) throw new Error('Failed to load employee list');
      return res.json();
    },
  });
  const employees = employeesData?.employees || [];

  // 2. Register Employee Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Registration failed');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      
      // Reset & Close Modal
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('EMPLOYEE');
      setFormError('');
    },
    onError: (err) => {
      setFormError(err.message || 'Something went wrong.');
    },
  });

  // 3. Delete Employee Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Deletion failed');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err) => {
      alert(err.message || 'Operation failed');
    },
  });

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return setFormError('All fields are required.');
    }
    if (password.length < 6) {
      return setFormError('Password must be at least 6 characters.');
    }
    createMutation.mutate({ name, email, password, role });
  };

  const handleDelete = (id, employeeName) => {
    if (
      window.confirm(
        `WARNING: Deleting employee "${employeeName}" will permanently remove their user account AND delete all articles they have written! Are you absolutely sure?`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight mb-1">
            Manage Employees
          </h1>
          <p className="text-sm text-muted-foreground">
            Register new authors, allocate admin permissions, and remove employee credentials.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-500/10 hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Main Table view */}
      {isLoading ? (
        <div className="w-full border border-border/40 rounded-2xl p-16 text-center bg-card flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          <span className="text-xs text-muted-foreground font-semibold">Loading platform users...</span>
        </div>
      ) : (
        <div className="w-full border border-border/40 rounded-2xl overflow-hidden bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/10 text-xs font-bold text-muted-foreground select-none">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Articles Written</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-secondary/5 transition-colors">
                    {/* Avatar & Name */}
                    <td className="p-4 font-bold text-foreground">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
                        />
                        <span className="truncate max-w-[180px]">{emp.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4 text-xs font-semibold text-muted-foreground font-mono">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        {emp.email}
                      </span>
                    </td>

                    {/* Role badge */}
                    <td className="p-4 text-xs">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-md border ${
                          emp.role === 'ADMIN'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        <Shield className="w-2.5 h-2.5" />
                        {emp.role}
                      </span>
                    </td>

                    {/* Blogs count */}
                    <td className="p-4 font-mono font-bold text-muted-foreground text-center sm:text-left">
                      <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <BookOpen className="w-3.5 h-3.5" />
                        {emp._count?.blogs || 0}
                      </span>
                    </td>

                    {/* Created date */}
                    <td className="p-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(emp.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Popup Creation Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/40 bg-secondary/10">
              <h3 className="font-heading font-extrabold text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                Register Staff User
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="px-5 py-2.5 bg-red-500/10 text-red-500 border-b border-red-500/20 text-xs font-bold">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="p-5 flex flex-col gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/20 border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/20 border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                <input
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/20 border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all"
                  required
                />
              </div>

              {/* Role select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 bg-secondary/20 border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all cursor-pointer"
                >
                  <option value="EMPLOYEE">EMPLOYEE (Author/Writer)</option>
                  <option value="ADMIN">ADMIN (Full Permissions)</option>
                </select>
              </div>

              {/* Submit panel */}
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                {createMutation.isPending ? 'Registering...' : 'Register Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

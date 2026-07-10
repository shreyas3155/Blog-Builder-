import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        throw new Error('Not authenticated');
      }
      const result = await res.json();
      return result.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
      return res.json();
    },
    onSuccess: () => {
      // Clear auth queries and redirect
      queryClient.setQueryData(['auth-user'], null);
      queryClient.invalidateQueries();
      window.location.href = '/';
    },
  });

  return {
    user: data || null,
    isLoading,
    isAuthenticated: !!data,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

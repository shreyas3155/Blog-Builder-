'use client';

import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { AlertProvider } from './AlertProvider';

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AlertProvider>
          {children}
        </AlertProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

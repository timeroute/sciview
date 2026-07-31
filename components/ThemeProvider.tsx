'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Theme } from '@radix-ui/themes';
import { useEffect, useState } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={['light', 'dark', 'system']}
    >
      <RadixThemeWrapper>{children}</RadixThemeWrapper>
    </NextThemesProvider>
  );
}

function RadixThemeWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    setMounted(true);
    const saved = document.documentElement.classList;
    const check = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const finalDark = saved.contains('dark') || (!saved.contains('light') && prefersDark);
      setTheme(finalDark ? 'dark' : 'light');
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', check);
    return () => {
      observer.disconnect();
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', check);
    };
  }, []);

  return (
    <Theme
      appearance={mounted ? theme : 'dark'}
      accentColor="cyan"
      grayColor="slate"
      scaling="100%"
      panelBackground="solid"
      hasBackground={false}
    >
      {children}
    </Theme>
  );
}

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, ReactNode } from 'react';
import { Box, Flex, Text, Tooltip } from '@radix-ui/themes';
import { useI18n } from '@/lib/i18n';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Box style={{ width: '172px', height: '40px' }} />;
  }

  const current = resolvedTheme ?? theme ?? 'dark';
  const options: { value: 'light' | 'dark' | 'system'; label: string; icon: ReactNode }[] = [
    {
      value: 'light',
      label: t('theme.light'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ),
    },
    {
      value: 'system',
      label: t('theme.system'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: t('theme.dark'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
  ];

  return (
    <Flex
      gap="1"
      align="center"
      style={{
        padding: '4px',
        borderRadius: '12px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {options.map((opt) => {
        const isActive =
          (theme === 'system' && opt.value === 'system') ||
          (theme !== 'system' && opt.value !== 'system' && current === opt.value);
        const borderColor = isActive
          ? (current === 'dark' ? 'rgba(34, 211, 238, 0.3)' : 'rgba(8, 145, 178, 0.3)')
          : 'transparent';
        const activeColor = opt.value === 'system'
          ? (current === 'dark' ? 'var(--accent-secondary)' : 'var(--accent-secondary)')
          : (current === 'dark' ? '#22d3ee' : '#0891b2');
        return (
          <Tooltip key={opt.value} content={opt.label}>
            <button
              type="button"
              onClick={() => setTheme(opt.value)}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 500,
                background: isActive
                  ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.2))'
                  : 'transparent',
                color: isActive ? activeColor : 'var(--text-tertiary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor,
                transition: 'all 0.2s ease',
              }}
            >
              {opt.icon}
              <Text size="2" style={{ fontFamily: 'inherit', fontSize: '12px' }}>
                {opt.label}
              </Text>
            </button>
          </Tooltip>
        );
      })}
    </Flex>
  );
}

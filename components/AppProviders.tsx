"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n";

/**
 * 根级 Providers：
 * - I18nProvider：国际化（语言自动检测 + 持久化）
 * - ThemeProvider（next-themes）：深/浅/自动三档主题
 *
 * 保持为独立的 client 组件，确保 RootLayout 仍为 ServerComponent，可正常导出 metadata。
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <NextThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemeProvider>
    </I18nProvider>
  );
}

"use client";

import { Box, Flex, Text, Select, Tooltip } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import {
  LOCALES,
  Locale,
  getLocaleMeta,
  useI18n,
} from "@/lib/i18n";

/**
 * 语言切换组件：和 ThemeToggle 放在一行
 * - 浏览器偏好自动匹配（首次）
 * - 用户手动选择后写入 localStorage
 */
export function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { locale, setLocale, t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Box style={{ width: compact ? 120 : 172, height: 40 }} />;
  }

  if (compact) {
    return (
      <Select.Root value={locale} onValueChange={(v) => setLocale(v as Locale)}>
        <Select.Trigger
          variant="soft"
          aria-label={t("language.label")}
          style={{
            height: 40,
            minWidth: 120,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
        >
          <Flex gap="2" align="center" asChild>
            <span>
              <span aria-hidden>{getLocaleMeta(locale).flagCode}</span>
              <Text size="2" style={{ fontFamily: "inherit", fontSize: 12 }}>
                {getLocaleMeta(locale).label}
              </Text>
            </span>
          </Flex>
        </Select.Trigger>
        <Select.Content>
          {LOCALES.map((l) => {
            const m = getLocaleMeta(l);
            return (
              <Select.Item key={l} value={l}>
                <Flex gap="2" align="center">
                  <span aria-hidden>{m.flagCode}</span>
                  <Text size="2">{m.label}</Text>
                </Flex>
              </Select.Item>
            );
          })}
        </Select.Content>
      </Select.Root>
    );
  }

  return (
    <Flex
      gap="1"
      align="center"
      style={{
        padding: 4,
        borderRadius: 12,
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {LOCALES.map((l) => {
        const m = getLocaleMeta(l);
        const active = locale === l;
        return (
          <Tooltip key={l} content={`${m.flagCode} ${m.label}`}>
            <button
              type="button"
              onClick={() => setLocale(l)}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                fontWeight: 500,
                background: active
                  ? "linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.2))"
                  : "transparent",
                color: active ? "var(--accent-primary)" : "var(--text-tertiary)",
                border: `1px solid ${active ? "rgba(34, 211, 238, 0.3)" : "transparent"}`,
                transition: "all 0.2s ease",
              }}
            >
              <span aria-hidden style={{ fontSize: 14 }}>
                {m.flagCode}
              </span>
              <Text size="2" style={{ fontFamily: "inherit", fontSize: 12 }}>
                {m.label}
              </Text>
            </button>
          </Tooltip>
        );
      })}
    </Flex>
  );
}

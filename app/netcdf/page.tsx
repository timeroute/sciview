'use client';

import { useState } from 'react';
import { Container, Heading, Flex, Button, Box, Text, Badge } from '@radix-ui/themes';
import Link from 'next/link';
import FileUploader from '@/components/FileUploader';
import FileViewer from '@/components/FileViewer';
import { FileInfo } from '@/lib/parsers';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';

export default function NetCDFPage() {
  const [file, setFile] = useState<FileInfo | null>(null);
  const { t, formatLocale } = useI18n();

  return (
    <Box style={{ minHeight: '100vh' }}>
      {/* 顶部装饰条 */}
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'var(--gradient-primary)',
          zIndex: 50,
          opacity: 0.5,
        }}
      />

      <Container size="3" p="8" style={{ paddingTop: '64px', paddingBottom: '120px' }}>
        {/* 顶部导航栏 */}
        <Flex
          justify="between"
          align="center"
          className="animate-slide-up"
          style={{
            marginBottom: '40px',
            padding: '16px 24px',
            borderRadius: '16px',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            position: 'sticky',
            top: '16px',
            zIndex: 40,
          }}
        >
          <Flex gap="4" align="center">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button
                variant="ghost"
                style={{
                  borderRadius: '10px',
                  padding: '0 16px',
                  height: '40px',
                  color: 'var(--text-secondary)',
                  background: 'transparent',
                  border: '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                {t('common.backHome')}
              </Button>
            </Link>
            <Box
              style={{
                width: '1px',
                height: '24px',
                background: 'var(--border-medium)',
              }}
            />
            <Flex gap="3" align="center">
              <Box
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(34, 211, 238, 0.05))',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <defs>
                    <linearGradient id="ncfg-page" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#0891b2" />
                    </linearGradient>
                  </defs>
                  <path d="M10 20 L20 30 L28 22 L38 34" stroke="url(#ncfg-page)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="20" r="2.5" fill="url(#ncfg-page)" />
                  <circle cx="20" cy="30" r="2.5" fill="url(#ncfg-page)" />
                  <circle cx="28" cy="22" r="2.5" fill="url(#ncfg-page)" />
                  <circle cx="38" cy="34" r="2.5" fill="url(#ncfg-page)" />
                </svg>
              </Box>
              <Flex direction="column" gap="0">
                <Heading
                  size="5"
                  weight="bold"
                  style={{
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.01em',
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
                  }}
                >
                  {t('netcdf.title')}
                </Heading>
                <Flex gap="2" align="center">
                  <Badge
                    size="1"
                    style={{
                      background: 'rgba(34, 211, 238, 0.1)',
                      border: '1px solid rgba(34, 211, 238, 0.2)',
                      color: 'var(--accent-primary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {t('netcdf.badge')}
                  </Badge>
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex gap="3" align="center">
            <LanguageSwitcher compact />
            <ThemeToggle />
            <span className="data-dot" />
            <Text
              size="2"
              style={{
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            >
              {t('common.ready')}
            </Text>
          </Flex>
        </Flex>

        {/* 页面内容 */}
        <Flex direction="column" gap="8" className="animate-slide-up stagger-1">
          {!file ? (
            /* 空状态 + 上传区域 */
            <Flex direction="column" gap="6" align="center">
              <Flex direction="column" gap="3" align="center" style={{ marginBottom: '16px' }}>
                <Heading
                  size="6"
                  weight="bold"
                  className="gradient-text"
                  style={{
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {t('netcdf.loadTitle')}
                </Heading>
                <Text
                  size="3"
                  align="center"
                  style={{
                    color: 'var(--text-secondary)',
                    maxWidth: '520px',
                    lineHeight: 1.7,
                  }}
                >
                  {t('netcdf.loadSubtitle')}
                </Text>
              </Flex>
              <Box style={{ width: '100%', maxWidth: '720px' }}>
                <FileUploader onFileLoaded={setFile} acceptFormats=".nc,.netcdf" />
              </Box>
            </Flex>
          ) : (
            /* 文件内容展示 */
            <Flex direction="column" gap="6">
              <Flex justify="between" align="center" wrap="wrap" gap="3">
                <Flex gap="3" align="center">
                  <Box
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-emerald)',
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </Box>
                  <Flex direction="column" gap="1">
                    <Text size="3" weight="medium" style={{ color: 'var(--text-primary)' }}>
                      {file.fileName || t('common.loadedFile')}
                    </Text>
                    <Flex gap="3" align="center">
                      <Badge
                        size="1"
                        style={{
                          background: 'rgba(34, 211, 238, 0.1)',
                          border: '1px solid rgba(34, 211, 238, 0.2)',
                          color: 'var(--accent-primary)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {file.format.toUpperCase()}
                      </Badge>
                      <Badge
                        size="1"
                        style={{
                          background: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          color: 'var(--accent-violet)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {formatLocale(file.variables.length)} {t('common.variables')}
                      </Badge>
                      <Badge
                        size="1"
                        style={{
                          background: 'rgba(192, 132, 252, 0.1)',
                          border: '1px solid rgba(192, 132, 252, 0.2)',
                          color: 'var(--accent-tertiary)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {formatLocale(file.dimensions.length)} {t('common.dimensions')}
                      </Badge>
                    </Flex>
                  </Flex>
                </Flex>

                <Button
                  variant="soft"
                  onClick={() => setFile(null)}
                  style={{
                    borderRadius: '10px',
                    padding: '0 20px',
                    height: '40px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  {t('common.closeFile')}
                </Button>
              </Flex>

              <FileViewer fileInfo={file} />
            </Flex>
          )}
        </Flex>
      </Container>
    </Box>
  );
}

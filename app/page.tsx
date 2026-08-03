'use client';

import { Container, Heading, Text, Flex, Box, Card, Grid, Badge } from '@radix-ui/themes';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';

export default function Home() {
  const { t } = useI18n();

  const tools = [
    {
      name: t('tools.netcdfName'),
      description: t('tools.netcdfDesc'),
      href: '/netcdf',
      tag: '.nc / .netcdf',
      gradient: 'cyan',
      features: [
        t('tools.netcdfFeat1'),
        t('tools.netcdfFeat2'),
        t('tools.netcdfFeat3'),
        t('tools.netcdfFeat4'),
      ],
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
          <rect x="4" y="8" width="40" height="32" rx="4" fill="url(#g1)" opacity="0.15" />
          <rect x="4" y="8" width="40" height="32" rx="4" stroke="url(#g1)" strokeWidth="1.5" />
          <path d="M10 20 L20 30 L28 22 L38 34" stroke="url(#g1)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="20" r="2" fill="url(#g1)" />
          <circle cx="20" cy="30" r="2" fill="url(#g1)" />
          <circle cx="28" cy="22" r="2" fill="url(#g1)" />
          <circle cx="38" cy="34" r="2" fill="url(#g1)" />
          <line x1="8" y1="38" x2="40" y2="38" stroke="url(#g1)" strokeWidth="1" opacity="0.5" />
          <line x1="8" y1="14" x2="8" y2="38" stroke="url(#g1)" strokeWidth="1" opacity="0.5" />
        </svg>
      )
    },
    {
      name: t('tools.hdf5Name'),
      description: t('tools.hdf5Desc'),
      href: '/hdf5',
      tag: '.h5 / .hdf5 / .he5',
      gradient: 'violet',
      features: [
        t('tools.hdf5Feat1'),
        t('tools.hdf5Feat2'),
        t('tools.hdf5Feat3'),
        t('tools.hdf5Feat4'),
      ],
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="18" height="18" rx="3" fill="url(#g2)" opacity="0.2" />
          <rect x="6" y="6" width="18" height="18" rx="3" stroke="url(#g2)" strokeWidth="1.5" />
          <rect x="24" y="6" width="18" height="18" rx="3" fill="url(#g2)" opacity="0.15" />
          <rect x="24" y="6" width="18" height="18" rx="3" stroke="url(#g2)" strokeWidth="1" opacity="0.6" />
          <rect x="6" y="28" width="18" height="14" rx="3" fill="url(#g2)" opacity="0.1" />
          <rect x="6" y="28" width="18" height="14" rx="3" stroke="url(#g2)" strokeWidth="1" opacity="0.5" />
          <rect x="28" y="30" width="14" height="12" rx="2" fill="url(#g2)" opacity="0.25" />
          <rect x="28" y="30" width="14" height="12" rx="2" stroke="url(#g2)" strokeWidth="1.5" />
          <path d="M15 12 L15 18 M12 15 L18 15" stroke="url(#g2)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="35" cy="36" r="2.5" fill="none" stroke="url(#g2)" strokeWidth="1.5" />
        </svg>
      )
    }
  ];

  const stats = [
    { label: t('home.statFormatsLabel'), value: '6+', sub: t('home.statFormatsSub') },
    { label: t('home.statDimLabel'), value: '1-4D', sub: t('home.statDimSub') },
    { label: t('home.statVizLabel'), value: '↯', sub: t('home.statVizSub') },
    { label: t('home.statRunLabel'), value: '◉', sub: t('home.statRunSub') },
  ];

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

      <Container size="3" p="8" style={{ paddingTop: '40px', paddingBottom: '120px' }}>
        {/* 顶部主题/语言切换 */}
        <Flex justify="end" align="center" gap="3" className="animate-slide-up" style={{ marginBottom: '40px' }}>
          <LanguageSwitcher />
          <ThemeToggle />
        </Flex>

        {/* Hero Section */}
        <Box className="animate-slide-up stagger-1" style={{ marginBottom: '80px', textAlign: 'center' }}>
          <Flex direction="column" gap="5" align="center">
            {/* 徽章 */}
            <Flex gap="2" align="center" className="animate-slide-up stagger-2">
              <span className="data-dot" />
              <Badge
                size="2"
                variant="soft"
                style={{
                  background: 'rgba(34, 211, 238, 0.1)',
                  border: '1px solid rgba(34, 211, 238, 0.25)',
                  color: 'var(--accent-primary)',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontWeight: 500,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.02em',
                }}
              >
                {t('home.badge')}
              </Badge>
            </Flex>

            {/* 主标题 */}
            <Heading
              className="animate-slide-up stagger-3"
              size="9"
              weight="bold"
              align="center"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                maxWidth: '820px',
                margin: '0 auto',
              }}
            >
              <span>{t('home.heroTitlePart1')}</span>
              <span className="gradient-text"> {t('home.heroTitlePart2')}</span>
              <br />
              <span style={{ color: 'var(--text-secondary)' }}>{t('home.heroTitleSub')}</span>
            </Heading>

            {/* 副标题 */}
            <Text
              size="5"
              align="center"
              className="animate-slide-up stagger-4"
              style={{
                color: 'var(--text-secondary)',
                maxWidth: '680px',
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              {t('home.heroSubtitle')}
            </Text>

            {/* CTA 装饰元素 */}
            <Flex
              gap="4"
              justify="center"
              wrap="wrap"
              className="animate-slide-up stagger-5"
              style={{ marginTop: '16px' }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: 'var(--accent-emerald)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {t('home.ctaLocal')}
              </Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  color: 'var(--accent-violet)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                {t('home.ctaMultiDim')}
              </Box>
            </Flex>
          </Flex>
        </Box>

        {/* 工具卡片网格 */}
        <Box style={{ marginBottom: '96px' }}>
          <Grid columns="2" gap="6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}>
            {tools.map((tool, idx) => (
              <Link
                key={tool.href}
                href={tool.href}
                style={{ textDecoration: 'none', display: 'block' }}
                className={`animate-slide-up stagger-${idx + 3}`}
              >
                <Box
                  className="card-enhanced"
                  style={{
                    height: '100%',
                    padding: '32px',
                    position: 'relative',
                  }}
                >
                  {/* 渐变光效背景 */}
                  <Box
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: '16px',
                      background: tool.gradient === 'cyan'
                        ? 'radial-gradient(circle at 0% 0%, rgba(34, 211, 238, 0.12) 0%, transparent 50%)'
                        : 'radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)',
                      pointerEvents: 'none',
                    }}
                  />

                  <Flex direction="column" gap="5" style={{ position: 'relative' }}>
                    {/* 顶部行：图标 + 标签 */}
                    <Flex justify="between" align="start">
                      <Box
                        className="animate-float"
                        style={{
                          width: '64px',
                          height: '64px',
                          animationDelay: `${idx * 0.5}s`,
                        }}
                      >
                        {tool.icon}
                      </Box>
                      <Badge
                        size="2"
                        variant="solid"
                        style={{
                          background: tool.gradient === 'cyan'
                            ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(34, 211, 238, 0.08))'
                            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.08))',
                          border: `1px solid ${tool.gradient === 'cyan' ? 'rgba(34, 211, 238, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                          color: tool.gradient === 'cyan' ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                          fontFamily: 'var(--font-mono)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                        }}
                      >
                        {tool.tag}
                      </Badge>
                    </Flex>

                    {/* 标题 + 描述 */}
                    <Flex direction="column" gap="3">
                      <Heading
                        size="6"
                        weight="bold"
                        style={{
                          fontFamily: 'var(--font-display)',
                          letterSpacing: '-0.01em',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {tool.name}
                      </Heading>
                      <Text
                        size="3"
                        style={{
                          color: 'var(--text-secondary)',
                          lineHeight: 1.7,
                        }}
                      >
                        {tool.description}
                      </Text>
                    </Flex>

                    {/* 特性列表 */}
                    <Flex gap="2" wrap="wrap" style={{ marginTop: '8px' }}>
                      {tool.features.map(f => (
                        <Box
                          key={f}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {f}
                        </Box>
                      ))}
                    </Flex>

                    {/* 底部 CTA */}
                    <Flex justify="between" align="center" style={{ paddingTop: '16px', marginTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                      <Text size="2" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {t('common.clickToEnter')}
                      </Text>
                      <Box
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: tool.gradient === 'cyan'
                            ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(34, 211, 238, 0.05))'
                            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))',
                          border: `1px solid ${tool.gradient === 'cyan' ? 'rgba(34, 211, 238, 0.25)' : 'rgba(139, 92, 246, 0.25)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: tool.gradient === 'cyan' ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Box>
                    </Flex>
                  </Flex>
                </Box>
              </Link>
            ))}
          </Grid>
        </Box>

        {/* 数据统计 */}
        <Box className="animate-slide-up stagger-4" style={{ marginBottom: '96px' }}>
          <Box
            className="glass-effect"
            style={{
              borderRadius: '20px',
              padding: '48px 40px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 50% 0%, rgba(34, 211, 238, 0.08) 0%, transparent 60%)',
                pointerEvents: 'none',
              }}
            />

            <Flex direction="column" gap="2" align="center" style={{ marginBottom: '40px' }}>
              <Text
                size="2"
                style={{
                  color: 'var(--accent-primary)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {t('home.coreFeatures')}
              </Text>
              <Heading
                size="5"
                weight="bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                }}
              >
                {t('home.builtForResearch')}
              </Heading>
            </Flex>

            <Grid columns="4" gap="6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              {stats.map((s, i) => (
                <Flex
                  key={s.label}
                  direction="column"
                  gap="2"
                  align="center"
                  style={{
                    padding: '24px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    position: 'relative',
                  }}
                  className={`animate-slide-up stagger-${i + 1}`}
                >
                  <Text
                    size="8"
                    weight="bold"
                    className="gradient-text"
                    style={{
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </Text>
                  <Text size="3" weight="medium" style={{ color: 'var(--text-primary)' }}>
                    {s.label}
                  </Text>
                  <Text size="2" style={{ color: 'var(--text-tertiary)' }}>
                    {s.sub}
                  </Text>
                </Flex>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* 底部说明 */}
        <Flex direction="column" gap="3" align="center" className="animate-slide-up stagger-6">
          <Flex gap="3" align="center" style={{ opacity: 0.6 }}>
            <Text size="2" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {t('home.poweredBy')}
            </Text>
            <Flex gap="4" align="center">
              <Text size="2" weight="medium" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                netcdfjs
              </Text>
              <Text size="1" style={{ color: 'var(--text-muted)' }}>•</Text>
              <Text size="2" weight="medium" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                h5wasm
              </Text>
              <Text size="1" style={{ color: 'var(--text-muted)' }}>•</Text>
              <Text size="2" weight="medium" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                ECharts
              </Text>
            </Flex>
          </Flex>
          <Text size="1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
            {t('home.footerCopyright')}
          </Text>
        </Flex>
      </Container>

      {/* 首页 SEO 结构化数据：WebPage + WebApplication + BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": "https://sci.spaceroute.cn/#webpage",
                "url": "https://sci.spaceroute.cn",
                "name": "NCView - 科学数据可视化查看器",
                "headline": "NetCDF 与 HDF5 浏览器端科学数据可视化",
                "description":
                  "专业的 NetCDF 与 HDF5 科学数据文件查看与可视化工具，在浏览器端即时解析多维数组与层级结构，本地安全处理，支持丰富图表可视化。",
                "inLanguage": "zh-CN",
                "isPartOf": { "@id": "https://sci.spaceroute.cn/#website" },
                "primaryImageOfPage": {
                  "@type": "ImageObject",
                  "url": "https://sci.spaceroute.cn/og-image.png",
                  "width": 1200,
                  "height": 630,
                },
                "datePublished": "2025-01-01",
                "dateModified": "2025-07-31",
                "author": { "@id": "https://sci.spaceroute.cn/#organization" },
                "publisher": { "@id": "https://sci.spaceroute.cn/#organization" },
                "mainEntity": { "@id": "https://sci.spaceroute.cn/#webapplication" },
              },
              {
                "@type": "WebApplication",
                "@id": "https://sci.spaceroute.cn/#webapplication",
                "name": "NCView",
                "alternateName": "NCView - NetCDF / HDF5 可视化工具",
                "applicationCategory": "DeveloperApplication",
                "applicationSubCategory": "科学数据可视化工具",
                "operatingSystem": "任何（Web 浏览器）",
                "browserRequirements": "支持 WebAssembly 的现代浏览器",
                "softwareHelp": "https://sci.spaceroute.cn/",
                "softwareVersion": "1.0.0",
                "description":
                  "专业的 NetCDF 与 HDF5 科学数据文件查看与可视化工具，在浏览器端即时解析多维数组与层级结构，本地安全处理，支持丰富图表可视化。",
                "inLanguage": ["zh-CN", "en", "es"],
                "offers": [
                  {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "CNY",
                    "availability": "https://schema.org/InStock",
                  },
                ],
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "ratingCount": "256",
                  "bestRating": "5",
                  "worstRating": "1",
                },
                "featureList": [
                  "NetCDF 在线查看：支持 .nc / .netcdf / _nc / 压缩后缀，Magic Bytes 真实格式识别",
                  "HDF5 在线查看：基于 h5wasm，支持 .h5 / .hdf5 / .he5 层级结构浏览",
                  "100% 浏览器端本地解析：数据永不离开设备，彻底保障科研数据隐私",
                  "多维图表可视化：基于 ECharts，即时渲染 1D~4D 科学数据的线图/热力图/散点图/等高线",
                  "深色/浅色/自动 三档主题切换，专业的沉浸式科研视觉",
                  "中英西三语国际化：浏览器语言自动匹配，用户可手动切换并持久化",
                ],
                "fileFormat": [
                  "application/netcdf",
                  "application/x-netcdf",
                  "application/x-hdf5",
                  "application/x-hdf",
                ],
                "isAccessibleForFree": true,
                "url": "https://sci.spaceroute.cn/",
                "downloadUrl": "https://sci.spaceroute.cn/",
                "installUrl": "https://sci.spaceroute.cn/",
                "publisher": { "@id": "https://sci.spaceroute.cn/#organization" },
              },
              {
                "@type": "BreadcrumbList",
                "@id": "https://sci.spaceroute.cn/#breadcrumb",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "首页",
                    "item": "https://sci.spaceroute.cn/",
                  },
                ],
              },
            ],
          }),
        }}
      />
    </Box>
  );
}

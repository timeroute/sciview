'use client';

import { useState } from 'react';
import { Box, Card, Flex, Text, Heading, Code, Badge, ScrollArea } from '@radix-ui/themes';
import { FileInfo, Attribute, Variable } from '@/lib/parsers';
import DataVisualizer from './DataVisualizer';

function SectionHeader({ icon, title, count, accent = 'violet' }: { icon: React.ReactNode; title: string; count?: number; accent?: 'cyan' | 'violet' | 'emerald' }) {
  const accentColors = {
    cyan: 'rgba(34, 211, 238, 0.15)',
    violet: 'rgba(139, 92, 246, 0.15)',
    emerald: 'rgba(16, 185, 129, 0.15)',
  };
  const accentBorders = {
    cyan: 'rgba(34, 211, 238, 0.3)',
    violet: 'rgba(139, 92, 246, 0.3)',
    emerald: 'rgba(16, 185, 129, 0.3)',
  };
  const accentIconColors = {
    cyan: 'var(--accent-primary)',
    violet: 'var(--accent-violet)',
    emerald: 'var(--accent-emerald)',
  };

  return (
    <Flex gap="3" align="center" mb="3">
      <Box
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: accentColors[accent],
          border: `1px solid ${accentBorders[accent]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: accentIconColors[accent],
        }}
      >
        {icon}
      </Box>
      <Flex direction="column" gap="0" flexGrow="1">
        <Flex gap="3" align="center">
          <Heading
            size="4"
            weight="bold"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </Heading>
          {count !== undefined && (
            <Badge
              size="1"
              style={{
                background: accentColors[accent],
                border: `1px solid ${accentBorders[accent]}`,
                color: accentIconColors[accent],
                fontFamily: 'var(--font-mono)',
                borderRadius: '6px',
              }}
            >
              {count}
            </Badge>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}

function AttributeList({ attributes }: { attributes: Attribute[] }) {
  if (attributes.length === 0) {
    return (
      <Text
        size="2"
        style={{
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          fontFamily: 'var(--font-mono)',
        }}
      >
        无属性
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="2">
      {attributes.map((attr, i) => (
        <Flex
          key={i}
          gap="3"
          align="start"
          style={{
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Code
            color="cyan"
            size="2"
            weight="medium"
            style={{
              flexShrink: 0,
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
            }}
          >
            {attr.name}
          </Code>
          <Text
            size="2"
            style={{
              color: 'var(--text-secondary)',
              wordBreak: 'break-all',
              lineHeight: 1.5,
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              paddingTop: '2px',
            }}
          >
            {String(attr.value)}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}

function DatasetCard({ variable, index }: { variable: Variable; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const dimCount = variable.shape.filter(s => s > 0).length || 1;

  return (
    <Box
      className="card-enhanced animate-slide-up"
      style={{
        padding: '4px',
        animationDelay: `${Math.min(index * 0.04, 0.4)}s`,
      }}
    >
      <Box
        onClick={() => setExpanded(!expanded)}
        style={{
          cursor: 'pointer',
          padding: '16px 20px',
          borderRadius: '12px',
          transition: 'all 0.2s ease',
        }}
      >
        <Flex justify="between" align="start" gap="4">
          <Flex direction="column" gap="2" flexGrow="1" minWidth="0">
            <Flex gap="3" align="center" wrap="wrap">
              <Code
                size="3"
                weight="bold"
                style={{
                  fontFamily: 'var(--font-mono)',
                  padding: '6px 10px',
                  borderRadius: '8px',
                }}
              >
                {variable.name}
              </Code>
              <Flex gap="2" align="center" wrap="wrap">
                <Badge
                  size="1"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    color: 'var(--accent-violet)',
                    fontFamily: 'var(--font-mono)',
                    borderRadius: '6px',
                  }}
                >
                  {variable.type}
                </Badge>
                <Badge
                  size="1"
                  style={{
                    background: 'rgba(34, 211, 238, 0.1)',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                    color: 'var(--accent-primary)',
                    fontFamily: 'var(--font-mono)',
                    borderRadius: '6px',
                  }}
                >
                  {dimCount}D
                </Badge>
                {variable.attributes.length > 0 && (
                  <Badge
                    size="1"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: 'var(--accent-emerald)',
                      fontFamily: 'var(--font-mono)',
                      borderRadius: '6px',
                    }}
                  >
                    {variable.attributes.length} attr
                  </Badge>
                )}
              </Flex>
            </Flex>

            <Flex gap="2" align="center" wrap="wrap">
              <Text
                size="2"
                style={{
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                shape: [{variable.shape.join(', ')}]
              </Text>
            </Flex>
          </Flex>

          <Box
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: expanded
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(129, 140, 248, 0.15))'
                : 'var(--bg-tertiary)',
              border: `1px solid ${expanded ? 'rgba(139, 92, 246, 0.3)' : 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.3s ease',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              color: expanded ? 'var(--accent-violet)' : 'var(--text-tertiary)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </Box>
        </Flex>
      </Box>

      {expanded && (
        <Box
          style={{
            margin: '0 12px 12px 12px',
            padding: '20px',
            borderRadius: '12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderTop: '1px solid var(--border-medium)',
          }}
        >
          <Flex direction="column" gap="5">
            {/* 属性 */}
            {variable.attributes.length > 0 && (
              <Flex direction="column" gap="2">
                <Flex gap="2" align="center">
                  <Box
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--accent-primary)',
                    }}
                  />
                  <Text
                    size="2"
                    weight="medium"
                    style={{
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '11px',
                    }}
                  >
                    属性 / Attributes
                  </Text>
                </Flex>
                <AttributeList attributes={variable.attributes} />
              </Flex>
            )}

            {/* 数据预览 */}
            {variable.data && (
              <Flex direction="column" gap="2">
                <Flex gap="2" align="center" justify="between">
                  <Flex gap="2" align="center">
                    <Box
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--accent-emerald)',
                      }}
                    />
                    <Text
                      size="2"
                      weight="medium"
                      style={{
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '11px',
                      }}
                    >
                      数据预览 / Data Preview
                    </Text>
                  </Flex>
                  <Badge
                    size="1"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: 'var(--accent-emerald)',
                      fontFamily: 'var(--font-mono)',
                      borderRadius: '6px',
                    }}
                  >
                    JSON
                  </Badge>
                </Flex>
                <Box
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    background: 'rgba(16, 185, 129, 0.03)',
                  }}
                >
                  <ScrollArea style={{ maxHeight: '220px' }}>
                    <Box style={{ padding: '16px' }}>
                      <pre
                        style={{
                          margin: 0,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          lineHeight: 1.7,
                          color: 'var(--text-secondary)',
                          whiteSpace: 'pre',
                          wordBreak: 'break-all',
                        }}
                      >
                        {JSON.stringify(variable.data, null, 2)}
                      </pre>
                    </Box>
                  </ScrollArea>
                </Box>
              </Flex>
            )}
          </Flex>
        </Box>
      )}
    </Box>
  );
}

export default function HDF5Viewer({ fileInfo }: { fileInfo: FileInfo }) {
  return (
    <Flex direction="column" gap="6">
      {/* 顶部：格式 + 全局属性 + 可视化按钮 */}
      <Flex direction="column" gap="5" style={{ display: 'grid', gridTemplateColumns: '340px 1fr' }}>
        {/* 左侧：格式卡片 + 全局属性 */}
        <Flex direction="column" gap="5">
          {/* 格式卡片 */}
          <Card
            className="card-enhanced animate-slide-up"
            style={{
              padding: '4px',
            }}
          >
            <Box
              style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(129, 140, 248, 0.08) 100%)',
              }}
            >
              <Flex gap="4" align="center">
                <Box
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(129, 140, 248, 0.2))',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-violet)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </Box>
                <Flex direction="column" gap="1">
                  <Text
                    size="2"
                    style={{
                      color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    文件格式
                  </Text>
                  <Heading
                    size="5"
                    weight="bold"
                    style={{
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.01em',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #c084fc 50%, #818cf8 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundSize: '200% 200%',
                      animation: 'gradient-shift 4s ease infinite',
                    }}
                  >
                    {fileInfo.format.toUpperCase()}
                  </Heading>
                </Flex>
              </Flex>
            </Box>
          </Card>

          {/* 全局属性 */}
          {fileInfo.globalAttributes.length > 0 && (
            <Card
              className="card-enhanced animate-slide-up stagger-1"
              style={{
                padding: '20px',
              }}
            >
              <SectionHeader
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                }
                title="全局属性"
                count={fileInfo.globalAttributes.length}
                accent="cyan"
              />
              <AttributeList attributes={fileInfo.globalAttributes} />
            </Card>
          )}

          {/* 维度 */}
          {fileInfo.dimensions.length > 0 && (
            <Card
              className="card-enhanced animate-slide-up stagger-2"
              style={{
                padding: '20px',
              }}
            >
              <SectionHeader
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                }
                title="命名维度"
                count={fileInfo.dimensions.length}
                accent="violet"
              />
              <Flex direction="column" gap="2">
                {fileInfo.dimensions.map((dim, i) => (
                  <Flex
                    key={i}
                    justify="between"
                    align="center"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      animationDelay: `${i * 0.05}s`,
                    }}
                    className="animate-slide-up"
                  >
                    <Flex gap="3" align="center">
                      <Box
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--accent-violet)',
                          boxShadow: '0 0 8px var(--accent-violet)',
                        }}
                      />
                      <Code
                        color="violet"
                        size="2"
                        weight="medium"
                        style={{
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {dim.name}
                      </Code>
                    </Flex>
                    <Badge
                      size="1"
                      style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        color: 'var(--accent-violet)',
                        fontFamily: 'var(--font-mono)',
                        borderRadius: '6px',
                        minWidth: '52px',
                        textAlign: 'center',
                      }}
                    >
                      {dim.size}
                    </Badge>
                  </Flex>
                ))}
              </Flex>
            </Card>
          )}
        </Flex>

        {/* 右侧：数据集列表头部 + 可视化 */}
        <Flex direction="column" gap="4">
          <Card
            className="card-enhanced animate-slide-up stagger-1"
            style={{
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <SectionHeader
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              }
              title="数据集"
              count={fileInfo.variables.length}
              accent="violet"
            />
            <Box style={{ marginTop: 0 }}>
              <DataVisualizer variables={fileInfo.variables} />
            </Box>
          </Card>
        </Flex>
      </Flex>

      {/* 数据集卡片列表 */}
      <Flex direction="column" gap="3">
        {fileInfo.variables.map((v, i) => (
          <DatasetCard key={i} variable={v} index={i} />
        ))}
      </Flex>

      <style jsx global>{`
        @media (max-width: 960px) {
          .HDF5Viewer {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Flex>
  );
}

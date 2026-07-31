'use client';

import { useState } from 'react';
import { Box, Text, Callout, Flex } from '@radix-ui/themes';
import { parseFile, FileInfo } from '@/lib/parsers';

interface FileUploaderProps {
  onFileLoaded: (info: FileInfo) => void;
  acceptFormats?: string;
}

export default function FileUploader({ onFileLoaded, acceptFormats = ".nc,.netcdf,.h5,.hdf5,.hdf,.he5" }: FileUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const info = await parseFile(file);
      onFileLoaded(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const formatLabel = acceptFormats.split(',').map(f => f.trim()).join(' · ');
  const inputId = `file-upload-${acceptFormats.replace(/[.,]/g, '-')}`;

  return (
    <Box>
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
          background: dragging
            ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)'
            : 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `2px ${dragging ? 'solid' : 'dashed'} ${dragging ? 'rgba(34, 211, 238, 0.6)' : 'var(--border-medium)'}`,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: dragging
            ? '0 0 60px rgba(34, 211, 238, 0.15), 0 20px 60px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.25)',
        }}
        className={dragging ? 'animate-border-glow' : ''}
      >
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            background: dragging
              ? 'radial-gradient(ellipse at 50% 0%, rgba(34, 211, 238, 0.12) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 50% 0%, rgba(148, 163, 184, 0.04) 0%, transparent 50%)',
            pointerEvents: 'none',
            transition: 'all 0.4s ease',
          }}
        />

        <Box
          style={{
            position: 'absolute',
            inset: 0,
            opacity: dragging ? 0.08 : 0.03,
            backgroundImage:
              'linear-gradient(rgba(148, 163, 184, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
            transition: 'opacity 0.4s ease',
          }}
        />

        <input
          type="file"
          accept={acceptFormats}
          onChange={handleFile}
          style={{ display: 'none' }}
          id={inputId}
          disabled={loading}
        />

        <label
          htmlFor={inputId}
          style={{
            cursor: loading ? 'progress' : 'pointer',
            display: 'block',
            padding: '64px 40px',
            position: 'relative',
          }}
        >
          <Flex
            direction="column"
            align="center"
            gap="5"
            style={{
              position: 'relative',
              pointerEvents: 'none',
            }}
          >
            <Box
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                background: loading
                  ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.15))'
                  : dragging
                  ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.25), rgba(139, 92, 246, 0.2))'
                  : 'var(--bg-tertiary)',
                border: `1.5px solid ${dragging || loading ? 'rgba(34, 211, 238, 0.4)' : 'var(--border-subtle)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: dragging ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
                boxShadow: dragging || loading
                  ? '0 8px 32px rgba(34, 211, 238, 0.2)'
                  : '0 4px 16px rgba(0, 0, 0, 0.3)',
              }}
              className={!loading && !dragging ? 'animate-float' : ''}
            >
              {loading ? (
                <Box
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '3px solid rgba(34, 211, 238, 0.2)',
                    borderTopColor: 'var(--accent-primary)',
                    borderRightColor: 'var(--accent-secondary)',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              ) : dragging ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#drg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="drg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17,8 12,3 7,8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
            </Box>

            <Flex direction="column" gap="2" align="center">
              <Text
                size="5"
                weight="bold"
                style={{
                  color: dragging ? 'var(--accent-primary)' : loading ? 'var(--accent-secondary)' : 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.3s ease',
                }}
              >
                {loading
                  ? '正在解析数据文件...'
                  : dragging
                  ? '释放以开始上传'
                  : '点击选择文件或拖拽到此处'}
              </Text>
              <Text
                size="3"
                style={{
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.6,
                  textAlign: 'center',
                }}
              >
                {loading
                  ? '请稍候，正在读取文件内容和元数据'
                  : `支持格式：${formatLabel}`}
              </Text>
            </Flex>

            <Flex gap="3" align="center" style={{ marginTop: '8px' }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  background: loading
                    ? 'rgba(139, 92, 246, 0.08)'
                    : 'rgba(16, 185, 129, 0.06)',
                  border: `1px solid ${loading ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.15)'}`,
                }}
              >
                {loading ? (
                  <span
                    className="data-dot"
                    style={{
                      width: '6px',
                      height: '6px',
                      background: 'var(--accent-violet)',
                      boxShadow: '0 0 12px var(--accent-violet)',
                    }}
                  />
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={dragging ? 'var(--accent-primary)' : 'var(--accent-emerald)'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {dragging ? (
                      <path d="M5 12h14M12 5v14" />
                    ) : (
                      <path d="M20 6L9 17l-5-5" />
                    )}
                  </svg>
                )}
                <Text
                  size="2"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: loading ? 'var(--accent-violet)' : dragging ? 'var(--accent-primary)' : 'var(--accent-emerald)',
                  }}
                >
                  {loading ? '解析中...' : dragging ? '准备就绪' : '本地处理，数据安全'}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </label>
      </Box>

      {error && (
        <Callout.Root
          color="red"
          style={{
            marginTop: '24px',
            borderRadius: '14px',
            padding: '16px 20px',
            background: 'rgba(239, 68, 68, 0.06)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Flex gap="3" align="start">
            <Box
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(239, 68, 68, 0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </Box>
            <Flex direction="column" gap="1">
              <Text size="3" weight="medium" style={{ color: 'rgba(254, 202, 202, 0.95)' }}>
                文件解析失败
              </Text>
              <Callout.Text style={{ color: 'rgba(252, 165, 165, 0.8)', lineHeight: 1.6 }}>
                {error}
              </Callout.Text>
            </Flex>
          </Flex>
        </Callout.Root>
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}

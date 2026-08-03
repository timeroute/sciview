'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Flex, Text, Box, Badge } from '@radix-ui/themes';
import { parseFile } from '@/lib/parsers';
import type { FileInfo } from '@/lib/parsers';
import { useI18n } from '@/lib/i18n';

interface FileUploaderProps {
  onFileLoaded: (fileInfo: FileInfo) => void;
  acceptFormats?: string;
}

export default function FileUploader({ onFileLoaded, acceptFormats }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, formatFileSize } = useI18n();

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsParsing(true);
    try {
      const info = await parseFile(file);
      onFileLoaded(info);
    } catch (err: any) {
      console.error('解析文件失败:', err);
      setError(err?.message || t('upload.unknownError'));
    } finally {
      setIsParsing(false);
    }
  }, [onFileLoaded, t]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onClick = () => inputRef.current?.click();

  return (
    <Flex direction="column" gap="3">
      <Box
        onClick={onClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          cursor: isParsing ? 'wait' : 'pointer',
          borderRadius: '16px',
          border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-medium)'}`,
          background: isDragging
            ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.06), rgba(139, 92, 246, 0.04))'
            : 'var(--bg-card)',
          padding: '40px 24px',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isDragging && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.08), transparent 70%)',
              pointerEvents: 'none',
            }}
          />
        )}

        <input
          ref={inputRef}
          type="file"
          accept={acceptFormats}
          onChange={onChange}
          style={{ display: 'none' }}
        />

        <Flex direction="column" gap="4" align="center" style={{ position: 'relative', zIndex: 1 }}>
          <Flex
            justify="center"
            align="center"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: isParsing
                ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(139, 92, 246, 0.15))'
                : 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              transition: 'all 0.25s ease',
              animation: isParsing ? 'pulse 2s ease-in-out infinite' : undefined,
            }}
          >
            {isParsing ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke="var(--accent-primary)" strokeWidth="2.5" opacity="0.25" />
                <path d="M12 2a10 10 0 0110 10" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
          </Flex>

          <Flex direction="column" gap="1" align="center">
            <Text
              size="4"
              weight="medium"
              style={{
                color: isParsing ? 'var(--accent-primary)' : 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.01em',
              }}
            >
              {isParsing ? t('upload.parsing') : t('upload.primary')}
            </Text>
            <Text
              size="2"
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}
            >
              {t('upload.secondary')}
            </Text>
          </Flex>

          <Flex gap="2" wrap="wrap" justify="center" mt="2">
            {(acceptFormats || '.nc,.netcdf,.h5,.hdf5,.hdf,.he5')
              .split(',')
              .filter(Boolean)
              .map(fmt => (
                <Badge
                  key={fmt}
                  size="1"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {fmt}
                </Badge>
              ))}
          </Flex>
        </Flex>
      </Box>

      {error && (
        <Flex
          gap="3"
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            animation: 'shake 0.4s ease-in-out',
          }}
        >
          <Box
            style={{
              width: '20px',
              height: '20px',
              flexShrink: 0,
              borderRadius: '999px',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-red)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </Box>
          <Text size="2" style={{ color: 'var(--accent-red)', lineHeight: 1.6 }}>
            {error}
          </Text>
        </Flex>
      )}

      <Flex justify="center">
        <Text
          size="1"
          style={{
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {t('upload.sizeLimit', { size: formatFileSize(256 * 1024 * 1024) })}
        </Text>
      </Flex>
    </Flex>
  );
}

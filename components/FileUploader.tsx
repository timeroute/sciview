'use client';

import { useState } from 'react';
import { Box, Text, Callout } from '@radix-ui/themes';
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

  return (
    <Box>
      <Box 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ 
          border: `2px dashed ${dragging ? 'var(--accent-9)' : 'var(--gray-7)'}`, 
          borderRadius: 'var(--radius-3)', 
          padding: 'var(--space-8)', 
          textAlign: 'center',
          backgroundColor: dragging ? 'var(--accent-2)' : 'transparent',
          transition: 'all 0.2s'
        }}
      >
        <input
          type="file"
          accept={acceptFormats}
          onChange={handleFile}
          style={{ display: 'none' }}
          id={`file-upload-${acceptFormats}`}
          disabled={loading}
        />
        <label htmlFor={`file-upload-${acceptFormats}`} style={{ cursor: 'pointer' }}>
          <Text color="gray">
            {loading ? '加载中...' : '点击或拖拽上传文件'}
          </Text>
          <Text size="2" color="gray" style={{ display: 'block', marginTop: 'var(--space-2)' }}>
            支持 {acceptFormats}
          </Text>
        </label>
      </Box>
      {error && (
        <Callout.Root color="red" style={{ marginTop: 'var(--space-4)' }}>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
    </Box>
  );
}

'use client';

import { useState } from 'react';
import { Container, Heading, Flex, Button } from '@radix-ui/themes';
import Link from 'next/link';
import FileUploader from '@/components/FileUploader';
import FileViewer from '@/components/FileViewer';
import { FileInfo } from '@/lib/parsers';

export default function NetCDFPage() {
  const [file, setFile] = useState<FileInfo | null>(null);

  return (
    <Container size="4" p="8">
      <Flex direction="column" gap="6">
        <Flex justify="between" align="center">
          <Heading size="8">NetCDF Viewer</Heading>
          <Link href="/">
            <Button variant="soft">← 返回</Button>
          </Link>
        </Flex>
        <FileUploader onFileLoaded={setFile} acceptFormats=".nc,.netcdf" />
        {file && <FileViewer fileInfo={file} />}
      </Flex>
    </Container>
  );
}

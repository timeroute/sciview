'use client';

import { useState } from 'react';
import { Container, Heading, Flex, Button } from '@radix-ui/themes';
import Link from 'next/link';
import FileUploader from '@/components/FileUploader';
import HDF5Viewer from '@/components/HDF5Viewer';
import { FileInfo } from '@/lib/parsers';

export default function HDF5Page() {
  const [file, setFile] = useState<FileInfo | null>(null);

  return (
    <Container size="4" p="8">
      <Flex direction="column" gap="6">
        <Flex justify="between" align="center">
          <Heading size="8">HDF5 Viewer</Heading>
          <Link href="/">
            <Button variant="soft">← 返回</Button>
          </Link>
        </Flex>
        <FileUploader onFileLoaded={setFile} acceptFormats=".h5,.hdf5,.hdf,.he5" />
        {file && <HDF5Viewer fileInfo={file} />}
      </Flex>
    </Container>
  );
}

'use client';

import { useState } from 'react';
import { Box, Card, Flex, Text, Heading, Code, ScrollArea } from '@radix-ui/themes';
import { FileInfo, Attribute, Variable } from '@/lib/parsers';

function AttributeList({ attributes }: { attributes: Attribute[] }) {
  if (attributes.length === 0) return <Text color="gray">无属性</Text>;
  
  return (
    <Flex direction="column" gap="1">
      {attributes.map((attr, i) => (
        <Flex key={i} gap="2" align="start">
          <Code color="blue">{attr.name}:</Code>
          <Text size="2" style={{ wordBreak: 'break-all' }}>{String(attr.value)}</Text>
        </Flex>
      ))}
    </Flex>
  );
}

function DatasetCard({ variable }: { variable: Variable }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card>
      <Box onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        <Flex justify="between" align="center">
          <Code size="3" weight="bold">{variable.name}</Code>
          <Text color="gray">{expanded ? '▼' : '▶'}</Text>
        </Flex>
        <Text size="2" color="gray">
          {variable.type} • shape: [{variable.shape.join(', ')}]
        </Text>
      </Box>
      
      {expanded && (
        <Box mt="3" pt="3" style={{ borderTop: '1px solid var(--gray-5)' }}>
          <Flex direction="column" gap="2">
            {variable.attributes.length > 0 && (
              <Box>
                <Text size="2" color="gray" mb="1">属性:</Text>
                <AttributeList attributes={variable.attributes} />
              </Box>
            )}
            {variable.data && (
              <Box>
                <Text size="2" color="gray" mb="1">数据预览:</Text>
                <ScrollArea style={{ maxHeight: 160 }}>
                  <Code size="1" style={{ display: 'block', whiteSpace: 'pre' }}>
                    {JSON.stringify(variable.data, null, 2)}
                  </Code>
                </ScrollArea>
              </Box>
            )}
          </Flex>
        </Box>
      )}
    </Card>
  );
}

export default function HDF5Viewer({ fileInfo }: { fileInfo: FileInfo }) {
  return (
    <Flex direction="column" gap="4">
      <Card>
        <Heading size="4">格式: {fileInfo.format.toUpperCase()}</Heading>
      </Card>

      <Box>
        <Heading size="3" mb="3">数据集 ({fileInfo.variables.length})</Heading>
        <Flex direction="column" gap="2">
          {fileInfo.variables.map((v, i) => (
            <DatasetCard key={i} variable={v} />
          ))}
        </Flex>
      </Box>
    </Flex>
  );
}

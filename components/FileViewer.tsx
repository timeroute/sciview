'use client';

import { useState } from 'react';
import { Box, Card, Flex, Text, Heading, Section, Code } from '@radix-ui/themes';
import { FileInfo, Attribute, Variable } from '@/lib/parsers';
import DataVisualizer from './DataVisualizer';

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

function VariableCard({ variable }: { variable: Variable }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card>
      <Box onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        <Flex justify="between" align="center">
          <Code size="4" weight="bold">{variable.name}</Code>
          <Text color="gray">{expanded ? '▼' : '▶'}</Text>
        </Flex>
        <Text size="2" color="gray">
          {variable.type} • [{variable.shape.join(', ')}]
        </Text>
      </Box>
      
      {expanded && (
        <Box mt="3" pt="3" style={{ borderTop: '1px solid var(--gray-5)' }}>
          <Flex direction="column" gap="2">
            <Text size="2"><Text color="gray">维度:</Text> {variable.dimensions.join(', ') || '标量'}</Text>
            {variable.attributes.length > 0 && (
              <Box>
                <Text size="2" color="gray" mb="1">属性:</Text>
                <AttributeList attributes={variable.attributes} />
              </Box>
            )}
            {variable.data && (
              <Box>
                <Text size="2" color="gray" mb="1">数据预览:</Text>
                <Box style={{ maxHeight: 160, overflowY: 'auto' }}>
                  <Code size="1" style={{ display: 'block', whiteSpace: 'pre' }}>
                    {JSON.stringify(variable.data, null, 2)}
                  </Code>
                </Box>
              </Box>
            )}
          </Flex>
        </Box>
      )}
    </Card>
  );
}

export default function FileViewer({ fileInfo }: { fileInfo: FileInfo }) {
  return (
    <Flex gap="4">
      <Box style={{ width: '33%' }}>
        <Flex direction="column" gap="4" pr="2">
          <Card>
            <Heading size="4">格式: {fileInfo.format.toUpperCase()}</Heading>
          </Card>

          <Section size="1">
            <Heading size="3" mb="2">全局属性</Heading>
            <Card>
              <AttributeList attributes={fileInfo.globalAttributes} />
            </Card>
          </Section>

          <Section size="1">
            <Heading size="3" mb="2">维度 ({fileInfo.dimensions.length})</Heading>
            <Card>
              <Flex direction="column" gap="1">
                {fileInfo.dimensions.map((dim, i) => (
                  <Flex key={i} gap="2">
                    <Code color="purple">{dim.name}:</Code>
                    <Text size="2">{dim.size}</Text>
                  </Flex>
                ))}
              </Flex>
            </Card>
          </Section>
        </Flex>
      </Box>

      <Box style={{ flex: 1 }}>
        <Flex justify="between" align="center" mb="3">
          <Heading size="3">变量 ({fileInfo.variables.length})</Heading>
          <DataVisualizer variables={fileInfo.variables} />
        </Flex>
        <Flex direction="column" gap="2">
          {fileInfo.variables.map((v, i) => (
            <VariableCard key={i} variable={v} />
          ))}
        </Flex>
      </Box>
    </Flex>
  );
}

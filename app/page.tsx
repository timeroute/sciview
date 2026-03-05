import { Container, Heading, Text, Flex, Card, Grid } from '@radix-ui/themes';
import Link from 'next/link';

const tools = [
  {
    name: 'NetCDF Viewer',
    description: '查看 NetCDF 文件的元数据、维度和变量',
    href: '/netcdf',
    icon: '📊'
  },
  {
    name: 'HDF5 Viewer',
    description: '查看 HDF5 文件的数据集、属性和组结构',
    href: '/hdf5',
    icon: '📁'
  }
];

export default function Home() {
  return (
    <Container size="4" p="8">
      <Flex direction="column" gap="6">
        <header>
          <Heading size="8" mb="2">科学数据查看器</Heading>
          <Text color="gray">选择一个工具开始</Text>
        </header>

        <Grid columns="2" gap="4">
          {tools.map(tool => (
            <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
              <Card asChild style={{ cursor: 'pointer', height: '100%' }}>
                <Flex direction="column" gap="2" p="4">
                  <Text size="8">{tool.icon}</Text>
                  <Heading size="5">{tool.name}</Heading>
                  <Text color="gray" size="2">{tool.description}</Text>
                </Flex>
              </Card>
            </Link>
          ))}
        </Grid>
      </Flex>
    </Container>
  );
}

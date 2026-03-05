'use client';

import { Variable } from '@/lib/parsers';
import ReactECharts from 'echarts-for-react';
import { Box, Flex, Text, Button, Select, Dialog } from '@radix-ui/themes';
import { useState } from 'react';

interface DataVisualizerProps {
  variables: Variable[];
}

export default function DataVisualizer({ variables }: DataVisualizerProps) {
  const [open, setOpen] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'heatmap'>('line');
  const [xVar, setXVar] = useState<string>('');
  const [yVar, setYVar] = useState<string>('');

  // 判断变量维度
  const getVarDimension = (v: Variable): number => {
    if (!Array.isArray(v.data) || v.data.length === 0) return 0;
    if (typeof v.data[0] === 'number') return 1;
    if (Array.isArray(v.data[0])) return 2;
    return 0;
  };

  const vars1D = variables.filter(v => getVarDimension(v) === 1);
  const vars2D = variables.filter(v => getVarDimension(v) === 2);

  const canPlot = () => {
    const xDim = xVar ? getVarDimension(variables.find(v => v.name === xVar)!) : 0;
    const yDim = yVar ? getVarDimension(variables.find(v => v.name === yVar)!) : 0;
    
    // 1D x 1D 或单个 2D
    return (xDim === 1 && yDim === 1) || (xDim === 0 && yDim === 2);
  };

  const getChartOption = () => {
    const xVariable = variables.find(v => v.name === xVar);
    const yVariable = variables.find(v => v.name === yVar);
    
    // 2D 热力图
    if (!xVariable && yVariable && getVarDimension(yVariable) === 2) {
      const data2D = yVariable.data as number[][];
      const heatmapData: [number, number, number][] = [];
      
      data2D.forEach((row, i) => {
        row.forEach((val, j) => {
          heatmapData.push([j, i, val]);
        });
      });
      
      return {
        tooltip: {
          position: 'top'
        },
        toolbox: {
          feature: {
            saveAsImage: { title: '下载图片' }
          }
        },
        grid: {
          height: '70%',
          top: '10%'
        },
        xAxis: {
          type: 'category',
          data: Array.from({ length: data2D[0]?.length || 0 }, (_, i) => i)
        },
        yAxis: {
          type: 'category',
          data: Array.from({ length: data2D.length }, (_, i) => i)
        },
        visualMap: {
          min: Math.min(...heatmapData.map(d => d[2])),
          max: Math.max(...heatmapData.map(d => d[2])),
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '5%'
        },
        series: [{
          name: yVar,
          type: 'heatmap',
          data: heatmapData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
    }
    
    // 1D x 1D 折线图/柱状图
    if (!xVariable?.data || !yVariable?.data) return {};
    
    const xData = xVariable.data as number[];
    const yData = yVariable.data as number[];
    const length = Math.min(xData.length, yData.length);
    
    const data = Array.from({ length }, (_, i) => [xData[i], yData[i]]);
    
    return {
      tooltip: {
        trigger: 'axis'
      },
      toolbox: {
        feature: {
          saveAsImage: { title: '下载图片' }
        }
      },
      xAxis: {
        type: 'value',
        name: xVar
      },
      yAxis: {
        type: 'value',
        name: yVar
      },
      series: [{
        type: chartType,
        data,
        name: yVar
      }]
    };
  };

  const is2DMode = !xVar && yVar && getVarDimension(variables.find(v => v.name === yVar)!) === 2;

  return (
    <>
      <Button onClick={() => setOpen(true)}>绘制图表</Button>
      
      <Dialog.Root open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setXVar('');
          setYVar('');
        }
      }}>
        <Dialog.Content style={{ maxWidth: 800 }}>
          <Dialog.Title>数据可视化</Dialog.Title>
          
          <Flex direction="column" gap="3" mt="3">
            {!is2DMode && (
              <Flex gap="3" align="center">
                <Text size="2" style={{ width: 60 }}>X 轴:</Text>
                <Select.Root value={xVar} onValueChange={setXVar}>
                  <Select.Trigger placeholder="选择变量 (1D)" style={{ flex: 1 }} />
                  <Select.Content>
                    {vars1D.map(v => (
                      <Select.Item key={v.name} value={v.name}>{v.name}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Flex>
            )}
            
            <Flex gap="3" align="center">
              <Text size="2" style={{ width: 60 }}>Y 轴:</Text>
              <Select.Root value={yVar} onValueChange={(v) => { setYVar(v); if (getVarDimension(variables.find(vr => vr.name === v)!) === 2) setXVar(''); }}>
                <Select.Trigger placeholder="选择变量" style={{ flex: 1 }} />
                <Select.Content>
                  <Select.Group>
                    <Select.Label>1D 变量</Select.Label>
                    {vars1D.map(v => (
                      <Select.Item key={v.name} value={v.name}>{v.name}</Select.Item>
                    ))}
                  </Select.Group>
                  <Select.Separator />
                  <Select.Group>
                    <Select.Label>2D 变量</Select.Label>
                    {vars2D.map(v => (
                      <Select.Item key={v.name} value={v.name}>{v.name}</Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </Flex>
            
            {!is2DMode && (
              <Flex gap="3" align="center">
                <Text size="2" style={{ width: 60 }}>图表类型:</Text>
                <Select.Root value={chartType} onValueChange={(v) => setChartType(v as any)}>
                  <Select.Trigger style={{ flex: 1 }} />
                  <Select.Content>
                    <Select.Item value="line">折线图</Select.Item>
                    <Select.Item value="bar">柱状图</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>
            )}
            
            {canPlot() ? (
              <Box mt="3">
                <ReactECharts option={getChartOption()} style={{ height: 400 }} />
              </Box>
            ) : yVar && (
              <Text color="red" size="2">不支持的数据维度组合</Text>
            )}
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

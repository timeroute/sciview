'use client';

import { Variable } from '@/lib/parsers';
import ReactECharts from 'echarts-for-react';
import { Box, Flex, Text, Button, Select, Dialog, Badge, Callout } from '@radix-ui/themes';
import { useState } from 'react';
import {
  downsample1D,
  downsample2D,
  safeMinMax,
  PLOT_1D_THRESHOLD,
  PLOT_2D_MAX,
  DownsampleStrategy,
} from '@/lib/downsample';

interface DataVisualizerProps {
  variables: Variable[];
}

export default function DataVisualizer({ variables }: DataVisualizerProps) {
  const [open, setOpen] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'heatmap'>('line');
  const [xVar, setXVar] = useState<string>('');
  const [yVar, setYVar] = useState<string>('');
  const [strategy, setStrategy] = useState<DownsampleStrategy>('lttb');

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
    return (xDim === 1 && yDim === 1) || (xDim === 0 && yDim === 2);
  };

  // 最近一次绘图的采样状态（用于 UI 提示条显示）
  let sampleInfoText: string | null = null;
  let sampleLevel: "info" | "warn" = "info";
  void sampleLevel;

  const getChartOption = () => {
    const xVariable = variables.find(v => v.name === xVar);
    const yVariable = variables.find(v => v.name === yVar);

    // 深色主题配色
    const axisStyle = {
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisTick: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisLabel: { color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: 11 },
      nameTextStyle: { color: '#94a3b8', fontFamily: 'var(--font-body)', fontSize: 12, padding: [0, 0, 8, 0] },
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.08)', type: 'dashed' } },
    };

    if (!xVariable && yVariable && getVarDimension(yVariable) === 2) {
      const data2D = yVariable.data as number[][];
      // ====== 2D 热力图：分桶降采样到 400×400 以内，避免 145 万 cell 卡死 ======
      const d2 = downsample2D(
        data2D,
        PLOT_2D_MAX.rows,
        PLOT_2D_MAX.cols,
        "avg"
      );
      const heatmapData = d2.data;

      if (d2.sampled) {
        sampleInfoText = `原始 ${d2.originalCells.toLocaleString()} 个单元 → 已降采样到 ${d2.sampledCells.toLocaleString()} 个显示（${d2.rows}×${d2.cols}）`;
        sampleLevel = "info";
      } else {
        sampleInfoText = null;
      }

      return {
        backgroundColor: 'transparent',
        tooltip: {
          position: 'top',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(34, 211, 238, 0.3)',
          borderWidth: 1,
          textStyle: { color: '#f1f5f9', fontFamily: 'var(--font-mono)', fontSize: 12 },
          formatter: (params: any) => {
            return `<div style="padding: 4px;"><span style="color:#22d3ee">x:</span> ${params.data[0]}<br/><span style="color:#818cf8">y:</span> ${params.data[1]}<br/><span style="color:#c084fc">value:</span> <b>${params.data[2]}</b></div>`;
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {
              title: '下载图片',
              iconStyle: { borderColor: '#64748b' },
              emphasis: { iconStyle: { borderColor: '#22d3ee', textFill: '#22d3ee' } }
            }
          },
          right: 16,
          top: 12,
        },
        grid: {
          height: '62%',
          top: '12%',
          left: 56,
          right: 32,
        },
        xAxis: {
          type: 'category',
          data: Array.from({ length: d2.cols }, (_, i) => i),
          ...axisStyle,
        },
        yAxis: {
          type: 'category',
          data: Array.from({ length: d2.rows }, (_, i) => i),
          ...axisStyle,
        },
        visualMap: {
          // 使用迭代法求极值，避免 Math.min(...1e6) 爆栈
          min: d2.min,
          max: d2.max,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '2%',
          textStyle: { color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: 11 },
          inRange: {
            color: ['#0e7490', '#22d3ee', '#818cf8', '#a78bfa', '#c084fc']
          }
        },
        series: [{
          name: yVar,
          type: 'heatmap',
          data: heatmapData,
          progressive: 5000,
          progressiveThreshold: 8000,
          large: true,
          largeThreshold: 2000,
          emphasis: d2.sampled
            ? undefined  // 大数据量关闭 hover 高亮，避免卡
            : {
                itemStyle: {
                  shadowBlur: 20,
                  shadowColor: 'rgba(34, 211, 238, 0.4)',
                  borderColor: '#22d3ee',
                  borderWidth: 1,
                }
              }
        }]
      };
    }

    if (!xVariable?.data || !yVariable?.data) return {};

    const xData = xVariable.data as number[];
    const yData = yVariable.data as number[];
    const length = Math.min(xData.length, yData.length);

    // ====== 1D 折线/柱状图：超阈值自动降采样 ======
    const threshold =
      chartType === "line" ? PLOT_1D_THRESHOLD.line :
      chartType === "bar" ? PLOT_1D_THRESHOLD.bar :
      PLOT_1D_THRESHOLD.scatter;
    const pickedStrategy = chartType === "line" ? strategy : "uniform";
    const d1 = downsample1D(xData, yData, threshold, pickedStrategy);
    const data = d1.data;
    const sampledLength = d1.sampledLength;

    if (d1.sampled) {
      const strategyLabel =
        pickedStrategy === "lttb" ? "LTTB（三角保真）" :
        pickedStrategy === "minmax" ? "Min-Max（保留极值）" : "均匀采样";
      sampleInfoText = `原始 ${d1.originalLength.toLocaleString()} 点 → 已用 ${strategyLabel} 降采样到 ${d1.sampledLength.toLocaleString()} 点显示（极值保留）`;
      sampleLevel = length >= 500_000 ? "warn" : "info";
    } else {
      sampleInfoText = null;
    }

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(34, 211, 238, 0.3)',
        borderWidth: 1,
        textStyle: { color: '#f1f5f9', fontFamily: 'var(--font-mono)', fontSize: 12 },
        axisPointer: {
          lineStyle: { color: 'rgba(34, 211, 238, 0.4)', type: 'dashed' },
          crossStyle: { color: 'rgba(34, 211, 238, 0.4)' }
        }
      },
      toolbox: {
        feature: {
          saveAsImage: {
            title: '下载图片',
            iconStyle: { borderColor: '#64748b' },
            emphasis: { iconStyle: { borderColor: '#22d3ee', textFill: '#22d3ee' } }
          }
        },
        right: 16,
        top: 12,
      },
      grid: {
        left: 64,
        right: 32,
        top: 56,
        bottom: 56,
      },
      dataZoom: d1.sampled
        ? [
            { type: "inside", throttle: 50 },
            { type: "slider", height: 22, bottom: 12, borderColor: "transparent", textStyle: { color: "#94a3b8" } },
          ]
        : length > 2000
        ? [{ type: "inside", throttle: 80 }]
        : undefined,
      xAxis: {
        type: 'value',
        name: xVar,
        ...axisStyle,
      },
      yAxis: {
        type: 'value',
        name: yVar,
        ...axisStyle,
      },
      series: [{
        type: chartType,
        data,
        name: yVar,
        // 大数据量下：强制关闭 smooth 贝塞尔、关闭 symbol、开启 large 模式，避免百万级渲染卡死
        smooth: chartType === 'line' && !d1.sampled && length <= 2000,
        symbol: 'circle',
        symbolSize: chartType === 'line' ? (d1.sampled ? 2 : 6) : 0,
        showSymbol: chartType === 'line' && sampledLength <= 120,
        sampling: d1.sampled ? "lttb" : chartType === "line" ? "lttb" : undefined,
        large: d1.sampled,
        largeThreshold: 2000,
        progressive: 2000,
        progressiveThreshold: 5000,
        ...(chartType === 'line' ? {
          lineStyle: {
            width: d1.sampled ? 1.5 : 2.5,
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#22d3ee' },
                { offset: 0.5, color: '#818cf8' },
                { offset: 1, color: '#c084fc' },
              ]
            },
            shadowColor: d1.sampled ? 'transparent' : 'rgba(34, 211, 238, 0.3)',
            shadowBlur: d1.sampled ? 0 : 10,
          },
          itemStyle: {
            color: '#22d3ee',
            borderColor: '#ffffff',
            borderWidth: d1.sampled ? 0 : 1.5,
          },
          areaStyle: d1.sampled
            ? undefined  // 大数据量关闭渐变填充（太吃 GPU）
            : {
                opacity: 0.15,
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(34, 211, 238, 0.4)' },
                    { offset: 1, color: 'rgba(34, 211, 238, 0)' },
                  ]
                }
              }
        } : {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#22d3ee' },
                { offset: 1, color: '#818cf8' },
              ]
            },
            borderRadius: [4, 4, 0, 0],
            borderColor: 'rgba(34, 211, 238, 0.3)',
            borderWidth: 1,
          }
        })
      }]
    };
  };

  const is2DMode = !xVar && yVar && getVarDimension(variables.find(v => v.name === yVar)!) === 2;
  const hasPlot = canPlot();
  // 先调用一次以刷新 sampleInfoText（否则首次渲染不会显示信息条）
  if (hasPlot) getChartOption();

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        style={{
          borderRadius: '10px',
          padding: '0 20px',
          height: '40px',
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(139, 92, 246, 0.15))',
          border: '1px solid rgba(34, 211, 238, 0.3)',
          color: 'var(--accent-primary)',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 211, 238, 0.25), rgba(139, 92, 246, 0.25))';
          e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)';
          e.currentTarget.style.boxShadow = '0 0 24px rgba(34, 211, 238, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(139, 92, 246, 0.15))';
          e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.3)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M7 16l4-4 4 4 6-6" />
        </svg>
        绘制图表
      </Button>

      <Dialog.Root open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setXVar('');
          setYVar('');
        }
      }}>
        <Dialog.Content
          style={{
            maxWidth: 900,
            width: 'calc(100vw - 48px)',
            padding: 0,
            overflow: 'hidden',
            borderRadius: '20px',
          }}
        >
          {/* 头部 */}
          <Box
            style={{
              padding: '24px 28px 20px 28px',
              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <Flex justify="between" align="center" gap="4">
              <Flex gap="3" align="center">
                <Box
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.2))',
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="M7 16l4-4 4 4 6-6" />
                  </svg>
                </Box>
                <Flex direction="column" gap="1">
                  <Dialog.Title
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                      margin: 0,
                    }}
                  >
                    数据可视化
                  </Dialog.Title>
                  <Flex gap="2" align="center" wrap="wrap">
                    <Badge
                      size="1"
                      style={{
                        background: 'rgba(34, 211, 238, 0.1)',
                        border: '1px solid rgba(34, 211, 238, 0.2)',
                        color: 'var(--accent-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {vars1D.length} 1D 变量
                    </Badge>
                    <Badge
                      size="1"
                      style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        color: 'var(--accent-violet)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {vars2D.length} 2D 变量
                    </Badge>
                  </Flex>
                </Flex>
              </Flex>
              <Dialog.Close>
                <Button
                  variant="ghost"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-tertiary)',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Button>
              </Dialog.Close>
            </Flex>
          </Box>

          {/* 配置区域 */}
          <Box style={{ padding: '24px 28px' }}>
            <Flex direction="column" gap="4">
              {!is2DMode && (
                <Flex gap="4" align="center" direction="row" wrap="wrap">
                  <Text size="2" style={{ width: 80, color: 'var(--text-secondary)', fontWeight: 500 }}>X 轴:</Text>
                  <Box style={{ flex: 1, minWidth: 200 }}>
                    <Select.Root value={xVar} onValueChange={setXVar}>
                      <Select.Trigger placeholder="选择 1D 变量" />
                      <Select.Content>
                        {vars1D.map(v => (
                          <Select.Item key={v.name} value={v.name}>{v.name}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Flex>
              )}

              <Flex gap="4" align="center" direction="row" wrap="wrap">
                <Text size="2" style={{ width: 80, color: 'var(--text-secondary)', fontWeight: 500 }}>Y 轴:</Text>
                <Box style={{ flex: 1, minWidth: 200 }}>
                  <Select.Root value={yVar} onValueChange={(v) => {
                    setYVar(v);
                    if (getVarDimension(variables.find(vr => vr.name === v)!) === 2) setXVar('');
                  }}>
                    <Select.Trigger placeholder="选择变量" />
                    <Select.Content style={{ maxHeight: '320px' }}>
                      {vars1D.length > 0 && (
                        <>
                          <Select.Group>
                            <Select.Label style={{ color: 'var(--accent-primary)' }}>1D 变量</Select.Label>
                            {vars1D.map(v => (
                              <Select.Item key={v.name} value={v.name}>{v.name}</Select.Item>
                            ))}
                          </Select.Group>
                          {vars2D.length > 0 && <Select.Separator />}
                        </>
                      )}
                      {vars2D.length > 0 && (
                        <Select.Group>
                          <Select.Label style={{ color: 'var(--accent-violet)' }}>2D 变量 (热力图)</Select.Label>
                          {vars2D.map(v => (
                            <Select.Item key={v.name} value={v.name}>{v.name}</Select.Item>
                          ))}
                        </Select.Group>
                      )}
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Flex>

              {!is2DMode && (
                <Flex gap="4" align="center" direction="row" wrap="wrap">
                  <Text size="2" style={{ width: 80, color: 'var(--text-secondary)', fontWeight: 500 }}>图表类型:</Text>
                  <Box style={{ flex: 1, minWidth: 200 }}>
                    <Select.Root value={chartType} onValueChange={(v) => setChartType(v as any)}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="line">📈 折线图</Select.Item>
                        <Select.Item value="bar">📊 柱状图</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Flex>
              )}

              {!is2DMode && chartType === "line" && (
                <Flex gap="4" align="center" direction="row" wrap="wrap">
                  <Text size="2" style={{ width: 80, color: 'var(--text-secondary)', fontWeight: 500 }}>采样策略:</Text>
                  <Box style={{ flex: 1, minWidth: 200 }}>
                    <Select.Root value={strategy} onValueChange={(v) => setStrategy(v as DownsampleStrategy)}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="lttb">🔻 LTTB 三角保真（默认，折线视觉最佳）</Select.Item>
                        <Select.Item value="minmax">📊 Min-Max（保留每桶最大/最小值）</Select.Item>
                        <Select.Item value="uniform">⚖️ 均匀采样（最简单）</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Flex>
              )}

              {/* 数据降采样提示 Callout */}
              {hasPlot && sampleInfoText && (
                <Callout.Root
                  color={(sampleLevel as string) === "warn" ? "orange" : "cyan"}
                  size="2"
                  variant="soft"
                >                  <Callout.Icon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </Callout.Icon>
                  <Callout.Text style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6 }}>
                    {sampleInfoText}
                    {(sampleLevel as string) === "warn" && " — 数据量较大，建议按需缩放或选择变量切片。"}
                  </Callout.Text>
                </Callout.Root>
              )}

              {/* 图表区域 */}
              {hasPlot ? (
                <Box
                  style={{
                    marginTop: '16px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <ReactECharts
                    option={getChartOption()}
                    style={{ height: 420, width: '100%' }}
                    theme="dark"
                    notMerge={true}
                    lazyUpdate={true}
                    opts={{ renderer: "canvas" }}
                  />
                </Box>
              ) : yVar ? (
                <Box
                  style={{
                    marginTop: '16px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                  }}
                >
                  <Flex gap="2" align="center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(252, 165, 165, 0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <Text size="2" style={{ color: 'rgba(252, 165, 165, 0.9)', fontFamily: 'var(--font-mono)' }}>
                      不支持的数据维度组合：请选择两个 1D 变量（折线/柱状图）或一个 2D 变量（热力图）
                    </Text>
                  </Flex>
                </Box>
              ) : null}
            </Flex>
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

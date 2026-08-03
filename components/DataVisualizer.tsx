'use client';

import { Variable } from '@/lib/parsers';
import ReactECharts from 'echarts-for-react';
import { Box, Flex, Text, Button, Select, Dialog, Badge, Callout, SegmentedControl } from '@radix-ui/themes';
import { useMemo, useState } from 'react';
import {
  downsample1D,
  downsample2D,
  PLOT_1D_THRESHOLD,
  PLOT_2D_MAX,
  DownsampleStrategy,
} from '@/lib/downsample';
import { useI18n } from '@/lib/i18n';

interface DataVisualizerProps {
  variables: Variable[];
}

type ChartType1D = 'line' | 'bar' | 'scatter';
type ChartType2D = 'heatmap' | 'contour';

type ChartBundle = {
  option: Record<string, unknown>;
  sampleInfo: { text: string | null; level: 'info' | 'warn' };
};

type EChartsParam = {
  data?: unknown;
  seriesType?: string;
  seriesName?: string;
  axisValue?: unknown;
  axisValueLabel?: unknown;
};

export default function DataVisualizer({ variables }: DataVisualizerProps) {
  const { t, formatLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [chartType1D, setChartType1D] = useState<ChartType1D>('line');
  const [chartType2D, setChartType2D] = useState<ChartType2D>('heatmap');
  const [xVar, setXVar] = useState<string>('');
  const [yVar, setYVar] = useState<string>('');
  const [strategy, setStrategy] = useState<DownsampleStrategy>('lttb');
  const [contourLevels, setContourLevels] = useState<number>(12);

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

  /** 将 2D 降采样后的 heatmap 数据转换为行列对齐的数值网格矩阵 */
  const convertHeatmapToContourGrid = (
    heatmapData: [number, number, number][],
    rows: number,
    cols: number
  ): number[][] => {
    const gridData: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));
    for (const [c, r, v] of heatmapData) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        gridData[r][c] = v;
      }
    }
    return gridData;
  };

  /** Marching Squares 近似：根据 2D 网格生成若干条等高线 polyline */
  const generateContourPolylines = (
    gridData: number[][],
    levels: number[]
  ): { level: number; coords: [number, number][][] }[] => {
    const rows = gridData.length;
    const cols = gridData[0]?.length ?? 0;
    if (rows < 2 || cols < 2) return [];

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const results: { level: number; coords: [number, number][][] }[] = [];

    for (const level of levels) {
      const segments: [number, number][][] = [];
      const edges: { from: [number, number]; to: [number, number] }[] = [];

      // 横向边 (相邻行之间的交点)
      for (let i = 0; i < rows - 1; i++) {
        for (let j = 0; j < cols; j++) {
          const v0 = gridData[i][j];
          const v1 = gridData[i + 1][j];
          if ((v0 - level) * (v1 - level) < 0) {
            const t = (level - v0) / (v1 - v0);
            const y = lerp(i, i + 1, t);
            edges.push({ from: [j - 0.5, y], to: [j + 0.5, y] });
          }
        }
      }
      // 纵向边 (相邻列之间的交点)
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols - 1; j++) {
          const v0 = gridData[i][j];
          const v1 = gridData[i][j + 1];
          if ((v0 - level) * (v1 - level) < 0) {
            const t = (level - v0) / (v1 - v0);
            const x = lerp(j, j + 1, t);
            edges.push({ from: [x, i - 0.5], to: [x, i + 0.5] });
          }
        }
      }

      // 贪心拼接邻接边为连续折线
      const used = new Array(edges.length).fill(false);
      const EPS = 1e-6;
      const samePoint = (a: [number, number], b: [number, number]) =>
        Math.abs(a[0] - b[0]) < EPS && Math.abs(a[1] - b[1]) < EPS;

      for (let start = 0; start < edges.length; start++) {
        if (used[start]) continue;
        const poly: [number, number][] = [edges[start].from, edges[start].to];
        used[start] = true;
        let changed = true;
        while (changed) {
          changed = false;
          for (let k = 0; k < edges.length; k++) {
            if (used[k]) continue;
            const last = poly[poly.length - 1];
            if (samePoint(last, edges[k].from)) {
              poly.push(edges[k].to);
              used[k] = true;
              changed = true;
              break;
            } else if (samePoint(last, edges[k].to)) {
              poly.push(edges[k].from);
              used[k] = true;
              changed = true;
              break;
            }
          }
        }
        changed = true;
        while (changed) {
          changed = false;
          for (let k = 0; k < edges.length; k++) {
            if (used[k]) continue;
            const first = poly[0];
            if (samePoint(first, edges[k].to)) {
              poly.unshift(edges[k].from);
              used[k] = true;
              changed = true;
              break;
            } else if (samePoint(first, edges[k].from)) {
              poly.unshift(edges[k].to);
              used[k] = true;
              changed = true;
              break;
            }
          }
        }
        if (poly.length >= 2) segments.push(poly);
      }

      if (segments.length > 0) {
        results.push({ level, coords: segments });
      }
    }

    return results;
  };

  const buildChart = useMemo<ChartBundle>((): ChartBundle => {
    const sampleInfo: { text: string | null; level: 'info' | 'warn' } = {
      text: null,
      level: 'info',
    };

    const emptyOption: Record<string, unknown> = {};
    const xVariable = variables.find(v => v.name === xVar);
    const yVariable = variables.find(v => v.name === yVar);
    if (!yVariable) return { option: emptyOption, sampleInfo };

    const axisStyle = {
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisTick: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisLabel: { color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: 11 },
      nameTextStyle: { color: '#94a3b8', fontFamily: 'var(--font-body)', fontSize: 12, padding: [0, 0, 8, 0] },
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.08)', type: 'dashed' } },
    };

    const tooltipBase = {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(34, 211, 238, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#f1f5f9', fontFamily: 'var(--font-mono)', fontSize: 12 },
    };

    const toolbox = {
      feature: {
        saveAsImage: {
          title: t('visualizer.saveImage'),
          iconStyle: { borderColor: '#64748b' },
          emphasis: { iconStyle: { borderColor: '#22d3ee', textFill: '#22d3ee' } }
        }
      },
      right: 16,
      top: 12,
    };

    // ============== 2D 模式：热力图 / 等高线图 ==============
    if (!xVariable && getVarDimension(yVariable) === 2) {
      const data2D = yVariable.data as number[][];
      const d2 = downsample2D(data2D, PLOT_2D_MAX.rows, PLOT_2D_MAX.cols, 'avg');

      if (d2.sampled) {
        sampleInfo.text = t('visualizer.downsampleInfo2D', {
          original: formatLocale(d2.originalCells),
          sampled: formatLocale(d2.sampledCells),
          rows: d2.rows,
          cols: d2.cols,
        });
        sampleInfo.level = 'info';
      }

      const xLabels = Array.from({ length: d2.cols }, (_, i) => i);
      const yLabels = Array.from({ length: d2.rows }, (_, i) => i);

      const visualMapBase = {
        min: d2.min,
        max: d2.max,
        calculable: true,
        orient: 'horizontal' as const,
        left: 'center',
        bottom: '2%',
        textStyle: { color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: 11 },
        inRange: {
          color: ['#0e7490', '#22d3ee', '#818cf8', '#a78bfa', '#c084fc']
        }
      };

      // ===== 2D 热力图 =====
      if (chartType2D === 'heatmap') {
        return {
          sampleInfo,
          option: {
            backgroundColor: 'transparent',
            tooltip: {
              position: 'top',
              ...tooltipBase,
              formatter: (params: EChartsParam) => {
                const d = params.data as [number, number, number] | undefined;
                if (!d) return '';
                return `<div style="padding: 4px;"><span style="color:#22d3ee">x:</span> ${d[0]}<br/><span style="color:#818cf8">y:</span> ${d[1]}<br/><span style="color:#c084fc">value:</span> <b>${d[2]}</b></div>`;
              }
            },
            toolbox,
            grid: { height: '62%', top: '12%', left: 56, right: 32 },
            xAxis: { type: 'category', data: xLabels, ...axisStyle },
            yAxis: { type: 'category', data: yLabels, ...axisStyle },
            visualMap: visualMapBase,
            series: [{
              name: yVar,
              type: 'heatmap',
              data: d2.data,
              progressive: 5000,
              progressiveThreshold: 8000,
              large: true,
              largeThreshold: 2000,
              emphasis: d2.sampled ? undefined : {
                itemStyle: {
                  shadowBlur: 20,
                  shadowColor: 'rgba(34, 211, 238, 0.4)',
                  borderColor: '#22d3ee',
                  borderWidth: 1,
                }
              }
            }]
          }
        };
      }

      // ===== 2D 等高线图 =====
      const gridData = convertHeatmapToContourGrid(d2.data, d2.rows, d2.cols);
      const levelCount = Math.max(3, Math.min(30, contourLevels));
      const step = (d2.max - d2.min) / (levelCount + 1);
      const levels: number[] = [];
      for (let i = 1; i <= levelCount; i++) {
        levels.push(d2.min + step * i);
      }

      const contourPolylines = generateContourPolylines(gridData, levels);

      const contourColors = [
        '#1e3a8a', '#1d4ed8', '#0ea5e9', '#22d3ee',
        '#34d399', '#a3e635', '#facc15', '#f97316', '#ef4444',
      ];

      const lineSeries: Record<string, unknown>[] = contourPolylines.map((cp, idx) => {
        const levelRatio = levels.length > 1
          ? (cp.level - d2.min) / (d2.max - d2.min)
          : 0.5;
        const colorIdx = Math.min(
          contourColors.length - 1,
          Math.max(0, Math.floor(levelRatio * (contourColors.length - 1)))
        );
        const showLabel = idx % 3 === 0;
        return {
          name: `level=${cp.level.toFixed(3)}`,
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          polyline: true,
          effect: { show: false },
          data: cp.coords.map(seg => ({ coords: seg })),
          lineStyle: {
            color: contourColors[colorIdx],
            width: 1.5,
            opacity: 0.92,
            shadowBlur: 4,
            shadowColor: 'rgba(0,0,0,0.35)',
          },
          label: showLabel
            ? {
                show: true,
                formatter: () => cp.level.toFixed(2),
                color: contourColors[colorIdx],
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                backgroundColor: 'rgba(15,23,42,0.85)',
                padding: [2, 5],
                borderRadius: 4,
                position: 'middle',
              }
            : { show: false },
        };
      });

      return {
        sampleInfo,
        option: {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            ...tooltipBase,
            axisPointer: {
              type: 'cross',
              lineStyle: { color: 'rgba(34, 211, 238, 0.4)', type: 'dashed' },
              crossStyle: { color: 'rgba(34, 211, 238, 0.4)' }
            },
            formatter: (params: EChartsParam | EChartsParam[]) => {
              const arr = Array.isArray(params) ? params : [params];
              const bgPt = arr.find(
                (p: EChartsParam) => p.seriesType === 'scatter' || p.seriesName === '__bg__'
              );
              const bgData = bgPt?.data as [number, number, number] | undefined;
              const valueInfo = bgData
                ? `<br/><span style="color:#c084fc">value ≈</span> <b>${Number(bgData[2]).toFixed(4)}</b>`
                : '';
              const first = arr[0];
              const ax = first?.axisValue ?? '—';
              const ay = first?.axisValueLabel ?? '—';
              return `<div style="padding: 4px;"><span style="color:#22d3ee">x ≈</span> ${ax}<br/><span style="color:#818cf8">y ≈</span> ${ay}${valueInfo}</div>`;
            }
          },
          toolbox,
          grid: { height: '62%', top: '12%', left: 56, right: 32 },
          xAxis: {
            type: 'value',
            min: -0.5,
            max: d2.cols - 0.5,
            ...axisStyle,
            name: 'x (col index)',
          },
          yAxis: {
            type: 'value',
            min: -0.5,
            max: d2.rows - 0.5,
            ...axisStyle,
            name: 'y (row index)',
          },
          visualMap: {
            ...visualMapBase,
            inRange: { color: contourColors },
            show: true,
          },
          series: [
            {
              name: '__bg__',
              type: 'scatter',
              data: d2.data.map(([c, r, v]) => [c, r, v]),
              symbolSize: Math.max(1, Math.min(18, Math.floor(380 / Math.max(d2.rows, d2.cols)))),
              itemStyle: { opacity: 0.28, borderWidth: 0 },
              emphasis: { disabled: true },
              silent: true,
              large: d2.sampled,
              largeThreshold: 1500,
              progressive: 2000,
              z: 0,
            },
            ...lineSeries,
          ],
        }
      };
    }

    // ============== 1D + 1D 模式：折线 / 柱状 / 散点 ==============
    if (!xVariable?.data || !yVariable?.data) return { option: emptyOption, sampleInfo };

    const xData = xVariable.data as number[];
    const yData = yVariable.data as number[];
    const length = Math.min(xData.length, yData.length);

    const threshold =
      chartType1D === 'line' ? PLOT_1D_THRESHOLD.line :
      chartType1D === 'scatter' ? PLOT_1D_THRESHOLD.scatter :
      PLOT_1D_THRESHOLD.bar;
    const pickedStrategy = chartType1D === 'line' ? strategy : 'uniform';
    const d1 = downsample1D(xData, yData, threshold, pickedStrategy);
    const data = d1.data;
    const sampledLength = d1.sampledLength;

    if (d1.sampled) {
      const strategyLabel =
        pickedStrategy === 'lttb' ? t('visualizer.downsampleInfo1DStrategyLTTB') :
        pickedStrategy === 'minmax' ? t('visualizer.downsampleInfo1DStrategyMinMax') : t('visualizer.downsampleInfo1DStrategyUniform');
      sampleInfo.text = t('visualizer.downsampleInfo1D', {
        original: formatLocale(d1.originalLength),
        strategy: strategyLabel,
        sampled: formatLocale(d1.sampledLength),
      });
      sampleInfo.level = length >= 500_000 ? 'warn' : 'info';
    }

    const dataZoom = d1.sampled
      ? [
          { type: 'inside', throttle: 50 },
          { type: 'slider', height: 22, bottom: 12, borderColor: 'transparent', textStyle: { color: '#94a3b8' } },
        ]
      : length > 2000
      ? [{ type: 'inside', throttle: 80 }]
      : undefined;

    // ===== 散点图 =====
    if (chartType1D === 'scatter') {
      return {
        sampleInfo,
        option: {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            ...tooltipBase,
            formatter: (params: EChartsParam) => {
              const d = params.data as [number, number] | undefined;
              if (!d) return '';
              return `<div style="padding: 4px;"><span style="color:#22d3ee">${xVar}:</span> ${d[0]}<br/><span style="color:#818cf8">${yVar}:</span> <b>${d[1]}</b></div>`;
            }
          },
          toolbox,
          grid: { left: 64, right: 32, top: 56, bottom: 56 },
          dataZoom,
          xAxis: { type: 'value', name: xVar, ...axisStyle },
          yAxis: { type: 'value', name: yVar, ...axisStyle },
          series: [{
            type: 'scatter',
            data,
            name: yVar,
            symbol: 'circle',
            symbolSize: d1.sampled ? 4 : sampledLength <= 200 ? 10 : sampledLength <= 2000 ? 7 : 5,
            itemStyle: {
              color: {
                type: 'radial',
                x: 0.4, y: 0.3, r: 0.9,
                colorStops: [
                  { offset: 0, color: 'rgba(34, 211, 238, 0.95)' },
                  { offset: 0.6, color: 'rgba(129, 140, 248, 0.85)' },
                  { offset: 1, color: 'rgba(192, 132, 252, 0.75)' },
                ]
              },
              shadowBlur: d1.sampled ? 0 : 6,
              shadowColor: 'rgba(34, 211, 238, 0.4)',
              borderColor: 'rgba(255,255,255,0.6)',
              borderWidth: d1.sampled ? 0 : 1,
              opacity: d1.sampled ? 0.55 : 0.9,
            },
            large: d1.sampled,
            largeThreshold: 2000,
            progressive: 2000,
            progressiveThreshold: 5000,
            emphasis: d1.sampled ? { disabled: true } : {
              itemStyle: {
                shadowBlur: 16,
                shadowColor: 'rgba(34, 211, 238, 0.65)',
                borderColor: '#fff',
                borderWidth: 2,
                scale: 1.2,
              }
            },
          }]
        }
      };
    }

    // ===== 折线图 / 柱状图 =====
    return {
      sampleInfo,
      option: {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          ...tooltipBase,
          axisPointer: {
            lineStyle: { color: 'rgba(34, 211, 238, 0.4)', type: 'dashed' },
            crossStyle: { color: 'rgba(34, 211, 238, 0.4)' }
          }
        },
        toolbox,
        grid: { left: 64, right: 32, top: 56, bottom: 56 },
        dataZoom,
        xAxis: { type: 'value', name: xVar, ...axisStyle },
        yAxis: { type: 'value', name: yVar, ...axisStyle },
        series: [{
          type: chartType1D,
          data,
          name: yVar,
          smooth: chartType1D === 'line' && !d1.sampled && length <= 2000,
          symbol: 'circle',
          symbolSize: chartType1D === 'line' ? (d1.sampled ? 2 : 6) : 0,
          showSymbol: chartType1D === 'line' && sampledLength <= 120,
          sampling: d1.sampled ? 'lttb' : chartType1D === 'line' ? 'lttb' : undefined,
          large: d1.sampled,
          largeThreshold: 2000,
          progressive: 2000,
          progressiveThreshold: 5000,
          ...(chartType1D === 'line' ? {
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
              ? undefined
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
      }
    };
  }, [variables, xVar, yVar, chartType1D, chartType2D, strategy, contourLevels]);

  const is2DMode = !xVar && yVar && getVarDimension(variables.find(v => v.name === yVar)!) === 2;
  const hasPlot = canPlot();
  const sampleInfoText = buildChart.sampleInfo.text;
  const sampleLevel = buildChart.sampleInfo.level;

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
        {t('visualizer.button')}
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
            maxWidth: 960,
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
                    {t('visualizer.dialogTitle')}
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
                      {t('visualizer.vars1D', { n: vars1D.length })}
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
                      {t('visualizer.vars2D', { n: vars2D.length })}
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
                  <Text size="2" style={{ width: 80, color: 'var(--text-secondary)', fontWeight: 500 }}>{t('visualizer.axisX')}:</Text>
                  <Box style={{ flex: 1, minWidth: 200 }}>
                    <Select.Root value={xVar} onValueChange={setXVar}>
                      <Select.Trigger placeholder={t('visualizer.select1D')} />
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
                <Text size="2" style={{ width: 80, color: 'var(--text-secondary)', fontWeight: 500 }}>{t('visualizer.axisY')}:</Text>
                <Box style={{ flex: 1, minWidth: 200 }}>
                  <Select.Root value={yVar} onValueChange={(v) => {
                    setYVar(v);
                    if (getVarDimension(variables.find(vr => vr.name === v)!) === 2) setXVar('');
                  }}>
                    <Select.Trigger placeholder={t('visualizer.selectVar')} />
                    <Select.Content style={{ maxHeight: '320px' }}>
                      {vars1D.length > 0 && (
                        <>
                          <Select.Group>
                            <Select.Label style={{ color: 'var(--accent-primary)' }}>{t('visualizer.group1D')}</Select.Label>
                            {vars1D.map(v => (
                              <Select.Item key={v.name} value={v.name}>{v.name}</Select.Item>
                            ))}
                          </Select.Group>
                          {vars2D.length > 0 && <Select.Separator />}
                        </>
                      )}
                      {vars2D.length > 0 && (
                        <Select.Group>
                          <Select.Label style={{ color: 'var(--accent-violet)' }}>{t('visualizer.group2D')}</Select.Label>
                          {vars2D.map(v => (
                            <Select.Item key={v.name} value={v.name}>{v.name}</Select.Item>
                          ))}
                        </Select.Group>
                      )}
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Flex>

              {/* 1D+1D 模式下的图表类型选择 */}
              {!is2DMode && yVar && getVarDimension(variables.find(vr => vr.name === yVar)!) === 1 && (
                <Flex gap="4" align="center" direction="row" wrap="wrap">
                  <Text size="2" style={{ width: 80, color: 'var(--text-secondary)', fontWeight: 500 }}>{t('visualizer.chartType')}:</Text>
                  <Box style={{ flex: 1, minWidth: 200 }}>
                    <SegmentedControl.Root
                      value={chartType1D}
                      onValueChange={(v) => setChartType1D(v as ChartType1D)}
                      size="2"
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '2px',
                      }}
                    >
                      <SegmentedControl.Item value="line" style={{ borderRadius: '8px' }}>
                        {t('visualizer.line')}
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="bar" style={{ borderRadius: '8px' }}>
                        {t('visualizer.bar')}
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="scatter" style={{ borderRadius: '8px' }}>
                        {t('visualizer.scatter')}
                      </SegmentedControl.Item>
                    </SegmentedControl.Root>
                  </Box>
                </Flex>
              )}

              {/* 2D 模式下的图表类型选择：热力图 / 等高线图 */}
              {is2DMode && (
                <Flex gap="4" align="center" direction="row" wrap="wrap">
                  <Text size="2" style={{ width: 80, color: 'var(--text-secondary)', fontWeight: 500 }}>{t('visualizer.chartType')}:</Text>
                  <Box style={{ flex: 1, minWidth: 300 }}>
                    <SegmentedControl.Root
                      value={chartType2D}
                      onValueChange={(v) => setChartType2D(v as ChartType2D)}
                      size="2"
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '2px',
                      }}
                    >
                      <SegmentedControl.Item value="heatmap" style={{ borderRadius: '8px' }}>
                        {t('visualizer.heatmap')}
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="contour" style={{ borderRadius: '8px' }}>
                        {t('visualizer.contour')}
                      </SegmentedControl.Item>
                    </SegmentedControl.Root>
                  </Box>
                </Flex>
              )}

              {/* 等高线图的层数调节 */}
              {is2DMode && chartType2D === 'contour' && (
                <Flex gap="4" align="center" direction="row" wrap="wrap">
                  <Text size="2" style={{ width: 80, color: 'var(--text-secondary)', fontWeight: 500 }}>{t('visualizer.contourLevels')}:</Text>
                  <Box style={{ flex: 1, minWidth: 200 }}>
                    <SegmentedControl.Root
                      value={String(contourLevels)}
                      onValueChange={(v) => setContourLevels(Number(v))}
                      size="2"
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '2px',
                      }}
                    >
                      <SegmentedControl.Item value="6" style={{ borderRadius: '8px' }}>{t('visualizer.levelsSparse')}</SegmentedControl.Item>
                      <SegmentedControl.Item value="12" style={{ borderRadius: '8px' }}>{t('visualizer.levelsMedium')}</SegmentedControl.Item>
                      <SegmentedControl.Item value="20" style={{ borderRadius: '8px' }}>{t('visualizer.levelsDense')}</SegmentedControl.Item>
                    </SegmentedControl.Root>
                  </Box>
                </Flex>
              )}

              {!is2DMode && chartType1D === 'line' && (
                <Flex gap="4" align="center" direction="row" wrap="wrap">
                  <Text size="2" style={{ width: 80, color: 'var(--text-secondary)', fontWeight: 500 }}>{t('visualizer.sampleStrategy')}:</Text>
                  <Box style={{ flex: 1, minWidth: 200 }}>
                    <Select.Root value={strategy} onValueChange={(v) => setStrategy(v as DownsampleStrategy)}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="lttb">{t('visualizer.lttb')}</Select.Item>
                        <Select.Item value="minmax">{t('visualizer.minmax')}</Select.Item>
                        <Select.Item value="uniform">{t('visualizer.uniform')}</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Flex>
              )}

              {/* 数据降采样提示 Callout */}
              {hasPlot && sampleInfoText && (
                <Callout.Root
                  color={sampleLevel === 'warn' ? 'orange' : 'cyan'}
                  size="2"
                  variant="soft"
                >
                  <Callout.Icon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </Callout.Icon>
                  <Callout.Text style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6 }}>
                    {sampleInfoText}
                    {sampleLevel === 'warn' && t('visualizer.downsampleWarnSuffix')}
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
                    option={buildChart.option}
                    style={{ height: 460, width: '100%' }}
                    theme="dark"
                    notMerge={true}
                    lazyUpdate={true}
                    opts={{ renderer: 'canvas' }}
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
                      {t('visualizer.dimensionError')}
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

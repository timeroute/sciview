// 大数据量绘制优化工具：为 1D 折线/柱状图、2D 热力图、JSON 预览提供安全的降采样与截断策略
// 核心目标：shape=1,450,000 级别的数据不会卡死主线程

// ========= 通用工具 =========

/** 安全地计算数字数组的 min / max（避免 Math.min(...1e6) 爆调用栈） */
export function safeMinMax(values: ArrayLike<number>): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  const len = values.length;
  for (let i = 0; i < len; i++) {
    const v = values[i];
    if (typeof v !== "number" || !isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!isFinite(min)) min = 0;
  if (!isFinite(max)) max = 0;
  return { min, max };
}

// ========= 1D 降采样策略 =========

export type DownsampleStrategy = "lttb" | "minmax" | "uniform";

/**
 * Largest-Triangle-Three-Buckets 折线图降采样（视觉保真度最高）
 * 参考 Sveinn Steinarsson 的 LTTB 算法
 */
export function downsampleLTTB(xs: number[], ys: number[], threshold: number): number[][] {
  const dataLength = xs.length;
  if (threshold >= dataLength || threshold <= 2) {
    const out: number[][] = new Array(dataLength);
    for (let i = 0; i < dataLength; i++) out[i] = [xs[i], ys[i]];
    return out;
  }

  const sampled: number[][] = [];
  sampled.push([xs[0], ys[0]]);

  const bucketSize = (dataLength - 2) / (threshold - 2);
  let a = 0;

  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, dataLength);
    const avgRangeLength = avgRangeEnd - avgRangeStart;

    let avgX = 0;
    let avgY = 0;
    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += xs[j];
      avgY += ys[j];
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    const rangeOffs = Math.floor(i * bucketSize) + 1;
    const rangeTo = Math.floor((i + 1) * bucketSize) + 1;

    const pointA = sampled[sampled.length - 1];

    let maxArea = -1;
    let nextA = rangeOffs;
    for (let j = rangeOffs; j < rangeTo; j++) {
      const area =
        Math.abs(
          (pointA[0] - avgX) * (ys[j] - pointA[1]) -
            (pointA[0] - xs[j]) * (avgY - pointA[1])
        ) * 0.5;
      if (area > maxArea) {
        maxArea = area;
        nextA = j;
      }
    }

    sampled.push([xs[nextA], ys[nextA]]);
    a = nextA;
  }

  sampled.push([xs[dataLength - 1], ys[dataLength - 1]]);
  return sampled;
}

/**
 * Min-Max 分桶降采样（对波动率大的数据最稳定，保留每桶最大/最小值）
 */
export function downsampleMinMax(xs: number[], ys: number[], threshold: number): number[][] {
  const n = xs.length;
  if (threshold >= n || threshold <= 2) {
    const out: number[][] = new Array(n);
    for (let i = 0; i < n; i++) out[i] = [xs[i], ys[i]];
    return out;
  }

  // 桶数 ≈ threshold/2，每桶出 2 个点（min / max），最后大约 = threshold
  const numBuckets = Math.max(2, Math.floor(threshold / 2));
  const bucketSize = n / numBuckets;

  const out: number[][] = [];
  out.push([xs[0], ys[0]]);

  for (let b = 0; b < numBuckets; b++) {
    const start = Math.max(1, Math.floor(b * bucketSize));
    const end = Math.min(n - 1, Math.ceil((b + 1) * bucketSize));
    if (start >= end) continue;

    let minIdx = start;
    let maxIdx = start;
    let minVal = ys[start];
    let maxVal = ys[start];
    for (let i = start; i < end; i++) {
      const v = ys[i];
      if (v < minVal) {
        minVal = v;
        minIdx = i;
      }
      if (v > maxVal) {
        maxVal = v;
        maxIdx = i;
      }
    }

    if (minIdx < maxIdx) {
      out.push([xs[minIdx], ys[minIdx]], [xs[maxIdx], ys[maxIdx]]);
    } else if (minIdx > maxIdx) {
      out.push([xs[maxIdx], ys[maxIdx]], [xs[minIdx], ys[minIdx]]);
    } else {
      out.push([xs[minIdx], ys[minIdx]]);
    }
  }

  out.push([xs[n - 1], ys[n - 1]]);
  return out;
}

/**
 * 均匀采样（最简单，适合散点图 / 柱状图）
 */
export function downsampleUniform(xs: number[], ys: number[], threshold: number): number[][] {
  const n = xs.length;
  if (threshold >= n || threshold <= 2) {
    const out: number[][] = new Array(n);
    for (let i = 0; i < n; i++) out[i] = [xs[i], ys[i]];
    return out;
  }
  const step = n / threshold;
  const out: number[][] = [];
  for (let i = 0; i < threshold - 1; i++) {
    const idx = Math.floor(i * step);
    out.push([xs[idx], ys[idx]]);
  }
  out.push([xs[n - 1], ys[n - 1]]);
  return out;
}

/** 对外统一入口：对 1D x/y 数据根据策略降采样；同时保证首尾点一致保留 */
export function downsample1D(
  xs: number[],
  ys: number[],
  threshold: number,
  strategy: DownsampleStrategy = "lttb"
): { data: number[][]; sampled: boolean; originalLength: number; sampledLength: number } {
  const n = Math.min(xs.length, ys.length);
  const x = xs.slice(0, n);
  const y = ys.slice(0, n);
  const sampled = strategy === "lttb"
    ? downsampleLTTB(x, y, threshold)
    : strategy === "minmax"
    ? downsampleMinMax(x, y, threshold)
    : downsampleUniform(x, y, threshold);
  return {
    data: sampled,
    sampled: n > threshold,
    originalLength: n,
    sampledLength: sampled.length,
  };
}

// ========= 2D 热力图降采样 =========

/**
 * 2D 数组分块聚合：把任意大的 data2D 降到 maxRows × maxCols 以内
 * strategy=avg 每块取均值（推荐热力图默认色值），strategy=max / min 取极值
 */
export function downsample2D(
  data2D: number[][],
  maxRows: number,
  maxCols: number,
  strategy: "avg" | "max" | "min" = "avg"
): {
  data: [number, number, number][];
  rows: number;
  cols: number;
  sampled: boolean;
  originalCells: number;
  sampledCells: number;
  min: number;
  max: number;
} {
  const rows = data2D.length;
  const cols = data2D[0]?.length ?? 0;
  const originalCells = rows * cols;

  let outRows = rows;
  let outCols = cols;
  let rowFactor = 1;
  let colFactor = 1;

  if (rows > maxRows) {
    rowFactor = rows / maxRows;
    outRows = maxRows;
  }
  if (cols > maxCols) {
    colFactor = cols / maxCols;
    outCols = maxCols;
  }
  const sampled = rows > maxRows || cols > maxCols;

  const out: [number, number, number][] = [];
  let gMin = Infinity;
  let gMax = -Infinity;

  for (let r = 0; r < outRows; r++) {
    const rStart = Math.floor(r * rowFactor);
    const rEnd = Math.min(rows, Math.ceil((r + 1) * rowFactor));
    for (let c = 0; c < outCols; c++) {
      const cStart = Math.floor(c * colFactor);
      const cEnd = Math.min(cols, Math.ceil((c + 1) * colFactor));
      let sum = 0;
      let min = Infinity;
      let max = -Infinity;
      let count = 0;
      for (let rr = rStart; rr < rEnd; rr++) {
        const row = data2D[rr];
        if (!row) continue;
        for (let cc = cStart; cc < cEnd; cc++) {
          const v = row[cc];
          if (typeof v !== "number" || !isFinite(v)) continue;
          sum += v;
          count++;
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
      if (count === 0) continue;
      let val = sum / count;
      if (strategy === "max") val = max;
      else if (strategy === "min") val = min;
      out.push([c, r, val]);
      if (val < gMin) gMin = val;
      if (val > gMax) gMax = val;
    }
  }
  if (!isFinite(gMin)) gMin = 0;
  if (!isFinite(gMax)) gMax = 0;
  return {
    data: out,
    rows: outRows,
    cols: outCols,
    sampled,
    originalCells,
    sampledCells: out.length,
    min: gMin,
    max: gMax,
  };
}

// ========= 截断 JSON 预览（用于 VariableCard 的大数据 stringify） =========

export interface TruncatedPreview {
  text: string;
  truncated: boolean;
  originalCount: number;
  shownCount: number;
}

/**
 * 预览数据用：对 1D / 2D 大数组做前后截断 + 中间省略占位，避免 JSON.stringify 爆
 */
export function truncateForPreview(
  data: unknown,
  max1D = 1000,
  max2DRows = 80,
  max2DCols = 40
): TruncatedPreview {
  // 标量
  if (!Array.isArray(data)) {
    return {
      text: JSON.stringify(data, null, 2),
      truncated: false,
      originalCount: 0,
      shownCount: 0,
    };
  }

  const is2D = Array.isArray(data[0]);

  if (!is2D) {
    // 1D
    const arr = data as number[];
    const n = arr.length;
    if (n <= max1D) {
      return {
        text: JSON.stringify(arr, null, 2),
        truncated: false,
        originalCount: n,
        shownCount: n,
      };
    }
    const head = arr.slice(0, Math.ceil(max1D / 2));
    const tail = arr.slice(n - Math.floor(max1D / 2));
    // 构造带省略标记的 JSON 文本（仅用于预览展示，不作为合法JSON解析）
    const headStr = JSON.stringify(head);
    const tailStr = JSON.stringify(tail);
    const text =
      headStr.slice(0, -1) +
      `,\n  "··· 省略 ${n - max1D} 个元素 ···",\n  ` +
      tailStr.slice(1);
    return {
      text,
      truncated: true,
      originalCount: n,
      shownCount: max1D,
    };
  } else {
    // 2D
    const arr = data as number[][];
    const rows = arr.length;
    const cols = arr[0]?.length ?? 0;
    if (rows <= max2DRows && cols <= max2DCols) {
      return {
        text: JSON.stringify(arr, null, 2),
        truncated: false,
        originalCount: rows * cols,
        shownCount: rows * cols,
      };
    }

    const rowKeep = Math.min(rows, max2DRows);
    const colKeep = Math.min(cols, max2DCols);
    const colHead = Math.ceil(colKeep / 2);
    const colTail = Math.floor(colKeep / 2);

    const outRows: unknown[] = [];
    for (let r = 0; r < rowKeep; r++) {
      const originalRow = arr[r] || [];
      if (cols <= colKeep) {
        outRows.push(originalRow);
      } else {
        const h = originalRow.slice(0, colHead);
        const t = originalRow.slice(cols - colTail);
        // 行内用占位字符串表示列省略
        outRows.push([...h, `··· 省略 ${cols - colKeep} 列 ···`, ...t]);
      }
    }
    // 行末尾省略占位
    let finalRows: unknown[] = outRows;
    if (rows > rowKeep) {
      finalRows = [...outRows, `[ ··· 省略 ${rows - rowKeep} 行 ··· ]`];
    }
    return {
      text: JSON.stringify(finalRows, null, 2),
      truncated: true,
      originalCount: rows * cols,
      shownCount: Math.min(rows, max2DRows) * Math.min(cols, max2DCols),
    };
  }
}

// ========= 1D 绘图安全阈值配置 =========

export const PLOT_1D_THRESHOLD = {
  line: 50_000,    // 折线图：5 万点（经 LTTB/MinMax 采样后视觉损失很小）
  scatter: 30_000, // 散点图：3 万点（点太多看不出形状还爆内存）
  bar: 10_000,     // 柱状图：1 万柱（再多就完全糊成条带）
};

export const PLOT_2D_MAX = {
  rows: 400,
  cols: 400,  // 400×400=16万 cell；再多 ECharts 渲染 DOM/Canvas 都会卡顿
};

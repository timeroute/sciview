// 中文（简体）语言包
export const messages = {
  // 公共通用
  common: {
    ready: "就绪",
    loading: "解析中...",
    readyToGo: "准备就绪",
    localAndSecure: "本地处理，数据安全",
    backHome: "返回首页",
    clickToEnter: "点击进入 →",
    noData: "无数据",
    loadedFile: "已加载文件",
    closeFile: "关闭文件",
    datasets: "数据集",
    variables: "变量",
    dimensions: "维度",
    attributes: "属性",
    noAttributes: "无属性",
    shape: "形状",
    totalElements: "元素总数",
    preview: "预览",
    expandToView: "点击展开查看详情",
    hidePreview: "点击收起预览",
    dataValue: "值",
    allElements: "全部",
    // 文件大小单位
    bytes: "字节",
    kb: "KB",
    mb: "MB",
    gb: "GB",
    tb: "TB",
  },
  // 主题切换
  theme: {
    light: "日间",
    system: "自动",
    dark: "夜间",
  },
  // 语言切换
  language: {
    label: "语言",
    zh: "中文",
    en: "English",
    es: "Español",
  },
  // 首页
  home: {
    badge: "v1.0 / SCIENTIFIC DATA",
    heroTitlePart1: "科学数据",
    heroTitlePart2: "可视化",
    heroTitleSub: "探索与洞察",
    heroSubtitle:
      "专业的 NetCDF 与 HDF5 文件查看工具，浏览器端即时解析多维科学数据，无需上传服务器，本地安全查看，支持丰富的图表可视化。",
    ctaLocal: "100% 本地处理",
    ctaMultiDim: "多维可视化",
    coreFeatures: "// 核心特性",
    builtForResearch: "为科研工作流而生",
    poweredBy: "Powered by",
    footerCopyright: "NCView © 2025 — 在浏览器中探索科学数据的无限可能",
    statFormatsLabel: "支持格式",
    statFormatsSub: "NetCDF, HDF5 等",
    statDimLabel: "数据维度",
    statDimSub: "多维数组解析",
    statVizLabel: "可视化",
    statVizSub: "图表即时渲染",
    statRunLabel: "运行方式",
    statRunSub: "数据永不离开",
  },
  // 工具卡片
  tools: {
    netcdfName: "NetCDF Viewer",
    netcdfDesc:
      "探索 NetCDF 格式的多维科学数据，查看元数据、维度信息与变量结构，支持即时数据可视化",
    netcdfFeat1: "多维数据解析",
    netcdfFeat2: "元数据浏览",
    netcdfFeat3: "变量预览",
    netcdfFeat4: "图表可视化",
    hdf5Name: "HDF5 Viewer",
    hdf5Desc:
      "深入查看 HDF5 层级数据结构，浏览数据集、组属性与层级关系，快速定位感兴趣的数据片段",
    hdf5Feat1: "层级树结构",
    hdf5Feat2: "数据集浏览",
    hdf5Feat3: "属性管理",
    hdf5Feat4: "多维可视化",
  },
  // NetCDF 工具页
  netcdf: {
    title: "NetCDF Viewer",
    badge: ".nc / .netcdf",
    loadTitle: "加载 NetCDF 文件",
    loadSubtitle:
      "支持 .nc 和 .netcdf 格式的科学数据文件，所有解析均在本地浏览器完成，您的数据不会上传至任何服务器。",
    groupAttributes: "全局属性",
    groupDimensions: "维度信息",
    groupVariables: "变量列表",
  },
  // HDF5 工具页
  hdf5: {
    title: "HDF5 Viewer",
    badge: ".h5 / .hdf5 / .he5",
    loadTitle: "加载 HDF5 文件",
    loadSubtitle:
      "支持 .h5、.hdf5 和 .he5 等层级数据格式，所有解析均在本地浏览器完成，您的数据完全私密，不会离开您的设备。",
    groupGroups: "分组结构",
    groupDatasets: "数据集列表",
    groupAttributes: "文件属性",
    dataTree: "数据结构",
  },
  // 文件上传
  upload: {
    titleClick: "点击选择文件或拖拽到此处",
    titleDragging: "释放以开始上传",
    titleLoading: "正在解析数据文件...",
    subtitleLoading: "请稍候，正在读取文件内容和元数据",
    formatNetcdfHint:
      "支持 NetCDF（.nc、_nc、.netcdf 等）与 HDF5（.h5、_h5、.hdf5、.he5 等）格式，文件后缀不标准也可尝试打开，自动识别真实内容",
    formatHdf5Hint:
      "支持 HDF5（.h5、_h5、.hdf5、.he5 等）与 NetCDF（.nc、_nc、.netcdf 等）格式，自动按内容识别，后缀不标准也能打开",
    formatGenericHint: "推荐格式：{formats}（自动识别内容，后缀不标准也可尝试）",
    errorTitle: "文件解析失败",
    // --- 新增：FileUploader 内部文案 ---
    primary: "点击选择文件或拖拽到此处",
    secondary: "支持 .nc .netcdf .h5 .hdf5 .he5 等格式，自动按真实内容识别",
    parsing: "正在解析文件...",
    unknownError: "解析失败，可能是文件格式不支持或文件已损坏",
    sizeLimit: "建议单文件不超过 {size}；超大文件可先本地切片",
  },
  // 通用的 FileViewer / HDF5Viewer 分组文案
  viewer: {
    fileFormat: "文件格式",
    globalAttrs: "全局属性",
    dimensions: "维度",
    variables: "变量",
    datasets: "数据集",
    attributes: "属性",
    dataPreview: "数据预览",
    noAttributes: "无属性",
    scalar: "标量 (Scalar)",
    truncated: "已截断（仅展示前 {count}）",
    namedDims: "命名维度",
  },
  // 数据可视化
  visualizer: {
    button: "绘制图表",
    dialogTitle: "数据可视化",
    vars1D: "{n} 1D 变量",
    vars2D: "{n} 2D 变量",
    axisX: "X 轴",
    axisY: "Y 轴",
    select1D: "选择 1D 变量",
    selectVar: "选择变量",
    group1D: "1D 变量",
    group2D: "2D 变量",
    chartType: "图表类型",
    line: "📈 折线图",
    bar: "📊 柱状图",
    scatter: "⚬ 散点图",
    heatmap: "🔥 热力图",
    contour: "🗻 等高线图",
    contourLevels: "等高线数",
    levelsSparse: "稀疏 (6)",
    levelsMedium: "适中 (12)",
    levelsDense: "密集 (20)",
    sampleStrategy: "采样策略",
    lttb: "🔻 LTTB 三角保真（默认，折线视觉最佳）",
    minmax: "📊 Min-Max（保留每桶最大/最小值）",
    uniform: "⚖️ 均匀采样（最简单）",
    dimensionError:
      "不支持的数据维度组合：请选择两个 1D 变量（折线/柱状/散点图）或一个 2D 变量（热力图/等高线图）",
    saveImage: "下载图片",
    placeholderX: "x",
    placeholderY: "y",
    placeholderValue: "value",
    placeholderXCol: "x (col index)",
    placeholderYRow: "y (row index)",
    levelApprox: "≈",
    downsampleInfo2D:
      "原始 {original} 个单元 → 已降采样到 {sampled} 个显示（{rows}×{cols}）",
    downsampleInfo1D:
      "原始 {original} 点 → 已用 {strategy} 降采样到 {sampled} 点显示（极值保留）",
    downsampleInfo1DStrategyLTTB: "LTTB（三角保真）",
    downsampleInfo1DStrategyMinMax: "Min-Max（保留极值）",
    downsampleInfo1DStrategyUniform: "均匀采样",
    downsampleWarnSuffix: " — 数据量较大，建议按需缩放或选择变量切片。",
  },
};

export type Messages = typeof messages;
export type LocaleKey = keyof Messages;

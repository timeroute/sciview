# NCView - Scientific Data Viewer

查看 NetCDF 和 HDF5 科学数据文件的详细信息工具。

## 功能特性

- ✅ 支持 NetCDF (.nc, .netcdf) 文件解析
- ✅ 支持 HDF5 (.h5, .hdf5) 文件解析
- ✅ 显示全局属性 (Global Attributes)
- ✅ 显示维度信息 (Dimensions)
- ✅ 显示变量及其属性 (Variables & Attributes)
- ✅ 显示数据类型和形状信息
- ✅ 数据可视化（支持 1D 数值数组的折线图和柱状图）

## 快速开始

安装依赖：

```bash
bun install
```

启动开发服务器：

```bash
bun dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 使用方法

1. 点击上传区域选择 NetCDF 或 HDF5 文件
2. 文件解析后会自动显示：
   - 文件格式
   - 全局属性
   - 维度列表
   - 变量详情（包括类型、维度、形状和属性）

## 技术栈

- **Next.js 16** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式
- **netcdfjs** - NetCDF 文件解析

## 项目结构

```
ncview/
├── app/
│   ├── page.tsx          # 主页面
│   ├── layout.tsx        # 布局
│   └── globals.css       # 全局样式
├── components/
│   ├── FileUploader.tsx  # 文件上传组件
│   └── FileViewer.tsx    # 文件信息查看器
└── lib/
    └── parsers.ts        # 文件解析逻辑
```

## 未来计划

- [ ] 支持绘制 2D 数据热力图
- [ ] 数据导出功能
- [ ] 支持大文件流式读取
- [ ] 更多图表类型（散点图、等高线图）

## HDF5 支持

HDF5 支持已集成，使用 h5wasm 库。安装依赖：

```bash
bun add h5wasm
```

## License

MIT

import { NetCDFReader } from 'netcdfjs';

let h5wasmModule: any = null;

async function getH5wasm() {
  if (!h5wasmModule) {
    const h5wasm = await import('h5wasm');
    await h5wasm.ready;
    h5wasmModule = h5wasm;
  }
  return h5wasmModule;
}

export interface Attribute {
  name: string;
  type: string;
  value: any;
}

export interface Variable {
  name: string;
  type: string;
  dimensions: string[];
  shape: number[];
  attributes: Attribute[];
  data?: any;
}

export interface FileInfo {
  format: 'netcdf' | 'hdf5';
  globalAttributes: Attribute[];
  dimensions: { name: string; size: number }[];
  variables: Variable[];
  fileName?: string;
  fileSize?: number;
}

// 宽松匹配：文件名中包含格式关键字（不要求严格以 .xxx 结尾）
// 比如 file_nc、data_hdf5.bin、something_h5_v2 都能匹配
const NETCDF_PATTERNS = [
  /\.nc\d*$/i,          // .nc .nc1 .nc4 等
  /\.netcdf$/i,         // .netcdf
  /[^a-z0-9]nc\d*$/i,   // _nc -nc 之类分隔符结尾
  /[^a-z0-9]netcdf$/i,  // _netcdf -netcdf
];

const HDF5_PATTERNS = [
  /\.h5$/i,
  /\.hdf5?$/i,          // .hdf .hdf5
  /\.he5$/i,
  /[^a-z0-9]h5$/i,
  /[^a-z0-9]hdf5?$/i,
  /[^a-z0-9]he5$/i,
];

// 检查是否符合 NetCDF 命名模式
function matchNetCDFName(name: string): boolean {
  const base = name.toLowerCase();
  // 首先去掉常见压缩后缀，再做匹配
  const cleaned = base.replace(/\.(gz|bz2|zip|xz)$/i, '');
  return NETCDF_PATTERNS.some(p => p.test(base) || p.test(cleaned));
}

// 检查是否符合 HDF5 命名模式
function matchHDF5Name(name: string): boolean {
  const base = name.toLowerCase();
  const cleaned = base.replace(/\.(gz|bz2|zip|xz)$/i, '');
  return HDF5_PATTERNS.some(p => p.test(base) || p.test(cleaned));
}

// 通过 Magic Bytes / 文件签名判断真实格式
// NetCDF Classic: "CDF\001" 或 "CDF\002"
// NetCDF-4 / HDF5: "\x89HDF\r\n\x1a\n" (HDF5 signature)
function detectFormatByBuffer(buffer: ArrayBuffer): 'netcdf' | 'hdf5' | null {
  try {
    const bytes = new Uint8Array(buffer, 0, Math.min(16, buffer.byteLength));

    // HDF5 / NetCDF4 签名：89 48 44 46 0D 0A 1A 0A
    const hdf5Sig = [0x89, 0x48, 0x44, 0x46, 0x0D, 0x0A, 0x1A, 0x0A];
    if (hdf5Sig.every((b, i) => bytes[i] === b)) {
      return 'hdf5';
    }

    // NetCDF Classic 签名: "CDF\x01" 或 "CDF\x02"
    if (bytes[0] === 0x43 && bytes[1] === 0x44 && bytes[2] === 0x46 &&
        (bytes[3] === 0x01 || bytes[3] === 0x02)) {
      return 'netcdf';
    }

    // NetCDF-64bit offset: "CDF\x05" 或 "CDF\x06"
    if (bytes[0] === 0x43 && bytes[1] === 0x44 && bytes[2] === 0x46 &&
        (bytes[3] === 0x05 || bytes[3] === 0x06)) {
      return 'netcdf';
    }
  } catch (e) {
    // 读取错误，不做判断
  }
  return null;
}

// 尝试通过解析结果判断格式
async function tryParse(buffer: ArrayBuffer, format: 'netcdf' | 'hdf5'): Promise<FileInfo | null> {
  try {
    if (format === 'netcdf') {
      return await parseNetCDF(buffer);
    } else {
      return await parseHDF5(buffer);
    }
  } catch (e) {
    return null;
  }
}

export async function parseNetCDF(buffer: ArrayBuffer): Promise<FileInfo> {
  const nc = new NetCDFReader(buffer);
  
  return {
    format: 'netcdf',
    globalAttributes: nc.globalAttributes.map(attr => ({
      name: attr.name,
      type: attr.type,
      value: attr.value
    })),
    dimensions: nc.dimensions.map(dim => ({
      name: dim.name,
      size: dim.size
    })),
    variables: nc.variables.map(v => ({
      name: v.name,
      type: v.type,
      dimensions: (v.dimensions || []).map((dimIndex: number) => nc.dimensions[dimIndex]?.name || ''),
      shape: (v.dimensions || []).map((dimIndex: number) => nc.dimensions[dimIndex]?.size || 0),
      attributes: (v.attributes || []).map((attr: any) => ({
        name: attr.name,
        type: attr.type,
        value: attr.value
      })),
      data: nc.getDataVariable(v.name)
    }))
  };
}

export async function parseHDF5(buffer: ArrayBuffer): Promise<FileInfo> {
  const h5wasm = await getH5wasm();
  
  // 创建虚拟文件系统中的文件
  const filename = 'temp.h5';
  const FS = h5wasm.FS;
  FS.writeFile(filename, new Uint8Array(buffer));
  
  const f = new h5wasm.File(filename, 'r');
  
  const globalAttributes: Attribute[] = [];
  const dimensions: { name: string; size: number }[] = [];
  const variables: Variable[] = [];

  function visitKeys(path: string = '') {
    const keys = path ? f.get(path).keys() : f.keys();
    
    keys.forEach(key => {
      const fullPath = path ? `${path}/${key}` : key;
      const item = f.get(fullPath);
      
      if (item.type === 'Dataset') {
        const attrs: Attribute[] = [];
        try {
          const attrKeys = item.attrs?.() || [];
          attrKeys.forEach((attrName: string) => {
            const attr = item.get_attribute(attrName);
            attrs.push({
              name: attrName,
              type: attr.dtype || 'unknown',
              value: attr.value
            });
          });
        } catch (e) {
          // 忽略属性读取错误
        }

        const shape = item.shape || [];
        const dimNames = shape.map((_: any, i: number) => `dim_${i}`);
        
        shape.forEach((size: number, i: number) => {
          if (!dimensions.find(d => d.name === dimNames[i] && d.size === size)) {
            dimensions.push({ name: dimNames[i], size });
          }
        });

        variables.push({
          name: fullPath,
          type: item.dtype || 'unknown',
          dimensions: dimNames,
          shape,
          attributes: attrs,
          data: Array.isArray(item.value) ? item.value : Array.from(item.value || [])
        });
      } else if (item.type === 'Group') {
        visitKeys(fullPath);
      }
    });
  }

  visitKeys();
  f.close();
  
  // 清理虚拟文件
  FS.unlink(filename);

  return {
    format: 'hdf5',
    globalAttributes,
    dimensions,
    variables
  };
}

export async function parseFile(file: File): Promise<FileInfo> {
  const buffer = await file.arrayBuffer();
  const name = file.name || '';

  // 第一步：通过 Magic Bytes 判断真实格式（最可靠）
  const detectedByMagic = detectFormatByBuffer(buffer);

  // 第二步：通过文件名宽松匹配
  const isNetCDFName = matchNetCDFName(name);
  const isHDF5Name = matchHDF5Name(name);

  let info: FileInfo | null = null;
  let primaryFormat: 'netcdf' | 'hdf5' | null = null;
  let secondaryFormat: 'netcdf' | 'hdf5' | null = null;

  // 以 Magic Bytes 优先，其次是文件名匹配
  if (detectedByMagic) {
    primaryFormat = detectedByMagic;
  } else if (isNetCDFName && !isHDF5Name) {
    primaryFormat = 'netcdf';
  } else if (isHDF5Name && !isNetCDFName) {
    primaryFormat = 'hdf5';
  } else if (isNetCDFName && isHDF5Name) {
    // 文件名同时匹配两种格式时，NetCDF 优先
    primaryFormat = 'netcdf';
    secondaryFormat = 'hdf5';
  } else {
    // 无任何匹配线索时，两种都试
    primaryFormat = 'netcdf';
    secondaryFormat = 'hdf5';
  }

  // 尝试主格式解析
  info = await tryParse(buffer, primaryFormat);

  // 失败则尝试次格式
  if (!info && secondaryFormat) {
    info = await tryParse(buffer, secondaryFormat);
  }

  // 如果仍失败，强制主格式再抛一次错误给用户查看具体原因
  if (!info) {
    try {
      if (primaryFormat === 'netcdf') {
        info = await parseNetCDF(buffer);
      } else {
        info = await parseHDF5(buffer);
      }
    } catch (e: any) {
      const hint = primaryFormat === 'netcdf'
        ? '（尝试按 NetCDF 解析失败）'
        : '（尝试按 HDF5 解析失败）';
      const message = (e && e.message) ? String(e.message) : '未知错误';
      throw new Error(
        '无法识别的文件格式。' +
        '支持 NetCDF（.nc、_nc、.netcdf 等）与 HDF5（.h5、_h5、.hdf5、.he5 等）格式。' +
        hint + ' 详细信息：' + message
      );
    }
  }

  if (info) {
    info.fileName = file.name;
    info.fileSize = file.size;
    return info;
  }

  // 兜底错误
  throw new Error(
    '不支持的文件格式。请上传 NetCDF（.nc、_nc、.netcdf 等）或 HDF5（.h5、_h5、.hdf5、.he5 等）格式的文件。'
  );
}

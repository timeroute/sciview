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
          data: item.value
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
  const ext = file.name.toLowerCase();
  
  if (ext.endsWith('.nc') || ext.endsWith('.netcdf')) {
    return parseNetCDF(buffer);
  } else if (ext.endsWith('.h5') || ext.endsWith('.hdf5') || ext.endsWith('.hdf') || ext.endsWith('.he5')) {
    return parseHDF5(buffer);
  }
  
  throw new Error('不支持的文件格式。请上传 .nc 或 .netcdf 文件。');
}

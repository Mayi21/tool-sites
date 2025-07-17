import Base64Tool from './components/tools/Base64Tool';
import DiffTool from './components/tools/DiffTool';

export default [
  {
    path: '/base64',
    name: 'Base64',
    desc: 'Base64 编解码',
    Component: Base64Tool,
  },
  {
    path: '/diff',
    name: 'Diff',
    desc: '文本对比',
    Component: DiffTool,
  },
]; 
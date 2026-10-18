import tools from './tools';

// 工具分类（一级菜单）
export const toolCategories = [
  {
    nameKey: 'Development Tools',
    key: 'dev',
    tools: ['base64', 'json-formatter', 'yaml-formatter', 'url-encoder', 'timestamp', 'regex-tester', 'jwt-decoder', 'cron-parser']
  },
  {
    nameKey: 'Text Processing',
    key: 'text',
    tools: ['diff', 'text-analyzer', 'text-processor', 'markdown-preview', 'unicode-converter']
  },
  {
    nameKey: 'Data Conversion',
    key: 'data',
    tools: ['csv-converter', 'uuid-generator', 'data-size']
  },
  {
    nameKey: 'Security & Encryption',
    key: 'security',
    tools: ['hash-generator', 'password-generator']
  },
  { nameKey: 'Design Tools', key: 'design', tools: ['image-compressor', 'image-watermark'] }
];

// 按分类组织工具（保持 tools.js 中定义的顺序）
export const categorizedTools = toolCategories.map(category => ({
  ...category,
  items: tools.filter(tool => category.tools.some(key => tool.path.includes(key)))
}));

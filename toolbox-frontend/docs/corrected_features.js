// 需要更新的工具功能描述配置
// 基于审计结果，移除未实现的功能

const correctedFeatures = {
  '/base64': {
    features: [
      '支持文本的Base64编码解码',
      '支持UTF-8字符编码',
      '一键复制结果到剪贴板',
      '编码解码切换功能'
    ]
  },

  '/json-formatter': {
    features: [
      '智能JSON格式化和美化',
      'JSON数据压缩（Minify）',
      '基本语法错误检测',
      '一键复制结果'
    ]
  },

  '/regex-tester': {
    features: [
      '实时正则表达式匹配测试',
      '高亮显示匹配结果',
      '支持全局、忽略大小写等修饰符'
    ]
  },

  '/url-encoder': {
    features: [
      '支持URL和查询参数编码',
      '编码解码模式切换',
      '一键复制结果'
    ]
  },

  '/timestamp': {
    features: [
      '支持秒级和毫秒级时间戳',
      '当前时间戳一键获取',
      '时间戳与日期双向转换'
    ]
  },

  '/jwt-decoder': {
    features: [
      '完整JWT结构解析（Header.Payload.Signature）',
      'Base64解码和JSON格式化',
      '基本令牌解析显示'
    ]
  },

  '/hash-generator': {
    features: [
      '支持MD5、SHA-1、SHA-256、SHA-512算法',
      '文本哈希计算',
      '实时计算，结果即时显示'
    ]
  },

  '/color-converter': {
    features: [
      '支持RGB、HEX、HSL格式转换',
      '实时颜色预览',
      '基本颜色选择器'
    ]
  }
};
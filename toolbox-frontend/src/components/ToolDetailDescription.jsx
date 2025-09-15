import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Container,
  Stack
} from '@mui/material';
import { 
  InfoOutlined,
  LightbulbOutlined,
  BuildOutlined,
  HelpOutlineOutlined,
  CheckCircleOutlined
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// 工具详细信息配置
export const getToolDetails = (path, t) => {
  const toolDetails = {
    '/base64': {
      description: t('toolDetails.base64.description', 'Base64是一种基于64个可打印字符来表示二进制数据的编码方法。支持文本内容的编码和解码，广泛用于数据传输场景。'),
      features: [
        t('toolDetails.base64.features.0', '支持文本的Base64编码解码'),
        t('toolDetails.base64.features.1', '支持UTF-8字符编码'),
        t('toolDetails.base64.features.2', '一键复制结果到剪贴板'),
        t('toolDetails.base64.features.3', '编码解码切换功能')
      ],
      useCases: [
        t('toolDetails.base64.useCases.0', '网页开发中的图片数据URI编码'),
        t('toolDetails.base64.useCases.1', 'API接口中的二进制数据传输'),
        t('toolDetails.base64.useCases.2', '电子邮件附件的编码传输'),
        t('toolDetails.base64.useCases.3', 'JWT Token的载荷编码'),
        t('toolDetails.base64.useCases.4', '配置文件中敏感信息的简单编码')
      ],
      tips: [
        t('toolDetails.base64.tips.0', 'Base64编码后的数据大小会增加约33%'),
        t('toolDetails.base64.tips.1', '编码结果末尾的"="是填充字符，用于对齐'),
        t('toolDetails.base64.tips.2', 'Base64不是加密方法，只是编码转换'),
        t('toolDetails.base64.tips.3', '适合文本内容的快速编码转换')
      ],
      faq: [
        {
          q: t('toolDetails.base64.faq.0.q', 'Base64编码安全吗？'),
          a: t('toolDetails.base64.faq.0.a', 'Base64只是编码转换，不提供加密功能。任何人都可以轻易解码，不要用于敏感信息保护。')
        },
        {
          q: t('toolDetails.base64.faq.1.q', '为什么编码后的字符串变长了？'),
          a: t('toolDetails.base64.faq.1.a', 'Base64将每3个字节编码为4个字符，所以编码后长度会增加约33%。')
        }
      ]
    },
    '/json-formatter': {
      description: t('toolDetails.json-formatter.description', 'JSON格式化工具，帮助开发者美化、验证和压缩JSON数据。支持基本的格式化和语法检查功能。'),
      features: [
        t('toolDetails.json-formatter.features.0', '智能JSON格式化和美化'),
        t('toolDetails.json-formatter.features.1', 'JSON数据压缩（Minify）'),
        t('toolDetails.json-formatter.features.2', '基本语法错误检测'),
        t('toolDetails.json-formatter.features.3', '一键复制结果')
      ],
      useCases: [
        t('toolDetails.json-formatter.useCases.0', 'API响应数据的格式化查看'),
        t('toolDetails.json-formatter.useCases.1', '配置文件的格式化编辑'),
        t('toolDetails.json-formatter.useCases.2', 'JSON数据的结构分析'),
        t('toolDetails.json-formatter.useCases.3', '前端开发中的数据调试'),
        t('toolDetails.json-formatter.useCases.4', 'JSON格式的验证和校正')
      ],
      tips: [
        t('toolDetails.json-formatter.tips.0', 'JSON字符串必须使用双引号，不能用单引号'),
        t('toolDetails.json-formatter.tips.1', '对象的键名必须用引号包围'),
        t('toolDetails.json-formatter.tips.2', '不支持注释和尾随逗号'),
        t('toolDetails.json-formatter.tips.3', '数值不能以0开头（除了0本身）')
      ],
      faq: [
        {
          q: t('toolDetails.json-formatter.faq.0.q', 'JSON格式化有什么用？'),
          a: t('toolDetails.json-formatter.faq.0.a', '格式化后的JSON更易阅读，方便调试和理解数据结构，特别适合API开发和调试。')
        },
        {
          q: t('toolDetails.json-formatter.faq.1.q', 'Minify有什么作用？'),
          a: t('toolDetails.json-formatter.faq.1.a', '压缩JSON可以减少文件大小，提高网络传输效率，常用于生产环境的API响应。')
        }
      ]
    },
    '/regex-tester': {
      description: t('toolDetails.regex-tester.description', '正则表达式测试工具，帮助开发者编写、测试和调试正则表达式。支持实时匹配预览和结果高亮显示。'),
      features: [
        t('toolDetails.regex-tester.features.0', '实时正则表达式匹配测试'),
        t('toolDetails.regex-tester.features.1', '高亮显示匹配结果'),
        t('toolDetails.regex-tester.features.2', '支持全局、忽略大小写等修饰符')
      ],
      useCases: [
        t('toolDetails.regex-tester.useCases.0', '表单验证规则的编写和测试'),
        t('toolDetails.regex-tester.useCases.1', '文本处理和数据清洗'),
        t('toolDetails.regex-tester.useCases.2', '日志文件的模式匹配'),
        t('toolDetails.regex-tester.useCases.3', '正则表达式的语法验证'),
        t('toolDetails.regex-tester.useCases.4', 'URL路由规则的测试')
      ],
      tips: [
        t('toolDetails.regex-tester.tips.0', '使用非贪婪匹配（?）可以避免过度匹配'),
        t('toolDetails.regex-tester.tips.1', '复杂正则建议分步测试，逐步完善'),
        t('toolDetails.regex-tester.tips.2', '注意转义字符的使用，特别是在字符串中'),
        t('toolDetails.regex-tester.tips.3', '善用字符类[\\d\\w\\s]简化表达式')
      ],
      faq: [
        {
          q: t('toolDetails.regex-tester.faq.0.q', '正则表达式性能如何优化？'),
          a: t('toolDetails.regex-tester.faq.0.a', '避免过度使用量词，合理使用锚点(^$)，简化字符类，避免深层嵌套。')
        },
        {
          q: t('toolDetails.regex-tester.faq.1.q', '如何测试复杂的正则？'),
          a: t('toolDetails.regex-tester.faq.1.a', '建议分解成小部分分别测试，然后组合。使用在线工具可视化正则结构。')
        }
      ]
    },
    '/url-encoder': {
      description: t('toolDetails.url-encoder.description', 'URL编码解码工具，用于处理URL中的特殊字符。支持基本的URL编码和解码功能。'),
      features: [
        t('toolDetails.url-encoder.features.0', '支持URL和查询参数编码'),
        t('toolDetails.url-encoder.features.1', '编码解码模式切换'),
        t('toolDetails.url-encoder.features.2', '一键复制结果')
      ],
      useCases: [
        t('toolDetails.url-encoder.useCases.0', 'URL查询参数的编码处理'),
        t('toolDetails.url-encoder.useCases.1', 'API接口中文参数传递'),
        t('toolDetails.url-encoder.useCases.2', '表单数据的URL安全传输'),
        t('toolDetails.url-encoder.useCases.3', '搜索引擎查询字符串处理'),
        t('toolDetails.url-encoder.useCases.4', 'RESTful API路径参数编码')
      ],
      tips: [
        t('toolDetails.url-encoder.tips.0', 'URL编码使用%加两位十六进制数表示字符'),
        t('toolDetails.url-encoder.tips.1', '空格可以编码为%20或+号（在查询参数中）'),
        t('toolDetails.url-encoder.tips.2', '中文字符通常使用UTF-8编码'),
        t('toolDetails.url-encoder.tips.3', '不要对整个URL进行编码，只编码参数部分')
      ],
      faq: [
        {
          q: t('toolDetails.url-encoder.faq.0.q', 'URL编码和Base64编码有什么区别？'),
          a: t('toolDetails.url-encoder.faq.0.a', 'URL编码主要处理URL中的特殊字符，Base64是将二进制数据转换为文本格式。')
        },
        {
          q: t('toolDetails.url-encoder.faq.1.q', '什么时候需要URL编码？'),
          a: t('toolDetails.url-encoder.faq.1.a', '当URL包含空格、中文、特殊符号或保留字符时需要编码，确保URL格式正确。')
        }
      ]
    },
    '/timestamp': {
      description: t('toolDetails.timestamp.description', 'Unix时间戳转换工具，支持时间戳与人类可读时间格式的双向转换。广泛用于服务器开发、数据库存储和API接口中。'),
      features: [
        t('toolDetails.timestamp.features.0', '支持秒级和毫秒级时间戳'),
        t('toolDetails.timestamp.features.1', '当前时间戳一键获取'),
        t('toolDetails.timestamp.features.2', '时间戳与日期双向转换')
      ],
      useCases: [
        t('toolDetails.timestamp.useCases.0', '数据库时间字段的调试'),
        t('toolDetails.timestamp.useCases.1', 'API接口时间参数处理'),
        t('toolDetails.timestamp.useCases.2', '日志文件时间分析'),
        t('toolDetails.timestamp.useCases.3', '定时任务时间设置'),
        t('toolDetails.timestamp.useCases.4', '前端时间显示格式化')
      ],
      tips: [
        t('toolDetails.timestamp.tips.0', 'Unix时间戳从1970年1月1日开始计算'),
        t('toolDetails.timestamp.tips.1', 'JavaScript使用毫秒时间戳，后端多用秒级'),
        t('toolDetails.timestamp.tips.2', '注意时区差异，建议使用UTC时间'),
        t('toolDetails.timestamp.tips.3', '时间戳越大表示时间越晚')
      ],
      faq: [
        {
          q: t('toolDetails.timestamp.faq.0.q', '时间戳为什么从1970年开始？'),
          a: t('toolDetails.timestamp.faq.0.a', '这是Unix系统的约定，称为"Unix纪元"，便于计算机处理时间。')
        },
        {
          q: t('toolDetails.timestamp.faq.1.q', '如何处理时区问题？'),
          a: t('toolDetails.timestamp.faq.1.a', '建议在存储时使用UTC时间戳，在显示时根据用户时区转换。')
        }
      ]
    },
    '/jwt-decoder': {
      description: t('toolDetails.jwt-decoder.description', 'JWT（JSON Web Token）解码工具，用于解析和验证JWT令牌的结构和内容。帮助开发者调试身份认证和授权系统。'),
      features: [
        t('toolDetails.jwt-decoder.features.0', '完整JWT结构解析（Header.Payload.Signature）'),
        t('toolDetails.jwt-decoder.features.1', 'Base64解码和JSON格式化'),
        t('toolDetails.jwt-decoder.features.2', '基本令牌解析显示')
      ],
      useCases: [
        t('toolDetails.jwt-decoder.useCases.0', '用户身份认证调试'),
        t('toolDetails.jwt-decoder.useCases.1', 'API访问权限验证'),
        t('toolDetails.jwt-decoder.useCases.2', 'SSO单点登录系统开发'),
        t('toolDetails.jwt-decoder.useCases.3', 'OAuth2.0令牌分析'),
        t('toolDetails.jwt-decoder.useCases.4', '移动应用登录状态管理')
      ],
      tips: [
        t('toolDetails.jwt-decoder.tips.0', 'JWT包含三部分：头部、载荷、签名'),
        t('toolDetails.jwt-decoder.tips.1', '载荷中包含用户信息和权限声明'),
        t('toolDetails.jwt-decoder.tips.2', 'JWT是无状态的，服务端不存储会话'),
        t('toolDetails.jwt-decoder.tips.3', '注意令牌的过期时间和刷新机制')
      ],
      faq: [
        {
          q: t('toolDetails.jwt-decoder.faq.0.q', 'JWT安全吗？'),
          a: t('toolDetails.jwt-decoder.faq.0.a', 'JWT本身是安全的，但需要正确实现签名验证和过期检查。')
        },
        {
          q: t('toolDetails.jwt-decoder.faq.1.q', '如何验证JWT签名？'),
          a: t('toolDetails.jwt-decoder.faq.1.a', '需要使用与签发时相同的密钥和算法来验证签名的有效性。')
        }
      ]
    },
    '/hash-generator': {
      description: t('toolDetails.hash-generator.description', '哈希生成工具，支持MD5、SHA-1、SHA-256等多种哈希算法。用于文本数据的哈希计算。'),
      features: [
        t('toolDetails.hash-generator.features.0', '支持MD5、SHA-1、SHA-256、SHA-512算法'),
        t('toolDetails.hash-generator.features.1', '文本哈希计算'),
        t('toolDetails.hash-generator.features.2', '实时计算，结果即时显示')
      ],
      useCases: [
        t('toolDetails.hash-generator.useCases.0', '数据完整性验证'),
        t('toolDetails.hash-generator.useCases.1', '密码安全存储'),
        t('toolDetails.hash-generator.useCases.2', '数据去重检测'),
        t('toolDetails.hash-generator.useCases.3', '版本控制系统中的提交ID'),
        t('toolDetails.hash-generator.useCases.4', '区块链和加密货币应用')
      ],
      tips: [
        t('toolDetails.hash-generator.tips.0', 'MD5已不适合安全场景，建议使用SHA-256'),
        t('toolDetails.hash-generator.tips.1', '相同输入总是产生相同的哈希值'),
        t('toolDetails.hash-generator.tips.2', '微小的输入变化会导致完全不同的哈希'),
        t('toolDetails.hash-generator.tips.3', '哈希是单向函数，无法从哈希值还原原文')
      ],
      faq: [
        {
          q: t('toolDetails.hash-generator.faq.0.q', '哪种哈希算法最安全？'),
          a: t('toolDetails.hash-generator.faq.0.a', '目前SHA-256和SHA-512被认为是安全的，MD5和SHA-1已被认为不够安全。')
        },
        {
          q: t('toolDetails.hash-generator.faq.1.q', '哈希碰撞是什么？'),
          a: t('toolDetails.hash-generator.faq.1.a', '不同的输入产生相同哈希值的情况，优秀的哈希算法应该极难出现碰撞。')
        }
      ]
    },
    '/color-converter': {
      description: t('toolDetails.color-converter.description', '颜色格式转换工具，支持RGB、HEX、HSL、HSV等多种颜色格式的相互转换。为设计师和前端开发者提供便捷的颜色处理功能。'),
      features: [
        t('toolDetails.color-converter.features.0', '支持RGB、HEX、HSL格式转换'),
        t('toolDetails.color-converter.features.1', '实时颜色预览'),
        t('toolDetails.color-converter.features.2', '基本颜色选择器')
      ],
      useCases: [
        t('toolDetails.color-converter.useCases.0', 'Web设计颜色方案制定'),
        t('toolDetails.color-converter.useCases.1', 'CSS样式表颜色调试'),
        t('toolDetails.color-converter.useCases.2', 'UI设计规范建立'),
        t('toolDetails.color-converter.useCases.3', '品牌色彩标准化'),
        t('toolDetails.color-converter.useCases.4', '打印设计CMYK转换')
      ],
      tips: [
        t('toolDetails.color-converter.tips.0', 'HEX格式以#开头，如#FF0000表示红色'),
        t('toolDetails.color-converter.tips.1', 'RGB值范围是0-255，HSL中H范围是0-360'),
        t('toolDetails.color-converter.tips.2', 'HSL更适合调整颜色的明度和饱和度'),
        t('toolDetails.color-converter.tips.3', '注意颜色在不同屏幕上的显示差异')
      ],
      faq: [
        {
          q: t('toolDetails.color-converter.faq.0.q', 'RGB和HSL哪个更好用？'),
          a: t('toolDetails.color-converter.faq.0.a', 'RGB直观易懂，HSL更适合调色和创建颜色变化。')
        },
        {
          q: t('toolDetails.color-converter.faq.1.q', '如何选择无障碍友好的颜色？'),
          a: t('toolDetails.color-converter.faq.1.a', '确保足够的对比度，避免仅用颜色传达信息，考虑色盲用户需求。')
        }
      ]
    },
    '/qr-generator': {
      description: t('toolDetails.qr-generator.description'),
      features: [
        t('toolDetails.qr-generator.features.0'),
        t('toolDetails.qr-generator.features.1'),
        t('toolDetails.qr-generator.features.2')
      ],
      useCases: [
        t('toolDetails.qr-generator.useCases.0'),
        t('toolDetails.qr-generator.useCases.1'),
        t('toolDetails.qr-generator.useCases.2'),
        t('toolDetails.qr-generator.useCases.3'),
        t('toolDetails.qr-generator.useCases.4')
      ],
      tips: [
        t('toolDetails.qr-generator.tips.0'),
        t('toolDetails.qr-generator.tips.1'),
        t('toolDetails.qr-generator.tips.2'),
        t('toolDetails.qr-generator.tips.3')
      ],
      faq: [
        {
          q: t('toolDetails.qr-generator.faq.0.q'),
          a: t('toolDetails.qr-generator.faq.0.a')
        },
        {
          q: t('toolDetails.qr-generator.faq.1.q'),
          a: t('toolDetails.qr-generator.faq.1.a')
        }
      ]
    },
    '/diff': {
      description: t('toolDetails.diff.description'),
      features: [
        t('toolDetails.diff.features.0'),
        t('toolDetails.diff.features.1'),
        t('toolDetails.diff.features.2')
      ],
      useCases: [
        t('toolDetails.diff.useCases.0'),
        t('toolDetails.diff.useCases.1'),
        t('toolDetails.diff.useCases.2'),
        t('toolDetails.diff.useCases.3'),
        t('toolDetails.diff.useCases.4')
      ],
      tips: [
        t('toolDetails.diff.tips.0'),
        t('toolDetails.diff.tips.1'),
        t('toolDetails.diff.tips.2'),
        t('toolDetails.diff.tips.3')
      ],
      faq: [
        {
          q: t('toolDetails.diff.faq.0.q'),
          a: t('toolDetails.diff.faq.0.a')
        },
        {
          q: t('toolDetails.diff.faq.1.q'),
          a: t('toolDetails.diff.faq.1.a')
        }
      ]
    },
    '/text-analyzer': {
      description: t('toolDetails.text-analyzer.description'),
      features: [
        t('toolDetails.text-analyzer.features.0'),
        t('toolDetails.text-analyzer.features.1'),
        t('toolDetails.text-analyzer.features.2'),
        t('toolDetails.text-analyzer.features.3')
      ],
      useCases: [
        t('toolDetails.text-analyzer.useCases.0'),
        t('toolDetails.text-analyzer.useCases.1'),
        t('toolDetails.text-analyzer.useCases.2'),
        t('toolDetails.text-analyzer.useCases.3'),
        t('toolDetails.text-analyzer.useCases.4')
      ],
      tips: [
        t('toolDetails.text-analyzer.tips.0'),
        t('toolDetails.text-analyzer.tips.1'),
        t('toolDetails.text-analyzer.tips.2'),
        t('toolDetails.text-analyzer.tips.3')
      ],
      faq: [
        {
          q: t('toolDetails.text-analyzer.faq.0.q'),
          a: t('toolDetails.text-analyzer.faq.0.a')
        },
        {
          q: t('toolDetails.text-analyzer.faq.1.q'),
          a: t('toolDetails.text-analyzer.faq.1.a')
        }
      ]
    },
    '/text-processor': {
      description: t('toolDetails.text-processor.description'),
      features: [
        t('toolDetails.text-processor.features.0'),
        t('toolDetails.text-processor.features.1'),
        t('toolDetails.text-processor.features.2'),
        t('toolDetails.text-processor.features.3'),
        t('toolDetails.text-processor.features.4')
      ],
      useCases: [
        t('toolDetails.text-processor.useCases.0'),
        t('toolDetails.text-processor.useCases.1'),
        t('toolDetails.text-processor.useCases.2'),
        t('toolDetails.text-processor.useCases.3'),
        t('toolDetails.text-processor.useCases.4')
      ],
      tips: [
        t('toolDetails.text-processor.tips.0'),
        t('toolDetails.text-processor.tips.1'),
        t('toolDetails.text-processor.tips.2'),
        t('toolDetails.text-processor.tips.3')
      ],
      faq: [
        {
          q: t('toolDetails.text-processor.faq.0.q'),
          a: t('toolDetails.text-processor.faq.0.a')
        },
        {
          q: t('toolDetails.text-processor.faq.1.q'),
          a: t('toolDetails.text-processor.faq.1.a')
        }
      ]
    },
    '/csv-converter': {
      description: t('toolDetails.csv-converter.description'),
      features: [
        t('toolDetails.csv-converter.features.0'),
        t('toolDetails.csv-converter.features.1'),
        t('toolDetails.csv-converter.features.2')
      ],
      useCases: [
        t('toolDetails.csv-converter.useCases.0'),
        t('toolDetails.csv-converter.useCases.1'),
        t('toolDetails.csv-converter.useCases.2'),
        t('toolDetails.csv-converter.useCases.3'),
        t('toolDetails.csv-converter.useCases.4')
      ],
      tips: [
        t('toolDetails.csv-converter.tips.0'),
        t('toolDetails.csv-converter.tips.1'),
        t('toolDetails.csv-converter.tips.2'),
        t('toolDetails.csv-converter.tips.3')
      ],
      faq: [
        {
          q: t('toolDetails.csv-converter.faq.0.q'),
          a: t('toolDetails.csv-converter.faq.0.a')
        },
        {
          q: t('toolDetails.csv-converter.faq.1.q'),
          a: t('toolDetails.csv-converter.faq.1.a')
        }
      ]
    },
    '/markdown-preview': {
      description: t('toolDetails.markdown-preview.description'),
      features: [
        t('toolDetails.markdown-preview.features.0'),
        t('toolDetails.markdown-preview.features.1'),
        t('toolDetails.markdown-preview.features.2'),
        t('toolDetails.markdown-preview.features.3'),
        t('toolDetails.markdown-preview.features.4'),
        t('toolDetails.markdown-preview.features.5')
      ],
      useCases: [
        t('toolDetails.markdown-preview.useCases.0'),
        t('toolDetails.markdown-preview.useCases.1'),
        t('toolDetails.markdown-preview.useCases.2'),
        t('toolDetails.markdown-preview.useCases.3'),
        t('toolDetails.markdown-preview.useCases.4')
      ],
      tips: [
        t('toolDetails.markdown-preview.tips.0'),
        t('toolDetails.markdown-preview.tips.1'),
        t('toolDetails.markdown-preview.tips.2'),
        t('toolDetails.markdown-preview.tips.3')
      ],
      faq: [
        {
          q: t('toolDetails.markdown-preview.faq.0.q'),
          a: t('toolDetails.markdown-preview.faq.0.a')
        },
        {
          q: t('toolDetails.markdown-preview.faq.1.q'),
          a: t('toolDetails.markdown-preview.faq.1.a')
        }
      ]
    },
    '/uuid-generator': {
      description: t('toolDetails.uuid-generator.description', 'UUID生成工具，创建全球唯一标识符。支持UUID v4标准。'),
      features: [
        t('toolDetails.uuid-generator.features.0', '标准UUID v4生成'),
        t('toolDetails.uuid-generator.features.1', '批量UUID生成'),
        t('toolDetails.uuid-generator.features.2', '一键复制所有结果')
      ],
      useCases: [
        t('toolDetails.uuid-generator.useCases.0', '数据库表主键'),
        t('toolDetails.uuid-generator.useCases.1', 'API请求追踪ID'),
        t('toolDetails.uuid-generator.useCases.2', '文件唯一命名'),
        t('toolDetails.uuid-generator.useCases.3', '分布式系统节点ID'),
        t('toolDetails.uuid-generator.useCases.4', '临时令牌生成')
      ],
      tips: [
        t('toolDetails.uuid-generator.tips.0', 'UUID v4基于随机数生成，安全性较高'),
        t('toolDetails.uuid-generator.tips.1', 'UUID长度固定为36个字符（含连字符）'),
        t('toolDetails.uuid-generator.tips.2', '在分布式环境中UUID几乎不会重复'),
        t('toolDetails.uuid-generator.tips.3', '用作数据库主键时考虑性能影响')
      ],
      faq: [
        {
          q: t('toolDetails.uuid-generator.faq.0.q', 'UUID会重复吗？'),
          a: t('toolDetails.uuid-generator.faq.0.a', 'UUID v4基于随机算法，重复概率极低，可以认为是唯一的。')
        },
        {
          q: t('toolDetails.uuid-generator.faq.1.q', 'UUID适合做数据库主键吗？'),
          a: t('toolDetails.uuid-generator.faq.1.a', '适合，但UUID较长，可能影响索引性能，需要权衡使用。')
        }
      ]
    },
    '/password-generator': {
      description: t('toolDetails.password-generator.description', '密码生成工具，创建高强度随机密码。支持自定义长度和字符集，提供密码强度评估。'),
      features: [
        t('toolDetails.password-generator.features.0', '自定义密码长度'),
        t('toolDetails.password-generator.features.1', '字符集选择（大小写、数字、符号）'),
        t('toolDetails.password-generator.features.2', '实时密码强度评估'),
        t('toolDetails.password-generator.features.3', '批量密码生成')
      ],
      useCases: [
        t('toolDetails.password-generator.useCases.0', '用户账户密码创建'),
        t('toolDetails.password-generator.useCases.1', '系统管理员账户'),
        t('toolDetails.password-generator.useCases.2', 'API密钥生成'),
        t('toolDetails.password-generator.useCases.3', '临时密码分发'),
        t('toolDetails.password-generator.useCases.4', '密码策略测试')
      ],
      tips: [
        t('toolDetails.password-generator.tips.0', '密码长度至少12位以上'),
        t('toolDetails.password-generator.tips.1', '包含大小写字母、数字和特殊符号'),
        t('toolDetails.password-generator.tips.2', '定期更换重要账户密码'),
        t('toolDetails.password-generator.tips.3', '不同网站使用不同密码')
      ],
      faq: [
        {
          q: t('toolDetails.password-generator.faq.0.q', '什么样的密码最安全？'),
          a: t('toolDetails.password-generator.faq.0.a', '长度12位以上，包含大小写字母、数字、特殊符号的随机组合最安全。')
        },
        {
          q: t('toolDetails.password-generator.faq.1.q', '密码强度如何评估？'),
          a: t('toolDetails.password-generator.faq.1.a', '根据长度、字符种类、随机性等因素综合评估，避免使用常见模式。')
        }
      ]
    },
    '/image-compressor': {
      description: t('toolDetails.image-compressor.description', '图片压缩工具，在保持视觉质量的同时减少图片文件大小。支持JPEG、PNG格式。'),
      features: [
        t('toolDetails.image-compressor.features.0', '基础压缩功能'),
        t('toolDetails.image-compressor.features.1', '质量可调节'),
        t('toolDetails.image-compressor.features.2', '支持JPEG、PNG格式')
      ],
      useCases: [
        t('toolDetails.image-compressor.useCases.0', '网站图片优化'),
        t('toolDetails.image-compressor.useCases.1', '移动应用资源压缩'),
        t('toolDetails.image-compressor.useCases.2', '邮件附件大小控制'),
        t('toolDetails.image-compressor.useCases.3', '存储空间节省'),
        t('toolDetails.image-compressor.useCases.4', '网页加载速度优化')
      ],
      tips: [
        t('toolDetails.image-compressor.tips.0', 'JPEG适合照片，PNG适合图标和透明图像'),
        t('toolDetails.image-compressor.tips.1', '网页图片建议压缩到100KB以下'),
        t('toolDetails.image-compressor.tips.2', '压缩前备份原图'),
        t('toolDetails.image-compressor.tips.3', '根据用途选择合适的压缩级别')
      ],
      faq: [
        {
          q: t('toolDetails.image-compressor.faq.0.q', '压缩会损失图片质量吗？'),
          a: t('toolDetails.image-compressor.faq.0.a', '有损压缩会减少细节，但合理设置下视觉效果仍然良好。')
        },
        {
          q: t('toolDetails.image-compressor.faq.1.q', '如何选择压缩级别？'),
          a: t('toolDetails.image-compressor.faq.1.a', '根据使用场景平衡文件大小和质量，网页用途可以适度压缩。')
        }
      ]
    },
    '/image-watermark': {
      description: t('toolDetails.image-watermark.description', '图片水印工具，为图片添加文字水印。支持水印位置和透明度调节。'),
      features: [
        t('toolDetails.image-watermark.features.0', '文字水印添加'),
        t('toolDetails.image-watermark.features.1', '水印位置选择'),
        t('toolDetails.image-watermark.features.2', '透明度调节'),
        t('toolDetails.image-watermark.features.3', '字体大小和颜色设置')
      ],
      useCases: [
        t('toolDetails.image-watermark.useCases.0', '摄影作品版权保护'),
        t('toolDetails.image-watermark.useCases.1', '企业宣传图片标识'),
        t('toolDetails.image-watermark.useCases.2', '产品图片品牌标记'),
        t('toolDetails.image-watermark.useCases.3', '社交媒体内容保护'),
        t('toolDetails.image-watermark.useCases.4', '设计作品署名')
      ],
      tips: [
        t('toolDetails.image-watermark.tips.0', '水印位置选择不要遮挡重要内容'),
        t('toolDetails.image-watermark.tips.1', '透明度设置要平衡可见性和美观性'),
        t('toolDetails.image-watermark.tips.2', '文字水印建议使用对比色'),
        t('toolDetails.image-watermark.tips.3', '考虑不同尺寸图片的水印适配')
      ],
      faq: [
        {
          q: t('toolDetails.image-watermark.faq.0.q', '水印能完全防止盗图吗？'),
          a: t('toolDetails.image-watermark.faq.0.a', '水印可以起到震慑作用，但无法完全防止，配合其他保护措施更有效。')
        },
        {
          q: t('toolDetails.image-watermark.faq.1.q', '如何选择水印位置？'),
          a: t('toolDetails.image-watermark.faq.1.a', '建议选择不影响主体内容的区域，同时确保水印不易被裁剪。')
        }
      ]
    },
    '/unicode-converter': {
      description: t('toolDetails.unicode-converter.description', 'Unicode编码转换工具，处理中文与Unicode之间的编码转换。'),
      features: [
        t('toolDetails.unicode-converter.features.0', '中文与Unicode互转'),
        t('toolDetails.unicode-converter.features.1', '支持Unicode实体编码'),
        t('toolDetails.unicode-converter.features.2', '基础文本转换')
      ],
      useCases: [
        t('toolDetails.unicode-converter.useCases.0', '网页中文显示问题修复'),
        t('toolDetails.unicode-converter.useCases.1', '数据库字符编码处理'),
        t('toolDetails.unicode-converter.useCases.2', 'JSON中文数据处理'),
        t('toolDetails.unicode-converter.useCases.3', '跨系统中文传输'),
        t('toolDetails.unicode-converter.useCases.4', '编码问题调试')
      ],
      tips: [
        t('toolDetails.unicode-converter.tips.0', 'Unicode是国际标准字符编码'),
        t('toolDetails.unicode-converter.tips.1', '\\u开头的是JavaScript Unicode表示'),
        t('toolDetails.unicode-converter.tips.2', '&#x开头的是HTML Unicode实体'),
        t('toolDetails.unicode-converter.tips.3', 'UTF-8是Unicode的一种实现方式')
      ],
      faq: [
        {
          q: t('toolDetails.unicode-converter.faq.0.q', 'Unicode和UTF-8有什么区别？'),
          a: t('toolDetails.unicode-converter.faq.0.a', 'Unicode是字符集标准，UTF-8是Unicode的编码实现方式之一。')
        },
        {
          q: t('toolDetails.unicode-converter.faq.1.q', '为什么会出现乱码？'),
          a: t('toolDetails.unicode-converter.faq.1.a', '通常是编码和解码使用了不同的字符集，或者字符集不支持相应字符。')
        }
      ]
    },
    '/cron-parser': {
      description: t('toolDetails.cron-parser.description', 'Cron表达式解析工具，用于解析和验证定时任务的Cron表达式。支持Linux和Spring格式。'),
      features: [
        t('toolDetails.cron-parser.features.0', 'Linux和Spring Cron格式支持'),
        t('toolDetails.cron-parser.features.1', '表达式语法验证'),
        t('toolDetails.cron-parser.features.2', '下次执行时间预测')
      ],
      useCases: [
        t('toolDetails.cron-parser.useCases.0', '定时任务配置'),
        t('toolDetails.cron-parser.useCases.1', '系统维护脚本调度'),
        t('toolDetails.cron-parser.useCases.2', '数据备份计划设定'),
        t('toolDetails.cron-parser.useCases.3', '报表生成时间安排'),
        t('toolDetails.cron-parser.useCases.4', '自动化流程触发')
      ],
      tips: [
        t('toolDetails.cron-parser.tips.0', 'Linux Cron有5个字段，Spring Cron有6个字段'),
        t('toolDetails.cron-parser.tips.1', '星号(*)表示匹配所有值'),
        t('toolDetails.cron-parser.tips.2', '逗号(,)用于列举多个值'),
        t('toolDetails.cron-parser.tips.3', '连字符(-)表示范围，斜杠(/)表示间隔')
      ],
      faq: [
        {
          q: t('toolDetails.cron-parser.faq.0.q', 'Cron表达式如何表示每5分钟执行？'),
          a: t('toolDetails.cron-parser.faq.0.a', 'Linux格式：*/5 * * * *，Spring格式：0 */5 * * * *')
        },
        {
          q: t('toolDetails.cron-parser.faq.1.q', '如何避免Cron任务重叠执行？'),
          a: t('toolDetails.cron-parser.faq.1.a', '合理设置执行间隔，使用锁机制防止同一任务并发执行。')
        }
      ]
    }
    // 工具详细信息配置完成
  };

  return toolDetails[path] || null;
};

export default function ToolDetailDescription({ toolPath, children }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const details = getToolDetails(toolPath, t);

  if (!details) {
    return children || null;
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
      <Grid container spacing={4}>
        {/* 左侧信息栏 */}
        <Grid item xs={12} lg={3}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <Stack spacing={3}>
              {/* 核心功能卡片 */}
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircleOutlined sx={{ color: 'secondary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ m: 0, color: 'text.primary' }}>
                      {t('toolDescription.featuresTitle')}
                    </Typography>
                  </Box>
                  <List dense>
                    {details.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: 'secondary.main'
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            fontSize: '14px',
                            color: 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* 使用技巧卡片 */}
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LightbulbOutlined sx={{ color: '#fa8c16', mr: 1 }} />
                    <Typography variant="h6" sx={{ m: 0, color: 'text.primary' }}>
                      {t('toolDescription.tipsTitle')}
                    </Typography>
                  </Box>
                  <List dense>
                    {details.tips.map((tip, index) => (
                      <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: '#fa8c16'
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={tip}
                          primaryTypographyProps={{
                            fontSize: '14px',
                            color: 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Grid>

        {/* 中间操作区域 */}
        <Grid item xs={12} lg={6}>
          <Box sx={{ minHeight: '600px' }}>
            {children}
          </Box>
        </Grid>

        {/* 右侧信息栏 */}
        <Grid item xs={12} lg={3}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <Stack spacing={3}>
              {/* 使用场景卡片 */}
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BuildOutlined sx={{ color: '#722ed1', mr: 1 }} />
                    <Typography variant="h6" sx={{ m: 0, color: 'text.primary' }}>
                      {t('toolDescription.useCasesTitle')}
                    </Typography>
                  </Box>
                  <List dense>
                    {details.useCases.map((useCase, index) => (
                      <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: '#722ed1'
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={useCase}
                          primaryTypographyProps={{
                            fontSize: '14px',
                            color: 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* 常见问题卡片 */}
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HelpOutlineOutlined sx={{ color: '#eb2f96', mr: 1 }} />
                    <Typography variant="h6" sx={{ m: 0, color: 'text.primary' }}>
                      {t('toolDescription.faqTitle')}
                    </Typography>
                  </Box>
                  <Box>
                    {details.faq.map((faq, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.primary',
                            fontWeight: 600,
                            display: 'block',
                            mb: 0.5
                          }}
                        >
                          Q: {faq.q}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '14px',
                            pl: 1
                          }}
                        >
                          A: {faq.a}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* 工具介绍卡片 */}
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InfoOutlined sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ m: 0, color: 'text.primary' }}>
                      {t('toolDescription.aboutTitle')}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '14px',
                      lineHeight: 1.6
                    }}
                  >
                    {details.description}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
import React from 'react';
import { Typography, Card, Row, Col, Divider, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  InfoCircleOutlined, 
  BulbOutlined, 
  ToolOutlined, 
  QuestionCircleOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// 工具详细信息配置
const getToolDetails = (path, t) => {
  const toolDetails = {
    '/base64': {
      description: 'Base64是一种基于64个可打印字符来表示二进制数据的编码方法。广泛用于在不支持二进制数据的系统中传输数据，如电子邮件、HTTP传输等场景。',
      features: [
        '支持文本和文件的Base64编码解码',
        '自动检测Base64格式的有效性',
        '支持UTF-8字符编码',
        '一键复制结果到剪贴板',
        '实时编码解码，无需点击按钮'
      ],
      useCases: [
        '网页开发中的图片数据URI编码',
        'API接口中的二进制数据传输',
        '电子邮件附件的编码传输',
        'JWT Token的载荷编码',
        '配置文件中敏感信息的简单编码'
      ],
      tips: [
        'Base64编码后的数据大小会增加约33%',
        '编码结果末尾的"="是填充字符，用于对齐',
        'Base64不是加密方法，只是编码转换',
        '适合小文件处理，大文件建议分块处理'
      ],
      faq: [
        {
          q: 'Base64编码安全吗？',
          a: 'Base64只是编码转换，不提供加密功能。任何人都可以轻易解码，不要用于敏感信息保护。'
        },
        {
          q: '为什么编码后的字符串变长了？',
          a: 'Base64将每3个字节编码为4个字符，所以编码后长度会增加约33%。'
        }
      ]
    },
    '/json-formatter': {
      description: 'JSON（JavaScript Object Notation）格式化工具，帮助开发者美化、验证和压缩JSON数据。支持语法高亮、错误检测和格式转换。',
      features: [
        '智能JSON格式化和美化',
        '语法错误检测和提示',
        'JSON数据压缩（Minify）',
        '支持大文件JSON处理',
        '语法高亮显示',
        '一键复制和下载结果'
      ],
      useCases: [
        'API响应数据的格式化查看',
        '配置文件的格式化编辑',
        'JSON数据的结构分析',
        '前端开发中的数据调试',
        'JSON格式的验证和校正'
      ],
      tips: [
        'JSON字符串必须使用双引号，不能用单引号',
        '对象的键名必须用引号包围',
        '不支持注释和尾随逗号',
        '数值不能以0开头（除了0本身）'
      ],
      faq: [
        {
          q: 'JSON格式化有什么用？',
          a: '格式化后的JSON更易阅读，方便调试和理解数据结构，特别适合API开发和调试。'
        },
        {
          q: 'Minify有什么作用？',
          a: '压缩JSON可以减少文件大小，提高网络传输效率，常用于生产环境的API响应。'
        }
      ]
    },
    '/regex-tester': {
      description: '正则表达式测试工具，帮助开发者编写、测试和调试正则表达式。支持实时匹配预览、捕获组显示和替换功能。',
      features: [
        '实时正则表达式匹配测试',
        '高亮显示匹配结果',
        '捕获组和命名组显示',
        '支持全局、忽略大小写等修饰符',
        '正则替换功能测试',
        '常用正则表达式模板库'
      ],
      useCases: [
        '表单验证规则的编写和测试',
        '文本处理和数据清洗',
        '日志文件的模式匹配',
        '代码重构中的批量替换',
        'URL路由规则的测试'
      ],
      tips: [
        '使用非贪婪匹配（?）可以避免过度匹配',
        '复杂正则建议分步测试，逐步完善',
        '注意转义字符的使用，特别是在字符串中',
        '善用字符类[\\d\\w\\s]简化表达式'
      ],
      faq: [
        {
          q: '正则表达式性能如何优化？',
          a: '避免过度使用量词，合理使用锚点(^$)，简化字符类，避免深层嵌套。'
        },
        {
          q: '如何测试复杂的正则？',
          a: '建议分解成小部分分别测试，然后组合。使用在线工具可视化正则结构。'
        }
      ]
    },
    '/url-encoder': {
      description: 'URL编码解码工具，用于处理URL中的特殊字符。当URL包含空格、中文或特殊符号时，需要进行编码以确保正确传输。',
      features: [
        '支持完整URL和查询参数编码',
        '自动检测并处理中文字符',
        '支持批量文本的URL编码',
        '实时编码解码预览',
        '兼容RFC 3986标准',
        '支持自定义字符集编码'
      ],
      useCases: [
        'URL查询参数的编码处理',
        'API接口中文参数传递',
        '表单数据的URL安全传输',
        '搜索引擎查询字符串处理',
        'RESTful API路径参数编码'
      ],
      tips: [
        'URL编码使用%加两位十六进制数表示字符',
        '空格可以编码为%20或+号（在查询参数中）',
        '中文字符通常使用UTF-8编码',
        '不要对整个URL进行编码，只编码参数部分'
      ],
      faq: [
        {
          q: 'URL编码和Base64编码有什么区别？',
          a: 'URL编码主要处理URL中的特殊字符，Base64是将二进制数据转换为文本格式。'
        },
        {
          q: '什么时候需要URL编码？',
          a: '当URL包含空格、中文、特殊符号或保留字符时需要编码，确保URL格式正确。'
        }
      ]
    },
    '/timestamp': {
      description: 'Unix时间戳转换工具，支持时间戳与人类可读时间格式的双向转换。广泛用于服务器开发、数据库存储和API接口中。',
      features: [
        '支持秒级和毫秒级时间戳',
        '多种日期格式输出',
        '时区自动识别和转换',
        '批量时间戳转换',
        '相对时间计算',
        '当前时间戳一键获取'
      ],
      useCases: [
        '数据库时间字段的调试',
        'API接口时间参数处理',
        '日志文件时间分析',
        '定时任务时间设置',
        '前端时间显示格式化'
      ],
      tips: [
        'Unix时间戳从1970年1月1日开始计算',
        'JavaScript使用毫秒时间戳，后端多用秒级',
        '注意时区差异，建议使用UTC时间',
        '时间戳越大表示时间越晚'
      ],
      faq: [
        {
          q: '时间戳为什么从1970年开始？',
          a: '这是Unix系统的约定，称为"Unix纪元"，便于计算机处理时间。'
        },
        {
          q: '如何处理时区问题？',
          a: '建议在存储时使用UTC时间戳，在显示时根据用户时区转换。'
        }
      ]
    },
    '/jwt-decoder': {
      description: 'JWT（JSON Web Token）解码工具，用于解析和验证JWT令牌的结构和内容。帮助开发者调试身份认证和授权系统。',
      features: [
        '完整JWT结构解析（Header.Payload.Signature）',
        'Base64解码和JSON格式化',
        '令牌过期时间检查',
        '签名算法识别',
        '声明（Claims）详细显示',
        '令牌有效性基础验证'
      ],
      useCases: [
        '用户身份认证调试',
        'API访问权限验证',
        'SSO单点登录系统开发',
        'OAuth2.0令牌分析',
        '移动应用登录状态管理'
      ],
      tips: [
        'JWT包含三部分：头部、载荷、签名',
        '载荷中包含用户信息和权限声明',
        'JWT是无状态的，服务端不存储会话',
        '注意令牌的过期时间和刷新机制'
      ],
      faq: [
        {
          q: 'JWT安全吗？',
          a: 'JWT本身是安全的，但需要正确实现签名验证和过期检查。'
        },
        {
          q: '如何验证JWT签名？',
          a: '需要使用与签发时相同的密钥和算法来验证签名的有效性。'
        }
      ]
    },
    '/hash-generator': {
      description: '哈希生成工具，支持MD5、SHA-1、SHA-256等多种哈希算法。用于数据完整性校验、密码存储和数字签名等场景。',
      features: [
        '支持MD5、SHA-1、SHA-256、SHA-512算法',
        '文本和文件哈希计算',
        '批量哈希生成',
        '哈希值比对验证',
        '大小写输出选择',
        '实时计算，结果即时显示'
      ],
      useCases: [
        '文件完整性验证',
        '密码安全存储',
        '数据去重检测',
        '版本控制系统中的提交ID',
        '区块链和加密货币应用'
      ],
      tips: [
        'MD5已不适合安全场景，建议使用SHA-256',
        '相同输入总是产生相同的哈希值',
        '微小的输入变化会导致完全不同的哈希',
        '哈希是单向函数，无法从哈希值还原原文'
      ],
      faq: [
        {
          q: '哪种哈希算法最安全？',
          a: '目前SHA-256和SHA-512被认为是安全的，MD5和SHA-1已被认为不够安全。'
        },
        {
          q: '哈希碰撞是什么？',
          a: '不同的输入产生相同哈希值的情况，优秀的哈希算法应该极难出现碰撞。'
        }
      ]
    },
    '/color-converter': {
      description: '颜色格式转换工具，支持RGB、HEX、HSL、HSV等多种颜色格式的相互转换。为设计师和前端开发者提供便捷的颜色处理功能。',
      features: [
        '支持RGB、HEX、HSL、HSV、CMYK格式',
        '实时颜色预览',
        '颜色选择器集成',
        '调色板生成',
        '对比度检测',
        '无障碍颜色建议'
      ],
      useCases: [
        'Web设计颜色方案制定',
        'CSS样式表颜色调试',
        'UI设计规范建立',
        '品牌色彩标准化',
        '打印设计CMYK转换'
      ],
      tips: [
        'HEX格式以#开头，如#FF0000表示红色',
        'RGB值范围是0-255，HSL中H范围是0-360',
        'HSL更适合调整颜色的明度和饱和度',
        '注意颜色在不同屏幕上的显示差异'
      ],
      faq: [
        {
          q: 'RGB和HSL哪个更好用？',
          a: 'RGB直观易懂，HSL更适合调色和创建颜色变化。'
        },
        {
          q: '如何选择无障碍友好的颜色？',
          a: '确保足够的对比度，避免仅用颜色传达信息，考虑色盲用户需求。'
        }
      ]
    },
    '/qr-generator': {
      description: '二维码生成工具，可将文本、URL、联系信息等转换为高质量的二维码图片。支持多种尺寸和自定义样式设置。',
      features: [
        '支持文本、URL、WiFi信息等多种内容',
        '可调节二维码尺寸和质量',
        '支持PNG、JPG、SVG格式输出',
        '错误纠正级别设置',
        '自定义颜色和样式',
        '批量二维码生成'
      ],
      useCases: [
        '网站链接分享',
        'WiFi密码快速连接',
        '联系方式信息交换',
        '产品信息标签制作',
        '活动签到和验票系统'
      ],
      tips: [
        '内容越多，二维码越复杂，扫描距离需要更近',
        '选择适当的错误纠正级别平衡容量和可靠性',
        '确保足够的对比度以便扫描',
        '测试在不同设备上的扫描效果'
      ],
      faq: [
        {
          q: '二维码能存储多少信息？',
          a: '取决于内容类型，纯数字最多7089个字符，中文汉字约1800个。'
        },
        {
          q: '二维码损坏了还能扫描吗？',
          a: '二维码有错误纠正功能，轻微损坏仍可正常扫描。'
        }
      ]
    },
    '/diff': {
      description: '文本对比工具，用于比较两个文本之间的差异。支持逐行对比、高亮显示变更内容，广泛用于代码审查和版本管理。',
      features: [
        '逐行文本差异对比',
        '高亮显示增删改内容',
        '支持大文件对比',
        '忽略空格和换行选项',
        '并排和统一视图切换',
        '导出对比结果'
      ],
      useCases: [
        '代码版本差异检查',
        '文档修改对比',
        '配置文件变更审查',
        '数据文件内容比较',
        '翻译文本校对'
      ],
      tips: [
        '大文件对比可能需要较长时间',
        '可以忽略空格和换行来聚焦内容变化',
        '使用并排视图便于查看上下文',
        '定期保存重要的对比结果'
      ],
      faq: [
        {
          q: '如何处理大文件对比？',
          a: '建议将大文件分割成小块进行对比，或使用专业的文件比较工具。'
        },
        {
          q: '对比结果如何保存？',
          a: '可以截图保存结果，或复制差异内容到其他文档中。'
        }
      ]
    },
    '/text-analyzer': {
      description: '文本分析工具，提供全面的文本统计分析功能。包括字符数、词数、行数统计，以及阅读时间估算和关键词分析。',
      features: [
        '字符和单词统计',
        '行数和段落统计',
        '阅读时间估算',
        '词频分析',
        '语言检测',
        '文本复杂度评估'
      ],
      useCases: [
        'SEO内容优化',
        '社交媒体文案字数控制',
        '学术论文统计',
        '翻译工作量评估',
        '内容质量分析'
      ],
      tips: [
        '不同语言的阅读速度标准不同',
        '词频分析有助于发现内容重点',
        'SEO优化时注意关键词密度',
        '标点符号也会影响文本复杂度'
      ],
      faq: [
        {
          q: '阅读时间如何计算？',
          a: '基于平均阅读速度（每分钟200-250词）估算，实际时间因人而异。'
        },
        {
          q: '词频分析有什么用？',
          a: '帮助识别文本主题，优化关键词分布，提升内容质量。'
        }
      ]
    },
    '/text-processor': {
      description: '文本处理工具，提供批量文本编辑功能。支持大小写转换、去重、排序、替换等多种文本操作，提升文本处理效率。',
      features: [
        '大小写转换（大写、小写、首字母大写）',
        '去除重复行',
        '文本排序（正序、倒序）',
        '空行和空格清理',
        '批量查找替换',
        '文本统计功能'
      ],
      useCases: [
        '数据清洗和预处理',
        '代码格式化',
        '邮件列表整理',
        '关键词列表管理',
        '文档格式统一'
      ],
      tips: [
        '批量操作前建议先备份原文本',
        '可以组合多个操作实现复杂处理',
        '注意区分英文和中文的处理差异',
        '大文件处理时注意浏览器性能限制'
      ],
      faq: [
        {
          q: '如何去除特殊字符？',
          a: '使用查找替换功能，配合正则表达式可以精确删除特定字符。'
        },
        {
          q: '处理中文文本有什么注意事项？',
          a: '中文没有明显的词边界，统计和处理时需要考虑字符特性。'
        }
      ]
    },
    '/csv-converter': {
      description: 'CSV与JSON格式转换工具，支持表格数据在不同格式间的转换。适用于数据导入导出、格式迁移和数据分析场景。',
      features: [
        'CSV到JSON双向转换',
        '自动识别分隔符',
        '支持自定义分隔符',
        '表头自动处理',
        '数据类型智能识别',
        '大数据文件处理'
      ],
      useCases: [
        '数据库数据导入导出',
        'API数据格式转换',
        'Excel文件数据处理',
        '数据分析预处理',
        '系统间数据迁移'
      ],
      tips: [
        '确保CSV文件有清晰的表头',
        '注意处理含有逗号的数据字段',
        'JSON转CSV时注意嵌套对象的处理',
        '大文件建议分批处理'
      ],
      faq: [
        {
          q: '如何处理含有特殊字符的数据？',
          a: '使用引号包围含有逗号、换行符的字段，或选择其他分隔符。'
        },
        {
          q: 'JSON嵌套对象如何转换为CSV？',
          a: '嵌套对象会被展平为多列，或转换为字符串格式。'
        }
      ]
    },
    '/markdown-preview': {
      description: 'Markdown预览工具，提供实时Markdown渲染功能。支持标准Markdown语法，帮助编写和预览文档内容。',
      features: [
        '实时Markdown渲染',
        '语法高亮显示',
        '支持表格、代码块、链接',
        '自定义CSS样式',
        'HTML导出功能',
        '打印友好格式'
      ],
      useCases: [
        'README文件编写',
        '技术文档撰写',
        '博客文章预览',
        'GitHub文档制作',
        '项目说明文档'
      ],
      tips: [
        '熟悉常用Markdown语法提升效率',
        '使用代码块展示技术内容',
        '合理使用标题层级组织内容',
        '预览时注意在不同设备上的显示效果'
      ],
      faq: [
        {
          q: 'Markdown和HTML有什么区别？',
          a: 'Markdown更简洁易写，HTML更灵活强大。Markdown最终会转换为HTML。'
        },
        {
          q: '如何在Markdown中插入图片？',
          a: '使用![alt text](image-url)语法，或直接使用HTML的img标签。'
        }
      ]
    },
    '/uuid-generator': {
      description: 'UUID生成工具，创建全球唯一标识符。支持UUID v4标准，广泛用于数据库主键、API令牌和分布式系统中。',
      features: [
        '标准UUID v4生成',
        '批量UUID生成',
        '大小写格式选择',
        '带连字符或不带连字符',
        '一键复制所有结果',
        '生成数量自定义'
      ],
      useCases: [
        '数据库表主键',
        'API请求追踪ID',
        '文件唯一命名',
        '分布式系统节点ID',
        '临时令牌生成'
      ],
      tips: [
        'UUID v4基于随机数生成，安全性较高',
        'UUID长度固定为36个字符（含连字符）',
        '在分布式环境中UUID几乎不会重复',
        '用作数据库主键时考虑性能影响'
      ],
      faq: [
        {
          q: 'UUID会重复吗？',
          a: 'UUID v4基于随机算法，重复概率极低，可以认为是唯一的。'
        },
        {
          q: 'UUID适合做数据库主键吗？',
          a: '适合，但UUID较长，可能影响索引性能，需要权衡使用。'
        }
      ]
    },
    '/password-generator': {
      description: '密码生成工具，创建高强度随机密码。支持自定义长度和字符集，提供密码强度评估，保障账户安全。',
      features: [
        '自定义密码长度',
        '字符集选择（大小写、数字、符号）',
        '密码强度实时评估',
        '批量密码生成',
        '排除易混淆字符选项',
        '密码安全建议'
      ],
      useCases: [
        '用户账户密码创建',
        '系统管理员账户',
        'API密钥生成',
        '临时密码分发',
        '密码策略测试'
      ],
      tips: [
        '密码长度至少12位以上',
        '包含大小写字母、数字和特殊符号',
        '定期更换重要账户密码',
        '不同网站使用不同密码'
      ],
      faq: [
        {
          q: '什么样的密码最安全？',
          a: '长度12位以上，包含大小写字母、数字、特殊符号的随机组合最安全。'
        },
        {
          q: '密码强度如何评估？',
          a: '根据长度、字符种类、随机性等因素综合评估，避免使用常见模式。'
        }
      ]
    },
    '/image-compressor': {
      description: '图片压缩工具，在保持视觉质量的同时减少图片文件大小。支持JPEG、PNG等格式，优化网站加载速度。',
      features: [
        '智能压缩算法',
        '质量可调节',
        '支持多种图片格式',
        '批量图片处理',
        '压缩前后对比',
        '文件大小优化建议'
      ],
      useCases: [
        '网站图片优化',
        '移动应用资源压缩',
        '邮件附件大小控制',
        '存储空间节省',
        '网页加载速度优化'
      ],
      tips: [
        'JPEG适合照片，PNG适合图标和透明图像',
        '网页图片建议压缩到100KB以下',
        '压缩前备份原图',
        '根据用途选择合适的压缩级别'
      ],
      faq: [
        {
          q: '压缩会损失图片质量吗？',
          a: '有损压缩会减少细节，但合理设置下视觉效果仍然良好。'
        },
        {
          q: '如何选择压缩级别？',
          a: '根据使用场景平衡文件大小和质量，网页用途可以适度压缩。'
        }
      ]
    },
    '/image-watermark': {
      description: '图片水印工具，为图片添加文字或图像水印。保护图片版权，防止未授权使用，支持多种水印样式设置。',
      features: [
        '文字水印添加',
        '水印位置自定义',
        '透明度调节',
        '字体大小颜色设置',
        '批量水印处理',
        '水印预览功能'
      ],
      useCases: [
        '摄影作品版权保护',
        '企业宣传图片标识',
        '产品图片品牌标记',
        '社交媒体内容保护',
        '设计作品署名'
      ],
      tips: [
        '水印位置选择不要遮挡重要内容',
        '透明度设置要平衡可见性和美观性',
        '文字水印建议使用对比色',
        '考虑不同尺寸图片的水印适配'
      ],
      faq: [
        {
          q: '水印能完全防止盗图吗？',
          a: '水印可以起到震慑作用，但无法完全防止，配合其他保护措施更有效。'
        },
        {
          q: '如何选择水印位置？',
          a: '建议选择不影响主体内容的区域，同时确保水印不易被裁剪。'
        }
      ]
    },
    '/unicode-converter': {
      description: 'Unicode编码转换工具，处理中文与Unicode之间的编码转换。解决字符编码问题，支持多种Unicode表示格式。',
      features: [
        '中文与Unicode互转',
        '支持Unicode实体编码',
        '批量文本转换',
        '编码格式检测',
        '错误编码修复',
        '字符编码分析'
      ],
      useCases: [
        '网页中文显示问题修复',
        '数据库字符编码处理',
        'JSON中文数据处理',
        '跨系统中文传输',
        '编码问题调试'
      ],
      tips: [
        'Unicode是国际标准字符编码',
        '\\u开头的是JavaScript Unicode表示',
        '&#x开头的是HTML Unicode实体',
        'UTF-8是Unicode的一种实现方式'
      ],
      faq: [
        {
          q: 'Unicode和UTF-8有什么区别？',
          a: 'Unicode是字符集标准，UTF-8是Unicode的编码实现方式之一。'
        },
        {
          q: '为什么会出现乱码？',
          a: '通常是编码和解码使用了不同的字符集，或者字符集不支持相应字符。'
        }
      ]
    },
    '/cron-parser': {
      description: 'Cron表达式解析工具，用于解析和验证定时任务的Cron表达式。支持Linux和Spring格式，显示执行时间和规则说明。',
      features: [
        'Linux和Spring Cron格式支持',
        '表达式语法验证',
        '下次执行时间预测',
        '人类可读的规则描述',
        '常用表达式模板',
        '执行频率分析'
      ],
      useCases: [
        '定时任务配置',
        '系统维护脚本调度',
        '数据备份计划设定',
        '报表生成时间安排',
        '自动化流程触发'
      ],
      tips: [
        'Linux Cron有5个字段，Spring Cron有6个字段',
        '星号(*)表示匹配所有值',
        '逗号(,)用于列举多个值',
        '连字符(-)表示范围，斜杠(/)表示间隔'
      ],
      faq: [
        {
          q: 'Cron表达式如何表示每5分钟执行？',
          a: 'Linux格式：*/5 * * * *，Spring格式：0 */5 * * * *'
        },
        {
          q: '如何避免Cron任务重叠执行？',
          a: '合理设置执行间隔，使用锁机制防止同一任务并发执行。'
        }
      ]
    }
    // 工具详细信息配置完成
  };

  return toolDetails[path] || null;
};

export default function ToolDetailDescription({ toolPath }) {
  const { t } = useTranslation();
  const details = getToolDetails(toolPath, t);

  if (!details) {
    return null;
  }

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <Card 
        style={{ 
          background: 'var(--bg-primary)', 
          border: '1px solid var(--border-color)' 
        }}
      >
        {/* 工具描述 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Space style={{ marginBottom: '0.5rem' }}>
            <InfoCircleOutlined style={{ color: '#1677ff' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              工具介绍 | About This Tool
            </Title>
          </Space>
          <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
            {details.description}
          </Paragraph>
        </div>

        <Divider />

        <Row gutter={[24, 24]}>
          {/* 核心功能 */}
          <Col xs={24} md={12}>
            <Space style={{ marginBottom: '1rem' }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
                核心功能 | Key Features
              </Title>
            </Space>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              {details.features.map((feature, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  {feature}
                </li>
              ))}
            </ul>
          </Col>

          {/* 使用场景 */}
          <Col xs={24} md={12}>
            <Space style={{ marginBottom: '1rem' }}>
              <ToolOutlined style={{ color: '#722ed1' }} />
              <Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
                使用场景 | Use Cases
              </Title>
            </Space>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              {details.useCases.map((useCase, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  {useCase}
                </li>
              ))}
            </ul>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[24, 24]}>
          {/* 使用技巧 */}
          <Col xs={24} md={12}>
            <Space style={{ marginBottom: '1rem' }}>
              <BulbOutlined style={{ color: '#fa8c16' }} />
              <Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
                使用技巧 | Tips & Tricks
              </Title>
            </Space>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              {details.tips.map((tip, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  {tip}
                </li>
              ))}
            </ul>
          </Col>

          {/* 常见问题 */}
          <Col xs={24} md={12}>
            <Space style={{ marginBottom: '1rem' }}>
              <QuestionCircleOutlined style={{ color: '#eb2f96' }} />
              <Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
                常见问题 | FAQ
              </Title>
            </Space>
            {details.faq.map((faq, index) => (
              <div key={index} style={{ marginBottom: '1rem' }}>
                <Text strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                  Q: {faq.q}
                </Text>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  A: {faq.a}
                </Text>
              </div>
            ))}
          </Col>
        </Row>
      </Card>
    </div>
  );
}
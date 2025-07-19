import Base64Tool from './components/tools/Base64Tool';
import DiffTool from './components/tools/DiffTool';
import JsonFormatter from './components/tools/JsonFormatter';
import UrlEncoder from './components/tools/UrlEncoder';
import TimestampConverter from './components/tools/TimestampConverter';
import ColorConverter from './components/tools/ColorConverter';
import RegexTester from './components/tools/RegexTester';
import TextAnalyzer from './components/tools/TextAnalyzer';
import HashGenerator from './components/tools/HashGenerator';
import TextProcessor from './components/tools/TextProcessor';
import DataGenerator from './components/tools/DataGenerator';
import MarkdownPreview from './components/tools/MarkdownPreview';
import CsvConverter from './components/tools/CsvConverter';
import JwtDecoder from './components/tools/JwtDecoder';
import QrGenerator from './components/tools/QrGenerator';
import ImageCompressor from './components/tools/ImageCompressor';

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
  {
    path: '/json-formatter',
    name: 'JSON格式化',
    desc: 'JSON 格式化/美化/压缩',
    Component: JsonFormatter,
  },
  {
    path: '/url-encoder',
    name: 'URL编解码',
    desc: 'URL 参数编码解码',
    Component: UrlEncoder,
  },
  {
    path: '/timestamp',
    name: '时间戳转换',
    desc: 'Unix时间戳与日期互转',
    Component: TimestampConverter,
  },
  {
    path: '/color-converter',
    name: '颜色转换',
    desc: 'RGB/HEX/HSL 互转',
    Component: ColorConverter,
  },
  {
    path: '/regex-tester',
    name: '正则测试',
    desc: '正则表达式在线测试',
    Component: RegexTester,
  },
  {
    path: '/text-analyzer',
    name: '文本统计',
    desc: '字数/词数/行数/段落统计',
    Component: TextAnalyzer,
  },
  {
    path: '/hash-generator',
    name: '哈希生成',
    desc: 'MD5/SHA 哈希生成',
    Component: HashGenerator,
  },
  {
    path: '/text-processor',
    name: '文本处理',
    desc: '去重/大小写/排序/统计',
    Component: TextProcessor,
  },
  {
    path: '/data-generator',
    name: '随机数据生成',
    desc: '生成测试数据/密码/UUID',
    Component: DataGenerator,
  },
  {
    path: '/markdown-preview',
    name: 'Markdown预览',
    desc: 'Markdown 实时预览',
    Component: MarkdownPreview,
  },
  {
    path: '/csv-converter',
    name: 'CSV/JSON转换',
    desc: 'CSV 与 JSON 互转',
    Component: CsvConverter,
  },
  {
    path: '/jwt-decoder',
    name: 'JWT解码',
    desc: 'JWT Token 解码',
    Component: JwtDecoder,
  },
  {
    path: '/qr-generator',
    name: '二维码生成',
    desc: '生成二维码图片',
    Component: QrGenerator,
  },
  {
    path: '/image-compressor',
    name: '图片压缩',
    desc: '在线图片压缩',
    Component: ImageCompressor,
  },
]; 
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
import UnicodeConverter from './components/tools/UnicodeConverter';
import CronParser from './components/tools/CronParser';

export default [
  {
    path: '/base64',
    nameKey: 'Base64',
    descKey: 'Base64 Encode/Decode Tool',
    Component: Base64Tool,
  },
  {
    path: '/diff',
    nameKey: 'Diff',
    descKey: 'Text Comparison Tool',
    Component: DiffTool,
  },
  {
    path: '/json-formatter',
    nameKey: 'JSON Formatter',
    descKey: 'JSON Format/Minify Tool',
    Component: JsonFormatter,
  },
  {
    path: '/url-encoder',
    nameKey: 'URL Encoder/Decoder',
    descKey: 'URL Encode/Decode Tool',
    Component: UrlEncoder,
  },
  {
    path: '/timestamp',
    nameKey: 'Timestamp Converter',
    descKey: 'Unix Timestamp Converter',
    Component: TimestampConverter,
  },
  {
    path: '/color-converter',
    nameKey: 'Color Converter',
    descKey: 'RGB/HEX/HSL Converter',
    Component: ColorConverter,
  },
  {
    path: '/regex-tester',
    nameKey: 'Regex Tester',
    descKey: 'Regex Testing Tool',
    Component: RegexTester,
  },
  {
    path: '/text-analyzer',
    nameKey: 'Text Analyzer',
    descKey: 'Text Statistics Tool',
    Component: TextAnalyzer,
  },
  {
    path: '/hash-generator',
    nameKey: 'Hash Generator',
    descKey: 'MD5/SHA Hash Generator',
    Component: HashGenerator,
  },
  {
    path: '/text-processor',
    nameKey: 'Text Processor',
    descKey: 'Text Processing Tool',
    Component: TextProcessor,
  },
  {
    path: '/data-generator',
    nameKey: 'Data Generator',
    descKey: 'Random Data Generator',
    Component: DataGenerator,
  },
  {
    path: '/markdown-preview',
    nameKey: 'Markdown Preview',
    descKey: 'Markdown Preview Tool',
    Component: MarkdownPreview,
  },
  {
    path: '/csv-converter',
    nameKey: 'CSV ↔ JSON Converter',
    descKey: 'CSV to JSON Converter',
    Component: CsvConverter,
  },
  {
    path: '/jwt-decoder',
    nameKey: 'JWT Decoder',
    descKey: 'JWT Token Decoder',
    Component: JwtDecoder,
  },
  {
    path: '/qr-generator',
    nameKey: 'QR Code Generator',
    descKey: 'QR Code Generator Tool',
    Component: QrGenerator,
  },
  {
    path: '/image-compressor',
    nameKey: 'Image Compressor',
    descKey: 'Online Image Compressor',
    Component: ImageCompressor,
  },
  {
    path: '/unicode-converter',
    nameKey: 'Unicode Converter',
    descKey: 'Chinese Unicode Converter',
    Component: UnicodeConverter,
  },
  {
    path: '/cron-parser',
    nameKey: 'Cron Expression Converter',
    descKey: 'Cron Expression Linux/Spring Converter Tool',
    Component: CronParser,
  },
]; 
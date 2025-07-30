import { lazy } from 'react';

export default [
  {
    path: '/base64',
    nameKey: 'Base64',
    descKey: 'Base64 Encode/Decode Tool',
    Component: lazy(() => import('./components/tools/Base64Tool')),
  },
  {
    path: '/diff',
    nameKey: 'Diff',
    descKey: 'Text Comparison Tool',
    Component: lazy(() => import('./components/tools/DiffTool')),
  },
  {
    path: '/json-formatter',
    nameKey: 'JSON Formatter',
    descKey: 'JSON Format/Minify Tool',
    Component: lazy(() => import('./components/tools/JsonFormatter')),
  },
  {
    path: '/url-encoder',
    nameKey: 'URL Encoder/Decoder',
    descKey: 'URL Encode/Decode Tool',
    Component: lazy(() => import('./components/tools/UrlEncoder')),
  },
  {
    path: '/timestamp',
    nameKey: 'Timestamp Converter',
    descKey: 'Unix Timestamp Converter',
    Component: lazy(() => import('./components/tools/TimestampConverter')),
  },
  {
    path: '/color-converter',
    nameKey: 'Color Converter',
    descKey: 'RGB/HEX/HSL Converter',
    Component: lazy(() => import('./components/tools/ColorConverter')),
  },
  {
    path: '/regex-tester',
    nameKey: 'Regex Tester',
    descKey: 'Regex Testing Tool',
    Component: lazy(() => import('./components/tools/RegexTester')),
  },
  {
    path: '/text-analyzer',
    nameKey: 'Text Analyzer',
    descKey: 'Text Statistics Tool',
    Component: lazy(() => import('./components/tools/TextAnalyzer')),
  },
  {
    path: '/hash-generator',
    nameKey: 'Hash Generator',
    descKey: 'MD5/SHA Hash Generator',
    Component: lazy(() => import('./components/tools/HashGenerator')),
  },
  {
    path: '/text-processor',
    nameKey: 'Text Processor',
    descKey: 'Text Processing Tool',
    Component: lazy(() => import('./components/tools/TextProcessor')),
  },
  {
    path: '/data-generator',
    nameKey: 'Data Generator',
    descKey: 'Random Data Generator',
    Component: lazy(() => import('./components/tools/DataGenerator')),
  },
  {
    path: '/markdown-preview',
    nameKey: 'Markdown Preview',
    descKey: 'Markdown Preview Tool',
    Component: lazy(() => import('./components/tools/MarkdownPreview')),
  },
  {
    path: '/csv-converter',
    nameKey: 'CSV ↔ JSON Converter',
    descKey: 'CSV to JSON Converter',
    Component: lazy(() => import('./components/tools/CsvConverter')),
  },
  {
    path: '/jwt-decoder',
    nameKey: 'JWT Decoder',
    descKey: 'JWT Token Decoder',
    Component: lazy(() => import('./components/tools/JwtDecoder')),
  },
  {
    path: '/qr-generator',
    nameKey: 'QR Code Generator',
    descKey: 'QR Code Generator Tool',
    Component: lazy(() => import('./components/tools/QrGenerator')),
  },
  {
    path: '/image-compressor',
    nameKey: 'Image Compressor',
    descKey: 'Online Image Compressor',
    Component: lazy(() => import('./components/tools/ImageCompressor')),
  },
  {
    path: '/unicode-converter',
    nameKey: 'Unicode Converter',
    descKey: 'Chinese Unicode Converter',
    Component: lazy(() => import('./components/tools/UnicodeConverter')),
  },
  {
    path: '/cron-parser',
    nameKey: 'Cron Expression Converter',
    descKey: 'Cron Expression Linux/Spring Converter Tool',
    Component: lazy(() => import('./components/tools/CronParser')),
  },
  {
    path: '/image-watermark',
    nameKey: 'Image Watermark',
    descKey: 'Add watermark to image',
    Component: lazy(() => import('./components/tools/WatermarkTool')),
  },
  {
    path: '/create-questionnaire',
    nameKey: 'Questionnaire Generator',
    descKey: 'Create and manage questionnaires',
    Component: lazy(() => import('./components/tools/CreateQuestionnaire')),
  },
];
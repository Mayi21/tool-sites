import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  zh: {
    translation: {
      title: "多功能工具箱",
      uuid: "UUID 生成器",
      uuid_desc: "多版本批量生成 UUID",
      base64: "Base64 编解码",
      base64_desc: "字符串/文件编码解码",
      compare: "文本对比",
      compare_desc: "专业风格文本差异高亮",
      timestamp: "Unix 时间戳转换",
      timestamp_desc: "毫秒级时间戳与日期互转",
      ipgen: "IP 地址生成",
      ipgen_desc: "批量生成 IPv4/IPv6",
      password: "随机密码生成",
      password_desc: "自定义规则批量生成密码",
      unicode: "Unicode 与中文互转",
      unicode_desc: "中文转 Unicode/反向转换",
      theme_light: "亮色",
      theme_dark: "暗黑",
      lang: "English"
    }
  },
  en: {
    translation: {
      title: "Multi-Tool Box",
      uuid: "UUID Generator",
      uuid_desc: "Batch generate UUIDs of multiple versions",
      base64: "Base64 Encode/Decode",
      base64_desc: "String/File Base64 encode & decode",
      compare: "Text Diff",
      compare_desc: "Professional text diff highlighting",
      timestamp: "Unix Timestamp Converter",
      timestamp_desc: "Convert timestamp and date (ms precision)",
      ipgen: "IP Address Generator",
      ipgen_desc: "Batch generate IPv4/IPv6",
      password: "Random Password Generator",
      password_desc: "Batch generate passwords with custom rules",
      unicode: "Unicode & Chinese Converter",
      unicode_desc: "Convert between Chinese and Unicode",
      theme_light: "Light",
      theme_dark: "Dark",
      lang: "中文"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "zh",
    fallbackLng: "zh",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 
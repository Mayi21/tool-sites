import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCommon from './zh/common.json';

// 公共翻译：中文同步打包（默认/回退语言），英文按需加载
// 各工具页的翻译在 tools/ 下按工具拆分，随工具 chunk 一起懒加载
const toolLocaleFiles = import.meta.glob('./*/tools/*.json');
const commonLoaders = { en: () => import('./en/common.json') };

const loadedCommon = new Set(['zh']);
const loadedTools = new Set();

async function registerBundle(lng, loader) {
  if (!loader) return;
  const mod = await loader();
  i18n.addResourceBundle(lng, 'translation', mod.default, true, false);
}

async function loadCommonLocale(lng) {
  if (loadedCommon.has(lng) || !commonLoaders[lng]) return;
  loadedCommon.add(lng);
  await registerBundle(lng, commonLoaders[lng]);
}

function registerToolLocale(lng, toolKey) {
  return registerBundle(lng, toolLocaleFiles[`./${lng}/tools/${toolKey}.json`]);
}

/** 加载某个工具的翻译（当前语言 + 中文回退），随工具页懒加载调用 */
export async function loadToolLocale(toolKey) {
  if (loadedTools.has(toolKey)) return;
  loadedTools.add(toolKey);
  const langs = new Set(['zh', i18n.language || 'zh']);
  await Promise.all([...langs].map(lng => registerToolLocale(lng, toolKey)));
}

/** 切换语言：补齐该语言的公共翻译和所有已加载工具的翻译 */
export async function changeLanguage(lng) {
  await Promise.all([
    loadCommonLocale(lng),
    ...[...loadedTools].map(toolKey => registerToolLocale(lng, toolKey)),
  ]);
  localStorage.setItem('language', lng);
  return i18n.changeLanguage(lng);
}

i18n
  .use(initReactI18next)
  .init({
    resources: { zh: { translation: zhCommon } },
    lng: 'zh',
    fallbackLng: 'zh',
    interpolation: { escapeValue: false },
  });

const savedLanguage = localStorage.getItem('language');
if (savedLanguage && savedLanguage !== 'zh' && commonLoaders[savedLanguage]) {
  changeLanguage(savedLanguage);
}

export default i18n;

import TimestampWidget from './widgets/TimestampWidget';
import PasswordWidget from './widgets/PasswordWidget';
import UUIDWidget from './widgets/UUIDWidget';
import Base64Widget from './widgets/Base64Widget';
import JsonWidget from './widgets/JsonWidget';
import HashWidget from './widgets/HashWidget';

import { ALL_SIZES, WIDE_SIZES } from './widgetSizing';

/**
 * 工作台小组件注册表：path → { component, defaultSize, availableSizes }
 * 与 tools.js 解耦：不在表内的工具固定后以启动卡片（LauncherWidget）展示
 *
 * 只有内容真的会「横向变多」的工具才开放 xl（4 列宽）：
 * - Base64 / JSON：宽档输入输出左右并排，一倍宽装下两块文本域
 * - 哈希：SHA-256/512 的 64/128 字符需要整行才不被截断
 * 时间戳、密码、UUID 拉宽后只是空白，保持 s/m/l。
 */
export const widgetRegistry = {
  '/timestamp': { component: TimestampWidget, defaultSize: 'm', availableSizes: ALL_SIZES },
  '/password-generator': { component: PasswordWidget, defaultSize: 'm', availableSizes: ALL_SIZES },
  '/uuid-generator': { component: UUIDWidget, defaultSize: 's', availableSizes: ALL_SIZES },
  '/base64': { component: Base64Widget, defaultSize: 'm', availableSizes: WIDE_SIZES },
  '/json-formatter': { component: JsonWidget, defaultSize: 'l', availableSizes: WIDE_SIZES },
  '/hash-generator': { component: HashWidget, defaultSize: 'm', availableSizes: WIDE_SIZES },
};

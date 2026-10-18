import TimestampWidget from './widgets/TimestampWidget';
import PasswordWidget from './widgets/PasswordWidget';
import UUIDWidget from './widgets/UUIDWidget';
import Base64Widget from './widgets/Base64Widget';
import JsonWidget from './widgets/JsonWidget';
import HashWidget from './widgets/HashWidget';

/**
 * 工作台小组件注册表：path → { component, defaultSize, availableSizes }
 * 与 tools.js 解耦：不在表内的工具固定后以启动卡片（LauncherWidget）展示
 */
export const widgetRegistry = {
  '/timestamp': { component: TimestampWidget, defaultSize: 'm', availableSizes: ['s', 'm', 'l'] },
  '/password-generator': { component: PasswordWidget, defaultSize: 'm', availableSizes: ['s', 'm', 'l'] },
  '/uuid-generator': { component: UUIDWidget, defaultSize: 's', availableSizes: ['s', 'm', 'l'] },
  '/base64': { component: Base64Widget, defaultSize: 'm', availableSizes: ['m', 'l'] },
  '/json-formatter': { component: JsonWidget, defaultSize: 'l', availableSizes: ['m', 'l'] },
  '/hash-generator': { component: HashWidget, defaultSize: 'm', availableSizes: ['m', 'l'] },
};

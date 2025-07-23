import React, { useState } from 'react';
import { Card, Input, Select, Button, Typography, Space, message } from 'antd';
const { Title, Paragraph, Text } = Typography;
import { CronExpressionParser } from 'cron-parser';
import { useTranslation } from 'react-i18next';

const CRON_TYPES = [
  { value: 'linux', label: 'Linux (5位)' },
  { value: 'spring', label: 'Spring (6位)' },
];

function convertCron(expr, from, to) {
  // 简单转换逻辑：
  // Linux: 分 时 日 月 周
  // Spring: 秒 分 时 日 月 周
  // 这里只做位数补全/裁剪，复杂语法需后端支持
  const linuxParts = expr.trim().split(/\s+/);
  if (from === 'linux' && to === 'spring') {
    if (linuxParts.length === 5) {
      return '0 ' + expr;
    }
    return expr;
  }
  if (from === 'spring' && to === 'linux') {
    if (linuxParts.length === 6 && linuxParts[0] === '0') {
      return linuxParts.slice(1).join(' ');
    }
    return expr;
  }
  return expr;
}

export default function CronParser() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [type, setType] = useState('auto'); // auto: 自动识别，linux: 5位，spring: 6位
  const [result, setResult] = useState([]);
  const [error, setError] = useState('');

  // 自动识别类型
  function detectType(expr) {
    const parts = expr.trim().split(/\s+/);
    if (parts.length === 5) return 'linux';
    if (parts.length === 6) return 'spring';
    return 'unknown';
  }

  const handleRun = () => {
    setError('');
    setResult([]);
    let expr = input.trim();
    let mode = type;
    if (mode === 'auto') mode = detectType(expr);
    if (mode === 'unknown') {
      setError('无法识别表达式类型（仅支持5位或6位）');
      return;
    }
    // Linux: 5位，Spring: 6位（秒 分 时 日 月 周）
    if (mode === 'linux') {
      expr = '0 ' + expr; // 补秒位
    }
    try {
      const cron = CronExpressionParser.parse(expr);
      const times = cron.take(5)
        .map(d => (d && typeof d.toISOString === 'function') ? d.toISOString() : String(d));
      setResult(times);
    } catch (e) {
      setError('解析失败: ' + e.message);
    }
  };

  return (
    <Card style={{ maxWidth: 700, margin: '0 auto' }}>
      <Title level={2}>{t('Cron Execution Time Calculator')}</Title>
      <Paragraph>
        {t("Enter a Linux (5 fields) or Spring (6 fields) cron expression, then click 'Run' to see the next 5 execution times.")}
      </Paragraph>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Input.TextArea
          rows={3}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={t('Enter a Linux (5 fields) or Spring (6 fields) cron expression, then click \'Run\' to see the next 5 execution times.')}
        />
        <Space>
          <span>{t('Type')}</span>
          <Select
            value={type}
            onChange={setType}
            style={{ width: 160 }}
            options={[
              { value: 'auto', label: t('Auto Detect') },
              { value: 'linux', label: t('Linux (5 fields)') },
              { value: 'spring', label: t('Spring (6 fields)') },
            ]}
          />
          <Button type="primary" onClick={handleRun}>{t('Run')}</Button>
        </Space>
        {error && <Text type="danger">{error}</Text>}
        {result.length > 0 && (
          <div>
            <Text strong>{t('Next 5 execution times (UTC)')}</Text>
            <ol style={{ marginTop: 8 }}>
              {result.map((tstr, i) => <li key={i}><code>{tstr}</code></li>)}
            </ol>
          </div>
        )}
      </Space>
    </Card>
  );
}

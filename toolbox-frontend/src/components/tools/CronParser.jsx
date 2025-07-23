import React, { useState } from 'react';
import { Card, Input, Select, Button, Typography, Space, message } from 'antd';
const { Title, Paragraph, Text } = Typography;
import { useTranslation } from 'react-i18next';
import { buildApiUrl } from '../../config/api';

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
  const [loading, setLoading] = useState(false);

  // 自动识别类型
  function detectType(expr) {
    const parts = expr.trim().split(/\s+/);
    if (parts.length === 5) return 'linux';
    if (parts.length === 6) return 'spring';
    return 'unknown';
  }

  const handleRun = async () => {
    setError('');
    setResult([]);
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/api/cron/next-times'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expr: input.trim(), type, count: 5 })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.times);
      } else {
        setError(data.error || t('Failed to parse: ') + 'unknown');
      }
    } catch (e) {
      setError(t('Failed to parse: ') + e.message);
    } finally {
      setLoading(false);
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
          <Button type="primary" onClick={handleRun} loading={loading}>{t('Run')}</Button>
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

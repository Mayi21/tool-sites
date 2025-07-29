import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Row, Col, Select, Alert, Table, Tag, Divider } from 'antd';
import { PlayCircleOutlined, ClearOutlined, InfoCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CronParser() {
  const { t } = useTranslation();
  const [cronExpression, setCronExpression] = useState('');
  const [cronType, setCronType] = useState('spring');
  const [parseResult, setParseResult] = useState(null);
  const [nextExecutions, setNextExecutions] = useState([]);
  const [error, setError] = useState(null);

  // Cron字段描述
  const cronFields = {
    spring: [
      { name: t('Second'), range: '0-59', special: '* , - /' },
      { name: t('Minute'), range: '0-59', special: '* , - /' },
      { name: t('Hour'), range: '0-23', special: '* , - /' },
      { name: t('Day of Month'), range: '1-31', special: '* , - / ? L W' },
      { name: t('Month'), range: '1-12 or JAN-DEC', special: '* , - /' },
      { name: t('Day of Week'), range: '0-7 or SUN-SAT', special: '* , - / ? L #' },
      { name: t('Year'), range: '1970-2099', special: '* , - /' }
    ],
    linux: [
      { name: t('Minute'), range: '0-59', special: '* , - /' },
      { name: t('Hour'), range: '0-23', special: '* , - /' },
      { name: t('Day of Month'), range: '1-31', special: '* , - /' },
      { name: t('Month'), range: '1-12 or JAN-DEC', special: '* , - /' },
      { name: t('Day of Week'), range: '0-7 or SUN-SAT', special: '* , - /' }
    ]
  };

  // 解析Cron表达式
  function parseCronExpression(expression, type) {
    const parts = expression.trim().split(/\s+/);
    const expectedLength = type === 'spring' ? 6 : 5; // Spring支持秒和年，Linux不支持
    
    if (parts.length < expectedLength || parts.length > (type === 'spring' ? 7 : 5)) {
      throw new Error(t('Invalid cron expression format'));
    }

    const fields = cronFields[type];
    const result = {};

    parts.forEach((part, index) => {
      if (index < fields.length) {
        result[fields[index].name] = {
          value: part,
          description: describeCronField(part, fields[index].name, type)
        };
      }
    });

    return result;
  }

  // 描述Cron字段
  function describeCronField(value, fieldName, type) {
    if (value === '*') {
      return t('Every') + ' ' + fieldName.toLowerCase();
    }
    
    if (value === '?') {
      return t('No specific value');
    }

    if (value.includes('/')) {
      const [start, step] = value.split('/');
      if (start === '*') {
        return t('Every') + ' ' + step + ' ' + fieldName.toLowerCase() + '(s)';
      }
      return t('Every') + ' ' + step + ' ' + fieldName.toLowerCase() + '(s) ' + t('starting from') + ' ' + start;
    }

    if (value.includes('-')) {
      const [start, end] = value.split('-');
      return t('From') + ' ' + start + ' ' + t('to') + ' ' + end;
    }

    if (value.includes(',')) {
      const values = value.split(',');
      return t('At') + ' ' + values.join(', ');
    }

    if (value.includes('L')) {
      return t('Last') + ' ' + fieldName.toLowerCase();
    }

    if (value.includes('W')) {
      return t('Nearest weekday to') + ' ' + value.replace('W', '');
    }

    if (value.includes('#')) {
      const [day, week] = value.split('#');
      return t('The') + ' ' + week + t('th') + ' ' + getDayName(day) + ' ' + t('of the month');
    }

    return t('At') + ' ' + value;
  }

  // 获取星期名称
  function getDayName(day) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[parseInt(day)] || day;
  }

  // 计算下次执行时间（改进版本）
  function calculateNextExecutions(expression, type) {
    const executions = [];
    const now = new Date();
    
    try {
      // 解析表达式的各个部分
      const parts = expression.trim().split(/\s+/);
      const isSpring = type === 'spring';
      
      // 根据表达式类型获取字段
      let second = 0, minute = '*', hour = '*', dayOfMonth = '*', month = '*', dayOfWeek = '*';
      
      if (isSpring) {
        if (parts.length >= 6) {
          [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
        }
      } else {
        if (parts.length >= 5) {
          [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
        }
      }
      
      // 简化的下次执行时间计算
      for (let i = 0; i < 5; i++) {
        let nextTime = new Date(now);
        
        // 根据不同的表达式模式计算下次执行时间
        if (minute === '*' && hour === '*') {
          // 每分钟执行
          nextTime.setMinutes(now.getMinutes() + i + 1);
        } else if (hour === '*') {
          // 每小时的特定分钟执行
          const targetMinute = minute === '*' ? 0 : parseInt(minute) || 0;
          nextTime.setMinutes(targetMinute);
          nextTime.setHours(now.getHours() + i + 1);
        } else {
          // 每天的特定时间执行
          const targetHour = hour === '*' ? 0 : parseInt(hour) || 0;
          const targetMinute = minute === '*' ? 0 : parseInt(minute) || 0;
          nextTime.setHours(targetHour);
          nextTime.setMinutes(targetMinute);
          nextTime.setSeconds(isSpring ? (parseInt(second) || 0) : 0);
          nextTime.setDate(now.getDate() + i + 1);
        }
        
        executions.push({
          key: i,
          time: nextTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          timestamp: nextTime.getTime()
        });
      }
    } catch (e) {
      // 如果计算失败，返回示例时间
      for (let i = 0; i < 5; i++) {
        const nextTime = new Date(now.getTime() + (i + 1) * 60 * 1000);
        executions.push({
          key: i,
          time: nextTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          timestamp: nextTime.getTime()
        });
      }
    }
    
    return executions;
  }

  // 解析Cron表达式
  function handleParse() {
    try {
      setError(null);
      
      if (!cronExpression.trim()) {
        setError(t('Please enter a cron expression'));
        return;
      }

      const result = parseCronExpression(cronExpression, cronType);
      setParseResult(result);
      
      const executions = calculateNextExecutions(cronExpression, cronType);
      setNextExecutions(executions);
      
    } catch (e) {
      setError(e.message);
      setParseResult(null);
      setNextExecutions([]);
    }
  }

  // 清空所有内容
  function clearAll() {
    setCronExpression('');
    setParseResult(null);
    setNextExecutions([]);
    setError(null);
  }

  // 预设的Cron表达式示例
  const cronExamples = {
    spring: [
      { label: t('Every second'), value: '* * * * * *' },
      { label: t('Every minute'), value: '0 * * * * *' },
      { label: t('Every hour'), value: '0 0 * * * *' },
      { label: t('Every day at midnight'), value: '0 0 0 * * *' },
      { label: t('Every Monday at 9 AM'), value: '0 0 9 * * MON' },
      { label: t('Every 15 minutes'), value: '0 */15 * * * *' },
      { label: t('Every weekday at 6 PM'), value: '0 0 18 * * MON-FRI' },
      { label: t('Every 30 seconds'), value: '*/30 * * * * *' },
      { label: t('Every 5 minutes'), value: '0 */5 * * * *' },
      { label: t('Every Sunday at 2 AM'), value: '0 0 2 * * SUN' },
      { label: t('First day of every month at noon'), value: '0 0 12 1 * *' },
      { label: t('Last day of every month at 11:59 PM'), value: '0 59 23 L * *' }
    ],
    linux: [
      { label: t('Every minute'), value: '* * * * *' },
      { label: t('Every hour'), value: '0 * * * *' },
      { label: t('Every day at midnight'), value: '0 0 * * *' },
      { label: t('Every Monday at 9 AM'), value: '0 9 * * 1' },
      { label: t('Every 15 minutes'), value: '*/15 * * * *' },
      { label: t('Every weekday at 6 PM'), value: '0 18 * * 1-5' },
      { label: t('Every 5 minutes'), value: '*/5 * * * *' },
      { label: t('Every Sunday at 2 AM'), value: '0 2 * * 0' },
      { label: t('First day of every month at noon'), value: '0 12 1 * *' },
      { label: t('Every 10 minutes during business hours'), value: '*/10 9-17 * * 1-5' }
    ]
  };

  const executionColumns = [
    {
      title: t('Execution Time'),
      dataIndex: 'time',
      key: 'time',
    }
  ];

  return (
    <Card style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>
        <ClockCircleOutlined style={{ marginRight: 8 }} />
        {t('Cron Expression Parser')}
      </Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 类型选择和输入区域 */}
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>{t('Cron Type')}:</Text>
                <Select
                  value={cronType}
                  onChange={setCronType}
                  style={{ width: 200, marginLeft: 8 }}
                  options={[
                    { label: 'Spring Boot (6-7 fields)', value: 'spring' },
                    { label: 'Linux Crontab (5 fields)', value: 'linux' }
                  ]}
                />
              </div>
              
              <div>
                <Text strong>{t('Cron Expression')}:</Text>
                <Input
                  value={cronExpression}
                  onChange={e => setCronExpression(e.target.value)}
                  placeholder={cronType === 'spring' ? '0 0 12 * * ?' : '0 12 * * *'}
                  style={{ marginTop: 8 }}
                  size="large"
                />
              </div>
            </Space>
          </Col>
        </Row>

        {/* 操作按钮 */}
        <Space>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />} 
            onClick={handleParse}
            size="large"
          >
            {t('Parse Expression')}
          </Button>
          <Button 
            icon={<ClearOutlined />} 
            onClick={clearAll}
          >
            {t('Clear')}
          </Button>
        </Space>

        {/* 错误信息 */}
        {error && (
          <Alert 
            message={t('Parse Error')} 
            description={error} 
            type="error" 
            showIcon 
          />
        )}

        {/* 解析结果 */}
        {parseResult && (
          <Card title={t('Parse Result')} size="small">
            <Row gutter={[16, 16]}>
              {Object.entries(parseResult).map(([field, data]) => (
                <Col key={field} xs={24} sm={12} md={8}>
                  <Card size="small" style={{ height: '100%' }}>
                    <Text strong>{field}:</Text>
                    <br />
                    <Tag color="blue" style={{ marginTop: 4 }}>{data.value}</Tag>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {data.description}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* 下次执行时间 */}
        {nextExecutions.length > 0 && (
          <Card title={t('Next Executions')} size="small">
            <Table
              columns={executionColumns}
              dataSource={nextExecutions}
              pagination={false}
              size="small"
            />
          </Card>
        )}

        <Divider />

        {/* 字段说明 */}
        <Card title={t('Field Description')} size="small">
          <Table
            columns={[
              { title: t('Field'), dataIndex: 'name', key: 'name' },
              { title: t('Range'), dataIndex: 'range', key: 'range' },
              { title: t('Special Characters'), dataIndex: 'special', key: 'special' }
            ]}
            dataSource={cronFields[cronType]}
            pagination={false}
            size="small"
          />
        </Card>

        {/* 示例 */}
        <Card title={t('Common Examples')} size="small">
          <Row gutter={[16, 16]}>
            {cronExamples[cronType].map((example, index) => (
              <Col key={index} xs={24} sm={12} md={8}>
                <Card 
                  size="small" 
                  hoverable
                  onClick={() => setCronExpression(example.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <Text strong>{example.label}</Text>
                  <br />
                  <Text code>{example.value}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 特殊字符说明 */}
        <Card title={t('Special Characters')} size="small">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Text strong>*</Text> - {t('Any value')}
              <br />
              <Text strong>?</Text> - {t('No specific value (Spring only)')}
              <br />
              <Text strong>-</Text> - {t('Range of values')}
              <br />
              <Text strong>,</Text> - {t('List of values')}
            </Col>
            <Col xs={24} sm={12}>
              <Text strong>/</Text> - {t('Step values')}
              <br />
              <Text strong>L</Text> - {t('Last (Spring only)')}
              <br />
              <Text strong>W</Text> - {t('Weekday (Spring only)')}
              <br />
              <Text strong>#</Text> - {t('Nth occurrence (Spring only)')}
            </Col>
          </Row>
        </Card>
      </Space>
    </Card>
  );
}
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Form, Button, Space, Card, Row, Col, Checkbox, InputNumber, Spin, Empty, message, Input, Progress, Slider } from 'antd';
import { CopyOutlined, ReloadOutlined, KeyOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PasswordGenerator() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generatedPasswords, setGeneratedPasswords] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(['lowercase', 'uppercase', 'numbers', 'symbols']);
  const [form] = Form.useForm();

  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleCopyAll = () => {
    const textToCopy = generatedPasswords.join('\n');
    copyToClipboard(textToCopy);
  };

  // 密码强度计算
  const calculatePasswordStrength = (password) => {
    let score = 0;
    let feedback = [];
    
    // 长度检查
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    else feedback.push(t('Password too short'));
    
    // 字符类型检查
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 2;
    
    // 重复字符检查
    const repeatedChars = password.match(/(.)\1{2,}/g);
    if (repeatedChars) {
      score -= repeatedChars.length;
      feedback.push(t('Avoid repeated characters'));
    }
    
    // 返回强度等级
    if (score >= 6) return { level: 'strong', score: Math.min(score * 12, 100), color: '#52c41a', text: t('Strong') };
    if (score >= 4) return { level: 'medium', score: score * 15, color: '#faad14', text: t('Medium') };
    return { level: 'weak', score: Math.max(score * 20, 10), color: '#f5222d', text: t('Weak') };
  };

  const generatePassword = (length, selectedOptions) => {
    let charset = '';
    if (selectedOptions.includes('lowercase')) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (selectedOptions.includes('uppercase')) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (selectedOptions.includes('numbers')) charset += '0123456789';
    if (selectedOptions.includes('symbols')) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (!charset) return '';
    
    let password = '';
    
    // 确保每种选中的字符类型至少包含一个
    const requiredChars = [];
    if (selectedOptions.includes('lowercase')) requiredChars.push('abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]);
    if (selectedOptions.includes('uppercase')) requiredChars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]);
    if (selectedOptions.includes('numbers')) requiredChars.push('0123456789'[Math.floor(Math.random() * 10)]);
    if (selectedOptions.includes('symbols')) requiredChars.push('!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 25)]);
    
    // 先添加必需字符
    requiredChars.forEach(char => {
      password += char;
    });
    
    // 填充剩余长度
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // 打乱密码字符顺序
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const onFinish = (values) => {
    const { count, minLength, maxLength } = values;
    
    // 验证至少选择一种字符类型
    if (!selectedOptions || selectedOptions.length === 0) {
      message.error(t('Please select at least one character type'));
      return;
    }
    
    // 验证长度范围
    if (minLength > maxLength) {
      message.error(t('Minimum length cannot be greater than maximum length'));
      return;
    }
    
    setLoading(true);
    setGeneratedPasswords([]);
    
    // 模拟异步生成
    setTimeout(() => {
      const passwords = [];
      for (let i = 0; i < count; i++) {
        const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        passwords.push(generatePassword(length, selectedOptions));
      }
      
      setGeneratedPasswords(passwords);
      setLoading(false);
      message.success(t('Passwords generated successfully'));
    }, 500);
  };

  const getOverallStrength = () => {
    if (generatedPasswords.length === 0) return null;
    
    const strengths = generatedPasswords.map(pwd => calculatePasswordStrength(pwd));
    const avgScore = strengths.reduce((sum, s) => sum + s.score, 0) / strengths.length;
    
    if (avgScore >= 80) return { level: 'strong', score: avgScore, color: '#52c41a', text: t('Strong'), icon: <CheckCircleOutlined /> };
    if (avgScore >= 50) return { level: 'medium', score: avgScore, color: '#faad14', text: t('Medium'), icon: <ExclamationCircleOutlined /> };
    return { level: 'weak', score: avgScore, color: '#f5222d', text: t('Weak'), icon: <CloseCircleOutlined /> };
  };

  const overallStrength = getOverallStrength();

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>
        <KeyOutlined style={{ marginRight: 8, color: '#1677ff' }} />
        {t('Password Generator')}
      </Title>
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
        {t('Generate secure passwords with customizable options and strength analysis.')}
      </Text>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ 
          count: 5,
          minLength: 12,
          maxLength: 16
        }}
      >
        <Card type="inner" title={t('Generation Options')}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="count"
                label={t('Number of Passwords')}
                rules={[
                  { required: true, message: t('Please enter the number of passwords') },
                  { type: 'number', min: 1, max: 200, message: t('Number must be between 1 and 200') }
                ]}
              >
                <InputNumber
                  min={1}
                  max={200}
                  style={{ width: '100%' }}
                  placeholder={t('1-200')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t('Password Length Range')}>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name="minLength"
                      rules={[
                        { required: true, message: t('Required') },
                        { type: 'number', min: 6, max: 128, message: t('Length must be between 6 and 128') }
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        min={6}
                        max={128}
                        style={{ width: '100%' }}
                        placeholder={t('Min')}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="maxLength"
                      rules={[
                        { required: true, message: t('Required') },
                        { type: 'number', min: 6, max: 128, message: t('Length must be between 6 and 128') }
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        min={6}
                        max={128}
                        style={{ width: '100%' }}
                        placeholder={t('Max')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label={t('Character Types')}
          >
            <Row gutter={[16, 8]}>
              <Col xs={12} sm={6}>
                <Checkbox 
                  checked={selectedOptions.includes('lowercase')}
                  onChange={e => {
                    const checked = e.target.checked;
                    if (checked) {
                      setSelectedOptions([...selectedOptions, 'lowercase']);
                    } else {
                      setSelectedOptions(selectedOptions.filter(opt => opt !== 'lowercase'));
                    }
                  }}
                >
                  {t('Lowercase (a-z)')}
                </Checkbox>
              </Col>
              <Col xs={12} sm={6}>
                <Checkbox 
                  checked={selectedOptions.includes('uppercase')}
                  onChange={e => {
                    const checked = e.target.checked;
                    if (checked) {
                      setSelectedOptions([...selectedOptions, 'uppercase']);
                    } else {
                      setSelectedOptions(selectedOptions.filter(opt => opt !== 'uppercase'));
                    }
                  }}
                >
                  {t('Uppercase (A-Z)')}
                </Checkbox>
              </Col>
              <Col xs={12} sm={6}>
                <Checkbox 
                  checked={selectedOptions.includes('numbers')}
                  onChange={e => {
                    const checked = e.target.checked;
                    if (checked) {
                      setSelectedOptions([...selectedOptions, 'numbers']);
                    } else {
                      setSelectedOptions(selectedOptions.filter(opt => opt !== 'numbers'));
                    }
                  }}
                >
                  {t('Numbers (0-9)')}
                </Checkbox>
              </Col>
              <Col xs={12} sm={6}>
                <Checkbox 
                  checked={selectedOptions.includes('symbols')}
                  onChange={e => {
                    const checked = e.target.checked;
                    if (checked) {
                      setSelectedOptions([...selectedOptions, 'symbols']);
                    } else {
                      setSelectedOptions(selectedOptions.filter(opt => opt !== 'symbols'));
                    }
                  }}
                >
                  {t('Symbols (!@#$...)')}
                </Checkbox>
              </Col>
            </Row>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<ReloadOutlined />} loading={loading} block>
              {loading ? t('Generating...') : t('Generate Passwords')}
            </Button>
          </Form.Item>
        </Card>
      </Form>
      
      {/* 密码强度显示 */}
      {overallStrength && (
        <Card 
          type="inner" 
          title={t('Password Strength Analysis')}
          style={{ marginTop: 16 }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {overallStrength.icon}
              <Text strong style={{ color: overallStrength.color }}>
                {overallStrength.text}
              </Text>
              <Text type="secondary">
                ({Math.round(overallStrength.score)}/100)
              </Text>
            </div>
            <Progress 
              percent={overallStrength.score} 
              strokeColor={overallStrength.color}
              showInfo={false}
            />
          </Space>
        </Card>
      )}
      
      <Card 
        type="inner" 
        title={t('Generated Passwords')} 
        style={{ marginTop: 16 }} 
        extra={
          generatedPasswords.length > 0 && (
            <Button size="small" onClick={handleCopyAll} icon={<CopyOutlined />}>
              {t('Copy All')}
            </Button>
          )
        }
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
            <Spin tip={t('Generating passwords, please wait...')} />
          </div>
        ) : generatedPasswords.length > 0 ? (
          <div>
            <TextArea 
              value={generatedPasswords.join('\n')} 
              readOnly 
              rows={Math.min(generatedPasswords.length + 2, 15)} 
              style={{ fontFamily: 'monospace', fontSize: 12, marginBottom: 16 }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {generatedPasswords.slice(0, 5).map((password, index) => {
                const strength = calculatePasswordStrength(password);
                return (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '6px 10px', 
                      border: `1px solid ${strength.color}`,
                      borderRadius: 4,
                      background: `${strength.color}10`,
                      fontSize: 12,
                      fontFamily: 'monospace'
                    }}
                  >
                    <div style={{ color: strength.color, fontWeight: 'bold', fontSize: 10 }}>
                      {strength.text} ({Math.round(strength.score)}%)
                    </div>
                    <div style={{ marginTop: 2, wordBreak: 'break-all' }}>
                      {password}
                    </div>
                  </div>
                );
              })}
              {generatedPasswords.length > 5 && (
                <div style={{ 
                  padding: '6px 10px', 
                  border: '1px dashed var(--border-color)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 12,
                  color: 'var(--text-secondary)'
                }}>
                  {t('... and')} {generatedPasswords.length - 5} {t('more')}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description={t('Generated passwords will appear here. Configure options and click generate.')} />
          </div>
        )}
      </Card>

      {/* 复制成功动画 */}
      <CopySuccessAnimation 
        visible={showAnimation} 
        onAnimationEnd={handleAnimationEnd} 
      />
    </Card>
  );
}
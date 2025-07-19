import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Card, Row, Col, Statistic, Progress, Space } from 'antd';
import { FileTextOutlined, BarChartOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

export default function TextAnalyzer() {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    lines: 0,
    sentences: 0,
    paragraphs: 0,
    uniqueWords: 0,
    averageWordLength: 0,
    readingTime: 0
  });

  useEffect(() => {
    analyzeText(text);
  }, [text]);

  function analyzeText(inputText) {
    if (!inputText) {
      setStats({
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        lines: 0,
        sentences: 0,
        paragraphs: 0,
        uniqueWords: 0,
        averageWordLength: 0,
        readingTime: 0
      });
      return;
    }

    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const lines = inputText.split('\n').filter(line => line.trim().length > 0).length;
    const sentences = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    const paragraphs = inputText.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;
    
    const wordArray = inputText.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(wordArray).size;
    const averageWordLength = wordArray.length > 0 
      ? (wordArray.reduce((sum, word) => sum + word.length, 0) / wordArray.length).toFixed(1)
      : 0;
    
    // Reading time estimation (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);

    setStats({
      characters,
      charactersNoSpaces,
      words,
      lines,
      sentences,
      paragraphs,
      uniqueWords,
      averageWordLength,
      readingTime
    });
  }

  function getWordFrequency() {
    if (!text) return [];
    
    const wordArray = text.toLowerCase().match(/\b\w+\b/g) || [];
    const frequency = {};
    
    wordArray.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  }

  const wordFrequency = getWordFrequency();

  return (
    <Card style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>{t('Text Analyzer')}</Title>
      
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <TextArea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            rows={12} 
            placeholder={t('Enter text to analyze')}
          />
        </Col>
        
        <Col span={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title={t('Characters')} 
                  value={stats.characters} 
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title={t('Characters (no spaces)')} 
                  value={stats.charactersNoSpaces} 
                />
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title={t('Words')} 
                  value={stats.words} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title={t('Unique Words')} 
                  value={stats.uniqueWords} 
                />
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title={t('Lines')} 
                  value={stats.lines} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title={t('Paragraphs')} 
                  value={stats.paragraphs} 
                />
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title={t('Sentences')} 
                  value={stats.sentences} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title={t('Reading Time')} 
                  value={stats.readingTime} 
                  suffix={t('min')}
                />
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <Statistic 
                  title={t('Average Word Length')} 
                  value={stats.averageWordLength} 
                  suffix={t('characters')}
                />
              </Col>
            </Row>
          </Space>
        </Col>
      </Row>
      
      {wordFrequency.length > 0 && (
        <Card title={t('Most Common Words')} style={{ marginTop: 24 }}>
          <Row gutter={16}>
            {wordFrequency.map((item, index) => (
              <Col span={6} key={index}>
                <div style={{ 
                  padding: 8, 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: 4,
                  textAlign: 'center',
                  marginBottom: 8
                }}>
                  <div style={{ fontWeight: 'bold' }}>{item.word}</div>
                  <div>{item.count} {t('times')}</div>
                  <Progress 
                    percent={Math.round((item.count / wordFrequency[0].count) * 100)} 
                    size="small" 
                    showInfo={false}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </Card>
  );
} 
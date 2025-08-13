import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Input, Button, Space, Card, Row, Col, Switch, Tooltip } from 'antd';
import { CopyOutlined, DiffOutlined, SwapOutlined } from '@ant-design/icons';
import CopySuccessAnimation from '../CopySuccessAnimation';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * Simple text diff implementation
 * @param {string} a - First text to compare
 * @param {string} b - Second text to compare
 * @returns {string} - Formatted diff result
 */
// 计算最长公共子序列索引
function lcsIndices(aItems, bItems) {
  const m = aItems.length, n = bItems.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = aItems[i] === bItems[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const pairs = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (aItems[i] === bItems[j]) { pairs.push([i++, j++]); }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
  }
  return pairs;
}

function computeLineDiff(aText, bText, { ignoreWhitespace, caseSensitive }) {
  const norm = s => {
    let t = s;
    if (!caseSensitive) t = t.toLowerCase();
    if (ignoreWhitespace) t = t.replace(/\s+/g, '');
    return t;
  };
  const aLines = aText.split('\n');
  const bLines = bText.split('\n');
  const aKeys = aLines.map(norm);
  const bKeys = bLines.map(norm);
  const matches = lcsIndices(aKeys, bKeys);
  const result = [];
  let ai = 0, bi = 0, mi = 0;
  const pushDel = line => result.push({ type: 'del', left: line, right: '' });
  const pushAdd = line => result.push({ type: 'add', left: '', right: line });
  const pushEq = (l, r) => result.push({ type: 'eq', left: l, right: r });
  while (ai < aLines.length || bi < bLines.length) {
    if (mi < matches.length && ai === matches[mi][0] && bi === matches[mi][1]) {
      pushEq(aLines[ai++], bLines[bi++]); mi++;
    } else if (mi < matches.length && ai < matches[mi][0]) {
      pushDel(aLines[ai++]);
    } else if (mi < matches.length && bi < matches[mi][1]) {
      pushAdd(bLines[bi++]);
    } else {
      if (ai < aLines.length) pushDel(aLines[ai++]);
      if (bi < bLines.length) pushAdd(bLines[bi++]);
    }
  }
  return result;
}

function diffChars(a, b) {
  const aArr = [...a], bArr = [...b];
  const matches = lcsIndices(aArr, bArr);
  const out = [];
  let ai = 0, bi = 0, mi = 0;
  const push = (t, v) => out.push({ type: t, text: v });
  while (ai < aArr.length || bi < bArr.length) {
    if (mi < matches.length && ai === matches[mi][0] && bi === matches[mi][1]) {
      push('eq', aArr[ai]); ai++; bi++; mi++;
    } else if (mi < matches.length && ai < matches[mi][0]) {
      push('del', aArr[ai++]);
    } else if (mi < matches.length && bi < matches[mi][1]) {
      push('add', bArr[bi++]);
    } else {
      if (ai < aArr.length) push('del', aArr[ai++]);
      if (bi < bArr.length) push('add', bArr[bi++]);
    }
  }
  return out;
}

export default function DiffTool() {
  const { t } = useTranslation();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [diffLines, setDiffLines] = useState([]);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();
  
  const handleCompare = () => {
    setDiffLines(computeLineDiff(a, b, { ignoreWhitespace, caseSensitive }));
  };

  async function copyDiff() {
    if (!diffLines.length) return;
    const text = diffLines.map(l => (l.type === 'eq' ? `  ${l.left}` : l.type === 'del' ? `- ${l.left}` : `+ ${l.right}`)).join('\n');
    await copyToClipboard(text);
  }

  const swapInputs = () => {
    setA(b); setB(a); setDiffLines([]);
  };
  
  return (
    <>
      <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Title level={2}>{t('Text Comparison')}</Title>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={12}>
              <TextArea 
                value={a} 
                onChange={e => setA(e.target.value)} 
                rows={8} 
                placeholder={t('Text 1')} 
              />
            </Col>
            <Col span={12}>
              <TextArea 
                value={b} 
                onChange={e => setB(e.target.value)} 
                rows={8} 
                placeholder={t('Text 2')} 
              />
            </Col>
          </Row>
          
          <Space>
            <Button type="primary" icon={<DiffOutlined />} onClick={handleCompare}>
              {t('Compare')}
            </Button>
            <Tooltip title={t('Swap')}>
              <Button icon={<SwapOutlined />} onClick={swapInputs} />
            </Tooltip>
            <Space size="middle" style={{ marginLeft: 12 }}>
              <span>{t('Ignore Whitespace')}</span>
              <Switch checked={ignoreWhitespace} onChange={setIgnoreWhitespace} />
              <span>{t('Case Sensitive')}</span>
              <Switch checked={caseSensitive} onChange={setCaseSensitive} />
            </Space>
          </Space>
          
          {diffLines.length > 0 && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span>{t('Diff Result')}</span>
                <Button size="small" onClick={copyDiff} icon={<CopyOutlined />}>
                  {t('Copy')}
                </Button>
              </div>
              <div style={{ display: 'flex', gap: 8, maxHeight: 400, overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: 4 }}>
                {[0,1].map(col => (
                  <div key={col} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}>
                    {diffLines.map((line, idx) => {
                      const content = col === 0 ? line.left : line.right;
                      const type = line.type;
                      const bg = type === 'eq' ? 'transparent' : (col === 0 && type === 'del') || (col === 1 && type === 'add') ? 'rgba(255,0,0,0.08)' : (type !== 'eq' ? 'rgba(255,165,0,0.08)' : 'transparent');
                      const borderLeft = type === 'eq' ? '4px solid transparent' : (col === 0 && type === 'del') ? '4px solid #ff4d4f' : (col === 1 && type === 'add') ? '4px solid #52c41a' : '4px solid #faad14';
                      const charDiff = type === 'eq' ? [{ type: 'eq', text: content }] : diffChars(line.left, line.right);
                      return (
                        <div key={idx} style={{ background: bg, borderLeft, padding: '2px 8px' }}>
                          <code>
                            {charDiff
                              .filter(seg => (col === 0 ? seg.type !== 'add' : seg.type !== 'del'))
                              .map((seg, i2) => (
                                <span key={i2} style={{
                                  backgroundColor: seg.type === 'eq' ? 'transparent' : (seg.type === 'add' ? 'rgba(82,196,26,0.2)' : 'rgba(255,77,79,0.2)')
                                }}>{seg.text}</span>
                              ))}
                          </code>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Space>
      </Card>
      
      <CopySuccessAnimation 
        visible={showAnimation} 
        onAnimationEnd={handleAnimationEnd} 
      />
    </>
  );
} 
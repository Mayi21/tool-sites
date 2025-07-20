import { useState, useEffect } from 'react';
import { Card, Tooltip, Empty } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

export default function IPMap({ data }) {
  const [mapData, setMapData] = useState({});
  const [hoveredCountry, setHoveredCountry] = useState(null);

  useEffect(() => {
    console.log('IPMap received data:', data);
    
    if (data && data.length > 0) {
      // 统计每个国家的访问量
      const countryStats = {};
      data.forEach(record => {
        const country = record.country || 'Unknown';
        if (!countryStats[country]) {
          countryStats[country] = {
            count: 0,
            ips: new Set(),
            tools: new Set()
          };
        }
        countryStats[country].count++;
        countryStats[country].ips.add(record.ip);
        if (record.tool) {
          countryStats[country].tools.add(record.tool);
        }
      });

      // 转换为数组格式
      const statsArray = Object.entries(countryStats).map(([country, stats]) => ({
        country,
        count: stats.count,
        uniqueIPs: stats.ips.size,
        tools: Array.from(stats.tools)
      }));

      console.log('Processed country stats:', statsArray);

      // 找到最大值用于计算颜色深浅
      const maxCount = Math.max(...statsArray.map(item => item.count), 1);

      const processedData = {};
      statsArray.forEach(item => {
        processedData[item.country] = {
          ...item,
          intensity: item.count / maxCount
        };
      });

      setMapData(processedData);
    } else {
      console.log('No data provided to IPMap');
      setMapData({});
    }
  }, [data]);

  // 简化的世界地图数据（主要国家）
  const worldMap = {
    '中国': { x: 75, y: 35, width: 8, height: 6 },
    '美国': { x: 15, y: 30, width: 12, height: 8 },
    '日本': { x: 85, y: 32, width: 3, height: 4 },
    '韩国': { x: 82, y: 32, width: 2, height: 3 },
    '德国': { x: 48, y: 25, width: 4, height: 3 },
    '法国': { x: 46, y: 26, width: 3, height: 3 },
    '英国': { x: 45, y: 24, width: 2, height: 3 },
    '加拿大': { x: 18, y: 20, width: 10, height: 6 },
    '澳大利亚': { x: 80, y: 60, width: 8, height: 4 },
    '新加坡': { x: 75, y: 50, width: 1, height: 1 },
    '印度': { x: 65, y: 40, width: 6, height: 5 },
    '巴西': { x: 30, y: 55, width: 6, height: 5 },
    '俄罗斯': { x: 60, y: 15, width: 15, height: 8 },
    '意大利': { x: 48, y: 28, width: 3, height: 3 },
    '西班牙': { x: 44, y: 28, width: 3, height: 3 },
    'Unknown': { x: 50, y: 50, width: 2, height: 2 } // 未知国家
  };

  const getCountryColor = (country) => {
    const countryData = mapData[country];
    if (!countryData) return '#f0f0f0';
    
    const intensity = countryData.intensity;
    const baseColor = [24, 144, 255]; // 蓝色
    const alpha = 0.3 + (intensity * 0.7);
    
    return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`;
  };

  const getCountryStroke = (country) => {
    return hoveredCountry === country ? '#1890ff' : '#ccc';
  };

  const getCountryStrokeWidth = (country) => {
    return hoveredCountry === country ? 2 : 1;
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <Empty description="暂无访问数据" />
      </Card>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '500px',
        background: '#fafafa',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* 世界地图背景 */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 80"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* 海洋背景 */}
          <rect width="100" height="80" fill="#e6f7ff" />
          
          {/* 绘制国家 */}
          {Object.entries(worldMap).map(([country, coords]) => {
            const countryData = mapData[country];
            const hasData = !!countryData;
            
            return (
              <Tooltip
                key={country}
                title={
                  hasData ? (
                    <div>
                      <div><strong>{country}</strong></div>
                      <div>访问量: {countryData.count}</div>
                      <div>独立IP: {countryData.uniqueIPs}</div>
                      <div>使用功能: {countryData.tools.join(', ')}</div>
                    </div>
                  ) : (
                    <div>{country} - 暂无访问数据</div>
                  )
                }
              >
                <rect
                  x={coords.x}
                  y={coords.y}
                  width={coords.width}
                  height={coords.height}
                  fill={getCountryColor(country)}
                  stroke={getCountryStroke(country)}
                  strokeWidth={getCountryStrokeWidth(country)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                />
              </Tooltip>
            );
          })}
        </svg>

        {/* 图例 */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'white',
          padding: '12px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            <GlobalOutlined /> 访问量图例
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{
              width: '20px',
              height: '12px',
              background: 'rgba(24, 144, 255, 0.3)',
              marginRight: '8px',
              border: '1px solid #ccc'
            }}></div>
            <span>低访问量</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '20px',
              height: '12px',
              background: 'rgba(24, 144, 255, 1)',
              marginRight: '8px',
              border: '1px solid #ccc'
            }}></div>
            <span>高访问量</span>
          </div>
        </div>

        {/* 统计信息 */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'white',
          padding: '12px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            全球统计
          </div>
          <div>覆盖国家: {Object.keys(mapData).length}</div>
          <div>总访问量: {Object.values(mapData).reduce((sum, item) => sum + item.count, 0)}</div>
          <div>独立IP数: {Object.values(mapData).reduce((sum, item) => sum + item.uniqueIPs, 0)}</div>
        </div>
      </div>

      {/* 访问量排行榜 */}
      <div style={{ marginTop: '20px' }}>
        <h4>访问量排行榜</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {Object.entries(mapData)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 10)
            .map(([country, data]) => (
              <div
                key={country}
                style={{
                  background: 'white',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  border: '1px solid #d9d9d9',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '14px' }}>
                  {country === '中国' ? '🇨🇳' : 
                   country === '美国' ? '🇺🇸' : 
                   country === '日本' ? '🇯🇵' : 
                   country === '韩国' ? '🇰🇷' : 
                   country === '德国' ? '🇩🇪' : 
                   country === '法国' ? '🇫🇷' : 
                   country === '英国' ? '🇬🇧' : 
                   country === '加拿大' ? '🇨🇦' : 
                   country === '澳大利亚' ? '🇦🇺' : 
                   country === '新加坡' ? '🇸🇬' : 
                   country === '印度' ? '🇮🇳' : 
                   country === '巴西' ? '🇧🇷' : 
                   country === '俄罗斯' ? '🇷🇺' : 
                   country === '意大利' ? '🇮🇹' : 
                   country === '西班牙' ? '🇪🇸' : '🌍'}
                </span>
                <span>{country}</span>
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                  {data.count}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 
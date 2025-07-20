import React, { useMemo } from 'react';
import { Card, Tooltip, Empty } from 'antd';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import countries from 'i18n-iso-countries';
import zhLocale from 'i18n-iso-countries/langs/zh.json';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(zhLocale);
countries.registerLocale(enLocale);

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function getCountryCode(country) {
  if (!country) return undefined;
  if (country.length === 2 && /^[A-Z]{2}$/.test(country)) return country;
  let code = countries.getAlpha2Code(country, 'zh');
  if (code) return code;
  code = countries.getAlpha2Code(country, 'en');
  if (code) return code;
  return undefined;
}

export default function IPMap({ data }) {
  // 统计各国访问量，key为ISO国家码
  const countryStats = useMemo(() => {
    const stats = {};
    (data || []).forEach(item => {
      const code = getCountryCode(item.countryCode || item.country);
      if (!code) return;
      if (!stats[code]) stats[code] = { count: 0, ips: new Set() };
      stats[code].count++;
      stats[code].ips.add(item.ip);
    });
    return stats;
  }, [data]);

  const max = Math.max(...Object.values(countryStats).map(d => d.count), 1);
  const colorScale = scaleLinear().domain([0, max]).range(['#e6f7ff', '#1890ff']);

  if (!data || data.length === 0) {
    return (
      <Card>
        <Empty description="暂无访问数据" />
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ width: '100%', height: 500 }}>
        <ComposableMap
          projectionConfig={{ scale: 120 }}
          width={800}
          height={400}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const code = geo.properties.ISO_A2;
                const stat = countryStats[code];
                return (
                  <Tooltip
                    key={geo.rsmKey}
                    title={
                      stat
                        ? (
                          <div>
                            <div><strong>{geo.properties.NAME}</strong></div>
                            <div>访问量: {stat.count}</div>
                            <div>独立IP: {stat.ips.size}</div>
                          </div>
                        )
                        : `${geo.properties.NAME} - 暂无访问数据`
                    }
                  >
                    <Geography
                      geography={geo}
                      fill={stat ? colorScale(stat.count) : '#f0f0f0'}
                      stroke="#fff"
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: '#ffec3d', outline: 'none' },
                        pressed: { outline: 'none' }
                      }}
                    />
                  </Tooltip>
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
    </Card>
  );
} 
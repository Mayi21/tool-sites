import { useState } from 'react';
import { Table, Tag, Space, Button, Input, Select, Tooltip, Avatar } from 'antd';
import { 
  SearchOutlined, 
  GlobalOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  DesktopOutlined,
  MobileOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

export default function IPTable({ data }) {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data || []);
  const [selectedCountry, setSelectedCountry] = useState('all');

  // 处理搜索和过滤
  const handleSearch = (value) => {
    setSearchText(value);
    filterData(value, selectedCountry);
  };

  const handleCountryFilter = (country) => {
    setSelectedCountry(country);
    filterData(searchText, country);
  };

  const filterData = (search, country) => {
    let filtered = data || [];
    
    if (search) {
      filtered = filtered.filter(item => 
        item.ip.includes(search) ||
        item.country.includes(search) ||
        item.city.includes(search) ||
        item.tool.includes(search)
      );
    }
    
    if (country && country !== 'all') {
      filtered = filtered.filter(item => item.country === country);
    }
    
    setFilteredData(filtered);
  };

  // 获取国家列表
  const getCountries = () => {
    if (!data) return [];
    const countries = [...new Set(data.map(item => item.country))];
    return countries.sort();
  };

  // 获取设备图标
  const getDeviceIcon = (userAgent) => {
    if (userAgent.includes('Mobile')) {
      return <MobileOutlined style={{ color: '#1890ff' }} />;
    }
    return <DesktopOutlined style={{ color: '#52c41a' }} />;
  };

  // 获取国家国旗（使用emoji）
  const getCountryFlag = (country) => {
    const flagMap = {
      '中国': '🇨🇳',
      '美国': '🇺🇸',
      '日本': '🇯🇵',
      '韩国': '🇰🇷',
      '德国': '🇩🇪',
      '法国': '🇫🇷',
      '英国': '🇬🇧',
      '加拿大': '🇨🇦',
      '澳大利亚': '🇦🇺',
      '新加坡': '🇸🇬',
      '印度': '🇮🇳',
      '巴西': '🇧🇷',
      '俄罗斯': '🇷🇺',
      '意大利': '🇮🇹',
      '西班牙': '🇪🇸'
    };
    return flagMap[country] || '🌍';
  };

  const columns = [
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
      render: (ip) => (
        <Tooltip title={`IP: ${ip}`}>
          <code style={{ fontSize: '12px' }}>{ip}</code>
        </Tooltip>
      ),
      sorter: (a, b) => a.ip.localeCompare(b.ip),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 200,
      render: (_, record) => (
        <Space>
          <span style={{ fontSize: '16px' }}>
            {getCountryFlag(record.country)}
          </span>
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.country}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.city}</div>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.country.localeCompare(b.country),
    },
    {
      title: '访问功能',
      dataIndex: 'tool',
      key: 'tool',
      width: 120,
      render: (tool) => (
        <Tag color="blue" style={{ margin: 0 }}>
          {tool}
        </Tag>
      ),
      filters: [
        { text: 'Base64工具', value: 'Base64工具' },
        { text: '文本对比', value: '文本对比' },
        { text: 'JSON格式化', value: 'JSON格式化' },
        { text: 'URL编码', value: 'URL编码' },
        { text: 'Unicode转换', value: 'Unicode转换' },
        { text: '文本处理', value: '文本处理' },
        { text: 'CSV转换', value: 'CSV转换' },
      ],
      onFilter: (value, record) => record.tool === value,
    },
    {
      title: '设备',
      dataIndex: 'userAgent',
      key: 'userAgent',
      width: 80,
      render: (userAgent) => (
        <Tooltip title={userAgent}>
          {getDeviceIcon(userAgent)}
        </Tooltip>
      ),
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 120,
      render: (browser) => (
        <Tag color="green" style={{ margin: 0 }}>
          {browser}
        </Tag>
      ),
    },
    {
      title: '访问时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#666' }} />
          <span>{new Date(timestamp).toLocaleString('zh-CN')}</span>
        </Space>
      ),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      defaultSortOrder: 'descend',
    },
    {
      title: '停留时间',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration) => {
        if (!duration) return '-';
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      },
      sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const statusMap = {
          'success': { color: 'green', text: '成功' },
          'error': { color: 'red', text: '错误' },
          'pending': { color: 'orange', text: '处理中' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="搜索IP、国家、城市或功能"
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Select
            value={selectedCountry}
            onChange={handleCountryFilter}
            style={{ width: 150 }}
            placeholder="选择国家"
          >
            <Option value="all">所有国家</Option>
            {getCountries().map(country => (
              <Option key={country} value={country}>
                {getCountryFlag(country)} {country}
              </Option>
            ))}
          </Select>
          <span style={{ color: '#666' }}>
            共 {filteredData.length} 条记录
          </span>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
        }}
        scroll={{ x: 1200 }}
        size="middle"
        bordered
      />
    </div>
  );
} 
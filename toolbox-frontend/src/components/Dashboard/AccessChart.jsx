import { useEffect, useRef } from 'react';
import { Card, Empty } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AccessChart({ data }) {
  const chartRef = useRef(null);

  if (!data || !data.length) {
    return (
      <Card>
        <Empty description="暂无数据" />
      </Card>
    );
  }

  // 处理数据格式
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: '访问量',
        data: data.map(item => item.visits),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: '独立访客',
        data: data.map(item => item.uniqueVisitors),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `日期: ${context[0].label}`;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '日期',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: '访问量',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  };

  return (
    <div style={{ height: '400px', position: 'relative' }}>
      <Line 
        ref={chartRef}
        data={chartData} 
        options={options}
        style={{ height: '100%' }}
      />
    </div>
  );
} 
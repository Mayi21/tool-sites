import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

export function ResultBarChart({ data, width = 500, height = 300 }) {
  return (
    <BarChart width={width} height={height} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="text" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>
  );
}

export function ResultPieChart({ data, colors, width = 400, height = 400 }) {
  return (
    <PieChart width={width} height={height}>
      <Pie
        data={data}
        cx={200}
        cy={200}
        labelLine={false}
        label={(entry) => entry.name}
        outerRadius={80}
        fill="#8884d8"
        dataKey="count"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}

// 默认导出包含所有图表组件的对象
export default {
  ResultBarChart,
  ResultPieChart
};
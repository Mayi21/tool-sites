
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import { Card, Spin, Alert, Button, message, Row, Col } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ViewResults() {
  const { t } = useTranslation();
  const { id } = useParams();
  const query = useQuery();
  const adminToken = query.get('adminToken');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/questionnaires/${id}/results?adminToken=${adminToken}`);
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (adminToken) {
      fetchResults();
    }
  }, [id, adminToken]);

  const handleCloseQuestionnaire = async () => {
    try {
      const response = await fetch(`/api/questionnaires/${id}/close?adminToken=${adminToken}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      message.success('Questionnaire closed successfully');
    } catch (err) {
      message.error(err.message);
    }
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `questionnaire-results-${id}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!adminToken) {
    return <Alert message={t('Error')} description={t('Admin token is required to view results')} type="error" />;
  }

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message={t('Error')} description={error} type="error" />;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Card title={t('Questionnaire Results')}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleCloseQuestionnaire}>{t('Close Questionnaire')}</Button>
        <Button onClick={downloadResults}>{t('Download Results')}</Button>
      </Space>
      {results.map(result => (
        <Card key={result.id} title={result.text} style={{ marginTop: 16 }}>
          {result.type === 'single' || result.type === 'multiple' ? (
            <BarChart width={500} height={300} data={result.options}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="text" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          ) : result.type === 'rating' ? (
            <PieChart width={400} height={400}>
              <Pie data={result.options} cx={200} cy={200} labelLine={false} label={(entry) => entry.name} outerRadius={80} fill="#8884d8" dataKey="count">
                {result.options.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <ul>
              {result.submissions.map((text, i) => <li key={i}>{text}</li>)}
            </ul>
          )}
        </Card>
      ))}
    </Card>
  );
}

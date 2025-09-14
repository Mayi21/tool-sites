import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CircularProgress, Alert, Button, Grid, Box, Typography, Paper, Stack } from '@mui/material';

// 动态导入图表组件
const Charts = lazy(() => import('./Charts'));

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
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Replace with your actual API endpoint from config
        const response = await fetch(`/api/questionnaires/${id}/results?adminToken=${adminToken}`);
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'Failed to fetch results');
        }
        const data = await response.json();
        setResults(data);
        // 延迟加载图表，给用户时间阅读内容
        setTimeout(() => setShowCharts(true), 500);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (adminToken) {
      fetchResults();
    } else {
      setError(t('Admin token is required to view results'));
      setLoading(false);
    }
  }, [id, adminToken, t]);

  const handleCloseQuestionnaire = async () => {
    try {
      // Replace with your actual API endpoint from config
      const response = await fetch(`/api/questionnaires/${id}/close?adminToken=${adminToken}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to close questionnaire');
      }
      setFeedback({ type: 'success', message: 'Questionnaire closed successfully' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
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

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (!results) {
    return null; // Or some placeholder
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Paper sx={{ maxWidth: 1000, margin: 'auto', p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">{t('Questionnaire Results')}</Typography>

        {feedback.message && <Alert severity={feedback.type}>{feedback.message}</Alert>}

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleCloseQuestionnaire}>{t('Close Questionnaire')}</Button>
          <Button variant="outlined" onClick={downloadResults}>{t('Download Results')}</Button>
        </Stack>

        {results.map(result => (
          <Card key={result.id} variant="outlined">
            <CardHeader title={result.text} />
            <CardContent>
              {result.type === 'single' || result.type === 'multiple' ? (
                showCharts ? (
                  <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>}>
                    <Charts.ResultBarChart data={result.options} />
                  </Suspense>
                ) : (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                    <Typography sx={{ ml: 1 }}>Loading chart...</Typography>
                  </Box>
                )
              ) : result.type === 'rating' ? (
                showCharts ? (
                  <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>}>
                    <Charts.ResultPieChart data={result.options} colors={COLORS} />
                  </Suspense>
                ) : (
                  <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                    <Typography sx={{ ml: 1 }}>Loading chart...</Typography>
                  </Box>
                )
              ) : (
                <ul>
                  {result.submissions.map((text, i) => <li key={i}>{text}</li>)}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Paper>
  );
}
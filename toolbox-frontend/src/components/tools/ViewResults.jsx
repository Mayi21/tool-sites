
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CircularProgress, Alert, Button, Grid, Box, Typography, Paper, Stack } from '@mui/material';
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
  const [feedback, setFeedback] = useState({ type: '', message: '' });

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
                  <Tooltip />
                </PieChart>
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

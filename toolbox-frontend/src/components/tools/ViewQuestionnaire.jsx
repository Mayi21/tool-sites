
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { 
  Card, CardContent, Button, Radio, RadioGroup, Checkbox, FormGroup, FormControlLabel, TextField, Rating, 
  CircularProgress, Alert, Typography, Stack, FormControl, FormLabel, Box 
} from '@mui/material';

const QuestionDisplay = ({ question, control }) => {
  const { t } = useTranslation();
  const name = `answers.${question.id}`;

  switch (question.type) {
    case 'single':
      return (
        <FormControl component="fieldset" margin="normal" required>
          <FormLabel component="legend">{question.text}</FormLabel>
          <Controller
            name={name}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <RadioGroup {...field}>
                {question.options.map(opt => (
                  <FormControlLabel key={opt.id} value={opt.id.toString()} control={<Radio />} label={opt.text} />
                ))}
              </RadioGroup>
            )}
          />
        </FormControl>
      );
    case 'multiple':
      return (
        <FormControl component="fieldset" margin="normal" required>
          <FormLabel component="legend">{question.text}</FormLabel>
          <FormGroup>
            {question.options.map(opt => (
              <Controller
                key={opt.id}
                name={`${name}.${opt.id}`}
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Checkbox {...field} checked={!!field.value} />} label={opt.text} />
                )}
              />
            ))}
          </FormGroup>
        </FormControl>
      );
    case 'text':
      return (
        <FormControl fullWidth margin="normal" required>
          <FormLabel sx={{ mb: 1 }}>{question.text}</FormLabel>
          <Controller
            name={name}
            control={control}
            rules={{ required: true }}
            render={({ field }) => <TextField {...field} multiline rows={4} variant="outlined" />}
          />
        </FormControl>
      );
    case 'rating':
      return (
        <FormControl component="fieldset" margin="normal" required>
          <FormLabel component="legend">{question.text}</FormLabel>
          <Controller
            name={name}
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Rating {...field} onChange={(e, val) => field.onChange(val)} value={Number(field.value)} />}
          />
        </FormControl>
      );
    default:
      return null;
  }
};

export default function ViewQuestionnaire() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const { handleSubmit, control, reset } = useForm();

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const response = await fetch(`/api/questionnaires/${id}`); // Replace with actual API endpoint
        if (!response.ok) throw new Error(await response.text() || 'Failed to fetch questionnaire');
        const data = await response.json();
        setQuestionnaire(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionnaire();
  }, [id]);

  const onSubmit = async (data) => {
    const answers = Object.entries(data.answers).map(([questionId, value]) => {
        const question = questionnaire.questions.find(q => q.id.toString() === questionId);
        if (question.type === 'multiple') {
            return { question_id: parseInt(questionId), option_ids: Object.keys(value).map(Number) };
        }
        return { question_id: parseInt(questionId), answer_text: value }; 
    });

    try {
      const response = await fetch(`/api/questionnaires/${id}/submit`, { // Replace with actual API endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error(await response.text() || 'Submission failed');
      setFeedback({ type: 'success', message: 'Submission successful!' });
      reset();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (!questionnaire) {
    return null;
  }

  return (
    <Card sx={{ maxWidth: 1000, margin: 'auto', p: 2 }}>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom>{questionnaire.questionnaire.title}</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {questionnaire.questions.map((q) => <QuestionDisplay key={q.id} question={q} control={control} />)}
            {feedback.message && <Alert severity={feedback.type}>{feedback.message}</Alert>}
            <Button type="submit" variant="contained" size="large">{t('Submit')}</Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}

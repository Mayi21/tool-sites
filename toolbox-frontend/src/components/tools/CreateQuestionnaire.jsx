
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { 
  Card, CardContent, Button, TextField, Select, MenuItem, Checkbox, FormControlLabel, 
  IconButton, Stack, Grid, Typography, Alert, FormControl, InputLabel, Paper, Link, Box
} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';

const questionSchema = yup.object().shape({
  text: yup.string().required('Question text is required'),
  type: yup.string().required('Question type is required'),
  options: yup.array().when('type', {
    is: (type) => ['single', 'multiple'].includes(type),
    then: yup.array().of(yup.string().required('Option text is required')).min(1, 'At least one option is required'),
    otherwise: yup.array(),
  }),
});

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  questions: yup.array().of(questionSchema).min(1, 'At least one question is required'),
  expires_at: yup.date().nullable(),
  one_submission_per_person: yup.boolean(),
});

const QuestionOptions = ({ control, nestIndex }) => {
  const { fields, remove, append } = useFieldArray({
    control,
    name: `questions.${nestIndex}.options`
  });

  return (
    <Stack spacing={1} sx={{ mt: 2, pl: 2 }}>
      {fields.map((item, k) => (
        <Stack direction="row" spacing={1} key={item.id}>
          <Controller
            name={`questions.${nestIndex}.options.${k}`}
            control={control}
            defaultValue={item.value}
            render={({ field }) => <TextField {...field} fullWidth label={`Option ${k + 1}`} size="small" />}
          />
          <IconButton onClick={() => remove(k)}><RemoveCircleOutline /></IconButton>
        </Stack>
      ))}
      <Button onClick={() => append('')} startIcon={<AddCircleOutline />}>Add Option</Button>
    </Stack>
  );
};

const QuestionCard = ({ control, index, remove }) => {
  const { t } = useTranslation();
  const questionType = useWatch({
    control,
    name: `questions.${index}.type`,
  });

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">{`${t('Question')} ${index + 1}`}</Typography>
        <Controller
          name={`questions.${index}.text`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField {...field} label={t('Question Text')} fullWidth error={!!error} helperText={error?.message} />
          )}
        />
        <Controller
          name={`questions.${index}.type`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormControl fullWidth error={!!error}>
              <InputLabel>{t('Type')}</InputLabel>
              <Select {...field} label={t('Type')}>
                <MenuItem value="single">{t('Single Choice')}</MenuItem>
                <MenuItem value="multiple">{t('Multiple Choice')}</MenuItem>
                <MenuItem value="text">{t('Short Answer')}</MenuItem>
                <MenuItem value="rating">{t('Rating')}</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        {(questionType === 'single' || questionType === 'multiple') && <QuestionOptions nestIndex={index} {...{ control }} />}
        <Button color="error" onClick={() => remove(index)} startIcon={<RemoveCircleOutline />}>{t('Remove Question')}</Button>
      </Stack>
    </Paper>
  );
};

export default function CreateQuestionnaire() {
  const { t } = useTranslation();
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: '', questions: [{ text: '', type: 'single', options: [''] }], one_submission_per_person: false, expires_at: null },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "questions" });

  const onSubmit = async (values) => {
    try {
      const response = await fetch('/api/questionnaires', { // Replace with your actual API endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Failed to create questionnaire');
      const data = await response.json();
      setResult(data);
      setFeedback({ type: 'success', message: 'Questionnaire created successfully' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ maxWidth: 1000, margin: 'auto', p: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>{t('Create Questionnaire')}</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => <TextField {...field} label={t('Title')} fullWidth error={!!errors.title} helperText={errors.title?.message} />}
            />
            
            <Box>{fields.map((item, index) => <QuestionCard key={item.id} {...{ control, index, remove }} />)}</Box>

            <Button onClick={() => append({ text: '', type: 'single', options: [''] })} startIcon={<AddCircleOutline />}>{t('Add Question')}</Button>
            
            <Controller
              name="expires_at"
              control={control}
              render={({ field }) => <DateTimePicker {...field} label={t('Expiration Time')} renderInput={(params) => <TextField {...params} fullWidth />} />}
            />

            <Controller
              name="one_submission_per_person"
              control={control}
              render={({ field }) => <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label={t('One submission per person')} />}
            />

            {feedback.message && <Alert severity={feedback.type}>{feedback.message}</Alert>}

            <Button type="submit" variant="contained" size="large">{t('Create Questionnaire')}</Button>
          </Stack>
        </form>

        {result && (
          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6">{t('Questionnaire Created')}</Typography>
              <p>{t('Shareable Link')}: <Link href={`/questionnaire/${result.questionnaireId}`} target="_blank">{`/questionnaire/${result.questionnaireId}`}</Link></p>
              <p>{t('Admin Token')}: <code>{result.adminToken}</code></p>
              <QRCodeCanvas value={`${window.location.origin}/questionnaire/${result.questionnaireId}`} />
            </CardContent>
          </Card>
        )}
      </Card>
    </LocalizationProvider>
  );
}

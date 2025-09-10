import { useTranslation } from 'react-i18next';
import { FormControl, Select, MenuItem } from '@mui/material';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <FormControl size="small" sx={{ minWidth: 100 }}>
      <Select
        value={i18n.language}
        onChange={e => i18n.changeLanguage(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none'
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: 'none'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: '1px solid',
            borderColor: 'primary.main'
          }
        }}
      >
        <MenuItem value="zh">中文</MenuItem>
        <MenuItem value="en">English</MenuItem>
      </Select>
    </FormControl>
  );
} 
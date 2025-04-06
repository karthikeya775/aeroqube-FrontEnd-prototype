import React from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Box, 
  Typography,
  useTheme
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useLanguage } from '../contexts/LanguageContext';

// Language options with their display names
const languages = [
  { code: 'en', name: 'English (Indian)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ur', name: 'اردو (Urdu)' },
  { code: 'as', name: 'অসমীয়া (Assamese)' },
  { code: 'bho', name: 'भोजपुरी (Bhojpuri)' },
  { code: 'kok', name: 'कोंकणी (Konkani)' },
  { code: 'mai', name: 'मैथिली (Maithili)' },
  { code: 'mni-Mtei', name: 'মৈতৈলোন্ (Manipuri)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'sa', name: 'संस्कृतम् (Sanskrit)' },
  { code: 'sd', name: 'سنڌي (Sindhi)' }
];

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();
  const theme = useTheme();

  const handleChange = (event) => {
    changeLanguage(event.target.value);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1
    }}>
      <LanguageIcon fontSize="small" sx={{ color: 'white' }} />
      <FormControl variant="standard" size="small">
        <Select
          value={language}
          onChange={handleChange}
          sx={{ 
            color: 'white',
            '.MuiSelect-icon': { color: 'white' },
            '&:before': { borderBottomColor: 'rgba(255, 255, 255, 0.5)' },
            '&:hover:not(.Mui-disabled):before': { borderBottomColor: 'white' },
            fontSize: '0.875rem'
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
              },
            },
          }}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              {lang.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector;
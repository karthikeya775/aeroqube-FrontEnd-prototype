import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  InputBase,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CardActionArea,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate, useParams } from "react-router-dom";
import NewsCard from "../../Components/NewsCard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useLanguage } from "../../contexts/LanguageContext";
import { newsApi } from "../../utils/api";

// const categories = [
//   { id: 'all', label: 'All News' },
//   { id: 'technology', label: 'Technology' },
//   { id: 'business', label: 'Business' },
//   { id: 'health', label: 'Health' },
//   { id: 'politics', label: 'Politics' },
//   { id: 'science', label: 'Science' },
//   { id: 'sports' , label:'Sports'}
// ];

const Dashboard = ({ onPlayAudio, currentPlayingNews }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { category = 'all' } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [newsCategories, setNewsCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getPublishedNews();
      if (response && response.data) {
        const newsData = response.data.map(item => {
          // Check if there are translations for the selected language
          const translatedContent = item.translations && item.translations[language];
          
          // Use translated content if available, otherwise use the original content
          const title = translatedContent ? translatedContent.headline : item.headline;
          const summary = translatedContent ? translatedContent.summary : item.summary;
          const content = translatedContent ? translatedContent.content : item.content;
          const audioUrl = translatedContent && translatedContent.appwrite_audio_url 
            ? translatedContent.appwrite_audio_url
            : item.appwrite_audio_url;
          
          return {
            id: item._id,
            title: title || '',
            summary: summary || '',
            sourceName: item.source || 'Unknown Source',
            sourceUrl: item.url || '#',
            category: item.category || 'general',
            date: item.date || '',
            time: item.time || '',
            imageUrl: item.main_image?.url || (item.images && item.images.length > 0 ? item.images[0].url : ''),
            voice_file: audioUrl || null,
            content: content || '',
            originalItem: item // Store the original item for full access to translations
          };
        });
        
        setNewsItems(newsData);
      } else {
        console.error('Invalid response format:', response);
        setSnackbar({
          open: true,
          message: 'Failed to load news. Please try again.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load news. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch news when language or refreshTimestamp changes
  useEffect(() => {
    fetchNews();
  }, [language, refreshTimestamp]);

  // Filter news items based on category, search query, source filter, and tags
  const filteredNews = newsItems.filter(news => {
    const matchesCategory = category === 'all' || news.category === category;
    const matchesSearch = searchQuery === '' || 
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (news.tags && news.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesSource = sourceFilter === 'all' || news.sourceName === sourceFilter;
    const matchesTags = selectedTags.length === 0 || 
      (news.tags && selectedTags.every(tag => news.tags.includes(tag)));
    
    if (!matchesCategory) {
      console.log('Category mismatch:', {
        newsCategory: news.category,
        currentCategory: category,
        title: news.title
      });
    }
    
    return matchesCategory && matchesSearch && matchesSource && matchesTags;
  });

  // Get unique sources for filter dropdown
  const sources = [...new Set(newsItems.map(news => news.sourceName))];

  console.log('Current Playing News:', currentPlayingNews);

  // useEffect(() => {
  //   // Simulate fetching categories and news
  //   const fetchCategories = async () => {
  //     // Replace with your API call
  //     const exampleCategories = [
  //       { id: 1, name: 'Technology', articles: [] },
  //       { id: 2, name: 'Health', articles: [] },
  //       { id: 3, name: 'Sports', articles: [] },
  //     ];
  //     setNewsCategories(exampleCategories);
  //   };

  //   fetchCategories();
  // }, []);

  const handleNewsClick = (newsId) => {
    // Find the news item by ID
    const newsItem = newsItems.find(item => item.id === newsId);
    // Navigate to the news detail page with the news item as state
    navigate(`/news/${newsId}`, { state: { news: newsItem } });
  };
  
  // Handle refresh by updating the timestamp
  const handleRefresh = async () => {
    try {
      // Update timestamp to trigger a re-fetch
      setRefreshTimestamp(Date.now());
      
      setSnackbar({
        open: true,
        message: 'News content refreshed successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing news:', error);
      setSnackbar({
        open: true,
        message: 'Failed to refresh news. Please try again.',
        severity: 'error'
      });
    }
  };

  const formatDate = (timestamp) => {
    // If timestamp is in the format "YYYY-MM-DDTHH:MM:SS"
    if (typeof timestamp === 'string' && timestamp.includes('T')) {
      try {
        // Try to parse the date
        const date = new Date(timestamp);
        
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          // Format as DD/MM/YYYY
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          
          return `${day}/${month}/${year}`;
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
      
      // If parsing fails, try to extract date parts manually
      const datePart = timestamp.split('T')[0];
      const dateParts = datePart.split('-');
      
      if (dateParts.length === 3) {
        // Rearrange from YYYY-MM-DD to DD/MM/YYYY
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      }
    }
    
    // If we can't parse it, just return the original
    return timestamp;
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333" }}>
          News Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{ height: 40, borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper
        component="form"
        sx={{
          p: "6px 12px",
          display: "flex",
          alignItems: "center",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          mb: 3,
          backgroundColor: "#fff",
        }}
        elevation={2}
        onSubmit={(e) => e.preventDefault()}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, fontSize: "16px" }}
          placeholder="Search news..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <IconButton type="submit" sx={{ p: "10px", color: "#007bff" }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <IconButton 
          sx={{ p: "10px", color: showFilters ? "#007bff" : "gray" }} 
          aria-label="filter" 
          onClick={() => setShowFilters(!showFilters)}
        >
          <FilterListIcon />
        </IconButton>
      </Paper>

      {/* Filters Dropdown */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Source
            </Typography>
            <FormControl fullWidth>
              <Select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">All Sources</MenuItem>
                {sources.map((source) => (
                  <MenuItem key={source} value={source}>
                    {source}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  Tags
                </Typography>
                {selectedTags.length > 0 && (
                  <Button size="small" onClick={clearTagFilters}>
                    Clear All
                  </Button>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {allTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleTagToggle(tag)}
                    color={selectedTags.includes(tag) ? "primary" : "default"}
                    variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* News Grid */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredNews.map((news) => (
            <Grid item xs={12} md={6} lg={4} key={news.id}>
              <NewsCard 
                news={news}
                onPlayAudio={onPlayAudio}
                currentPlayingNews={currentPlayingNews}
                onReadMore={() => handleNewsClick(news.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { 
  Container, Typography, Button, Card, CardContent, CardMedia, 
  Box, Chip, Avatar, Divider, Paper
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import axios from "axios";

const NewsDetail = ({ onPlayAudio, currentPlayingNews }) => {
  const location = useLocation();
  const { newsId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsDetails = async () => {
      try {
        setLoading(true);
        let newsData;

        if (location.state?.news) {
          newsData = location.state.news;
        } else if (newsId) {
          // Fetch from API if not available in location state
          const response = await axios.get(`http://localhost:7000/aeroqube/v0/api/news/${newsId}`);
          if (response.data && response.data.data) {
            const item = response.data.data;
            
            // Check if there are translations for the selected language
            const translatedContent = item.translations && item.translations[language];
            
            // Use translated content if available, otherwise use the original content
            const title = translatedContent ? translatedContent.headline : item.headline;
            const summary = translatedContent ? translatedContent.summary : item.summary;
            const content = translatedContent ? translatedContent.content : item.content;
            const audioUrl = translatedContent && translatedContent.appwrite_audio_url 
              ? translatedContent.appwrite_audio_url
              : item.appwrite_audio_url;
            
            newsData = {
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
          } else {
            console.error('Invalid response format:', response.data);
            setError('Failed to load news details');
          }
        } else {
          setError('No news ID provided');
        }

        if (newsData) {
          // If we already have the news data from location state, check if it has translations
          if (newsData.originalItem && newsData.originalItem.translations) {
            const translatedContent = newsData.originalItem.translations[language];
            
            if (translatedContent) {
              // Update with translated content
              setNews({
                ...newsData,
                title: translatedContent.headline || newsData.title,
                summary: translatedContent.summary || newsData.summary,
                content: translatedContent.content || newsData.content,
                voice_file: translatedContent.appwrite_audio_url || newsData.voice_file
              });
            } else {
              setNews(newsData);
            }
          } else {
            setNews(newsData);
          }
        }
      } catch (error) {
        console.error('Error fetching news details:', error);
        setError('Failed to load news details');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetails();
  }, [newsId, location.state, language]);

  useEffect(() => {
    // For debugging
    console.log("News detail received state:", location.state);
    console.log("News object:", news);
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [location.state, news]);

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      
      // Format as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return timestamp;
    }
  };

  if (!news) {
    return (
      <Container sx={{ textAlign: "center", py: 5 }}>
        <Typography variant="h5" color="error">News not found</Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
          The news article could not be found. It may have been removed or the link is invalid.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }} 
          onClick={() => navigate("/dashboard")}
        >
          Go Back to Dashboard
        </Button>
      </Container>
    );
  }

  const handlePlayAudio = () => {
    if (onPlayAudio) {
      onPlayAudio(news);
    }
  };
  
  const handleGoBack = () => {
    // Use direct navigation to dashboard rather than navigate(-1)
    navigate("/dashboard");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack} 
          sx={{ 
            mb: 4,
            alignSelf: 'flex-start'
          }}
        >
          Back
        </Button>

        <Card sx={{ 
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', 
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <CardMedia
            component="img"
            height="400"
            image={news.imageUrl}
            alt={news.title}
            sx={{ objectFit: 'cover' }}
          />
          
          <CardContent sx={{ p: 4 }}>
            {/* Article metadata */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 3 
            }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={news.category}
                  color="primary"
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
                
                <Chip
                  icon={<AccessTimeIcon fontSize="small" />}
                  label={formatDate(news.timestamp)}
                  size="small"
                  variant="outlined"
                />
              </Box>
              
              <Chip
                avatar={
                  <Avatar 
                    src={`https://logo.clearbit.com/${news.sourceName.replace(/\s+/g, '').toLowerCase()}.com`}
                    alt={news.sourceName}
                  >
                    {news.sourceName?.[0]}
                  </Avatar>
                }
                label={news.sourceName}
                variant="outlined"
                size="small"
                onClick={() => window.open(news.sourceUrl, '_blank')}
                sx={{ cursor: 'pointer' }}
              />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
              {news.title}
            </Typography>
            
            {/* Summary section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                backgroundColor: '#f8f9fa',
                borderRadius: 2,
                borderLeft: '4px solid #007bff'
              }}
            >
              <Typography 
                variant="h6" 
                component="h2" 
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                Summary
              </Typography>
              <Typography variant="body1" paragraph>
                {news.summary}
              </Typography>
            </Paper>
            
            {/* <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body1" paragraph>
              {news.content || "Full content of this article is not available at the moment."}
            </Typography> */}
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="contained" 
                startIcon={<VolumeUpIcon />}
                onClick={handlePlayAudio}
              >
                Listen to Article
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default NewsDetail;
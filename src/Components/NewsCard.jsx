import { useState, useEffect } from 'react';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import { 
  Button, Card, CardMedia, CardContent, Typography, 
  Box, Chip, IconButton, Tooltip, Divider, Avatar
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';

const NewsCard = ({ news, onPlayAudio, currentPlayingNews, onReadMore }) => {
  const navigate = useNavigate();
  
  // Default values if no news prop is passed
  const {
    id,
    title = 'Breaking News: AI Transforms News Consumption',
    summary = 'AI-powered platforms now offer concise news summaries with text, audio, and 3D avatars, revolutionizing how users stay informed.',
    timestamp = new Date().toISOString(),
    imageUrl = 'https://images.unsplash.com/photo-1581090700227-1e8d49c2a960?auto=format&fit=crop&w=800&q=80',
    sourceName = 'Tech Today',
    sourceUrl = 'https://example.com',
    sourceReliability = 'High',
    voice_file
  } = news || {};

  const isCurrentlyPlaying = currentPlayingNews?.id === id;

  // Check if the voice_file is valid
  const hasValidVoiceFile = () => {
    if (!voice_file) return false;
    
    if (typeof voice_file === 'string' && voice_file.trim() !== '') {
      return true;
    }
    
    if (typeof voice_file === 'object' && voice_file.url && voice_file.url.trim() !== '') {
      return true;
    }
    
    return false;
  };

  // Debug logging for voice_file
  useEffect(() => {
    if (news) {
      console.log(`NewsCard - ID: ${id} - voice_file:`, voice_file);
      console.log(`NewsCard - ID: ${id} - voice_file type:`, typeof voice_file);
      console.log(`NewsCard - ID: ${id} - has valid voice file:`, hasValidVoiceFile());
    }
  }, [id, voice_file, news]);

  const handleListen = (e) => {
    e.stopPropagation();
    if (onPlayAudio) {
      // Ensure voice_file is properly passed
      const updatedNews = { ...news };
      console.log('Playing audio with voice_file:', updatedNews.voice_file);
      onPlayAudio(updatedNews);
    }
  };

  const handleReadMore = () => {
    if (onReadMore) {
      onReadMore();
    } else if (id) {
      navigate(`/news/${id}`);
    }
  };

  const handleSourceClick = (e) => {
    e.stopPropagation();
    if (sourceUrl) {
      window.open(sourceUrl, '_blank');
    }
  };

  const formattedDate = timestamp ? new Date(timestamp).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Unknown date';

  return (
    <Card sx={{ 
      maxWidth: '100%', 
      borderRadius: 4, 
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 20px rgba(0,0,0,0.12)'
      },
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
    onClick={handleReadMore}
    >
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={title}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip 
            size="small"
            label={formattedDate}
            variant="outlined"
            sx={{ 
              fontSize: '0.75rem',
              height: 24,
              borderRadius: 12,
            }}
            icon={<AccessTimeIcon fontSize="small" />}
          />
          
          <Chip 
            size="small"
            label={sourceName}
            color="primary"
            variant="outlined"
            sx={{ 
              fontSize: '0.75rem',
              height: 24,
              borderRadius: 12,
            }}
            icon={<LinkIcon fontSize="small" />}
            onClick={handleSourceClick}
          />
        </Box>
        
        <Typography variant="h6" component="h2" gutterBottom sx={{ 
          fontWeight: 'bold', 
          fontSize: '1.1rem',
          mb: 2,
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          lineHeight: 1.3
        }}>
          {title}
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body2" color="text.secondary" sx={{ 
          mb: 2,
          flexGrow: 1,
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 3,
          lineHeight: 1.6
        }}>
          {summary}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<VisibilityIcon />}
            sx={{ 
              borderRadius: 50,
              textTransform: 'none',
              px: 2
            }}
            onClick={handleReadMore}
          >
            Read More
          </Button>
          
          {/* Show Listen button if voice_file is valid */}
          <Button
            size="small"
            variant="contained"
            color={isCurrentlyPlaying ? "secondary" : "primary"}
            startIcon={isCurrentlyPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            onClick={handleListen}
            sx={{ 
              borderRadius: 50,
              textTransform: 'none',
              px: 2
            }}
            disabled={!hasValidVoiceFile()}
          >
            {isCurrentlyPlaying ? "Pause" : "Listen"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
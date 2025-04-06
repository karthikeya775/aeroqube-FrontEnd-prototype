import { useState, useRef, useEffect } from 'react';
import { 
  Box, Paper, Typography, IconButton, 
  Slider, LinearProgress, Chip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CloseIcon from '@mui/icons-material/Close';
import SpeedIcon from '@mui/icons-material/Speed';

// API base URL
const BASE_URL = 'http://localhost:7000/aeroqube/v0/api/news';

// For testing - a reliable public MP3 if the news audio fails
const FALLBACK_AUDIO = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const AudioPlayer = ({ news, isPlaying, onStop, onTogglePlay }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  
  const audioRef = useRef(null);
  
  // Get a valid audio URL that will work
  const getAudioUrl = () => {
    // If we're using the fallback, return it immediately
    if (useFallback) {
      console.log('Using fallback audio');
      return FALLBACK_AUDIO;
    }
    
    // Simple direct approach
    console.log('AudioPlayer - voice_file:', news?.voice_file);
    
    if (!news?.voice_file) {
      console.log('No voice_file found, switching to fallback');
      setUseFallback(true);
      return FALLBACK_AUDIO;
    }
    
    if (typeof news.voice_file === 'string') {
      return news.voice_file;
    }
    
    if (typeof news.voice_file === 'object' && news.voice_file.url) {
      return news.voice_file.url;
    }
    
    console.log('Unable to determine audio format, switching to fallback');
    setUseFallback(true);
    return FALLBACK_AUDIO;
  };
  
  // Reset on new news item
  useEffect(() => {
    // Reset fallback state when a new news item is loaded
    setUseFallback(false);
    setError(null);
    setIsLoading(true);
    
    // If there's an existing audio element, clean it up
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    
  }, [news]);
  
  // Log the audio source for debugging
  useEffect(() => {
    const audioSrc = getAudioUrl();
    console.log('AudioPlayer - news:', news);
    console.log('AudioPlayer - voice_file type:', typeof news?.voice_file);
    console.log('AudioPlayer - voice_file:', news?.voice_file);
    console.log('AudioPlayer - processed audioSrc:', audioSrc);
    console.log('AudioPlayer - using fallback:', useFallback);
    
    // Create a new audio element
    initAudio();
    
    // Clean up on unmount or when news changes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
    };
  }, [news, useFallback]);
  
  const initAudio = () => {
    const url = getAudioUrl();
    
    // If no URL is available and we're not using fallback, try the fallback
    if (!url && !useFallback) {
      console.log('No audio URL available, switching to fallback');
      setUseFallback(true);
      return;
    }
    
    console.log('Initializing audio with source:', url);
    
    try {
      // Create new audio element
      const audio = new Audio();
      
      // Configure audio properties before setting src
      audio.preload = 'auto';
      audio.volume = volume;
      audio.playbackRate = playbackRate;
      
      // Set the source and load
      audio.src = url;
      
      // Add event listeners
      audio.addEventListener('loadedmetadata', () => {
        console.log('Audio metadata loaded successfully, duration:', audio.duration);
        setDuration(audio.duration);
        setIsLoading(false);
        setError(null);
      });
      
      audio.addEventListener('canplaythrough', () => {
        console.log('Audio can play through without buffering');
        setIsLoading(false);
      });
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
      
      audio.addEventListener('ended', () => {
        console.log('Audio playback ended');
        onStop();
      });
      
      audio.addEventListener('error', (e) => {
        const errorDetails = {
          code: audio.error ? audio.error.code : 'unknown',
          message: audio.error ? audio.error.message : 'unknown error',
          src: audio.src
        };
        console.error('Audio error details:', errorDetails);
        
        // Only switch to fallback if we're not already using it
        if (!useFallback) {
          console.log('Audio error occurred, switching to fallback');
          setUseFallback(true);
          return;
        }
        
        // If we're already using the fallback and still getting errors, show them
        let errorMessage = 'Failed to load audio';
        if (audio.error) {
          switch(audio.error.code) {
            case 1: errorMessage = 'Audio loading aborted'; break;
            case 2: errorMessage = 'Network error while loading audio'; break;
            case 3: errorMessage = 'Audio decoding error'; break;
            case 4: errorMessage = 'Audio format not supported'; break;
            default: errorMessage = `Audio error: ${audio.error.message || 'unknown'}`;
          }
        }
        
        setError(errorMessage);
        setIsLoading(false);
      });
      
      // Load the audio
      audio.load();
      
      // Store reference
      audioRef.current = audio;
      
    } catch (err) {
      console.error('Error setting up audio:', err);
      setError('Failed to initialize audio player');
      setIsLoading(false);
      
      // Try fallback if not already using it
      if (!useFallback) {
        setUseFallback(true);
      }
    }
  };
  
  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    try {
      console.log('Setting volume to:', isMuted ? 0 : volume);
      audioRef.current.volume = isMuted ? 0 : volume;
    } catch (err) {
      console.error('Error setting volume:', err);
    }
  }, [volume, isMuted]);
  
  // Handle playback rate changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    try {
      console.log('Setting playback rate to:', playbackRate);
      audioRef.current.playbackRate = playbackRate;
    } catch (err) {
      console.error('Error setting playback rate:', err);
    }
  }, [playbackRate]);
  
  // Control playback
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      console.log('Attempting to play audio');
      // Wait a moment before playing to ensure audio is ready
      setTimeout(() => {
        const playPromise = audioRef.current?.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing audio:', error);
            
            if (error.name === 'NotAllowedError') {
              setError('Autoplay blocked - Please interact with the player first');
            } else if (!useFallback) {
              console.log('Play error, switching to fallback');
              setUseFallback(true);
            } else {
              setError(`Playback error: ${error.message || 'unknown'}`);
              // Let the parent know playback failed
              onTogglePlay();
            }
          });
        }
      }, 300);
    } else {
      console.log('Pausing audio');
      audioRef.current.pause();
    }
  }, [isPlaying, useFallback, onTogglePlay]);
  
  const togglePlay = () => {
    if (isLoading) return;
    onTogglePlay();
  };
  
  const handleTimeChange = (e, newValue) => {
    if (!audioRef.current) return;
    
    try {
      setCurrentTime(newValue);
      audioRef.current.currentTime = newValue;
    } catch (err) {
      console.error('Error setting current time:', err);
    }
  };
  
  const handleVolumeChange = (e, newValue) => {
    console.log('Volume changed to:', newValue);
    setVolume(newValue);
    setIsMuted(newValue === 0);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const changePlaybackRate = () => {
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper to get language display name
  const getLanguageDisplay = () => {
    if (useFallback) return "Demo Audio";
    if (!news?.currentLanguage) return "";
    
    // Map language codes to display names
    const languageNames = {
      "en": "English",
      "hi": "Hindi",
      "bn": "Bengali",
      "te": "Telugu",
      "ta": "Tamil",
      "mr": "Marathi",
      "gu": "Gujarati",
      "kn": "Kannada",
      "ml": "Malayalam",
      "pa": "Punjabi",
      "ur": "Urdu"
    };
    
    return languageNames[news.currentLanguage] || news.currentLanguage;
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        bgcolor: 'background.paper',
        borderRadius: '8px 8px 0 0',
        width: '100%',
        maxWidth: '100%',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
      }}
    >
      <IconButton 
        onClick={onStop}
        sx={{ 
          color: 'text.secondary',
          '&:hover': { color: 'error.main' }
        }}
      >
        <CloseIcon />
      </IconButton>

      <Typography 
        variant="subtitle1" 
        sx={{ 
          flex: 1, 
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {news.title}
        {getLanguageDisplay() && (
          <Chip 
            size="small" 
            label={getLanguageDisplay()} 
            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
          />
        )}
      </Typography>

      {error && (
        <Typography 
          variant="caption" 
          color="error"
          sx={{ mx: 1 }}
        >
          {error}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={togglePlay} disabled={isLoading}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        
        <Box sx={{ width: 200, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption">{formatTime(currentTime)}</Typography>
          <Slider
            value={currentTime}
            max={duration || 1}
            onChange={handleTimeChange}
            size="small"
            sx={{ mx: 1 }}
            disabled={isLoading || !duration}
          />
          <Typography variant="caption">{formatTime(duration || 0)}</Typography>
        </Box>

        <IconButton onClick={toggleMute} disabled={isLoading}>
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
        
        <Slider
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          min={0}
          max={1}
          step={0.01}
          size="small"
          sx={{ width: 100 }}
          disabled={isLoading}
        />

        <Chip
          icon={<SpeedIcon />}
          label={`${playbackRate}x`}
          onClick={changePlaybackRate}
          size="small"
          disabled={isLoading}
        />
      </Box>

      {isLoading && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0,
            height: 2
          }} 
        />
      )}
    </Paper>
  );
};

export default AudioPlayer;
 
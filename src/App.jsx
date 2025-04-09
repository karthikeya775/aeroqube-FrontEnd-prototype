import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AudioPlayer from './Components/AudioPlayer';
import Dashboard from './Pages/User/Dashboard';
import Footer from './Components/Footer';
import Header from './Components/Header';
import UserRoleSelection from './Pages/UserRoleSelection';
import { Box } from '@mui/material';
import ManageNews from './Pages/Admin/ManageNews';
import NewsDetail from './Pages/User/NewsDetail';

function App() {
  const [currentNews, setCurrentNews] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Debug log when audio state changes
  useEffect(() => {
    console.log('Current audio state:', { 
      currentNewsId: currentNews?.id,
      isPlaying: isPlaying,
      audioUrl: currentNews?.voice_file
    });
  }, [currentNews, isPlaying]);

  const handlePlayAudio = (news) => {
    console.log('handlePlayAudio called with news:', news);
    console.log('Audio URL:', news.voice_file);
    
    if (currentNews?.id === news.id) {
      console.log('Toggling play state for same audio');
      setIsPlaying(!isPlaying);
    } else {
      console.log('Setting new audio to play');
      setCurrentNews(news);
      setIsPlaying(true);
    }
  };

  const handleStopAudio = () => {
    console.log('Stopping audio playback');
    setIsPlaying(false);
    setCurrentNews(null);
  };

  const handleTogglePlay = () => {
    console.log('Toggling play state');
    setIsPlaying(!isPlaying);
  };

  return (
    <Router>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Render Header for all pages */}
        <Header />

        {/* Main Content */}
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            py: 3,
            pb: currentNews ? 12 : 3,
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <Box sx={{ width: '100%' }}>
                  <UserRoleSelection />
                </Box>
              }
            />
            <Route
              path="/dashboard"
              element={<Dashboard onPlayAudio={handlePlayAudio} currentPlayingNews={currentNews} />}
            />
            <Route path="/admin" element={<ManageNews />} />
            <Route
              path="/dashboard/:category"
              element={<Dashboard onPlayAudio={handlePlayAudio} currentPlayingNews={currentNews} />}
            />
            <Route path="/news/:id" element={<NewsDetail onPlayAudio={handlePlayAudio} currentPlayingNews={currentNews} />} />
          </Routes>
        </Box>

        {/* Audio Player */}
        {currentNews && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1100,
              bgcolor: 'background.paper',
            }}
          >
            <AudioPlayer news={currentNews} isPlaying={isPlaying} onStop={handleStopAudio} onTogglePlay={handleTogglePlay} />
          </Box>
        )}
      </Box>

      {/* Render Footer for all pages */}
      <Footer />
    </Router>
  );
}

export default App;

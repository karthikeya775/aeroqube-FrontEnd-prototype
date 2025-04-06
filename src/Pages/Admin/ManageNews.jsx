// src/Pages/Admin/ManageNews.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Menu, MenuItem, Tooltip,
  LinearProgress, Avatar, TablePagination, Divider, useTheme, useMediaQuery, Grid, FormControl, InputLabel, Select, CircularProgress,
  Snackbar, Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import { newsApi } from '../../utils/api';
import axios from 'axios';

const ManageNews = () => {
  // Theme hooks for responsive design
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // State variables
  const [news, setNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [editedNews, setEditedNews] = useState({
    headline: '',
    content: '',
    summary: '',
    source: '',
    category: 'general',
    url: '',
    main_image: null,
    voice_file: null,
    tags: [],
    status: 'pending',
    date: '',
    time: '',
    author: ''
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const columns = [
    { id: 'headline', label: 'Headline', minWidth: 170 },
    { id: 'source', label: 'Source', minWidth: 100 },
    { id: 'category', label: 'Category', minWidth: 100 },
    { id: 'date', label: 'Date', minWidth: 100 },
    { id: 'time', label: 'Time', minWidth: 100 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'actions', label: 'Edit', minWidth: 80 },
    { id: 'approveReject', label: 'Actions', minWidth: 150 },
  ];

  const fetchNews = async () => {
    try {
      setLoading(true);
      
      // Fetch news from the database
      try {
        // Use the getNewsFromDatabase API to get all news from the database
        const dbResponse = await newsApi.getNewsFromDatabase();
        console.log("Database News Response:", dbResponse);
        
        if (dbResponse && dbResponse.data && Array.isArray(dbResponse.data)) {
          const dbNews = dbResponse.data;
          console.log("News from database:", dbNews);
          
          if (dbNews.length > 0) {
            // Create a deep copy of the news array to prevent reference issues
            const newsData = JSON.parse(JSON.stringify(dbNews));
            
            // Sort news by publication date and time (newest first)
            const sortedNews = newsData.sort((a, b) => {
              const dateA = a.date ? new Date(a.date) : new Date(0);
              const dateB = b.date ? new Date(b.date) : new Date(0);
              
              if (dateA.getTime() === dateB.getTime()) {
                const timeA = a.time || '00:00';
                const timeB = b.time || '00:00';
                return timeB.localeCompare(timeA);
              }
              
              return dateB.getTime() - dateA.getTime();
            });
            
            console.log("Sorted news from database:", sortedNews);
            setNews(sortedNews);
          } else {
            console.log("No news found in the database");
            setSnackbar({
              open: true,
              message: 'No news found in the database. Try fetching and storing news first.',
              severity: 'info'
            });
            setNews([]);
          }
        } else {
          console.log("No news found in the database");
          setSnackbar({
            open: true,
            message: 'No news found in the database. Try fetching and storing news first.',
            severity: 'info'
          });
          setNews([]);
        }
      } catch (dbError) {
        console.error('Error fetching news from database:', dbError);
        setSnackbar({
          open: true,
          message: 'Failed to fetch news from database. Please try again.',
          severity: 'error'
        });
        setNews([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      // Show error message to the user
      setSnackbar({
        open: true,
        message: 'Failed to fetch news. Please try again.',
        severity: 'error'
      });
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Handlers
  const handleApprove = async (id) => {
    try {
      console.log("Publishing news item:", id);
      
      // Make a direct API call with axios instead of using the utility function
      const response = await axios.patch(
        `http://localhost:7000/aeroqube/v0/api/news/toggle-status/${id}?t=${Date.now()}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Toggle status direct response:", response);
      
      if (response.data && response.data.success) {
        // Get the updated status from the response
        const newStatus = response.data.data.status;
        console.log("New status from response:", newStatus);
        
        // Update the news list with the published item
        setNews(news.map(item => 
          item._id === id ? { ...item, status: newStatus } : item
        ));
        
        // Show success message with Snackbar
        setSnackbar({
          open: true,
          message: `News item ${newStatus === 'published' ? 'published' : 'updated'} successfully!`,
          severity: 'success'
        });
        
        // Refresh the list to ensure data is up-to-date
        await fetchNews();
      } else {
        throw new Error(response.data?.message || "Toggle status failed");
      }
    } catch (error) {
      console.error('Error publishing news:', error);
      setSnackbar({
        open: true,
        message: `Failed to publish news: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleReject = async (id) => {
    try {
      console.log("Rejecting news item:", id);
      
      // Call the delete-news API endpoint
      await newsApi.deleteNews(id);
      
      // Remove the news item from the state
      setNews(news.filter(item => item._id !== id));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'News item rejected and deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error rejecting news:', error);
      
      setSnackbar({
        open: true,
        message: 'Failed to reject news. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleSetToPending = async (id) => {
    try {
      console.log("Setting news item to pending:", id);
      
      // Make a direct API call with axios instead of using the utility function
      const response = await axios.patch(
        `http://localhost:7000/aeroqube/v0/api/news/toggle-status/${id}?t=${Date.now()}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Toggle status direct response:", response);
      
      if (response.data && response.data.success) {
        // Get the updated status from the response
        const newStatus = response.data.data.status;
        console.log("New status from response:", newStatus);
        
        // Update the news list with the pending item
        setNews(news.map(item => 
          item._id === id ? { ...item, status: newStatus } : item
        ));
        
        // Show success message with Snackbar
        setSnackbar({
          open: true,
          message: `News item set to ${newStatus} successfully!`,
          severity: 'success'
        });
        
        // Refresh the news list to ensure data is up-to-date
        await fetchNews();
      } else {
        throw new Error(response.data?.message || "Toggle status failed");
      }
    } catch (error) {
      console.error('Error setting news to pending:', error);
      
      // Show error message with Snackbar
      setSnackbar({
        open: true,
        message: `Failed to set news to pending: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleOpenDetails = (newsItem) => {
    setSelectedNews(newsItem);
    setEditedNews({
      headline: newsItem.headline || '',
      content: newsItem.content || '',
      summary: newsItem.summary || '',
      source: newsItem.source || '',
      category: newsItem.category || 'general',
      url: newsItem.url || '',
      main_image: newsItem.main_image || null,
      voice_file: newsItem.voice_file || null,
      tags: newsItem.tags || [],
      status: newsItem.status || 'pending',
      date: newsItem.date || '',
      time: newsItem.time || '',
      author: newsItem.author || ''
    });
    setDialogOpen(true);
  };

  const handleEdit = (news) => {
    console.log("News item being edited:", news);
    console.log("Main image:", news.main_image);
    
    setSelectedNews(news);
    setEditedNews({
      headline: news.headline || '',
      summary: news.summary || '',
      category: news.category || 'general',
      tags: news.tags || [],
      content: news.content || '',
      source: news.source || '',
      url: news.url || '',
      main_image: news.main_image || null,
      voice_file: news.voice_file || null,
      status: news.status || 'pending',
      date: news.date || '',
      time: news.time || '',
      author: news.author || ''
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!selectedNews?._id) {
        throw new Error('No news item selected');
      }

      console.log("Saving changes for news item:", selectedNews._id);
      
      // Only include the 4 editable fields as confirmed by backend team
      const updateData = {
        headline: editedNews.headline,
        summary: editedNews.summary,
        category: editedNews.category,
        tags: editedNews.tags
      };
      
      console.log("Sending update with only the 4 editable fields:", updateData);
      
      // Call the API
      const response = await axios.put(
        `http://localhost:7000/aeroqube/v0/api/news/update-news/${selectedNews._id}`, 
        updateData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Direct API response:", response);
      
      // Close the dialog
      setDialogOpen(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'News item updated successfully!',
        severity: 'success'
      });
      
      // Refresh the news list
      await fetchNews();
    } catch (error) {
      console.error('Error updating news:', error);
      
      // Extract error message
      let errorMessage = 'Unknown error';
      
      if (error.response) {
        console.log('Error response:', error.response);
        errorMessage = error.response.data?.message || error.response.statusText || 'Server error';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error message
      setSnackbar({
        open: true,
        message: `Failed to update news: ${errorMessage}`,
        severity: 'error'
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedNews(null);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (filter) => {
    console.log("Setting filter to:", filter);
    if (filter !== undefined) {
      setStatusFilter(filter);
    }
    setFilterAnchorEl(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleRefresh = async () => {
    await fetchNews();
  };

  const handleProcessNews = async () => {
    try {
      setLoading(true);
      setSnackbar({
        open: true,
        message: 'Starting news processing...',
        severity: 'info'
      });
      
      const response = await newsApi.processNews();
      console.log('Processing result:', response);
      
      // Check if processing is already in progress
      if (response && response.message) {
        setSnackbar({
          open: true,
          message: 'News extraction is already in progress. Please wait for it to complete.',
          severity: 'warning'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'News processing started successfully!',
          severity: 'success'
        });
        
        // Refresh the news list
        await fetchNews();
      }
    } catch (error) {
      console.error('Error processing news:', error);
      setSnackbar({
        open: true,
        message: 'Failed to process news. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch news from external API and write to news.json
  const handleFetchFromExternal = async () => {
    try {
      setLoading(true);
      setSnackbar({
        open: true,
        message: 'Fetching news from external API...',
        severity: 'info'
      });
      
      // Call the getAllNews endpoint which fetches from external source and saves to news.json
      const response = await newsApi.getAllNews();
      console.log("External API fetch response:", response);
      
      // Check for API unavailability
      if (response.data && response.data.message && response.data.message.includes("unavailable")) {
        setSnackbar({
          open: true,
          message: 'News API service is currently unavailable. Please try again later.',
          severity: 'error'
        });
        return;
      }
      
      setSnackbar({
        open: true,
        message: response.data.message || 'Successfully fetched news from external API and saved to news.json.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error fetching from external API:', error);
      
      // Check for API unavailability in the error
      if (error.response && error.response.data && error.response.data.message && 
          error.response.data.message.includes("unavailable")) {
        setSnackbar({
          open: true,
          message: 'News API service is currently unavailable. Please try again later.',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to fetch news from external API. Please try again.',
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Add this new function to fetch and store news
  const handleFetchAndStoreNews = async () => {
    try {
      setLoading(true);
      setSnackbar({
        open: true,
        message: 'Fetching and storing news...',
        severity: 'info'
      });
      
      // Simply call the addNewsToDatabase endpoint, which will handle everything on the backend
      const response = await newsApi.addNewsToDatabase();
      console.log("Add to database response:", response);
      
      // Check for API unavailability
      if (response.data && response.data.message && response.data.message.includes("unavailable")) {
        setSnackbar({
          open: true,
          message: 'News API service is currently unavailable. Please try again later.',
          severity: 'error'
        });
        return;
      }
      
      // Refresh the news list
      await fetchNews();
      
      setSnackbar({
        open: true,
        message: response.data.message || 'Successfully added news from news.json to the database.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding news to database:', error);
      
      // Check for API unavailability in the error
      if (error.response && error.response.data && error.response.data.message && 
          error.response.data.message.includes("unavailable")) {
        setSnackbar({
          open: true,
          message: 'News API service is currently unavailable. Please try again later.',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to add news to database. Please try again.',
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredNews = news
    .filter(item => {
      console.log("Filtering item:", item.headline, "Status:", item.status, "Filter:", statusFilter);
      if (statusFilter === 'all') return true;
      if (statusFilter === 'pending') return item.status === 'pending';
      if (statusFilter === 'approved') return item.status === 'published';
      if (statusFilter === 'rejected') return item.status === 'rejected';
      return true;
    })
    .filter(item => {
      // If search query is empty, show all items
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase().trim();
      
      // Search in headline
      if (item.headline?.toLowerCase().includes(query)) return true;
      
      // Search in source
      if (item.source?.toLowerCase().includes(query)) return true;
      
      // Search in tags
      if (item.tags && Array.isArray(item.tags)) {
        return item.tags.some(tag => tag.toLowerCase().includes(query));
      }
      
      return false;
    });

  // Calculate pagination
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredNews.length - page * rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 3, color: '#1a237e' }}>Loading news articles...</Typography>
        <LinearProgress color="primary" sx={{ width: '50%', borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Manage News
        </Typography>
         
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleFetchFromExternal}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "1. Fetch from API"}
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={handleFetchAndStoreNews}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "2. Store in DB"}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Refresh"}
          </Button>
          
          <Button
            variant="contained"
            color="info"
            onClick={handleProcessNews}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Scrap News"}
          </Button>
        </Box>
      </Box>
      
      {/* Status Summary Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, 
        gap: 2, 
        mb: 4
      }}>
        <Paper sx={{ 
          p: 3, 
          borderRadius: 3,
          backgroundColor: '#e3f2fd',
          borderLeft: '5px solid #2196f3',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 6px 25px rgba(0,0,0,0.07)'
          }
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Total Articles</Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2196f3', mt: 1 }}>
            {news.length}
          </Typography>
        </Paper>
        
        <Paper sx={{ 
          p: 3, 
          borderRadius: 3,
          backgroundColor: '#fff8e1',
          borderLeft: '5px solid #ffc107',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 6px 25px rgba(0,0,0,0.07)'
          }
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Pending</Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#ffc107', mt: 1 }}>
            {news.filter(item => item.status === 'pending').length}
          </Typography>
        </Paper>
        
        <Paper sx={{ 
          p: 3, 
          borderRadius: 3,
          backgroundColor: '#e8f5e9',
          borderLeft: '5px solid #4caf50',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 6px 25px rgba(0,0,0,0.07)'
          }
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Approved</Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#4caf50', mt: 1 }}>
            {news.filter(item => item.status === 'published').length}
          </Typography>
        </Paper>
        
        <Paper sx={{ 
          p: 3, 
          borderRadius: 3,
          backgroundColor: '#ffebee',
          borderLeft: '5px solid #f44336',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 6px 25px rgba(0,0,0,0.07)'
          }
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Rejected</Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#f44336', mt: 1 }}>
            {news.filter(item => item.status === 'rejected').length}
          </Typography>
        </Paper>
      </Box>

      {/* News Table */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 3, 
        boxShadow: '0 6px 25px rgba(0,0,0,0.07)', 
        mb: 3,
        overflow: 'hidden',
        width: '100%'
      }}>
        <Table sx={{ width: '100%' }}>
          <TableHead sx={{ backgroundColor: '#f0f4f8' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNews
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                  <TableCell>{row.headline}</TableCell>
                  <TableCell>{row.source}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>
                    {row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {row.time || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status === 'published' ? 'Approved' : row.status === 'pending' ? 'Pending' : 'Rejected'}
                      color={row.status === 'published' ? 'success' : row.status === 'pending' ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(row)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    {row.status === 'pending' ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleApprove(row._id)}
                          sx={{ 
                            bgcolor: 'success.main',
                            '&:hover': { bgcolor: 'success.dark' },
                            textTransform: 'none',
                            px: 1,
                            py: 0.5,
                            minWidth: 'auto'
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleReject(row._id)}
                          sx={{ 
                            bgcolor: 'error.main',
                            '&:hover': { bgcolor: 'error.dark' },
                            textTransform: 'none',
                            px: 1,
                            py: 0.5,
                            minWidth: 'auto'
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    ) : row.status === 'published' ? (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={() => handleSetToPending(row._id)}
                        sx={{ 
                          color: 'warning.main',
                          borderColor: 'warning.main',
                          '&:hover': { 
                            borderColor: 'warning.dark',
                            bgcolor: 'warning.light',
                            color: 'warning.dark'
                          },
                          textTransform: 'none',
                          px: 1,
                          py: 0.5,
                          minWidth: 'auto'
                        }}
                      >
                        Set to Pending
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Rejected
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredNews.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid rgba(224, 224, 224, 1)',
            backgroundColor: '#f9fafc'
          }}
        />
      </TableContainer>

      {/* View/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }
        }}  
      >
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', py: 2.5, px: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>Edit News</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Headline"
                value={editedNews.headline}
                onChange={(e) => setEditedNews({ ...editedNews, headline: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Summary"
                multiline
                rows={4}
                value={editedNews.summary}
                onChange={(e) => setEditedNews({ ...editedNews, summary: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={editedNews.category}
                onChange={(e) => setEditedNews({ ...editedNews, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                value={editedNews.tags.join(', ')}
                onChange={(e) => setEditedNews({ 
                  ...editedNews, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
                helperText="Enter tags separated by commas"
              />
            </Grid>
            
            {/* Read-only Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Additional Information (Read-only)</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Source"
                value={editedNews.source}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="URL"
                value={editedNews.url}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                value={editedNews.date ? new Date(editedNews.date).toLocaleDateString() : ''}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time"
                value={editedNews.time}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            
            {editedNews.main_image && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>Main Image:</Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: 200, 
                  backgroundImage: `url(${editedNews.main_image.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0'
                }} />
              </Grid>
            )}
            
            {editedNews.voice_file && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>Audio File:</Typography>
                <audio controls style={{ width: '100%' }}>
                  <source src={editedNews.voice_file} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: '#f5f5f5', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ 
              textTransform: 'none',
              fontWeight: 'medium',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            sx={{ 
              textTransform: 'none', 
              bgcolor: '#1976d2',
              px: 3,
              py: 1,
              fontWeight: 'medium',
              boxShadow: '0 4px 10px rgba(25, 118, 210, 0.25)',
              '&:hover': {
                bgcolor: '#1565c0',
                boxShadow: '0 6px 15px rgba(25, 118, 210, 0.3)'
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageNews;
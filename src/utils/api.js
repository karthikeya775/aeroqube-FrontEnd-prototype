import axios from 'axios';

// Base URL for API requests
const BASE_URL = 'https://aeroqube-backend-prototype.onrender.com/aeroqube/v0/api/news';

// News APIs
export const newsApi = {
  // Get all news articles
  getAllNews: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/all-news`);
      console.log("API Response:", response);
      
      // Check if response has a data property (from ApiResponse)
      if (response.data && response.data.data) {
        return response.data;
      }
      
      // If no data property, return the entire response
      return response;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },

  // Get published news
  getPublishedNews: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/published-news`);
      console.log("Published News Response:", response);
      
      // Check if response has a data property (from ApiResponse)
      if (response.data && response.data.data) {
        return response.data;
      }
      
      // If no data property, return the entire response
      return response;
    } catch (error) {
      console.error('Error fetching published news:', error);
      throw error;
    }
  },

  // Get all news from database
  getNewsFromDatabase: async () => {
    try {
      // Add timestamp to prevent caching
      const response = await axios.get(`${BASE_URL}/get-news?t=${Date.now()}`);
      console.log("Database News Response:", response);
      
      // Check if response has a data property (from ApiResponse)
      if (response.data && response.data.data) {
        return response.data;
      }
      
      // If no data property, return the entire response
      return response;
    } catch (error) {
      console.error('Error fetching news from database:', error);
      throw error;
    }
  },

  // Add news to database
  addNewsToDatabase: async (newsData) => {
    try {
      // If newsData is provided, we'll use it. Otherwise, just call the endpoint
      // which will use the news.json file on the server
      const response = newsData 
        ? await axios.post(`${BASE_URL}/add`, newsData)
        : await axios.post(`${BASE_URL}/add`);
      
      return response.data;
    } catch (error) {
      console.error('Error adding news to database:', error);
      throw error;
    }
  },

  // Toggle news status
  toggleNewsStatus: async (newsId) => {
    try {
      console.log(`Toggling news status for ID: ${newsId}`);
      
      // Add a timestamp to prevent caching
      const response = await axios.patch(`${BASE_URL}/toggle-status/${newsId}?t=${Date.now()}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Toggle status response:', response);
      
      if (response.data && response.data.success) {
        console.log('Status toggle successful, new status:', response.data.data?.status);
        return response.data.data || response.data;
      } else {
        console.warn('Toggle status response indicated failure:', response.data);
        throw new Error(response.data.message || 'Status toggle failed');
      }
    } catch (error) {
      console.error('Error toggling news status:', error);
      throw error;
    }
  },

  // Update news
  updateNews: async (newsId, newsData) => {
    try {
      console.log(`Updating news with ID: ${newsId}`, newsData);
      const response = await axios.put(`${BASE_URL}/update-news/${newsId}`, newsData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Update response:', response);
      
      if (response.data && response.data.success) {
        console.log('Update successful');
        return response.data.data || response.data;
      } else {
        console.warn('Update response indicated failure:', response.data);
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  },

  // Delete news
  deleteNews: async (newsId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/delete-news/${newsId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  },

  // Process news (extract, translate, TTS)
  processNews: async () => {
    try {
      const response = await axios.post(`${BASE_URL}/process`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error processing news:', error);
      throw error;
    }
  },

  // Get API status
  getApiStatus: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api-status`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getting API status:', error);
      throw error;
    }
  },

  // Get supported languages
  getSupportedLanguages: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/languages`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getting supported languages:', error);
      throw error;
    }
  }
};

// // User API endpoints
// export const userApi = {
//   // Get user profile
//   getProfile: async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/users/profile`);
//       return response.data.data || response.data;
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//       throw error;
//     }
//   },

//   // Update user profile
//   updateProfile: async (userData) => {
//     try {
//       const response = await axios.put(`${BASE_URL}/users/profile`, userData);
//       return response.data.data || response.data;
//     } catch (error) {
//       console.error('Error updating user profile:', error);
//       throw error;
//     }
//   },

//   // Get user preferences
//   getPreferences: async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/users/preferences`);
//       return response.data.data || response.data;
//     } catch (error) {
//       console.error('Error fetching user preferences:', error);
//       throw error;
//     }
//   },

//   // Update user preferences
//   updatePreferences: async (preferences) => {
//     try {
//       const response = await axios.put(`${BASE_URL}/users/preferences`, preferences);
//       return response.data.data || response.data;
//     } catch (error) {
//       console.error('Error updating user preferences:', error);
//       throw error;
//     }
//   }
// };

// // Admin API endpoints
// export const adminApi = {
//   // Get all users
//   getAllUsers: async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/admin/users`);
//       return response.data.data || response.data;
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       throw error;
//     }
//   },

//   // Update user role
//   updateUserRole: async (userId, role) => {
//     try {
//       const response = await axios.put(`${BASE_URL}/admin/users/${userId}/role`, { role });
//       return response.data.data || response.data;
//     } catch (error) {
//       console.error('Error updating user role:', error);
//       throw error;
//     }
//   },

//   // Get system statistics
//   getSystemStats: async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/admin/stats`);
//       return response.data.data || response.data;
//     } catch (error) {
//       console.error('Error fetching system stats:', error);
//       throw error;
//     }
//   }
// };

export default axios; 
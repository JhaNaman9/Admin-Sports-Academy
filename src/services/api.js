import axios from 'axios';

// Create a base API instance
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase maximum content length and timeout for handling Base64 images
  maxContentLength: 50 * 1024 * 1024, // 50MB max content size
  maxBodyLength: 50 * 1024 * 1024,    // 50MB max body size
  timeout: 60000,                     // 60 seconds timeout
});

// Add request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle unauthorized errors (token expired)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      
      // If we have a refresh token, try to get a new access token
      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          const { accessToken } = response.data.data;
          
          // Update token in localStorage
          localStorage.setItem('token', accessToken);
          
          // Update the Authorization header
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log out
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, just log out
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle forbidden errors
    if (error.response && error.response.status === 403) {
      console.log('Forbidden error:', error.response.data);
      
      // Only redirect for specific 403 messages about permissions
      if (error.response.data?.message?.includes('permission')) {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  getCurrentUser: async () => {
    try {
      // Simplifying the approach - check if token exists first
      const token = localStorage.getItem('token');
      if (!token) {
        return { data: { data: { user: null } } };
      }
      
      // Use cached user if available to avoid unnecessary API calls
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const cachedUser = JSON.parse(userStr);
          // Check if it's an admin - we only need role and _id for admin panel
          if (cachedUser && cachedUser.role === 'admin' && cachedUser._id) {
            return { data: { data: { user: cachedUser } } };
          }
        } catch (parseError) {
          console.error('Error parsing cached user from localStorage:', parseError);
          localStorage.removeItem('user'); // Clear invalid cache
        }
      }
      
      // If no valid cached admin user, fetch from API
      const response = await api.get('/users/me');
      if (response.data?.data?.user) {
        const userData = response.data.data.user;
        // Only store and use if it's an admin
        if (userData.role === 'admin') {
          localStorage.setItem('user', JSON.stringify(userData));
          return { data: { data: { user: userData } } };
        } else {
          console.warn('Non-admin user tried to access admin panel');
          authService.logout(); // Clear credentials for non-admin users
          return { data: { data: { user: null } } };
        }
      } else {
        console.error('Error fetching current user: Unexpected response structure');
        localStorage.removeItem('user');
        return { data: { data: { user: null } } };
      }
    } catch (err) {
      console.error('Error in authService.getCurrentUser:', err);
      // Don't immediately clear token/user on network errors to allow offline usage
      return { data: { data: { user: null } } };
    }
  },
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user && user.role === 'admin'; // Only consider admin users as authenticated
    } catch (e) {
      return false;
    }
  },
  getToken: () => localStorage.getItem('token'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
};

// User Services
export const userService = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.patch(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStats: () => api.get('/users/stats'),
};

// Coach Services
export const coachService = {
  getAllCoaches: (params) => api.get('/coaches', { params }),
  getCoachById: (id) => api.get(`/coaches/${id}`),
  createCoach: (data) => api.post('/coaches', data),
  updateCoach: (id, data) => api.patch(`/coaches/${id}`, data),
  deleteCoach: (id) => api.delete(`/coaches/${id}`),
  approveCoach: (id) => api.patch(`/coaches/${id}/approve`),
  suspendCoach: (id) => api.patch(`/coaches/${id}/suspend`),
  getCoachPerformance: (id) => api.get(`/coaches/${id}/performance`),
  getCoachSchedule: (id) => api.get(`/coaches/${id}/schedule`),
  updateCoachSchedule: (id, data) => api.post(`/coaches/${id}/schedule`, data),
  getCoachStudents: (id) => api.get(`/coaches/${id}/students`),
  assignStudentToCoach: (coachId, studentId) => api.post(`/coaches/${coachId}/students/${studentId}`),
  removeStudentFromCoach: (coachId, studentId) => api.delete(`/coaches/${coachId}/students/${studentId}`),
};

// Student Services
export const studentService = {
  getAllStudents: (params) => api.get('/students', { params }),
  getStudentById: (id) => api.get(`/students/${id}`),
  getStudentProgress: (id) => api.get(`/students/${id}/progress`),
};

// Subscription Services
export const subscriptionService = {
  getAllSubscriptions: (params) => api.get('/subscriptions', { params }),
  getSubscriptionById: (id) => api.get(`/subscriptions/${id}`),
  createSubscription: (data) => api.post('/subscriptions', data),
  updateSubscription: (id, data) => api.patch(`/subscriptions/${id}`, data),
  deleteSubscription: (id) => api.delete(`/subscriptions/${id}`),
  getSubscriptionStats: () => api.get('/subscriptions/stats'),
};

// Tournament Services
export const tournamentService = {
  getAllTournaments: async (params) => {
    try {
      // Check for token first
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await api.get('/tournaments', { params });
      return response;
    } catch (error) {
      console.error('Tournament service error:', error);
      throw error;
    }
  },
  getTournamentById: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      return await api.get(`/tournaments/${id}`);
    } catch (error) {
      console.error(`Error fetching tournament ${id}:`, error);
      throw error;
    }
  },
  createTournament: async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      return await api.post('/tournaments', data);
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  },
  updateTournament: async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      if (!id) {
        throw new Error('Tournament ID is required for update');
      }
      
      // Validate and log the data being sent
      console.log(`Tournament update API call - ID: ${id}, Data type:`, typeof data);
      
      // Check if data contains a location property and ensure it's a string
      if (data.location) {
        console.log('Location data type:', typeof data.location);
        
        // If location is an object, stringify it
        if (typeof data.location === 'object') {
          data.location = JSON.stringify(data.location);
          console.log('Converted location object to string');
        }
      }
      
      // Debug: Check size of request to ensure it's not too large
      const dataSize = JSON.stringify(data).length;
      console.log(`Request data size: ${Math.round(dataSize / 1024)} KB`);
      
      if (dataSize > 10 * 1024 * 1024) {
        console.warn('Request data is very large! This may cause issues.');
      }
      
      console.log('Sending update request to API...');
      return await api.patch(`/tournaments/${id}`, data);
    } catch (error) {
      console.error(`Error updating tournament ${id}:`, error);
      
      // Add more context to the error message
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        // Enhance error message
        const originalError = error;
        
        // Create a more descriptive error
        const enhancedError = new Error(
          `Failed to update tournament (${error.response.status}): ${
            error.response.data?.message || 'Unknown server error'
          }`
        );
        
        // Copy properties from the original error
        enhancedError.stack = originalError.stack;
        enhancedError.response = originalError.response;
        
        throw enhancedError;
      }
      
      throw error;
    }
  },
  deleteTournament: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      return await api.delete(`/tournaments/${id}`);
    } catch (error) {
      console.error(`Error deleting tournament ${id}:`, error);
      throw error;
    }
  },
  getTournamentParticipants: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      return await api.get(`/tournaments/${id}/participants`);
    } catch (error) {
      console.error(`Error fetching tournament ${id} participants:`, error);
      throw error;
    }
  },
};

// Content Services
export const contentService = {
  getAllContent: (params) => api.get('/content', { params }),
  getContentById: (id) => api.get(`/content/${id}`),
  createContent: (data) => api.post('/content', data),
  updateContent: (id, data) => api.patch(`/content/${id}`, data),
  deleteContent: (id) => api.delete(`/content/${id}`),
};

// Report Services
export const reportService = {
  getReports: (params) => api.get('/reports', { params }),
  generateReport: (type, params) => api.post(`/reports/generate/${type}`, params),
};

// Diet Plan Services
export const dietPlanService = {
  getAllDietPlans: (params) => api.get('/diet-plans', { params }),
  getDietPlanById: (id) => api.get(`/diet-plans/${id}`),
  createDietPlan: (data) => api.post('/diet-plans', data),
  updateDietPlan: (id, data) => api.patch(`/diet-plans/${id}`, data),
  deleteDietPlan: (id) => api.delete(`/diet-plans/${id}`),
  assignDietPlan: (id, studentIds) => api.patch(`/diet-plans/${id}/assign`, { studentIds }),
};

// Activity Services
export const activityService = {
  getAllActivities: (params) => api.get('/activities', { params }),
  getActivityById: (id) => api.get(`/activities/${id}`),
  createActivity: (data) => api.post('/activities', data),
  updateActivity: (id, data) => api.patch(`/activities/${id}`, data),
  deleteActivity: (id) => api.delete(`/activities/${id}`),
  getActivityStats: (params) => api.get('/activities/stats', { params }),
  getStudentActivities: (studentId, params) => api.get(`/students/${studentId}/activities`, { params }),
  trackAreaCoverage: (id, data) => api.patch(`/activities/${id}/area`, data),
};

// Notification Services
export const notificationService = {
  getAllNotifications: (params) => api.get('/notifications', { params }),
  getNotificationById: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  deleteReadNotifications: () => api.delete('/notifications/delete-read'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  createSystemNotification: (data) => api.post('/notifications/system', data),
  createTournamentNotification: (tournamentId, data) => 
    api.post(`/tournaments/${tournamentId}/notify`, data),
};

// Sport Category Services
export const sportCategoryService = {
  getAllSportCategories: (params) => api.get('/sport-categories', { params }),
  getSportCategoryById: (id) => api.get(`/sport-categories/${id}`),
  createSportCategory: (data) => api.post('/sport-categories', data),
  updateSportCategory: (id, data) => api.patch(`/sport-categories/${id}`, data),
  deleteSportCategory: (id) => api.delete(`/sport-categories/${id}`),
};

export default api; 
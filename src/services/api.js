import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For mobile testing, using your PC's IP address
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api'
  : 'http://172.20.10.11:3000/api'; // Your PC's IP address

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  timeoutErrorMessage: 'Connection timeout - check if backend is running',
});

// Log the API URL being used
console.log('API connecting to:', API_BASE_URL);
console.log('Platform:', Platform.OS);

// Add token to requests if available
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, '- Status:', response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error Response:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // Request made but no response
      console.error('API No Response:', {
        url: error.config?.url,
        message: 'No response received from server',
        error: error.message
      });
    } else {
      // Error setting up request
      console.error('API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

    register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // Listings
  getListings: async () => {
    const response = await api.get('/listings');
    return response.data;
  },

  createListing: async (listingData) => {
    const response = await api.post('/listings', listingData);
    return response.data;
  },

  // Messages
  getMessages: async () => {
    const response = await api.get('/messages');
    return response.data;
  },

    // Profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // Forum Posts
  getPosts: async () => {
    const response = await api.get('/posts');
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

    getPost: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Requests
  createRequest: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },

  getReceivedRequests: async () => {
    const response = await api.get('/requests/received');
    return response.data;
  },

  getSentRequests: async () => {
    const response = await api.get('/requests/sent');
    return response.data;
  },

    updateRequest: async (id, status) => {
    const response = await api.put(`/requests/${id}`, { status });
    return response.data;
  },

  // Messages
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  getConversationMessages: async (listingId, otherUserId) => {
    const response = await api.get(`/messages/conversation/${listingId}/${otherUserId}`);
    return response.data;
  },

  markMessagesAsRead: async (conversationKey) => {
    const response = await api.put(`/messages/read/${conversationKey}`);
    return response.data;
  }
};
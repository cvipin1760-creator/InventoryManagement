import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token and branch ID to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const branchId = localStorage.getItem('activeBranchId');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (branchId) {
      config.headers['X-Branch-ID'] = branchId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle non-JSON responses gracefully
    let errorMessage = 'An error occurred';
    
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Try to get error message from response
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.statusText) {
        errorMessage = error.response.statusText;
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check if the backend is running.';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    // Attach the cleaned error message to the error object
    error.userMessage = errorMessage;
    return Promise.reject(error);
  }
);

export default apiClient;

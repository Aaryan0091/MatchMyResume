/**
 * Axios instance configuration for the Smart Resume Analyzer API.
 */

import axios, { AxiosError } from 'axios';

// API base URL - points to the FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout for PDF processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any additional request configuration here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common error cases
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as { detail?: string };

      if (status === 400) {
        error.message = data?.detail || 'Invalid request. Please check your input.';
      } else if (status === 404) {
        error.message = 'Resource not found.';
      } else if (status === 500) {
        error.message = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      // Request was made but no response received
      error.message = 'Network error. Please check your connection.';
    } else {
      // Something else happened
      error.message = 'An unexpected error occurred.';
    }

    return Promise.reject(error);
  }
);

export default api;

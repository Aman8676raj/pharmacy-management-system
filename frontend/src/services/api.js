import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Send and receive HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returned a structured error response
    const customMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    const enhancedError = new Error(customMessage);
    enhancedError.statusCode = error.response?.status;
    enhancedError.errors = error.response?.data?.errors;
    enhancedError.rawResponse = error.response;

    return Promise.reject(enhancedError);
  }
);

export default api;


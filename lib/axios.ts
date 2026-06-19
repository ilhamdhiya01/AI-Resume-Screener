import axios from 'axios';

import { API_NEXT, LOGIN_PATH } from '@/routes';

const axiosInstance = axios.create({
  baseURL: API_NEXT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    // Throw kalau API return 200 tapi success=false
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Request failed');
    }
    return response;
  },
  (error) => {
    // Override axios default message dengan API response message
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = LOGIN_PATH;
      }
    }

    if (error.response?.status === 403) {
      console.error('Access forbidden');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

// اضافه کردن توکن به همه درخواست‌ها
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// مدیریت خطاهای 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // اگر توکن منقضی شده/نامعتبر بود
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // انتقال به لاگین
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;

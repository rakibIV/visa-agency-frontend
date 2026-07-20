import axios from 'axios';

const isProd = import.meta.env.MODE === 'production';
const BASE_URL = isProd 
  ? 'https://visaagency-dusky.vercel.app/api' 
  : 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;

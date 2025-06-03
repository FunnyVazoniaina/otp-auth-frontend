import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const requestOtp = (data) => API.post('/auth/request-otp', data);
export const verifyOtp = (data) => API.post('/auth/verify-otp', data);

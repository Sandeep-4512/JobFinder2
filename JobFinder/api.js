// api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://jobfinder-r8g0.onrender.com/api', // 🔥 Your live backend
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

export default API;

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

axios.defaults.baseURL = 'http://16.171.7.97/api';
axios.defaults.headers.common['Accept'] = 'application/json';

const token = localStorage.getItem('token');
console.log('Stored token:', localStorage.getItem('token'));

if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

const app = createApp(App);
app.use(router);
app.mount('#app');

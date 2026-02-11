import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Use relative path to leverage Next.js rewrites
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

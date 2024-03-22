import axios from './axios';

export const  loginRequest = user => axios.post(`/login`,user);
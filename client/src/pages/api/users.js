import axios from './axios';

export const  loginRequest = user => axios.post(`/login`,user);

export const  registerRequest = user => axios.post(`/register`,user);

export const recoveryPasswordRequest = request => axios.post(`/recovery-password`, request);

export const updatePasswordRequest = ({ token, newPassword }) => axios.put(`/reset-password`, { token, newPassword });



import axios from './axios';


export const profileRequest = () => axios.get(`/profile`)

export const searchUsers = (name) => axios.get('/search', {params:{name}})

export const searchFriendsRequest = (name) => axios.get('/search-friend', {params:{name}})

export const  loginRequest = user => axios.post(`/login`,user);

export const  logoutRequest = user => axios.post(`/logout`,user);

export const  registerRequest = user => axios.post(`/register`,user);

export const recoveryPasswordRequest = request => axios.post(`/recovery-password`, request);

export const updatePasswordRequest = ({ token, newPassword }) => axios.put(`/reset-password`, { token, newPassword });

export const updateProfileRequest = (formdata) => axios.put(`/update-profile`,formdata)



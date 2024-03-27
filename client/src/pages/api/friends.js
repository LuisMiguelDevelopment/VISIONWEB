import axios from './axios';

export const getMyFriends = () => axios.get(`/List-friends`);
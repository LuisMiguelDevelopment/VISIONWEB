import axios from './axios';

export const getMyFriends = () => axios.get(`/List-friends`);

export const getRequestFriends = () => axios.get(`/friends-request`);

export const sendFriends = (requestedUserId) => axios.post(`/friends/add-friends`, {requestedUserId});

export const acceptFriendRequest = (requestId) => axios.put(`/friends/accept-request/${requestId}`);

export const deleteRequestFriend = (requestId) => axios.delete(`/friends/delete-request/${requestId}`);
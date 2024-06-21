import { createContext, useContext, useState, useEffect } from "react";
import {
  getMyFriends,
  getRequestFriends,
  getFriendProfile,
  sendFriends,
  acceptFriendRequest,
  deleteRequestFriend,
  deleteMyFriend // Asegúrate de importar la función deleteMyFriend desde la API
} from "@/pages/api/friends";
import io from 'socket.io-client';
import { useAuth } from "./authContext";

const ENDPOINT = "http://localhost:3001";
export const socket = io(ENDPOINT);

export const FriendContext = createContext();

export const useFriend = () => {
  const context = useContext(FriendContext);
  if (!context) {
    throw new Error("useFriend must be used within FriendProvider");
  }
  return context;
};

export const FriendProvider = ({ children }) => {
  const [friendList, setFriendList] = useState([]);
  const [requestList, setRequestList] = useState({ friendRequests: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileFriend, setProfileFriend] = useState(null); // Asegúrate de que profileFriend sea inicializado correctamente
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const userId = user.UserId;
      socket.emit("setUserId2", userId);
    }
  }, [user]);

  const fetchRequest = async () => {
    try {
      const res = await getRequestFriends();
      setRequestList(res.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await getMyFriends();
      setFriendList(res.data.friendList);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const fetchFriendsProfile = async (friendId) => {
    try {
      const res = await getFriendProfile(friendId); 
      setProfileFriend(res.data.friendProfile);
      console.log(res.data.friendProfile);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchRequest();
    }
  }, [user]);

  useEffect(() => {
    socket.on("requestSend", (data) => {
      console.log("Nueva solicitud de amistad recibida:", data);
      fetchRequest();
    });

    return () => {
      socket.off("requestSend");
    };
  }, []);

  useEffect(() => {
    socket.on("acceptSend", (data) => {
      console.log("Solicitud de amistad aceptada:", data);
      fetchFriends();
    });

    return () => {
      socket.off("acceptSend");
    };
  }, []);

  const sendFriendRequest = async (requestedUserId) => {
    try {
      await sendFriends(requestedUserId);
      socket.emit("sendFriendRequest", { requestedUserId });
      console.log("Solicitud de amistad enviada con éxito");
    } catch (error) {
      console.error("Error enviando la solicitud de amistad:", error);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const request = requestList.friendRequests.find(req => req.FriendRequestId === requestId);
      if (!request) {
        throw new Error("Solicitud no encontrada en la lista");
      }

      const { RequestingUserId, RequestedUserId } = request;
      await acceptFriendRequest(requestId);

      socket.emit("acceptFriend", {
        requestingUserId: RequestingUserId,
        requestedUserId: RequestedUserId
      });

      fetchRequest();
      fetchFriends();
    } catch (error) {
      console.error("Error aceptando la solicitud de amistad:", error);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await deleteRequestFriend(requestId);
      fetchRequest();
    } catch (error) {
      console.error("Error rechazando la solicitud de amistad:", error);
    }
  };

  const deleteFriend = async (friendId) => {
    try {
      await deleteMyFriend(friendId); // Asegúrate de que deleteMyFriend elimine correctamente al amigo
      fetchFriends();
    } catch (error) {
      console.error("Error eliminando al amigo:", error);
    }
  };

  const friendsObject = {
    friendList,
    loading,
    error,
    sendFriendRequest,
    requestList,
    acceptRequest,
    rejectRequest,
    fetchFriendsProfile,
    profileFriend,
    deleteFriend // Asegúrate de incluir deleteFriend en el objeto retornado por el proveedor
  };

  return (
    <FriendContext.Provider value={friendsObject}>
      {children}
    </FriendContext.Provider>
  );
};

import { createContext, useContext, useState, useEffect } from "react";
import { getMyFriends, getRequestFriends, sendFriends, acceptFriendRequest, deleteRequestFriend } from "@/pages/api/friends";
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
      console.log(res.data);
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

  useEffect(() => {
    fetchFriends();
    fetchRequest();
  }, []);

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
      fetchFriends();  // Actualiza la lista de amigos cuando se acepte la solicitud
    });

    return () => {
      socket.off("acceptSend");
    };
  }, []);

  const sendFriendRequest = async (requestedUserId) => {
    try {
      await sendFriends(requestedUserId);
      socket.emit("sendFriendRequest", { requestedUserId: requestedUserId });
      console.log("Solicitud de amistad enviada con éxito");
    } catch (error) {
      console.error("Error enviando la solicitud de amistad:", error);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      // Encuentra la solicitud en el requestList
      const request = requestList.friendRequests.find(req => req.FriendRequestId === requestId);
      if (!request) {
        throw new Error("Solicitud no encontrada en la lista");
      }

      // Obtener los IDs de RequestingUserId y RequestedUserId
      const { RequestingUserId, RequestedUserId } = request;

      // Acepta la solicitud de amistad
      await acceptFriendRequest(requestId);

      // Emitir el evento del socket con los IDs
      socket.emit("acceptFriend", {
        requestingUserId: RequestingUserId,
        requestedUserId: RequestedUserId
      });

      // Recargar las solicitudes de amistad
      fetchRequest();
      fetchFriends(); // Actualiza la lista de amigos localmente también
    } catch (error) {
      console.error("Error aceptando la solicitud de amistad:", error);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await deleteRequestFriend(requestId);
      fetchRequest(); // Vuelve a cargar las solicitudes de amistad
    } catch (error) {
      console.error("Error rechazando la solicitud de amistad:", error);
    }
  };

  const friendsObject = {
    friendList,
    loading,
    error,
    sendFriendRequest,
    requestList,
    acceptRequest,
    rejectRequest
  };

  return (
    <FriendContext.Provider value={friendsObject}>
      {children}
    </FriendContext.Provider>
  );
};

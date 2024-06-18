import { createContext, useContext, useState, useEffect } from "react";
import { getMyFriends , getRequestFriends ,sendFriends  , acceptFriendRequest , deleteRequestFriend} from "@/pages/api/friends";

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

  useEffect(() => {
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

    fetchFriends();
  }, []);
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await getRequestFriends();
        console.log(res.data)
        setRequestList(res.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchRequest();
  }, []);

  
  const sendFriendRequest = async (requestedUserId) => {
    try {
      await sendFriends(requestedUserId); // Usa la función de envío importada
      console.log("Succefully sent")
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      // Actualiza la lista de solicitudes de amigos
      const res = await getRequestFriends();
      setRequestList(res.data);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };


  const rejectRequest = async (requestId) => {
    try {
      await deleteRequestFriend(requestId);
      // Actualiza la lista de solicitudes de amigos
      const res = await getRequestFriends();
      setRequestList(res.data);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };


  // Create an object with your desired structure here
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

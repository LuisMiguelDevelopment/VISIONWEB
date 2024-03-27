import { createContext, useContext, useState, useEffect } from "react";
import { getMyFriends } from "@/pages/api/friends";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await getMyFriends();
        // Assuming res.data contains friendList as you've shown previously
        setFriendList(res.data.friendList);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  // Create an object with your desired structure here
  const friendsObject = {
    friendList,
    loading,
    error
  };

  return (
    <FriendContext.Provider value={friendsObject}>
      {children}
    </FriendContext.Provider>
  );
};

import React, { useState, useEffect } from "react";
import styles from "../styles/ListFriend.module.css";
import { PiVideoCameraFill } from "react-icons/pi";
import io from "socket.io-client";
import { useFriend } from "../context/friendContext";
import { useAuth } from "../context/authContext";
import Cookies from "js-cookie";
import { useCall } from "../context/CallContext";
import SearchFriends from "./SearchFriends";
import FriendProfile from "./FriendProfile";

const ListFriends = () => {
  const { friendList, fetchFriendsProfile, deleteFriend } = useFriend(); // Asegúrate de incluir deleteFriend desde useFriend
  const { user, profile, getImageUrl, searchResultsFriends } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);
  const { handleCall } = useCall();
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState(null);

  useEffect(() => {
    if (profile) {
      console.log(profile.NameUser);
    }
  }, [user]);

  useEffect(() => {
    const connectToSocket = async () => {
      if (userId && token) {
        const newSocket = io("http://localhost:3001", {
          query: { userId, token },
        });
        setSocket(newSocket);
        newSocket.on("reconnect_attempt", () => {
          newSocket.emit("userLoggedIn");
          console.log("Intento de reconexión");
        });
        newSocket.on("connectedUsers", (users) => {
          setOnlineUsers(users);
        });
        return () => {
          newSocket.disconnect();
          console.log("Desconectado del servidor");
        };
      }
    };

    connectToSocket();
  }, [userId, token, user]);

  useEffect(() => {
    const autoConnect = async () => {
      const tokenValue = Cookies.get("token");
      if (tokenValue && user) {
        setToken(tokenValue);
        setUserId(user.UserId);
      }
    };
    autoConnect();
  }, [user]);

  useEffect(() => {
    if (searchResultsFriends && searchResultsFriends.length > 0) {
      setFilteredFriends(searchResultsFriends);
    } else {
      setFilteredFriends(friendList);
    }
  }, [searchResultsFriends, friendList]);

  const isFriendOnline = (friendUserId) => {
    return onlineUsers.includes(String(friendUserId));
  };

  const handleCallClick = (friendUserId, friendName, friend) => {
    if (socket) {
      handleCall({
        userToCall: friendUserId,
        from: userId,
        name: profile.NameUser,
        nameCall: friend.NameUser,
        profileImage: profile.ProfilePicture,
        profileImageFriend: friend.ProfilePicture,
      });
    } else {
      console.error("Socket is not available");
    }
  };

  const handleClickFriendProfile = (friendId) => {
    if (friendId === selectedFriendId) {
      setSelectedFriendId(null);
    } else {
      setSelectedFriendId(friendId);
      fetchFriendsProfile(friendId);
    }
  };

  return (
    <>
      <SearchFriends text="Search Friends..." />
      {filteredFriends.map((friend, index) => {
        const profilePictureUrl = friend.ProfilePicture
          ? getImageUrl(friend.ProfilePicture)
          : "/profile.webp";

        const isOpen = selectedFriendId === friend.UserId;

        return (
          <div key={index} className={styles.container_friend}>
            <div className={styles.info_friend}>
              <img
                className={styles.image_profile}
                src={profilePictureUrl}
                alt={`${friend.NameUser}'s profile picture`}
                onClick={() => handleClickFriendProfile(friend.UserId)}
              />
              <span className={styles.span}>{friend.NameUser}</span>
            </div>
            <div className={styles.options}>
              <PiVideoCameraFill
                className={styles.camera}
                onClick={() =>
                  handleCallClick(
                    friend.UserId,
                    friend.NameUser,
                    friend,
                    friend.ProfilePicture
                  )
                }
              />
              <div
                className={`${styles.indicator} ${isFriendOnline(friend.UserId)
                  ? styles.online
                  : styles.offline}`}
              ></div>
            </div>
            {isOpen && (
              <FriendProfile
                profileFriend={profile}
                onClose={() => setSelectedFriendId(null)} // Función para cerrar el perfil
                deleteFriend={() => deleteFriend(friend.UserId)} // Asegúrate de pasar deleteFriend correctamente
              />
            )}
          </div>
        );
      })}
    </>
  );
};

export default ListFriends;

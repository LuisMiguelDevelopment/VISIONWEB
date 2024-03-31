import React, { useEffect, useState } from "react";
import styles from "../styles/ListFriend.module.css";
import Image from "next/image";
import pruebaimg from "../../public/Rectangle13.png";
import { PiVideoCameraFill } from "react-icons/pi";
import io from "socket.io-client";
import { useFriend } from "../context/friendContext";
import { useAuth } from "../context/authContext";
import Cookies from "js-cookie";

const ListFriends = () => {
  const { friendList } = useFriend();
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (user && user.UserId) {
      setUserId(user.UserId);
    }
  }, [user]);

  useEffect(() => {
    const tokenValue = Cookies.get("token");
    if (userId && tokenValue) {
      setToken(tokenValue);
    }
  }, [userId]);

  useEffect(() => {
    const connectToSocket = async () => {
      if (userId && token) {
        const socket = io("http://localhost:3001", {
          query: { UserId: userId, token: token },
        });

        socket.on("reconnect_attempt", () => {
          socket.emit("userLoggedIn");
          console.log("Intento de reconexión");
        });

        socket.on("connectedUsers", (users) => {
          setOnlineUsers(users);
        });

        

        return () => {
          socket.disconnect();
          console.log("Desconectado del servidor");
        };
      }
    };

    connectToSocket();
  }, [userId, token]);

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

 const isFriendOnline = (friend, friendUserId) => {
  console.log("Online users:", onlineUsers);
  console.log("Friend user id:", friend.UserId);
  return onlineUsers.includes(String(friendUserId));
};

  return (
    <>
      {friendList.map((friend, index) => {
        console.log("Friend object:", friend);
        return (
          <div key={index} className={styles.container_friend}>
            <div className={styles.info_friend}>
              <Image className={styles.image_profile} src={pruebaimg} />
              <span className={styles.span}>{friend.NameUser}</span>
            </div>
            <div className={styles.options}>
              <PiVideoCameraFill className={styles.camera} />
              {/* Pass friend.UserId as an argument to isFriendOnline */}
              <div
                className={`${styles.indicator} ${
                  isFriendOnline(friend, friend.UserId)
                    ? styles.online
                    : styles.offline
                }`}
              ></div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ListFriends;

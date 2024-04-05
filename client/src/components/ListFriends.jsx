import React, { useEffect, useState } from "react";
import styles from "../styles/ListFriend.module.css";
import Image from "next/image";
import pruebaimg from "../../public/Rectangle13.png";
import { PiVideoCameraFill } from "react-icons/pi";
import io from "socket.io-client";
import { useFriend } from "../context/friendContext";
import { useAuth } from "../context/authContext";
import Cookies from "js-cookie";
import { useCall } from "../context/CallContext";

const ListFriends = () => {
  const { friendList } = useFriend();
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);
  const { calls, handleCall } = useCall();

 

   /**********************  USUARIO ONLINE *********************/

  useEffect(() => {
  
    const connectToSocket = async () => {
      if (userId && token) {
        const newSocket = io("http://localhost:3001", {
          query: { UserId: userId, token: token },
        });
        setSocket(newSocket); // Asigna el socket al estado
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
    // Realizar la conexión automática al socket cuando el token está disponible
    const autoConnect = async () => {
      const tokenValue = Cookies.get("token");
      if (tokenValue && user) {
        setToken(tokenValue);
        setUserId(user.UserId);
      }
    };
    autoConnect();
  }, [user]);

  // Función para verificar si un amigo está en línea
  const isFriendOnline = (friendUserId) => {
    return onlineUsers.includes(String(friendUserId));
  };


    /**********************  USUARIO ONLINE *********************/



   /**********************  CLICK PARA LLAMAR A UN AMIGO *********************/
  const handleCallClick = (friendUserId) => {
    console.log(socket)
    console.log("Botón de llamada clickeado");

    console.log(friendUserId)
    console.log(userId)


    if (socket) {
      handleCall({
        userToCall: friendUserId,
        from: userId 
      });
    } else {
      console.error("Socket is not available");
    }
  };

/**********************  CLICK PARA LLAMAR A UN AMIGO *********************/


  return (
    <>
      {friendList.map((friend, index) => {
        return (
          <div key={index} className={styles.container_friend}>
            <div className={styles.info_friend}>
              <Image className={styles.image_profile} src={pruebaimg} />
              <span className={styles.span}>{friend.NameUser}</span>
            </div>
            <div className={styles.options}>
              <PiVideoCameraFill
                className={styles.camera}
                onClick={() =>
                  handleCallClick(friend.UserId, friend.NameUser, friend.signal)
                }
              />

              <div
                className={`${styles.indicator} ${
                  isFriendOnline(friend.UserId) ? styles.online : styles.offline
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

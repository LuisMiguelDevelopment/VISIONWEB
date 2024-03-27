import React, { useEffect, useState } from "react";
import styles from "../styles/ListFriend.module.css";
import Image from "next/image";
import pruebaimg from "../../public/Rectangle13.png";
import { PiVideoCameraFill } from "react-icons/pi";
import io from 'socket.io-client';
import { useFriend } from "../context/friendContext"; // Importa el hook useFriend

const ListFriends = () => {
  const { friendList } = useFriend(); // Obtiene la lista de amigos del contexto
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const socket = io("http://localhost:PORT"); // Reemplaza PORT por el puerto del servidor

    socket.on("connectedUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  return (
    <>
      {friendList.map((friend, index) => (
        <div key={index} className={styles.container_friend}>
          <div className={styles.info_friend}>
            <Image className={styles.image_profile} src={pruebaimg} />
            <span className={styles.span}>{friend.NameUser}</span>
          </div>
          <div className={styles.options}>
            <PiVideoCameraFill className={styles.camera} />
            <div
              className={`${styles.online} ${
                isUserOnline(friend.UserId) ? styles.online : styles.offline
              }`}
            ></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ListFriends;

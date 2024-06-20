import React, { useState, useEffect } from "react";
import styles from "../styles/Modal.module.css";
import Image from "next/image";
import { IoCloseOutline } from "react-icons/io5";
import { FaPhone } from "react-icons/fa6";
import { useAuth } from "@/context/authContext";

const ModalCall = ({ handleCallAccept, handleCancell, UserName, UserCall, isReceiver, image, imageFriend }) => {
  const { getImageUrl } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFriend, setProfileImageFriend] = useState(null);

  useEffect(() => {
    if (image) {
      setProfileImage(getImageUrl(image));
    } else {
      setProfileImage("/profile.webp"); 
    }
  }, [image, getImageUrl]);

  useEffect(() => {
    if (imageFriend) {
      setProfileImageFriend(getImageUrl(imageFriend));
    } else {
      setProfileImageFriend("/profile.webp"); 
    }
  }, [imageFriend, getImageUrl]);

  return (
    <div className={styles.general}>
      <div className={styles.modal_info}>
        <div className={styles.modal_img}>
          {isReceiver && (
            <img
              src={profileImage || "/profile.webp"} 
              alt="Profile Image"
              width={100}
              height={100}
              className={styles.img}
            />
          )}
          {!isReceiver && (
            <img
              src={profileImageFriend || "/profile.webp"} 
              alt="Profile Image"
              width={100}
              height={100}
              className={styles.img}
            />
          )}
        </div>
        <div className={styles.modal_info_call}>
          <span className={styles.span}>{UserName}{UserCall}</span>
         
          {isReceiver && (
            <p className={styles.p}>is calling you</p>
          )}
          {!isReceiver && (
            <p className={styles.p}>You are calling</p>
          )}
        </div>

        <div className={styles.buttons}>
          {isReceiver && (
            <button className={`${styles.button} ${styles.button_green}`} onClick={handleCallAccept}>
              <FaPhone />
            </button>
          )}
          <button className={`${styles.button} ${styles.button_red}`} onClick={handleCancell}>
            <IoCloseOutline />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCall;

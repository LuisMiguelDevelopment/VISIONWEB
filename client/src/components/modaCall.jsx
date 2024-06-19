import { useState, useEffect } from "react";
import styles from "../styles/Modal.module.css";
import Image from "next/image";
import { IoCloseOutline } from "react-icons/io5";
import { FaPhone } from "react-icons/fa6";
import { useAuth } from "@/context/authContext";
import { useCall } from "@/context/CallContext";

const ModalCall = ({ handleCallAccept, handleCancell, UserName, UserCall, isReceiver, image, imageFriend }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFriend, setProfileImageFriend] = useState(null);

  const { getImageUrl } = useAuth();



  useEffect(() => {


    if (image) {
      setProfileImage(getImageUrl(image));

    } else {

      setProfileImage("/default-profile.png");
    }
  }, [image, getImageUrl]);

  useEffect(() => {

    console.log(imageFriend)
    if (imageFriend) {
      setProfileImageFriend(getImageUrl(imageFriend));
    } else {
      setProfileImageFriend("/default-profile.png");
    }
  }, [imageFriend, getImageUrl]);


  return (
    <div className={styles.general}>
      <div className={styles.modal_info}>
        <div className={styles.modal_img}>
          {isReceiver && (
            <img
              src={profileImage}
              alt="Profile Image"
              width={100} // Adjust size as necessary
              height={100} // Adjust size as necessary
              className={styles.img}
            />
          )}
          {!isReceiver && (
            <img
              src={profileImageFriend}
              alt="Profile Image"
              width={100}
              height={100}
              className={styles.img}
            />
          )}
        </div>
        <div className={styles.modal_info_call}>
          <span className={styles.span}>{UserName}{UserCall}</span>
          <p className={styles.p}>is calling you</p>
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

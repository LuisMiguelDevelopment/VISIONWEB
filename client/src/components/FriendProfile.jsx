import React, { useState } from "react";
import styles from '../styles/FriendProfile.module.css';
import { IoClose } from "react-icons/io5";
import { useAuth } from "@/context/authContext";

const FriendProfile = ({ profileFriend, onClose }) => {
    const { getImageUrl } = useAuth();
    const [isOpen, setIsOpen] = useState(true); // Estado para controlar la visibilidad del perfil

    if (!profileFriend || !isOpen) {
        return null;
    }

    const profilePictureUrl = profileFriend.ProfilePicture
        ? getImageUrl(profileFriend.ProfilePicture)
        : "/profile.webp";

    return (
        <div className={styles.profile_Friend}>
            <div className={styles.container_close} onClick={() => {
                setIsOpen(false);
                onClose(); // Llamar a la función onClose para informar al padre que se ha cerrado el perfil
            }}>
                <IoClose className={styles.close} />
            </div>
            <img
                className={styles.img}
                src={profilePictureUrl}
                alt={`${profileFriend.NameUser}'s profile picture`}
            />
            <div className={styles.info_friend}>
                <span className={styles.span}>Name:</span>
                <p> {profileFriend.NameUser}</p>
                <span className={styles.span}>Last Name:</span>
                <p> {profileFriend.LastName}</p>
            </div>
        </div>
    );
};

export default FriendProfile;

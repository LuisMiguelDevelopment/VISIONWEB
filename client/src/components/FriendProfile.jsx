import React, { useState } from "react";
import styles from '../styles/FriendProfile.module.css';
import { IoClose } from "react-icons/io5";
import { useAuth } from "@/context/authContext";

const FriendProfile = ({ profileFriend, onClose, deleteFriend }) => {
    const { getImageUrl } = useAuth();
    const [isOpen, setIsOpen] = useState(true); // Estado para controlar la visibilidad del perfil

    if (!profileFriend || !isOpen) {
        return null;
    }

    const profilePictureUrl = profileFriend.ProfilePicture
        ? getImageUrl(profileFriend.ProfilePicture)
        : "/profile.webp";

    const handleDeleteFriend = async () => {
        try {
            await deleteFriend(profileFriend.UserId); // Llamar a la función deleteFriend con el UserId del amigo
            onClose(); // Cerrar el perfil después de eliminar al amigo
        } catch (error) {
            console.error("Error deleting friend:", error);
        }
    };

    return (
        <div className={styles.profile_Friend}>
            <div className={styles.container_close} onClick={() => {
                setIsOpen(false);
                onClose(); 
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
            <button className={styles.button} onClick={handleDeleteFriend}>Delete</button>
        </div>
    );
};

export default FriendProfile;

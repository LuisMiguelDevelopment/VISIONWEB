import React, { useState } from 'react';
import styles from '../styles/Profile_slider.module.css';
import Image from 'next/image';
import { PiGearSixFill } from "react-icons/pi";
import { useAuth } from '@/context/authContext';
import ProfileEditModal from './Profile_edit'; // Asegúrate de importar correctamente tu modal

const Profile_Slider = () => {
    const { profile, getImageUrl } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);


    const { NameUser, LastName, ProfilePicture } = profile;

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className={styles.container_friend}>
            <div className={styles.info_friend}>
                <Image 
                    className={styles.image_profile} 
                    src={ProfilePicture ? getImageUrl(ProfilePicture) : '/profile.webp'} 
                    alt={`${NameUser} ${LastName}`} 
                    width={100} 
                    height={100} 
                />
                <span className={styles.span}>{NameUser} {LastName}</span>
            </div>
            <div className={styles.options}>
                <PiGearSixFill className={styles.gear} onClick={openModal} />
            </div>
            {isModalOpen && <ProfileEditModal closeModal={closeModal} />}
        </div>
    );
}

export default Profile_Slider;

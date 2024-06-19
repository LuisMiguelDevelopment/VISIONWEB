import React, { useState, useEffect } from 'react';
import styles from '../styles/ModalEditProfile.module.css';
import Image from 'next/image';
import { useAuth } from '@/context/authContext';

const Profile = () => {
    const { profile, updateProfile, getImageUrl, user } = useAuth();
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [dateBirth, setDateBirth] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.NameUser);
            setLastName(profile.LastName);
            setEmail(profile.Email);
            setDateBirth(profile.DateBirth);
        }
    }, [profile]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('NameUser', name);
            formData.append('LastName', lastName);
            formData.append('Email', email);
            formData.append('DateBirth', dateBirth);
            if (profilePicture) {
                formData.append('profilePicture', profilePicture);
            }

            await updateProfile(formData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setName(profile.NameUser);
            setLastName(profile.LastName);
            setEmail(profile.Email);
            setDateBirth(profile.DateBirth);
        }
        setProfilePicture(null);
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'NameUser':
                setName(value);
                break;
            case 'LastName':
                setLastName(value);
                break;
            case 'Email':
                setEmail(value);
                break;
            case 'DateBirth':
                setDateBirth(value);
                break;
            case 'profilePicture':
                setProfilePicture(e.target.files[0]);
                break;
            default:
                break;
        }
    };

    return (
        <div className={styles.general}>
            <div className={styles.header_modal}>
                <label className={styles.imageContainer}>
                    {isEditing && profilePicture ? (
                        <div className={styles.imagePreview}>
                            <Image src={URL.createObjectURL(profilePicture)} alt="Profile Preview" width={100} height={100} />
                        </div>
                    ) : (
                        <>
                            {profile && profile.ProfilePicture ? (
                                <img src={getImageUrl(profile.ProfilePicture)} alt="Profile Image" className={styles.img} />
                            ) : (
                                <div className={styles.noImage}>No hay imagen de perfil disponible</div>
                            )}
                        </>
                    )}
                    <input
                        type="file"
                        name="profilePicture"
                        onChange={handleChange}
                        className={styles.fileInput_img}
                    />
                    <span className={styles.editText}>Editar</span>
                </label>
            </div>

            <div className={styles.body}>
                {isEditing ? (
                    <div className={styles.editContainer}>
                        <input
                            type="text"
                            name="NameUser"
                            value={name}
                            onChange={handleChange}
                            className={styles.editInput}
                        />
                        <input
                            type="text"
                            name="LastName"
                            value={lastName}
                            onChange={handleChange}
                            className={styles.editInput}
                        />
                        <input
                            type="text"
                            name="Email"
                            value={email}
                            onChange={handleChange}
                            className={styles.editInput}
                        />
                        <input
                            type="date"
                            name="DateBirth"
                            value={dateBirth}
                            onChange={handleChange}
                            className={styles.editInput}
                        />


                        <div className={styles.editButtons}>
                            <button className={`${styles.save_button} ${styles.button}`} onClick={handleSave}>Guardar</button>
                            <button className={`${styles.save_cancel} ${styles.button}`} onClick={handleCancel}>Cancelar</button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.data_container}>
                        <div className={styles.text_group}>
                            <span className={styles.span}>Nombre:</span>
                            <p>{profile ? profile.NameUser : ''}</p>

                        </div>
                        <div className={styles.text_group}>

                            <span className={styles.span}>Apellido:</span>
                            <p> {profile ? profile.LastName : ''}</p>
                        </div>
                        <div className={styles.text_group}>
                            <span className={styles.span}>Email:</span>
                            <p> {profile ? profile.Email : ''}</p>

                        </div>
                        <div className={styles.text_group}>
                            <span className={styles.span}>Fecha de nacimiento:</span>
                            <p> {profile ? profile.DateBirth : ''}</p>

                        </div>

                        <button onClick={handleEditClick} className={styles.editButton}>
                            Editar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;

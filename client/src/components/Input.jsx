// components/Input.js
import React from "react";
import { CiUser } from "react-icons/ci";
import { MdOutlineMailOutline } from "react-icons/md";
import { LuEye } from "react-icons/lu";
import { IoMdEyeOff } from "react-icons/io";
import styles from "../styles/Input.module.css";

const Input = ({ type, placeholder, register, icon, showPassword, handlePasswordVisibility, error }) => {
  return (
    <div className={styles.container_input}>
      <input
        type={type}
        className={styles.input}
        placeholder={placeholder}
        {...register}
      />
      {icon === "email" && (
        <MdOutlineMailOutline className={styles.icon} />
      )}
      {icon === "user" && (
        <CiUser className={styles.icon} />
      )}
      {icon === "password" && (
        <>
          {showPassword ? (
            <LuEye
              className={styles.icon}
              onClick={handlePasswordVisibility}
            />
          ) : (
            <IoMdEyeOff
              className={styles.icon}
              onClick={handlePasswordVisibility}
            />
          )}
        </>
      )}
      {error && (
        <p className={styles.error_message}>{error.message}</p>
      )}
    </div>
  );
};

export default Input;

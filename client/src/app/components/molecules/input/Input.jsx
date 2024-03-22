'use client'
import { useState } from "react";
import "./input.css";
import Icon from "../../atoms/icons/Icon";

const Input = ({ typeInput, type, placeholder , value , onChange}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    console.log("Password visibility changed"); // For debugging
  };

  return (
    <div className="input-container">
      <input
        className="input"
        type={typeInput === "password" && passwordVisible ? "text" : typeInput}
        placeholder={placeholder}  value={value} onChange={onChange}
      />
      {typeInput === "password" && (
        <Icon
          type={passwordVisible ? "eye" : "eye-closed"}
          onClick={handleTogglePasswordVisibility}
        />
      )}
      {typeInput !== "password" && <Icon type={type} />}
    </div>
  );
};

export default Input;

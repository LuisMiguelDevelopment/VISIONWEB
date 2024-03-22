'use client'
import React, { useEffect, useState } from 'react';
import "./formLogin.css";
import TitleIcon from "../../molecules/titleIcon/TitleIcon";
import Input from "../../molecules/input/Input";
import Button from "../../atoms/buttons/Button";
import { loginRequest } from "../../../api/users"; // Importar la función loginRequest


const Login = () => {
  const [formData, setFormData] = useState({
    Email: '',
    PasswordKey: ''
  });
 
  const handleChange = (event, fieldName) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      // Llamar a la función loginRequest con los datos del formulario
      const response = await loginRequest(formData);
      console.log("Login successful:", response.data); // Manejar la respuesta del servidor después de iniciar sesión
    } catch (error) {
      console.error("Error during login:", error); // Manejar cualquier error durante el inicio de sesión
    }
  };


 

  return (
    <form className="form__login" onSubmit={handleSubmit}>
      <TitleIcon
        level={"h1"}
        text1={"L"}
        type={"visionweb"}
        level2={"h1"}
        text2={"gin"}
      />
      <Input
        typeInput={"email"}
        type={"mail"}
        placeholder={"Email"}
        value={formData.Email}
        onChange={(event) => handleChange(event, 'Email')}
      />

      
      <Input
        typeInput={"password"}
        type={"password"}
        placeholder={"Password"}
        value={formData.PasswordKey}
        onChange={(event) => handleChange(event, 'PasswordKey')}
      />
      <Button type="submit" text={"Send"} variant={"buttonBlue"} />
    </form>
  );
};

export default Login;
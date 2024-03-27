import { createContext, useContext, useState, useEffect } from "react";
import {
  loginRequest,
  recoveryPasswordRequest,
  registerRequest,
  updatePasswordRequest,
} from "../pages/api/users";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within on AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [request, setRequest] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);

  const signin = async (user) => {
    try {
      const res = await loginRequest(user);
      console.log(res.data);
      setIsAuthenticated(true);
      setUser(res.data);
    } catch (error) {
      console.log(error);
      if (Array.isArray(error.response.data)) {
        setErrors(error.response.data);
      }
      setErrors([error.response.data.message]);
    }
  };
  const login = async (user) => {
    try {
      const res = await registerRequest(user);
      console.log(res.data);
      setIsAuthenticated(true);
      setUser(res.data);
    } catch (error) {
      console.log(error);
      if (Array.isArray(error.response.data)) {
        setErrors(error.response.data);
      }
      setErrors([error.response.data.message]);
    }
  };
  const recovery = async (request) => {
    try {
      const res = await recoveryPasswordRequest(request);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const updatePassword = async (token, newPassword) => {
    try {
      await updatePasswordRequest({token, newPassword})
      console.log(token , newPassword)
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    async function checkLogin() {
      const cookies = Cookies.get();
      if (!cookies.token) {
        setIsAuthenticated(false);
        setUser(null);
      } else {
        try {
          const res = await loginRequest(); // Aquí deberías pasar cualquier dato necesario para obtener los datos del usuario
          setIsAuthenticated(true);
          setUser(res.data);
        } catch (error) {
          console.log(error);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    }
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signin,
        login,
        recovery,
        request,
        updatePassword,
        user,
        isAuthenticated,
        errors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

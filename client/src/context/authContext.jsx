import { createContext, useContext, useState, useEffect } from "react";
import {
  loginRequest,
  profileRequest,
  recoveryPasswordRequest,
  registerRequest,
  updatePasswordRequest,
} from "../pages/api/users";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

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
  const [profile, setProfile] = useState([]);
  const router = useRouter();

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
      await updatePasswordRequest({ token, newPassword });
      console.log(token, newPassword);
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push("/login");
  //   }
  // });

  useEffect(() => {
    const profile = async () => {
      try {
        const res = await profileRequest();
        setProfile(res.data);
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    profile();
  }, []);

  const authenticateUser = async () => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const res = await profileRequest();
        setIsAuthenticated(true);
        setUser(res.data);
      } catch (error) {
        console.error("Error authenticating user:", error);
        setIsAuthenticated(false);
        setUser(null);
        Cookies.remove("token");
      }
    }
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signin,
        login,
        recovery,
        request,
        profile,
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

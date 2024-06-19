import { createContext, useContext, useState, useEffect } from "react";
import {
  loginRequest,
  profileRequest,
  recoveryPasswordRequest,
  registerRequest,
  updatePasswordRequest,
  searchUsers,
  updateProfileRequest,
  logoutRequest
} from "../pages/api/users";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [profile, setProfile] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [image, setImage] = useState('');
  const router = useRouter();


  const fetchProfile = async () => {
    try {
      const res = await profileRequest();
      setProfile(res.data);
      setImage(res.data.ProfilePicture);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };


  const signin = async (user) => {
    try {
      const res = await loginRequest(user);
      console.log(res.data);
      setIsAuthenticated(true);
      setUser(res.data);
      await fetchProfile();
      router.push('/');
    } catch (error) {
      console.log(error);
      if (Array.isArray(error.response.data)) {
        setErrors(error.response.data);
      } else {
        setErrors([error.response.data.message]);
      }
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
      } else {
        setErrors([error.response.data.message]);
      }
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


  const search = async (name) => {
    try {
      const res = await searchUsers(name);
      setSearchResults(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
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

    authenticateUser();
    fetchProfile();
  }, []);


  const updateProfile = async (formData) => {
    try {
      const res = await updateProfileRequest(formData);
      console.log(res.data);

      const updatedProfile = await profileRequest();
      setProfile(updatedProfile.data);
    } catch (error) {
      console.log(error);

    }
  };



  const logout = async () =>{
    try{
      await logoutRequest();
      setIsAuthenticated(false);
      setUser(null);
      Cookies.remove('token');
      console.log('logout');
      router.push('/login');
    }catch(error){
      console.log(error)
    }
  }

  const getImageUrl = (profilePicture) => {
    return `http://localhost:3001/${profilePicture}`;
  };


  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [!isAuthenticated, router]);

  const authContextValue = {
    signin,
    login,
    recovery,
    profile,
    updatePassword,
    user,
    isAuthenticated,
    errors,
    searchResults,
    setSearchResults,
    search,
    updateProfile,
    getImageUrl,
    logout
  };


  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

import axiosInstance from '../axiosConfig';
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const[loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if(!token) { setLoading(false); return}

    axiosInstance.get("/api/auth/profile", {headers: { Authorization: `Bearer ${token}`}} )
    .then(res => setUser({...res.data, token}))
    .catch(() => localStorage.removeItem("token"))
    .finally(() => setLoading(false))
  }, [])

  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

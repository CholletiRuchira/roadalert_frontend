import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token  = localStorage.getItem('ra_token');
    const stored = localStorage.getItem('ra_user');
    if (token && stored) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('ra_token', data.token);
    localStorage.setItem('ra_user', JSON.stringify(data.user));
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post('/api/auth/register', { name, email, password });
    localStorage.setItem('ra_token', data.token);
    localStorage.setItem('ra_user', JSON.stringify(data.user));
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('ra_token');
    localStorage.removeItem('ra_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
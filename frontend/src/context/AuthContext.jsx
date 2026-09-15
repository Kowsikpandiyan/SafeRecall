import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get('/auth/me');
        if (response.data && response.data.success) {
          setUser(response.data.user);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  const register = async (name, email, password, role, phone, address) => {
    setError(null);
    setLoading(true);

    try {
      const response = await API.post('/auth/register', {
        name,
        email,
        password,
        role,
        phone,
        address
      });

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('user_info', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      setLoading(false);

      return { success: true, user: userData };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      setError(message);
      return { success: false, message };
    }
  };

  const login = async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      const response = await API.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('user_info', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      setLoading(false);

      return { success: true, user: userData };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        setError,
        register,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

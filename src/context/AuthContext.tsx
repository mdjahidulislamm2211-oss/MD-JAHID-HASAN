import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/api.js';
import type { AdminUser } from '../types/index.js';

interface AuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, securityCode: string) => Promise<void>;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vm_admin_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    adminApi.checkAuth()
      .then(res => {
        setAdminUser(res.user);
      })
      .catch(() => {
        localStorage.removeItem('vm_admin_token');
        setAdminUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, pass: string, securityCode: string) => {
    const res = await adminApi.login(email, pass, securityCode);
    localStorage.setItem('vm_admin_token', res.token);
    setAdminUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('vm_admin_token');
    setAdminUser(null);
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    await adminApi.changePassword(oldPass, newPass);
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: Boolean(adminUser),
        isLoading,
        login,
        logout,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

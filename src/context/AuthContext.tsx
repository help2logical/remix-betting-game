import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { STORAGE_KEYS, ROLES } from '../config';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>(ROLES.USER);

  // Initialize from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const savedRole = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE);
    const accounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]');

    if (savedUser) {
      const user = accounts.find((u: User) => u.username === savedUser);
      if (user) {
        setCurrentUser(user);
        setUserRole(savedRole || ROLES.USER);
      }
    }
  }, []);

  const getAccounts = (): User[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]');
  };

  const saveAccounts = (accounts: User[]) => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  };

  const login = async (username: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const accounts = getAccounts();
      const user = accounts.find((u: User) => u.username === username && u.password === password);

      if (user) {
        setCurrentUser(user);
        setUserRole(user.role);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, user.role);
        resolve();
      } else {
        reject(new Error('Invalid username or password'));
      }
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole(ROLES.USER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ROLE);
  };

  const register = async (username: string, password: string, role: string = ROLES.USER): Promise<void> => {
    return new Promise((resolve, reject) => {
      const accounts = getAccounts();
      const exists = accounts.find((u: User) => u.username === username);

      if (exists) {
        reject(new Error('User already exists'));
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        username,
        password,
        role: role as 'user' | 'admin' | 'master_admin',
        balance: 1000,
        createdAt: Date.now(),
      };

      accounts.push(newUser);
      saveAccounts(accounts);
      resolve();
    });
  };

  const updateUserBalance = async (userId: string, newBalance: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const accounts = getAccounts();
      const user = accounts.find((u: User) => u.id === userId);

      if (user) {
        user.balance = newBalance;
        saveAccounts(accounts);
        if (currentUser?.id === userId) {
          setCurrentUser({ ...user });
        }
        resolve();
      } else {
        reject(new Error('User not found'));
      }
    });
  };

  const deleteUser = async (userId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const accounts = getAccounts();
      const index = accounts.findIndex((u: User) => u.id === userId);

      if (index !== -1) {
        accounts.splice(index, 1);
        saveAccounts(accounts);
        if (currentUser?.id === userId) {
          logout();
        }
        resolve();
      } else {
        reject(new Error('User not found'));
      }
    });
  };

  const value: AuthContextType = {
    currentUser,
    userRole,
    login,
    logout,
    register,
    updateUserBalance,
    deleteUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

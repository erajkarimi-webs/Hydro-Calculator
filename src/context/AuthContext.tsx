import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isPro: boolean;
  login: (email: string, pass: string) => { success: boolean; message?: string };
  register: (name: string, email: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;
  quickProLogin: () => void;
  upgradeToPro: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRO_MASTER_EMAIL = 'erajkarimi@gmail.com';
const PRO_MASTER_PASS = 'Civil@18032';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('aquacalc_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default logged in as Pro Eraj Karimi for instant access
    return {
      name: 'Eng. Eraj Karimi',
      email: 'erajkarimi@gmail.com',
      isPro: true,
      role: 'Principal Water Resources Engineer (P.E.)',
      organization: 'Civil & Environmental Hydrosystems',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('aquacalc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aquacalc_user');
    }
  }, [user]);

  const login = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check master Pro account
    if (cleanEmail === PRO_MASTER_EMAIL.toLowerCase()) {
      if (pass === PRO_MASTER_PASS || pass.length > 0) {
        const proUser: UserProfile = {
          name: 'Eng. Eraj Karimi',
          email: PRO_MASTER_EMAIL,
          isPro: true,
          role: 'Principal Water Resources Engineer (P.E.)',
          organization: 'Civil & Environmental Hydrosystems',
        };
        setUser(proUser);
        return { success: true };
      }
    }

    // Check custom registered users from localStorage
    try {
      const dbUsersStr = localStorage.getItem('aquacalc_registered_users');
      const dbUsers = dbUsersStr ? JSON.parse(dbUsersStr) : [];
      const found = dbUsers.find((u: any) => u.email.toLowerCase() === cleanEmail);
      if (found) {
        if (found.pass === pass) {
          const registeredUser: UserProfile = {
            name: found.name,
            email: found.email,
            isPro: found.isPro ?? true, // Give Pro access
            role: found.role || 'Design Engineer',
            organization: found.org || 'Hydrologic Engineering Group',
          };
          setUser(registeredUser);
          return { success: true };
        }
        return { success: false, message: 'Invalid password. Please verify your credentials.' };
      }
    } catch {
      // Ignore
    }

    // Default friendly login
    const newUser: UserProfile = {
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email: cleanEmail,
      isPro: true, // unlock Pro features
      role: 'Environmental Engineer',
    };
    setUser(newUser);
    return { success: true };
  };

  const register = (name: string, email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const dbUsersStr = localStorage.getItem('aquacalc_registered_users');
      const dbUsers = dbUsersStr ? JSON.parse(dbUsersStr) : [];
      
      const exists = dbUsers.some((u: any) => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        return { success: false, message: 'Account with this email already exists. Please sign in.' };
      }

      const newUserRecord = {
        name: name.trim() || 'Engineer',
        email: cleanEmail,
        pass,
        isPro: true, // auto give Pro to registered users!
        createdAt: new Date().toISOString(),
      };
      dbUsers.push(newUserRecord);
      localStorage.setItem('aquacalc_registered_users', JSON.stringify(dbUsers));

      const newUser: UserProfile = {
        name: newUserRecord.name,
        email: cleanEmail,
        isPro: true,
        role: 'Registered Professional Engineer',
      };
      setUser(newUser);
      return { success: true };
    } catch {
      const newUser: UserProfile = {
        name,
        email: cleanEmail,
        isPro: true,
      };
      setUser(newUser);
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const quickProLogin = () => {
    const proUser: UserProfile = {
      name: 'Eng. Eraj Karimi',
      email: PRO_MASTER_EMAIL,
      isPro: true,
      role: 'Principal Water Resources Engineer (P.E.)',
      organization: 'Civil & Environmental Hydrosystems',
    };
    setUser(proUser);
  };

  const upgradeToPro = () => {
    if (user) {
      setUser({ ...user, isPro: true });
    } else {
      quickProLogin();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isPro: !!user?.isPro,
        login,
        register,
        logout,
        quickProLogin,
        upgradeToPro,
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

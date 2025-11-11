import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const ADMIN_EMAIL = 'pranavnasrani@gmail.com';

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  const value = { user, login, logout, loading, isAdmin };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
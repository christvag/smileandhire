'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../lib/api';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'CLIENT' | 'APPLICANT';
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
  name?: string;
  company?: any;
  applicant?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔄 Logging in via Supabase API...');
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('✅ Login successful via Supabase API');
      
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);

      // Redirect based on role
      if (data.user.role === 'CLIENT') {
        router.push('/client/dashboard');
      } else if (data.user.role === 'APPLICANT') {
        router.push('/applicant/dashboard');
      } else if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      console.log('🔄 Registering user via Supabase API...');
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      console.log('✅ Registration successful via Supabase API');
      
      // Store auth data
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      setToken(result.token);
      setUser(result.user);

      // Redirect based on role
      if (result.user.role === 'CLIENT') {
        router.push('/client/dashboard');
      } else if (result.user.role === 'APPLICANT') {
        router.push('/applicant/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('token');
    console.log('AuthContext: refreshUser called, token:', currentToken ? 'exists' : 'missing');
    if (!currentToken) {
      console.log('AuthContext: No token available, cannot refresh user');
      return;
    }

    try {
      console.log('AuthContext: Calling API /api/auth/me...');
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      console.log('AuthContext: API response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('AuthContext: Received user data:', userData.user);
        console.log('AuthContext: Username in response:', userData.user.username);
        
        setUser(userData.user);
        localStorage.setItem('user', JSON.stringify(userData.user));
        console.log('AuthContext: User data updated successfully');
      } else {
        console.error('AuthContext: API response not OK:', response.status, response.statusText);
        if (response.status === 401) {
          console.log('AuthContext: Token invalid, logging out user');
          logout();
        }
      }
    } catch (error) {
      console.error('AuthContext: Error refreshing user data:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
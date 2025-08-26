'use client';

import React, { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
type UserRole = 'ADMIN' | 'CLIENT' | 'APPLICANT';

interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  name?: string;
  image?: string;
  avatar?: string;
  username?: string;
  company?: any;
  applicant?: any;
}

interface NextAuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: () => boolean;
}

const NextAuthContext = createContext<NextAuthContextType | undefined>(undefined);

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const user: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email || '',
    role: session.user.role,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    name: session.user.name || undefined,
    image: session.user.image || undefined,
    avatar: session.user.image || undefined,
    username: session.user.username,
    company: session.user.company,
    applicant: session.user.applicant,
  } : null;

  const isLoading = status === 'loading';

  const login = async (email: string, password: string) => {
    try {
      console.log('🔄 Logging in with NextAuth credentials...');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        console.log('✅ Login successful via NextAuth');
        // NextAuth will handle the redirect automatically
        // But we can customize it based on user role if needed
        await update(); // Refresh session
        
        // Custom redirect logic
        if (user?.role === 'CLIENT') {
          router.push('/client/dashboard');
        } else if (user?.role === 'APPLICANT') {
          router.push('/applicant/dashboard');
        } else if (user?.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('🔄 Logging in with Google SSO...');
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/'
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      console.log('✅ Google SSO initiated');
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      console.log('🔄 Registering user...');
      // For registration, we use the backend API endpoint
      // Then automatically sign them in with NextAuth
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
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

      console.log('✅ Registration successful');
      
      // Automatically sign them in after registration
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      // Redirect based on role
      if (result.user?.role === 'CLIENT') {
        router.push('/client/dashboard');
      } else if (result.user?.role === 'APPLICANT') {
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
    console.log('NextAuthContext: refreshUser called');
    try {
      await update(); // This will refresh the session
      console.log('NextAuthContext: Session refreshed successfully');
    } catch (error) {
      console.error('NextAuthContext: Error refreshing session:', error);
    }
  };

  const logout = async () => {
    console.log('🔄 Logging out...');
    await signOut({ 
      redirect: true,
      callbackUrl: '/'
    });
  };

  const isAuthenticated = () => {
    return !!session?.user;
  };

  return (
    <NextAuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
        isAuthenticated,
      }}
    >
      {children}
    </NextAuthContext.Provider>
  );
}

export function useNextAuth() {
  const context = useContext(NextAuthContext);
  if (context === undefined) {
    throw new Error('useNextAuth must be used within a NextAuthProvider');
  }
  return context;
}
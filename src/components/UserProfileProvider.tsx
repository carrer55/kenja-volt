import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  position: string | null;
  phone: string | null;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string; data?: UserProfile }>;
  loading: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile, loading } = useAuth();

  const profile = user ? {
    id: user.id,
    email: user.email,
    name: user.name,
    company: user.company,
    position: user.position,
    phone: user.phone
  } : null;

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile, loading }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
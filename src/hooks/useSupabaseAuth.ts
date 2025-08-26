import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { userProfileService, type UserProfile } from '../lib/database';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    // 初期認証状態の確認
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await userProfileService.getProfile(session.user.id);
        setAuthState({
          user: session.user,
          profile,
          loading: false,
          isAuthenticated: true
        });
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          isAuthenticated: false
        });
      }
    };

    getInitialSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await userProfileService.getProfile(session.user.id);
          setAuthState({
            user: session.user,
            profile,
            loading: false,
            isAuthenticated: true
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            isAuthenticated: false
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: {
    full_name: string;
    company_name: string;
    position: string;
    phone: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // プロフィール作成
        const profileResult = await userProfileService.createProfile({
          id: data.user.id,
          full_name: userData.full_name,
          company_name: userData.company_name,
          position: userData.position,
          phone: userData.phone,
          department: null,
          role: 'user'
        });

        if (!profileResult.success) {
          return { success: false, error: profileResult.error };
        }
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.user) {
      return { success: false, error: 'ユーザーが認証されていません' };
    }

    const result = await userProfileService.updateProfile(authState.user.id, updates);
    
    if (result.success) {
      // ローカル状態を更新
      setAuthState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null
      }));
    }

    return result;
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    isAuthenticated: authState.isAuthenticated,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword
  };
}
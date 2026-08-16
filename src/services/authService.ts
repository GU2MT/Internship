import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserAccount, UserRole } from '../types/cctv';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  badgeId?: string;
  organization?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserAccount;
  error?: string;
}

export const authService = {
  isConfigured: (): boolean => {
    return isSupabaseConfigured();
  },

  async signUp(data: SignUpData): Promise<AuthResponse> {
    if (data.role === 'admin') {
      return {
        success: false,
        error: 'System Admin accounts can only be provisioned directly in Supabase. Self-registration is restricted to Private Camera Owners.',
      };
    }

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.',
      };
    }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            role: data.role,
            badge_id: data.badgeId || '',
            organization: data.organization || '',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (authData.user) {
        // Attempt instant sign in for seamless session establishment
        try {
          await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });
        } catch {
          // Ignore if email confirmation is required by server configuration
        }

        const userAccount: UserAccount = {
          id: authData.user.id,
          email: authData.user.email || data.email,
          name: data.name,
          role: data.role,
          badgeId: data.badgeId,
          organization: data.organization,
        };
        return { success: true, user: userAccount };
      }

      return { success: false, error: 'Registration completed but user object was not returned.' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown registration error';
      return { success: false, error: message };
    }
  },

  async signIn(data: SignInData): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.',
      };
    }

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (authData.user) {
        const meta = authData.user.user_metadata || {};
        const userAccount: UserAccount = {
          id: authData.user.id,
          email: authData.user.email || data.email,
          name: meta.full_name || authData.user.email?.split('@')[0] || 'Authenticated User',
          role: (meta.role as UserRole) || 'public',
          badgeId: meta.badge_id || undefined,
          organization: meta.organization || undefined,
        };
        return { success: true, user: userAccount };
      }

      return { success: false, error: 'Sign in succeeded but user object was null.' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown sign-in error';
      return { success: false, error: message };
    }
  },

  async signOut(): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown sign-out error';
      return { success: false, error: message };
    }
  },

  async getCurrentUser(): Promise<UserAccount | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const meta = user.user_metadata || {};
      return {
        id: user.id,
        email: user.email || '',
        name: meta.full_name || user.email?.split('@')[0] || 'User',
        role: (meta.role as UserRole) || 'public',
        badgeId: meta.badge_id || undefined,
        organization: meta.organization || undefined,
      };
    } catch {
      return null;
    }
  },

  onAuthStateChange(callback: (user: UserAccount | null) => void) {
    if (!isSupabaseConfigured()) {
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const user: UserAccount = {
          id: session.user.id,
          email: session.user.email || '',
          name: meta.full_name || session.user.email?.split('@')[0] || 'User',
          role: (meta.role as UserRole) || 'public',
          badgeId: meta.badge_id || undefined,
          organization: meta.organization || undefined,
        };
        callback(user);
      } else {
        callback(null);
      }
    });

    return subscription;
  },
};

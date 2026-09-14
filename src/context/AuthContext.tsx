import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AppNotification } from '../types.ts';
import { api, getStoredToken } from '../lib/api.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: (googleData?: { email?: string; name?: string; avatar?: string; idToken?: string }) => Promise<User>;
  logout: () => void;
  switchRole: (role: 'user' | 'admin') => Promise<void>;
  notifications: AppNotification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  toast: { message: string; type: 'info' | 'success' | 'warning' | 'error'; id: number } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { showToast: triggerToast } = useToast();

  const showToast = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      triggerToast(message, type);
    },
    [triggerToast]
  );

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
    } catch {
      // ignore
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getCurrentUser();
      setUser(data.user);
      await refreshNotifications();
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshNotifications]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    showToast(`Welcome back, ${res.user.name}!`, 'success');
    await refreshNotifications();
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await api.register(name, email, pass);
    setUser(res.user);
    showToast(`Account created successfully! Welcome to Web2APK Studio.`, 'success');
    await refreshNotifications();
  };

  const loginWithGoogle = async (googleData?: {
    email?: string;
    name?: string;
    avatar?: string;
    idToken?: string;
  }) => {
    setLoading(true);
    try {
      if (googleData?.email) {
        const res = await api.loginWithGoogle({
          email: googleData.email,
          name: googleData.name,
          avatar: googleData.avatar,
          idToken: googleData.idToken,
        });
        setUser(res.user);
        showToast(`Signed in with Google as ${res.user.email}`, 'success');
        await refreshNotifications();
        return res.user;
      }

      // Try Firebase Google popup authentication
      try {
        const { signInWithPopup } = await import('firebase/auth');
        const { auth, googleProvider } = await import('../lib/firebase.ts');
        const cred = await signInWithPopup(auth, googleProvider);
        const fbUser = cred.user;
        const res = await api.loginWithGoogle({
          email: fbUser.email || '',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
          avatar: fbUser.photoURL || undefined,
        });
        setUser(res.user);
        showToast(`Signed in with Google as ${res.user.email}`, 'success');
        await refreshNotifications();
        return res.user;
      } catch (popupErr: any) {
        // Re-throw so caller can handle or trigger the interactive Google account chooser
        throw popupErr;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    showToast('Signed out successfully', 'info');
  };

  const switchRole = async (role: 'user' | 'admin') => {
    const res = await api.switchRole(role);
    setUser(res.user);
    showToast(`Switched active view to ${role.toUpperCase()} mode (${res.user.name})`, 'success');
    await refreshNotifications();
  };

  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        switchRole,
        notifications,
        unreadCount,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        showToast,
        toast: null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

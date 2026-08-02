import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { initFirebase } from '@/lib/firebase';

export interface UserProfile {
  name: string;
  role: 'client' | 'firma' | 'admin';
  email: string;
}

export interface SessionPayload {
  uid: string;
  email: string;
  role: 'client' | 'firma' | 'admin';
  name?: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  hasCompanyProfile: boolean | null;
  loading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setSession: (session: SessionPayload) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  hasCompanyProfile: null,
  loading: true,
  theme: 'light',
  toggleTheme: () => {},
  setSession: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasCompanyProfile, setHasCompanyProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setSession = (sess: SessionPayload) => {
    localStorage.setItem('active_user_session', JSON.stringify(sess));
    localStorage.setItem('user_role_' + sess.uid, sess.role);
    if (sess.role === 'firma') {
      localStorage.setItem('has_company_profile_' + sess.uid, 'true');
      setHasCompanyProfile(true);
    }
    setUser({ uid: sess.uid, email: sess.email, displayName: sess.name || sess.companyName || 'Użytkownik' } as User);
    setProfile({
      name: sess.name || sess.companyName || 'Użytkownik',
      role: sess.role,
      email: sess.email
    });
    setLoading(false);
  };

  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeProfile = () => {};
    let unsubscribeCompany = () => {};
    
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Multi-tab sync: listen for session changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'active_user_session') {
        if (e.newValue) {
          try {
            const sess = JSON.parse(e.newValue);
            if (sess && sess.uid) {
              setUser({ uid: sess.uid, email: sess.email, displayName: sess.name } as User);
              setProfile({
                name: sess.name || 'Użytkownik',
                role: sess.role || 'client',
                email: sess.email || ''
              });
              if (sess.role === 'firma') {
                setHasCompanyProfile(true);
              }
            }
          } catch (e) {}
        } else {
          // Session was cleared in another tab
          setUser(null);
          setProfile(null);
          setHasCompanyProfile(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const handleCompanySnapshot = (currentUserUid: string) => (companySnap: any) => {
      const exists = companySnap.exists();
      setHasCompanyProfile(exists);
      localStorage.setItem('has_company_profile_' + currentUserUid, exists ? 'true' : 'false');
      setLoading(false);
    };

    const handleCompanyError = (currentUserUid: string) => (error: any) => {
      const cachedHasProfile = localStorage.getItem('has_company_profile_' + currentUserUid) === 'true';
      setHasCompanyProfile(cachedHasProfile);
      setLoading(false);
    };

    const handleProfileSnapshot = (currentUser: User, cachedRole: any, db: any) => (docSnap: any) => {
      clearTimeout(safetyTimeout);
      if (docSnap.exists()) {
        const userData = docSnap.data() as UserProfile;
        setProfile(userData);
        localStorage.setItem('user_role_' + currentUser.uid, userData.role);
        
        if (userData.role === 'firma') {
          unsubscribeCompany();
          unsubscribeCompany = onSnapshot(
            doc(db, 'companies', currentUser.uid),
            handleCompanySnapshot(currentUser.uid),
            handleCompanyError(currentUser.uid)
          );
        } else {
          setHasCompanyProfile(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const handleProfileError = (currentUser: User, cachedRole: any) => (error: any) => {
      clearTimeout(safetyTimeout);
      setLoading(false);
    };

    const setupAuth = async () => {
      // Check persistent active_user_session for instant auto-login
      const savedSession = localStorage.getItem('active_user_session');
      if (savedSession) {
        try {
          const sess = JSON.parse(savedSession);
          if (sess && sess.uid) {
            setUser({ uid: sess.uid, email: sess.email, displayName: sess.name } as User);
            setProfile({
              name: sess.name || 'Użytkownik',
              role: sess.role || 'client',
              email: sess.email || ''
            });
            if (sess.role === 'firma') {
              setHasCompanyProfile(true);
            }
            setLoading(false);
          }
        } catch (e) {}
      }

      try {
        const { auth, db } = await initFirebase();
        unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            setLoading(true);
            setUser(currentUser);
            
            unsubscribeProfile();
            unsubscribeCompany();

            const cachedRole = localStorage.getItem('user_role_' + currentUser.uid) as 'client' | 'firma' | 'admin' | null;
            if (cachedRole) {
              setProfile({
                name: currentUser.displayName || 'Użytkownik',
                role: cachedRole,
                email: currentUser.email || '',
              });
              if (cachedRole === 'firma') {
                const cachedHasProfile = localStorage.getItem('has_company_profile_' + currentUser.uid) === 'true';
                setHasCompanyProfile(cachedHasProfile);
              }
            }

            unsubscribeProfile = onSnapshot(
              doc(db, 'users', currentUser.uid),
              handleProfileSnapshot(currentUser, cachedRole, db),
              handleProfileError(currentUser, cachedRole)
            );
          } else if (!savedSession) {
            clearTimeout(safetyTimeout);
            setUser(null);
            setProfile(null);
            setHasCompanyProfile(null);
            setLoading(false);
          } else {
            setLoading(false);
          }
        });
      } catch (error) {
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    };

    setupAuth();

    return () => {
      clearTimeout(safetyTimeout);
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeAuth();
      unsubscribeProfile();
      unsubscribeCompany();
    };
  }, []);

  const logout = async () => {
    localStorage.removeItem('active_user_session');
    localStorage.removeItem('adminToken');
    try {
      const { auth } = await initFirebase();
      await signOut(auth);
    } catch (error) {}
    setUser(null);
    setProfile(null);
    setHasCompanyProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, hasCompanyProfile, loading, theme, toggleTheme, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

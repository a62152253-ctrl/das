import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { initFirebase } from './firebase';

interface UserProfile {
  name: string;
  role: 'client' | 'firma' | 'admin';
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  hasCompanyProfile: boolean | null;
  loading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  hasCompanyProfile: null,
  loading: true,
  theme: 'light',
  toggleTheme: () => {},
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

  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeProfile = () => {};
    let unsubscribeCompany = () => {};
    
    // Safety timeout in case Firebase hangs
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const handleCompanySnapshot = (currentUserUid: string) => (companySnap: any) => {
      const exists = companySnap.exists();
      setHasCompanyProfile(exists);
      localStorage.setItem('has_company_profile_' + currentUserUid, exists ? 'true' : 'false');
      setLoading(false);
    };

    const handleCompanyError = (currentUserUid: string) => (error: any) => {
      console.error("Error fetching company profile, defaulting to cached value:", error);
      const cachedHasProfile = localStorage.getItem('has_company_profile_' + currentUserUid) === 'true';
      setHasCompanyProfile(cachedHasProfile);
      setLoading(false);
    };

    const handleProfileSnapshot = (currentUser: User, cachedRole: any, db: any) => (docSnap: any) => {
      clearTimeout(safetyTimeout);
      if (docSnap.exists()) {
        const userData = docSnap.data() as UserProfile;
        setProfile(userData);
        
        // Cache user role
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
        setProfile(null);
        setHasCompanyProfile(null);
        setLoading(false);
      }
    };

    const handleProfileError = (currentUser: User, cachedRole: any) => (error: any) => {
      clearTimeout(safetyTimeout);
      console.error("Error fetching user profile:", error);
      if (!cachedRole) {
        setProfile(null);
        setHasCompanyProfile(null);
      }
      setLoading(false);
    };

    const setupAuth = async () => {
      try {
        const { auth, db } = await initFirebase();
        unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
          setLoading(true);
          setUser(currentUser);
          
          // Clear previous listeners
          unsubscribeProfile();
          unsubscribeCompany();
          
          if (currentUser) {
            // Read cached role synchronously to support offline startup
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
          } else {
            clearTimeout(safetyTimeout);
            setProfile(null);
            setHasCompanyProfile(null);
            setLoading(false);
          }
        });
      } catch (error) {
        clearTimeout(safetyTimeout);
        console.error('Auth setup failed:', error);
        setLoading(false);
      }
    };

    setupAuth();

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribeAuth();
      unsubscribeProfile();
      unsubscribeCompany();
    };
  }, []);

  const logout = async () => {
    try {
      const { auth } = await initFirebase();
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, hasCompanyProfile, loading, theme, toggleTheme, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

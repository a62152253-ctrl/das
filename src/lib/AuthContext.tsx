import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { initFirebase } from './firebase';

interface UserProfile {
  name: string;
  role: 'client' | 'firma';
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  hasCompanyProfile: boolean | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  hasCompanyProfile: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasCompanyProfile, setHasCompanyProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeProfile = () => {};
    let unsubscribeCompany = () => {};
    
    // Safety timeout in case Firebase hangs
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const setupAuth = async () => {
      try {
        const { auth, db } = await initFirebase();
        unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
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

            unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
              clearTimeout(safetyTimeout);
              if (docSnap.exists()) {
                const userData = docSnap.data() as UserProfile;
                setProfile(userData);
                
                // Cache user role
                localStorage.setItem('user_role_' + currentUser.uid, userData.role);
                
                if (userData.role === 'firma') {
                  unsubscribeCompany = onSnapshot(doc(db, 'companies', currentUser.uid), (companySnap) => {
                    const exists = companySnap.exists();
                    setHasCompanyProfile(exists);
                    localStorage.setItem('has_company_profile_' + currentUser.uid, exists ? 'true' : 'false');
                    setLoading(false);
                  }, (error) => {
                    console.error("Error fetching company profile, defaulting to cached value:", error);
                    const cachedHasProfile = localStorage.getItem('has_company_profile_' + currentUser.uid) === 'true';
                    setHasCompanyProfile(cachedHasProfile);
                    setLoading(false);
                  });
                } else {
                  setHasCompanyProfile(null);
                  setLoading(false);
                }
              } else {
                setProfile(null);
                setHasCompanyProfile(null);
                setLoading(false);
              }
            }, (error) => {
              clearTimeout(safetyTimeout);
              console.error("Error fetching user profile:", error);
              // Fallback to cached profile if available, otherwise default to client
              if (!cachedRole) {
                setProfile({
                  name: 'Gość offline',
                  role: 'client',
                  email: currentUser.email || '',
                });
                setHasCompanyProfile(null);
              }
              setLoading(false);
            });
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
    <AuthContext.Provider value={{ user, profile, hasCompanyProfile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

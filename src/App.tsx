import { useState, useEffect } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { CompanyProfileForm } from './components/company/profile/CompanyProfileForm';
import { CompanyDashboard } from './components/company/dashboard/CompanyDashboard';
import { ClientDashboard } from './components/client/ClientDashboard';
const AdminDashboard = React.lazy(() => import('./components/admin/dashboard/AdminDashboard'));
import { Navbar } from './components/common/Navbar';
import { HomePage } from './components/HomePage';
import { CompanyPublicProfile } from './components/company/profile/CompanyPublicProfile';
import { SearchBar } from './components/search/SearchBar';
import { SearchResults } from './components/search/core/SearchResults';
import { SearchMap } from './components/search/core/SearchMap';
import { ToastContainer, SkeletonList } from './components/ui';
import { AuthView } from './types';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from './lib/AuthContext';
import { searchAll } from './lib/SearchEngine';
import { SearchResultItem } from './lib/RankingEngine';

export default function App() {
  const { user, profile, hasCompanyProfile, loading, logout } = useAuth();
  const [view, setView] = useState<AuthView>('login');

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [searchCity, setSearchCity] = useState('Poznań');
  const [isSearching, setIsSearching] = useState(false);
  const isWorkspaceView = view === 'dashboard-client' || view === 'dashboard-company' || view === 'dashboard-admin';

  // Role Discipline & Guarded Routing
  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Unauthenticated users must see login screen (or register / forgot-password if navigating there)
      if (view !== 'login' && view !== 'register' && view !== 'forgot-password') {
        setView('login');
      }
      return;
    }

    // Role-specific routing rules for authenticated users
    if (profile?.role === 'admin') {
      const isForbiddenAdminView = 
        view === 'login' || 
        view === 'register' || 
        view === 'forgot-password' || 
        view === 'dashboard-company' || 
        view === 'dashboard-client' ||
        view === 'create-company-profile';

      if (isForbiddenAdminView) {
        setView('dashboard-admin');
      }
    } else if (profile?.role === 'firma') {
      // Company role must stay in company mode!
      if (hasCompanyProfile === false) {
        if (view !== 'create-company-profile') {
          setView('create-company-profile');
        }
      } else {
        // Allow company profile view ONLY if it's previewing their own company profile
        const isPreviewingSelf = view === 'company-profile' && selectedCompanyId === user.uid;
        const isAllowedCompanyView = view === 'dashboard-company' || view === 'create-company-profile' || isPreviewingSelf;

        if (!isAllowedCompanyView) {
          setView('dashboard-company');
        }
      }
    } else if (profile?.role === 'client') {
      // Client role
      const isForbiddenClientView = 
        view === 'login' || 
        view === 'register' || 
        view === 'forgot-password' || 
        view === 'dashboard-company' || 
        view === 'dashboard-admin' || 
        view === 'create-company-profile';

      if (isForbiddenClientView) {
        setView('home');
      }
    }
  }, [user, profile, hasCompanyProfile, loading]);

  useEffect(() => {
    handleSearch('', 'Poznań');
  }, []);

  const handleSearch = async (queryText: string, city: string) => {
    setIsSearching(true);
    setSearchQuery(queryText);
    setSearchCity(city);

    if (profile?.role !== 'firma') {
      try {
        const saved = localStorage.getItem('lokalnie_recent_searches');
        const current = saved ? JSON.parse(saved) : [];
        const cleanQuery = queryText.trim();
        const entry = {
          id: `${Date.now()}`,
          query: cleanQuery || 'Wszystko',
          city: city || 'Poznań'
        };
        const withoutDuplicate = current.filter((item: { query: string; city: string }) => {
          return item.query !== entry.query || item.city !== entry.city;
        });
        localStorage.setItem('lokalnie_recent_searches', JSON.stringify([entry, ...withoutDuplicate].slice(0, 4)));
      } catch (err) {
        console.error('Could not save recent search', err);
      }
    }

    try {
      const results = await searchAll(queryText);
      setSearchResults(results);
      if (queryText.trim() !== '') {
        // For company role, searching doesn't divert away from company mode
        if (profile?.role !== 'firma') {
          setView('search');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCompany = (companyId: string) => {
    // If company user clicks a company, redirect to their own dashboard unless it's themselves
    if (profile?.role === 'firma') {
      if (companyId === user?.uid) {
        setSelectedCompanyId(companyId);
        setView('company-profile');
      } else {
        setView('dashboard-company');
      }
      return;
    }
    setSelectedCompanyId(companyId);
    setView('company-profile');
  };

  const handleNavigate = (targetView: AuthView, id?: string) => {
    if (id) setSelectedCompanyId(id);

    // Enforce role discipline on manual navigation requests
    if (profile?.role === 'firma') {
      if (targetView === 'company-profile' && id && id === user?.uid) {
        setView('company-profile');
        return;
      }
      if (targetView !== 'dashboard-company' && targetView !== 'create-company-profile') {
        setView('dashboard-company');
        return;
      }
    } else if (profile?.role === 'client') {
      if (targetView === 'dashboard-company' || targetView === 'dashboard-admin' || targetView === 'create-company-profile') {
        setView('home');
        return;
      }
    } else if (profile?.role === 'admin') {
      if (targetView === 'dashboard-company' || targetView === 'dashboard-client' || targetView === 'create-company-profile') {
        setView('dashboard-admin');
        return;
      }
    }

    setView(targetView);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans relative overflow-hidden text-white">
        <ToastContainer />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 text-center space-y-5">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 mx-auto animate-pulse">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none text-white">
              LOKALNIE<span className="text-indigo-400">PRO</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 animate-pulse">
              Ładowanie serwisu usługi...
            </p>
          </div>
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mt-3" />
        </div>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 font-sans text-white">
        <ToastContainer />
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h1 className="text-xl font-black tracking-tight">Weryfikujemy Twoje konto</h1>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-300">
            Nie udało się jeszcze pobrać roli użytkownika. Odśwież stronę za chwilę albo wyloguj się i spróbuj ponownie.
          </p>
          <button
            type="button"
            onClick={async () => {
              await logout();
              setView('login');
            }}
            className="mt-6 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-white/15"
          >
            Wyloguj i wróć do logowania
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <ToastContainer />

      {!isWorkspaceView && (
        <Navbar 
          currentView={view} 
          onNavigate={handleNavigate} 
        />
      )}

      {/* Dynamic View Router */}
      <div className="flex-1">
        {view === 'login' && (
          <LoginForm onNavigate={handleNavigate} />
        )}

        {view === 'register' && (
          <RegisterForm onNavigate={handleNavigate} />
        )}

        {view === 'forgot-password' && (
          <ForgotPasswordForm onNavigate={handleNavigate} />
        )}

        {view === 'create-company-profile' && (
          <CompanyProfileForm onNavigate={handleNavigate} />
        )}

        {view === 'home' && (
          <HomePage 
            onSearch={handleSearch} 
            onSelectCompany={handleSelectCompany}
          />
        )}

        {view === 'search' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
            <SearchBar initialQuery={searchQuery} onSearch={handleSearch} />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Wyniki wyszukiwania</p>
                <h1 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                  {searchQuery ? `Szukasz: ${searchQuery}` : 'Polecane firmy w okolicy'}
                </h1>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Lokalizacja: {searchCity || 'cała Polska'}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {isSearching ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <SkeletonList count={5} />
                  </div>
                ) : (
                  <SearchResults 
                    results={searchResults} 
                    query={searchQuery} 
                    onSelectCompany={handleSelectCompany} 
                  />
                )}
              </div>
              <div className="lg:col-span-1">
                <SearchMap results={searchResults} onSelectCompany={handleSelectCompany} />
              </div>
            </div>
          </div>
        )}

        {view === 'company-profile' && selectedCompanyId && (
          <CompanyPublicProfile 
            companyId={selectedCompanyId} 
            onBack={() => {
              if (profile?.role === 'firma') {
                setView('dashboard-company');
              } else {
                setView('search');
              }
            }}
            onOpenChat={() => {
              if (profile?.role === 'firma') {
                setView('dashboard-company');
              } else {
                setView('dashboard-client');
              }
            }}
          />
        )}

        {view === 'dashboard-client' && (
          <ClientDashboard onNavigate={handleNavigate} />
        )}

        {view === 'dashboard-company' && (
          <CompanyDashboard onNavigate={handleNavigate} />
        )}

        {view === 'dashboard-admin' && (
          <React.Suspense fallback={<div>Loading admin panel…</div>}>
            <AdminDashboard onNavigate={handleNavigate} />
          </React.Suspense>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { CompanyProfileForm } from './components/CompanyProfileForm';
import { CompanyDashboard } from './components/CompanyDashboard';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { CompanyPublicProfile } from './components/CompanyPublicProfile';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { SearchMap } from './components/SearchMap';
import { ToastContainer } from './components/ui/Toast';
import { AuthView, Company } from './types';
import { Sparkles, MapPin, Loader2, Star, MessageSquare, Phone, Globe, ChevronRight, Building2, Mail, Briefcase, FileText, Tag, FolderKanban } from 'lucide-react';
import { useAuth } from './lib/AuthContext';
import { searchAll } from './lib/SearchEngine';
import { SearchResultItem } from './lib/RankingEngine';

export default function App() {
  const { user, profile, hasCompanyProfile, loading } = useAuth();
  const [view, setView] = useState<AuthView>('home');

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [searchCity, setSearchCity] = useState('Gniezno');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!user) {
      setView('login');
      return;
    }

    // User is logged in, route them by role
    if (profile?.role === 'admin') {
      setView('dashboard-admin');
    } else if (profile?.role === 'firma') {
      if (hasCompanyProfile === false) {
        setView('create-company-profile');
      } else {
        setView('dashboard-company');
      }
    } else {
      // client
      setView('home');
    }
  }, [user, profile, hasCompanyProfile]);

  useEffect(() => {
    handleSearch('', 'Gniezno');
  }, []);

  const handleSearch = async (queryText: string, city: string) => {
    setIsSearching(true);
    setSearchQuery(queryText);
    setSearchCity(city);

    // Save search history
    if (queryText.trim() !== '') {
      try {
        const existingLogsStr = localStorage.getItem('lokalnie_search_logs');
        const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
        const newLog = {
          id: Date.now().toString(),
          query: queryText,
          city: city,
          timestamp: new Date().toLocaleString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
        const updatedLogs = [newLog, ...existingLogs].slice(0, 10); // keep last 10
        localStorage.setItem('lokalnie_search_logs', JSON.stringify(updatedLogs));
      } catch (err) {
        console.error('Could not save search log', err);
      }
    }

    try {
      const results = await searchAll(queryText);
      setSearchResults(results);
      setView('search');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setView('company-profile');
  };

  const handleContactCompany = (companyId: string, companyName: string) => {
    setView('dashboard-client');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // GUEST FLOW (not logged in)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center font-sans overflow-y-auto p-6">
        <ToastContainer />
        {/* Decorative glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[20%] w-[70%] h-[50%] bg-blue-650/20 blur-[120px] rounded-full mix-blend-screen"></div>
          <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[40%] bg-indigo-650/10 blur-[100px] rounded-full mix-blend-screen"></div>
        </div>

        <div className="max-w-[420px] w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-100 relative z-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">LOKALNIE<span className="text-blue-600">PRO</span></h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Platforma wyszukiwania ofert</p>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {view === 'register' && <RegisterForm onNavigate={setView} />}
              {view === 'forgot-password' && <ForgotPasswordForm onNavigate={setView} />}
              {view === 'create-company-profile' && <CompanyProfileForm onNavigate={setView} />}
              {view !== 'register' && view !== 'forgot-password' && view !== 'create-company-profile' && (
                <LoginForm onNavigate={setView} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      <ToastContainer />
      <Navbar currentView={view} onNavigate={setView} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          
          {/* CLIENT HOME VIEW: SEARCH ENGINE */}
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <HomePage onSearch={handleSearch} onSelectCompany={handleSelectCompany} />
            </motion.div>
          )}

          {/* SEARCH RESULTS VIEW */}
          {view === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
            >
              <div className="mb-8">
                <SearchBar initialQuery={searchQuery} onSearch={handleSearch} />
                <p className="text-slate-500 text-sm font-bold mt-4">
                  Wyniki wyszukiwania dla frazy: <span className="text-slate-900">"{searchQuery || 'Wszystko'}"</span> w lokalizacji <span className="text-slate-900">{searchCity}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column: List results */}
                <div className="lg:col-span-2 space-y-6">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : (
                    <SearchResults 
                      results={searchResults} 
                      onSelectCompany={handleSelectCompany} 
                      onContactCompany={handleContactCompany}
                    />
                  )}
                </div>

                {/* Right column: Interactive map popup */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <SearchMap results={searchResults} onSelectCompany={handleSelectCompany} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* COMPANY PUBLIC PROFILE DETAIL VIEW */}
          {view === 'company-profile' && selectedCompanyId && (
            <motion.div
              key="company-profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CompanyPublicProfile 
                companyId={selectedCompanyId} 
                onBack={() => setView('search')} 
                onContact={handleContactCompany} 
              />
            </motion.div>
          )}

          {/* DASHBOARD CLIENT */}
          {view === 'dashboard-client' && (
            <motion.div key="dashboard-client" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ClientDashboard />
            </motion.div>
          )}

          {/* DASHBOARD COMPANY */}
          {view === 'dashboard-company' && (
            <motion.div key="dashboard-company" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CompanyDashboard />
            </motion.div>
          )}

          {/* DASHBOARD ADMIN */}
          {view === 'dashboard-admin' && (
            <motion.div key="dashboard-admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs font-medium space-y-2">
          <p>&copy; {new Date().getFullYear()} LOKALNIE PRO. Wszystkie prawa zastrzeżone.</p>
          <p className="text-slate-600">Lokalne wyszukiwanie firm, ofert i promocji w Twojej okolicy.</p>
        </div>
      </footer>
    </div>
  );
}

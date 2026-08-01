import React, { useState } from 'react';
import { 
  Users, Building2, FileText, Tag, FolderKanban, MessageSquare, 
  AlertTriangle, BarChart3, Settings, ScrollText, ShieldAlert,
  CheckCircle, XCircle, Trash2, Edit3, Plus, UserX, ShieldCheck, Star, Loader2
} from 'lucide-react';
import { Company, Ad, Promotion, Review } from '../types';
import { useAuth } from '../lib/AuthContext';
import { Sidebar } from './Sidebar';

type AdminTab = 
  | 'users' 
  | 'companies' 
  | 'ads' 
  | 'promos' 
  | 'categories' 
  | 'reviews' 
  | 'reports' 
  | 'stats' 
  | 'settings' 
  | 'logs';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'firma' | 'admin';
  status: 'active' | 'blocked';
}

interface AdminDashboardProps {
  onNavigate?: (view: any) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  // Simulated Admin State
  const [users, setUsers] = useState<UserItem[]>([
    { id: '1', name: 'Andrzej Kowalski', email: 'andrzej@gmail.com', role: 'client', status: 'active' },
    { id: 'comp_1', name: 'Salon Anna (Anna Nowak)', email: 'kontakt@salonanna.pl', role: 'firma', status: 'active' },
    { id: 'comp_2', name: 'Barber Gniezno', email: 'info@barbergnezno.pl', role: 'firma', status: 'active' },
    { id: '4', name: 'Administrator Główny', email: 'admin@lokalnie.pro', role: 'admin', status: 'active' }
  ]);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Backend API Stats
  const [apiStats, setApiStats] = useState<any>(null);
  const [loadingApiStats, setLoadingApiStats] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'stats') {
      setLoadingApiStats(true);
      fetch('http://localhost:5000/api/admin-stats')
        .then(res => res.json())
        .then(data => {
          setApiStats(data);
          setLoadingApiStats(false);
        })
        .catch(err => {
          console.error("Failed to fetch admin stats from backend, falling back:", err);
          setApiStats({
            monthlyRevenue: [
              { month: 'Mar', amount: 1200 },
              { month: 'Apr', amount: 1900 },
              { month: 'May', amount: 2400 },
              { month: 'Jun', amount: 3100 },
              { month: 'Jul', amount: 4800 }
            ],
            registrationTrends: [
              { name: 'Mieszkańcy', count: users.filter(u => u.role === 'client').length },
              { name: 'Firmy', count: companies.length },
              { name: 'Administratorzy', count: users.filter(u => u.role === 'admin').length }
            ],
            popularCategories: [
              { category: 'Uroda', searches: 450 },
              { category: 'Motoryzacja', searches: 320 },
              { category: 'Gastronomia', searches: 290 },
              { category: 'Usługi domowe', searches: 180 }
            ]
          });
          setLoadingApiStats(false);
        });
    }
  }, [activeTab, users, companies]);

  React.useEffect(() => {
    async function loadAdminData() {
      try {
        const { getFirebaseDb } = await import('../lib/firebase');
        const { collection, getDocs } = await import('firebase/firestore');
        const db = await getFirebaseDb();
        const [cSnap, aSnap, pSnap] = await Promise.all([
          getDocs(collection(db, 'companies')),
          getDocs(collection(db, 'ads')),
          getDocs(collection(db, 'promotions'))
        ]);
        setCompanies(cSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Company)));
        setAds(aSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
        setPromotions(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion)));
      } catch (err) {
        console.error("Error loading admin data from Firestore:", err);
      } finally {
        setLoadingDb(false);
      }
    }
    loadAdminData();
  }, []);
  
  const [categories, setCategories] = useState<string[]>([
    'Uroda i Styl', 'Motoryzacja', 'Usługi domowe', 'Gastronomia', 'Medycyna', 'Nieruchomości'
  ]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [reviews, setReviews] = useState<Review[]>([
    { id: '1', companyId: 'comp_1', clientId: '1', clientName: 'Andrzej Kowalski', rating: 5, comment: 'Świetna obsługa, fryzura dokładnie taka jak chciałem!', createdAt: '2026-07-28' },
    { id: '2', companyId: 'comp_2', clientId: '1', clientName: 'Tomasz Nowak', rating: 2, comment: 'Długo czekałem na obsługę pomimo rezerwacji.', createdAt: '2026-07-29' }
  ]);

  const [reports, setReports] = useState([
    { id: 'r1', targetType: 'ogłoszenie', targetTitle: 'Oryginalne felgi aluminiowe', reason: 'Podejrzenie oszustwa / zbyt niska cena', reporter: 'Tomasz Nowak', status: 'pending' }
  ]);

  const [logs, setLogs] = useState([
    { time: '18:15', action: 'Logowanie administratora', user: 'admin@lokalnie.pro' },
    { time: '16:42', action: 'Dodanie nowej firmy do weryfikacji', user: 'info@barbergnezno.pl' },
    { time: '14:20', action: 'Edycja pakietu widoczności na Platinum', user: 'kontakt@salonanna.pl' }
  ]);

  // Operations
  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const toggleCompanyStatus = (uid: string) => {
    setCompanies(companies.map(c => c.uid === uid ? { 
      ...c, 
      visibilityPackage: c.visibilityPackage === 'free' ? 'platinum' : 'free' 
    } : c));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategories([...categories, newCategoryName.trim()]);
    setNewCategoryName('');
  };

  const deleteCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  const handleResolveReport = (id: string, action: 'keep' | 'delete') => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
    if (action === 'delete') {
      alert('Zgłoszona oferta została usunięta.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f7] font-sans">
      <Sidebar
        title="Admin Główny"
        subtitle="Panel Admina"
        tabs={[
          { id: 'users', label: 'Użytkownicy', icon: Users },
          { id: 'companies', label: 'Firmy', icon: Building2 },
          { id: 'ads', label: 'Ogłoszenia', icon: FileText },
          { id: 'promos', label: 'Promocje', icon: Tag },
          { id: 'categories', label: 'Kategorie', icon: FolderKanban },
          { id: 'reviews', label: 'Opinie', icon: MessageSquare },
          { id: 'reports', label: 'Zgłoszenia', icon: AlertTriangle },
          { id: 'stats', label: 'Statystyki', icon: BarChart3 },
          { id: 'settings', label: 'Konfiguracja', icon: Settings },
          { id: 'logs', label: 'Dziennik zdarzeń', icon: ScrollText },
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
        onLogout={async () => {
          await logout();
          onNavigate?.('login');
        }}
        onGoToSearch={() => onNavigate?.('home')}
        badge="ADMIN"
      />

      {/* Main Content Area */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto">
          {/* Page Title & Context */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'users' && 'Zarządzanie Użytkownikami'}
                {activeTab === 'companies' && 'Katalog Firm i Wizytówek'}
                {activeTab === 'ads' && 'Moderacja Ogłoszeń'}
                {activeTab === 'promos' && 'Promocje i Zniżki'}
                {activeTab === 'categories' && 'Kategorie Branżowe'}
                {activeTab === 'reviews' && 'Opinie i Recenzje'}
                {activeTab === 'reports' && 'Zgłoszenia Naruszeń'}
                {activeTab === 'stats' && 'Statystyki Systemowe'}
                {activeTab === 'settings' && 'Ustawienia Portalu'}
                {activeTab === 'logs' && 'Dziennik Zdarzeń'}
              </h1>
              <p className="text-slate-500 text-xs font-semibold mt-1">
                {activeTab === 'users' && 'Modyfikuj role, blokuj i usuwaj konta użytkowników.'}
                {activeTab === 'companies' && 'Weryfikuj zgłoszenia firm, zarządzaj abonamentami i pozycją.'}
                {activeTab === 'ads' && 'Zarządzaj ogłoszeniami lokalnymi dodanymi przez firmy.'}
                {activeTab === 'promos' && 'Przeglądaj aktywne kupony rabatowe w serwisie.'}
                {activeTab === 'categories' && 'Zarządzaj listą kategorii biznesowych i słów kluczowych.'}
                {activeTab === 'reviews' && 'Monitoruj treść opinii i odpowiedzi dodawanych przez firmy.'}
                {activeTab === 'reports' && 'Weryfikuj zgłoszenia nadużyć nadesłane przez użytkowników.'}
                {activeTab === 'stats' && 'Przeglądaj statystyki ruchu, wyszukiwań i konwersji serwisu.'}
                {activeTab === 'settings' && 'Konfiguracja głównych parametrów portalu wyszukiwarki.'}
                {activeTab === 'logs' && 'Sprawdzaj historię logowań i operacji administracyjnych.'}
              </p>
            </div>
          </div>

          {/* Active Tab Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 shadow-sm">
            
            {/* USERS MANAGER */}
            {activeTab === 'users' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-6">Użytkownicy w bazie</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="pb-3">Nazwa / Email</th>
                        <th className="pb-3">Rola</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Akcje</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-xs text-slate-700">
                      {users.map(u => (
                        <tr key={u.id}>
                          <td className="py-4">
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                          </td>
                          <td className="py-4 capitalize">{u.role}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              u.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' 
                                : 'bg-rose-50 text-rose-700 border-rose-100/50'
                            }`}>
                              {u.status === 'active' ? 'Aktywny' : 'Zablokowany'}
                            </span>
                          </td>
                          <td className="py-4 text-right space-x-2">
                            <button 
                              onClick={() => toggleUserStatus(u.id)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
                              title={u.status === 'active' ? 'Zablokuj' : 'Aktywuj'}
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Usuń"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COMPANIES MANAGER */}
            {activeTab === 'companies' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-6">Firmy w bazie</h3>
                <div className="space-y-4">
                  {companies.map(c => (
                    <div key={c.uid} className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center justify-between shadow-3xs">
                      <div>
                        <p className="font-bold text-slate-900">{c.companyName}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          Adres: {c.address}, {c.city} | Pakiet: <span className="text-indigo-600 font-bold">{c.visibilityPackage.toUpperCase()}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleCompanyStatus(c.uid)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            c.visibilityPackage !== 'free' 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200/60'
                          }`}
                        >
                          {c.visibilityPackage !== 'free' ? 'Wyróżniona' : 'Promuj'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADS MANAGER */}
            {activeTab === 'ads' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-6">Moderacja ogłoszeń</h3>
                <div className="space-y-4">
                  {ads.map(ad => (
                    <div key={ad.id} className="p-4 border border-slate-200/60 rounded-xl flex justify-between items-start bg-slate-50/20 shadow-3xs">
                      <div>
                        <span className="text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100/50 leading-none">
                          {ad.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-2">{ad.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ad.description}</p>
                      </div>
                      <button 
                        onClick={() => setAds(ads.filter(a => a.id !== ad.id))}
                        className="p-1.5 text-slate-400 hover:text-rose-650 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROMOTIONS MANAGER */}
            {activeTab === 'promos' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-6">Kupony rabatowe</h3>
                <div className="space-y-4">
                  {promotions.map(p => (
                    <div key={p.id} className="p-4 border border-slate-200/60 rounded-xl flex justify-between items-center bg-slate-50/20 shadow-3xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-rose-650 bg-rose-50 px-2 py-0.5 rounded border border-rose-105 leading-none">
                          {p.discountValue}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{p.title}</span>
                      </div>
                      <button 
                        onClick={() => setPromotions(promotions.filter(pr => pr.id !== p.id))}
                        className="p-1.5 text-slate-400 hover:text-rose-650 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORIES MANAGER */}
            {activeTab === 'categories' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-6">Kategorie</h3>
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-6 max-w-md bg-slate-50 p-1.5 rounded-xl border border-slate-200/65">
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="np. Sport i rekreacja..."
                    className="flex-1 px-3 py-1.5 bg-transparent text-xs font-semibold placeholder-slate-400 focus:outline-none"
                  />
                  <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer transition-colors shadow-sm">
                    Dodaj
                  </button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {categories.map((cat, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/50">
                      <span>{cat}</span>
                      <button 
                        type="button" 
                        onClick={() => deleteCategory(cat)}
                        className="text-slate-400 hover:text-rose-500 focus:outline-none font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS MODERATION */}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-6">Moderacja opinii</h3>
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="p-4 border border-slate-200/60 rounded-xl bg-slate-50/20 shadow-3xs">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-slate-900 text-xs">{r.clientName}</span>
                          <div className="flex items-center text-amber-500 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-500 mr-1" />
                            <span className="text-[10px] font-bold">{r.rating} / 5</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setReviews(reviews.filter(rev => rev.id !== r.id))}
                          className="text-[10px] font-bold text-rose-600 hover:underline"
                        >
                          Usuń opinię
                        </button>
                      </div>
                      <p className="text-slate-600 text-xs font-medium leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REPORTS */}
            {activeTab === 'reports' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-6">Zgłoszenia nadużyć</h3>
                <div className="space-y-4">
                  {reports.filter(r => r.status === 'pending').map(rep => (
                    <div key={rep.id} className="p-4 border border-rose-100 bg-rose-50/10 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          <span className="font-bold text-[9px] text-rose-650 uppercase tracking-wider">{rep.targetType}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 mt-1.5 text-xs">{rep.targetTitle}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Powód: {rep.reason} | Zgłosił: {rep.reporter}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => handleResolveReport(rep.id, 'keep')}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-[10px] cursor-pointer"
                        >
                          Odrzuć
                        </button>
                        <button 
                          onClick={() => handleResolveReport(rep.id, 'delete')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                        >
                          Usuń ofertę
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATISTICS */}
            {activeTab === 'stats' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-6">Pulpit Analityczny Platformy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 bg-slate-50 border border-slate-200/50 rounded-xl shadow-3xs flex flex-col justify-between">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Użytkownicy w bazie</span>
                      <span className="text-2xl font-black text-slate-900 block mt-2">{users.length}</span>
                    </div>
                    <div className="p-5 bg-slate-50 border border-slate-200/50 rounded-xl shadow-3xs flex flex-col justify-between">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Weryfikowane firmy</span>
                      <span className="text-2xl font-black text-slate-900 block mt-2">{companies.length}</span>
                    </div>
                    <div className="p-5 bg-slate-50 border border-slate-200/50 rounded-xl shadow-3xs flex flex-col justify-between">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Aktywne ogłoszenia</span>
                      <span className="text-2xl font-black text-slate-900 block mt-2">{ads.length}</span>
                    </div>
                  </div>
                </div>

                {loadingApiStats || !apiStats ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wczytywanie wykresów...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* SaaS revenue bar chart */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-2xl shadow-3xs">
                      <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-4">
                        Przychody z pakietów (SaaS)
                      </h4>
                      <div className="flex items-center justify-center">
                        <svg width="100%" height="150" viewBox="0 0 400 150" className="max-w-[400px]">
                          <defs>
                            <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4f46e5" />
                              <stop offset="100%" stopColor="#818cf8" />
                            </linearGradient>
                          </defs>
                          
                          {/* Grid horizontal lines */}
                          <line x1="30" y1="30" x2="370" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="30" y1="60" x2="370" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="30" y1="90" x2="370" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="30" y1="120" x2="370" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />
                          
                          {apiStats.monthlyRevenue.map((item: any, idx: number) => {
                            const barWidth = 32;
                            const chartWidth = 340;
                            const chartHeight = 90;
                            const maxRev = Math.max(...apiStats.monthlyRevenue.map((r: any) => r.amount));
                            
                            const x = 30 + idx * (chartWidth / (apiStats.monthlyRevenue.length - 1)) - barWidth / 2;
                            const pct = item.amount / maxRev;
                            const barHeight = chartHeight * pct;
                            const y = 120 - barHeight;
                            
                            return (
                              <g key={idx} className="group cursor-pointer">
                                <rect
                                  x={x}
                                  y={y}
                                  width={barWidth}
                                  height={barHeight}
                                  rx="5"
                                  fill="url(#indigoGrad)"
                                />
                                <text
                                  x={x + barWidth / 2}
                                  y={y - 8}
                                  textAnchor="middle"
                                  className="text-[9px] font-black fill-slate-800"
                                >
                                  {item.amount}zł
                                </text>
                                <text
                                  x={x + barWidth / 2}
                                  y={135}
                                  textAnchor="middle"
                                  className="text-[9px] font-bold fill-slate-400"
                                >
                                  {item.month}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    {/* Users list breakdown */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-2xl shadow-3xs flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-4">
                          Struktura rejestracji
                        </h4>
                        <div className="space-y-4">
                          {apiStats.registrationTrends.map((trend: any, idx: number) => {
                            const total = apiStats.registrationTrends.reduce((sum: number, t: any) => sum + t.count, 0);
                            const percentage = total > 0 ? (trend.count / total) * 100 : 0;
                            return (
                              <div key={idx} className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                  <span className="text-slate-500 uppercase tracking-wider">{trend.name}</span>
                                  <span className="text-slate-900">{trend.count} ({percentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                  <div 
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                        <span>Dane pobrane z Express API</span>
                        <span>100% online</span>
                      </div>
                    </div>

                    {/* Popular search terms rank */}
                    <div className="md:col-span-2 p-6 bg-white border border-slate-200/60 rounded-2xl shadow-3xs">
                      <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-5">
                        Najczęściej wyszukiwane kategorie
                      </h4>
                      <div className="space-y-3.5">
                        {apiStats.popularCategories.map((cat: any, idx: number) => {
                          const maxSearches = Math.max(...apiStats.popularCategories.map((c: any) => c.searches));
                          const pct = maxSearches > 0 ? (cat.searches / maxSearches) * 100 : 0;
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <span className="w-24 truncate text-[10px] font-bold text-slate-550 uppercase tracking-wider text-right">
                                {cat.category}
                              </span>
                              <div className="flex-1 bg-slate-100 rounded-lg h-5.5 relative overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500" 
                                  style={{ width: `${pct}%` }}
                                />
                                <span className="absolute inset-y-0 left-2.5 flex items-center text-[9px] font-black text-slate-900 leading-none">
                                  {cat.searches} wyszukiwań
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* CONFIGURATION */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-slate-900">Ustawienia systemowe</h3>
                <div className="space-y-4 max-w-sm">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nazwa portalu</label>
                    <input type="text" defaultValue="LOKALNIE PRO" className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Domyślna lokalizacja mapy</label>
                    <input type="text" defaultValue="Gniezno" className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white" />
                  </div>
                  <button type="button" onClick={() => alert('Ustawienia zapisane')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer transition-colors shadow-sm mt-2">
                    Zapisz konfigurację
                  </button>
                </div>
              </div>
            )}

            {/* SYSTEM LOGS */}
            {activeTab === 'logs' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-6">Dziennik zdarzeń</h3>
                <div className="space-y-2 border border-slate-200/60 rounded-xl p-3 bg-slate-50/20">
                  {logs.map((log, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b border-slate-100 text-xs font-semibold last:border-0 last:pb-0">
                      <div>
                        <span className="text-slate-400 mr-3">{log.time}</span>
                        <span className="text-slate-800 font-bold">{log.action}</span>
                      </div>
                      <span className="text-slate-400 text-[10px] font-semibold">{log.user}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

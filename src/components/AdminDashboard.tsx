import React, { useState } from 'react';
import { 
  Users, Building2, FileText, Tag, FolderKanban, MessageSquare, 
  AlertTriangle, BarChart3, Settings, ScrollText, ShieldAlert,
  CheckCircle, XCircle, Trash2, Edit3, Plus, UserX, ShieldCheck, Star
} from 'lucide-react';
import { Company, Ad, Promotion, Review } from '../types';

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

export function AdminDashboard() {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel Administracyjny</h1>
          <p className="text-slate-500 text-sm font-medium">Zarządzanie użytkownikami, weryfikacją firm, ofertami oraz parametrami LOKALNIE PRO</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Menu */}
        <div className="space-y-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-3 space-y-1">
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'users' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="w-5 h-5 shrink-0" />
              <span>Użytkownicy</span>
            </button>

            <button 
              onClick={() => setActiveTab('companies')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'companies' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-5 h-5 shrink-0" />
              <span>Firmy</span>
            </button>

            <button 
              onClick={() => setActiveTab('ads')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'ads' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-5 h-5 shrink-0" />
              <span>Ogłoszenia</span>
            </button>

            <button 
              onClick={() => setActiveTab('promos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'promos' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Tag className="w-5 h-5 shrink-0" />
              <span>Promocje</span>
            </button>

            <button 
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'categories' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FolderKanban className="w-5 h-5 shrink-0" />
              <span>Kategorie</span>
            </button>

            <button 
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'reviews' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-5 h-5 shrink-0" />
              <span>Opinie</span>
            </button>

            <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'reports' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Zgłoszenia</span>
              </div>
              <span className="bg-red-650 text-white text-xs font-black px-2 py-0.5 rounded-full">1</span>
            </button>

            <button 
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'stats' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-5 h-5 shrink-0" />
              <span>Statystyki</span>
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span>Konfiguracja</span>
            </button>

            <button 
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'logs' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ScrollText className="w-5 h-5 shrink-0" />
              <span>Dziennik zdarzeń</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          
          {/* USERS MANAGER */}
          {activeTab === 'users' && (
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">Zarządzanie użytkownikami</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-xs font-black uppercase tracking-wider">
                      <th className="pb-3">Nazwa / Email</th>
                      <th className="pb-3">Rola</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="py-4">
                          <p className="font-extrabold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                        </td>
                        <td className="py-4 capitalize">{u.role}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {u.status === 'active' ? 'Aktywny' : 'Zablokowany'}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          <button 
                            onClick={() => toggleUserStatus(u.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                            title={u.status === 'active' ? 'Zablokuj' : 'Aktywuj'}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteUser(u.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
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
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">Weryfikacja i widoczność firm</h3>
              <div className="space-y-4">
                {companies.map(c => (
                  <div key={c.uid} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-900">{c.companyName}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Adres: {c.address}, {c.city} | Pakiet: <span className="text-blue-600">{c.visibilityPackage.toUpperCase()}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleCompanyStatus(c.uid)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          c.visibilityPackage !== 'free' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
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
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">Moderacja ogłoszeń</h3>
              <div className="space-y-4">
                {ads.map(ad => (
                  <div key={ad.id} className="p-4 border border-slate-200 rounded-2xl flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                        {ad.category}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-2">{ad.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ad.description}</p>
                    </div>
                    <button 
                      onClick={() => setAds(ads.filter(a => a.id !== ad.id))}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0"
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
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">Aktywne promocje w bazie</h3>
              <div className="space-y-4">
                {promotions.map(p => (
                  <div key={p.id} className="p-4 border border-slate-200 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 mr-2">
                        {p.discountValue}
                      </span>
                      <span className="font-extrabold text-slate-900">{p.title}</span>
                    </div>
                    <button 
                      onClick={() => setPromotions(promotions.filter(pr => pr.id !== p.id))}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
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
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">Zarządzanie kategoriami</h3>
              <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Dodaj nową kategorię..."
                  className="flex-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
                <button type="submit" className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm cursor-pointer">
                  Dodaj
                </button>
              </form>

              <div className="flex flex-wrap gap-2.5">
                {categories.map((cat, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-200">
                    <span>{cat}</span>
                    <button 
                      type="button" 
                      onClick={() => deleteCategory(cat)}
                      className="text-slate-400 hover:text-red-500 focus:outline-none font-bold"
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
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">Moderacja opinii klientów</h3>
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm">{r.clientName}</span>
                        <div className="flex items-center text-amber-500 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                          <span className="text-xs font-bold">{r.rating} / 5</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setReviews(reviews.filter(rev => rev.id !== r.id))}
                        className="text-xs font-bold text-red-500 hover:underline"
                      >
                        Usuń opinię
                      </button>
                    </div>
                    <p className="text-slate-600 text-sm font-medium">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">Zgłoszenia nadużyć</h3>
              <div className="space-y-4">
                {reports.filter(r => r.status === 'pending').map(rep => (
                  <div key={rep.id} className="p-5 border border-red-100 bg-red-50/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="font-black text-xs text-red-600 uppercase tracking-wider">{rep.targetType}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-950 mt-1.5">{rep.targetTitle}</h4>
                      <p className="text-xs text-slate-500 mt-1">Powód: {rep.reason} | Zgłosił: {rep.reporter}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleResolveReport(rep.id, 'keep')}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Odrzuć
                      </button>
                      <button 
                        onClick={() => handleResolveReport(rep.id, 'delete')}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer"
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
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">Statystyki globalne platformy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 text-xs font-black uppercase tracking-widest block">Użytkownicy</span>
                  <span className="text-3xl font-black text-slate-950 block mt-2">{users.length}</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 text-xs font-black uppercase tracking-widest block">Firmy</span>
                  <span className="text-3xl font-black text-slate-950 block mt-2">{companies.length}</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 text-xs font-black uppercase tracking-widest block">Aktywne ogłoszenia</span>
                  <span className="text-3xl font-black text-slate-950 block mt-2">{ads.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* CONFIGURATION */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-extrabold text-slate-900">Ustawienia systemowe</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Nazwa portalu</label>
                  <input type="text" defaultValue="LOKALNIE PRO" className="w-full p-3 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Domyślna lokalizacja mapy</label>
                  <input type="text" defaultValue="Gniezno" className="w-full p-3 border border-slate-200 rounded-xl" />
                </div>
                <button type="button" onClick={() => alert('Ustawienia zapisane')} className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl text-sm cursor-pointer">
                  Zapisz konfigurację
                </button>
              </div>
            </div>
          )}

          {/* SYSTEM LOGS */}
          {activeTab === 'logs' && (
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">Dziennik zdarzeń systemowych</h3>
              <div className="space-y-3">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex justify-between py-2.5 border-b border-slate-100 text-sm font-medium last:border-0">
                    <div>
                      <span className="text-slate-400 mr-3">{log.time}</span>
                      <span className="text-slate-850 font-bold">{log.action}</span>
                    </div>
                    <span className="text-xs text-slate-400">{log.user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

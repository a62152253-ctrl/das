import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import { doc, getDoc, setDoc, query, collection, where, getDocs, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { Loader2, Award, BarChart3, Building2, ClipboardList, Tag, Image, MessageSquare, Sparkles, Settings, Calendar, Eye } from 'lucide-react';
import { Company, Service, Ad, Promotion, Review, Statistics, Conversation } from '../../types';
import { Sidebar } from '../common/Sidebar';
import { ProfileCompleteness } from './ProfileCompleteness';
import { CompanyBookingsManager } from '../booking/CompanyBookingsManager';
import { CompanyReviews } from '../reviews/CompanyReviews';
import { CompanyProfileForm } from './CompanyProfileForm';
import { ConversationList } from '../chat/ConversationList';
import { ChatWindow } from '../chat/ChatWindow';
import { CompanyServices } from '../CompanyServices';
import { CompanyPromotions } from '../CompanyPromotions';
import { CompanyAds } from '../CompanyAds';
import { CompanyStatistics } from '../CompanyStatistics';
import { CompanySettings } from '../CompanySettings';
import { getCompanyStatistics } from '../../lib/AnalyticsEngine';
import { SkeletonStats, SkeletonList } from '../ui/Skeleton';
import { addToast } from '../ui/Toast';

type CompanyTab = 
  | 'stats' 
  | 'bookings'
  | 'chat'
  | 'profile' 
  | 'services' 
  | 'promos' 
  | 'reviews' 
  | 'settings';

interface CompanyDashboardProps {
  onNavigate?: (view: any, id?: string) => void;
}

export function CompanyDashboard({ onNavigate }: CompanyDashboardProps) {
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<CompanyTab>('stats');
  const [loading, setLoading] = useState(true);

  // Core company data
  const [company, setCompany] = useState<Company | null>(null);

  // Lists management
  const [services, setServices] = useState<Service[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);

  // Selected chat conversation state
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const loadData = async () => {
    if (!user) return;
    
    const defaultComp: Company = {
      uid: user.uid,
      companyName: profile?.name || 'Moja Firma',
      email: user.email || '',
      nip: '',
      description: 'Zarządzaj swoją firmą i usługami.',
      address: 'ul. Przykładowa 1',
      city: 'Poznań',
      postalCode: '60-001',
      phone: '500 000 000',
      services: 'Usługi',
      visibilityPackage: 'free',
      lat: 52.5360,
      lng: 17.5950,
      updatedAt: new Date().toISOString()
    };

    // Load from localStorage cache first for immediate offline support
    try {
      const cached = localStorage.getItem('cached_company_' + user.uid);
      if (cached) {
        setCompany(JSON.parse(cached));
      } else {
        setCompany(defaultComp);
      }
    } catch (e) {
      setCompany(defaultComp);
    }

    try {
      const db = getFirebaseDb();
      const docRef = doc(db, 'companies', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const comp = { uid: docSnap.id, ...docSnap.data() } as Company;
        setCompany(comp);
        localStorage.setItem('cached_company_' + user.uid, JSON.stringify(comp));
      } else {
        setCompany(defaultComp);
      }

      // Load services
      try {
        const qServices = query(collection(db, 'services'), where('companyId', '==', user.uid));
        const snapServices = await getDocs(qServices);
        setServices(snapServices.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
      } catch (e) { console.warn('Services could not be loaded from Firestore'); }

      // Load promotions
      try {
        const qPromos = query(collection(db, 'promotions'), where('companyId', '==', user.uid));
        const snapPromos = await getDocs(qPromos);
        setPromotions(snapPromos.docs.map(d => ({ id: d.id, ...d.data() } as Promotion)));
      } catch (e) { console.warn('Promotions could not be loaded from Firestore'); }

      // Load ads
      try {
        const qAds = query(collection(db, 'ads'), where('companyId', '==', user.uid));
        const snapAds = await getDocs(qAds);
        setAds(snapAds.docs.map(d => ({ id: d.id, ...d.data() } as Ad)));
      } catch (e) { console.warn('Ads could not be loaded from Firestore'); }

      // Load stats
      try {
        const companyStats = await getCompanyStatistics(user.uid);
        setStats(companyStats);
      } catch (e) { console.warn('Stats could not be loaded'); }
    } catch (err: any) {
      console.warn('Network offline notice: Using cached profile state.', err?.message || err);
      setCompany(prev => prev || defaultComp);
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, profile]);

  // Handlers for Services
  const handleAddService = async (name: string, price: number, description: string, category?: string, durationMin?: number) => {
    if (!user || !company) return;
    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, 'services'), {
        companyId: user.uid,
        companyName: company.companyName,
        name,
        price,
        description,
        category: category || 'Usługi',
        durationMin: durationMin || 30,
        isActive: true
      });
      addToast(`Dodano usługę: ${name}`, 'success');
      await loadData();
    } catch (e) {
      addToast('Nie udało się dodać usługi.', 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'services', id));
      addToast('Usunięto usługę z cennika.', 'info');
      await loadData();
    } catch (e) {
      addToast('Błąd podczas usuwania usługi.', 'error');
    }
  };

  const handleUpdateService = async (id: string, updated: Partial<Service>) => {
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, 'services', id), updated);
      addToast('Zaktualizowano dane usługi.', 'success');
      await loadData();
    } catch (e) {
      addToast('Nie udało się zaktualizować usługi.', 'error');
    }
  };

  // Handlers for Promotions
  const handleAddPromotion = async (title: string, discount: string, description: string, promoCode?: string, expiresAt?: string) => {
    if (!user || !company) return;
    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, 'promotions'), {
        companyId: user.uid,
        companyName: company.companyName,
        title,
        discountValue: discount,
        description,
        promoCode: promoCode || '',
        expiresAt: expiresAt || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        isActive: true
      });
      addToast(`Utworzono promocję: ${title}`, 'success');
      await loadData();
    } catch (e) {
      addToast('Błąd podczas tworzenia promocji.', 'error');
    }
  };

  const handleDeletePromotion = async (id: string) => {
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'promotions', id));
      addToast('Usunięto promocję.', 'info');
      await loadData();
    } catch (e) {
      addToast('Błąd podczas usuwania promocji.', 'error');
    }
  };

  // Handlers for Ads
  const handleAddAd = async (title: string, description: string, price?: number) => {
    if (!user || !company) return;
    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, 'ads'), {
        companyId: user.uid,
        companyName: company.companyName,
        title,
        description,
        price: price || 0,
        city: company.city || 'Poznań',
        createdAt: new Date().toISOString(),
        status: 'active',
        views: 0,
        category: 'Usługi'
      });
      addToast('Opublikowano nowe ogłoszenie.', 'success');
      await loadData();
    } catch (e) {
      addToast('Błąd publikacji ogłoszenia.', 'error');
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'ads', id));
      addToast('Usunięto ogłoszenie.', 'info');
      await loadData();
    } catch (e) {
      addToast('Błąd podczas usuwania ogłoszenia.', 'error');
    }
  };

  // Handlers for Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !company) return;
    try {
      const db = getFirebaseDb();
      // Clean undefined fields for Firestore safety
      const cleanCompany = JSON.parse(JSON.stringify(company));
      await setDoc(doc(db, 'companies', user.uid), cleanCompany, { merge: true });
      addToast('Zapisano ustawienia profilu firmy!', 'success');
      await loadData();
    } catch (e: any) {
      console.error('Error saving settings:', e);
      addToast('Błąd zapisu ustawień: ' + (e?.message || ''), 'error');
    }
  };

  const sidebarTabs = [
    { id: 'stats', label: 'Statystyki & Profil', icon: BarChart3 },
    { id: 'bookings', label: 'Rezerwacje Wizyt', icon: Calendar },
    { id: 'chat', label: 'Wiadomości Realtime', icon: MessageSquare },
    { id: 'profile', label: 'Edytuj Profil Firmy', icon: Building2 },
    { id: 'services', label: 'Oferta Usług', icon: ClipboardList },
    { id: 'promos', label: 'Promocje i Kody', icon: Tag },
    { id: 'reviews', label: 'Opinie Klientów', icon: Award },
    { id: 'settings', label: 'Ustawienia Konta', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col lg:flex-row font-sans text-slate-900 dark:text-slate-100">
        <div className="w-60 hidden lg:block bg-[#0f0f10] border-r border-white/5 p-6 space-y-4">
          <div className="h-8 w-32 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-20 w-full bg-slate-800/60 rounded-xl animate-pulse" />
        </div>
        <div className="flex-1 p-6 space-y-6">
          <SkeletonStats />
          <SkeletonList count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col lg:flex-row font-sans text-slate-900 dark:text-slate-100">
      <Sidebar
        title={company?.companyName || 'Moja Firma'}
        subtitle={company?.city || user?.email || ''}
        tabs={sidebarTabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
        onLogout={logout}
        onPreviewProfile={() => onNavigate && onNavigate('company-profile', company?.uid)}
        badge={company?.visibilityPackage?.toUpperCase() || 'FREE'}
      />

      <main className="flex-1 lg:ml-60 p-4 sm:p-8 max-w-7xl space-y-6">
        {/* TAB 1: Stats & Overview */}
        {activeTab === 'stats' && company && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Panel Biznesowy Firmy</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Przegląd kluczowych wskaźników i kompletności wizytówki</p>
              </div>

              <button
                onClick={() => onNavigate && onNavigate('company-profile', company.uid)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
              >
                <Eye className="w-4 h-4" /> Podgląd Wizytówki
              </button>
            </div>

            {/* Completeness indicator */}
            <ProfileCompleteness
              company={company}
              onNavigateToEdit={() => setActiveTab('profile')}
            />

            {/* Statistics chart & metrics */}
            <CompanyStatistics company={company} stats={stats} />
          </div>
        )}

        {/* TAB 2: Bookings Manager */}
        {activeTab === 'bookings' && company && (
          <div className="animate-fade-in">
            <CompanyBookingsManager
              companyId={company.uid}
              companyName={company.companyName}
            />
          </div>
        )}

        {/* TAB 3: Realtime Chat */}
        {activeTab === 'chat' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" /> Rozmowy Realtime z Klientami
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ConversationList
                  onSelectConversation={(conv) => setSelectedConversation(conv)}
                  selectedId={selectedConversation?.id}
                />
              </div>
              <div className="lg:col-span-2">
                {selectedConversation ? (
                  <ChatWindow conversation={selectedConversation} />
                ) : (
                  <div className="h-[550px] bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs text-slate-400 p-6 text-center">
                    Wybierz konwersację z listy klientów po lewej stronie, aby otworzyć bezpieczny czat.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Profile Editor */}
        {activeTab === 'profile' && company && (
          <div className="animate-fade-in">
            <CompanyProfileForm
              onNavigate={() => setActiveTab('stats')}
              existingCompany={company}
            />
          </div>
        )}

        {/* TAB 5: Services */}
        {activeTab === 'services' && company && (
          <div className="animate-fade-in">
            <CompanyServices
              services={services}
              onAdd={handleAddService}
              onDelete={handleDeleteService}
              onUpdate={handleUpdateService}
            />
          </div>
        )}

        {/* TAB 6: Promotions & Ads */}
        {activeTab === 'promos' && company && (
          <div className="space-y-8 animate-fade-in">
            <CompanyPromotions
              promotions={promotions}
              onAdd={handleAddPromotion}
              onDelete={handleDeletePromotion}
            />
            <CompanyAds
              ads={ads}
              onAdd={handleAddAd}
              onDelete={handleDeleteAd}
            />
          </div>
        )}

        {/* TAB 7: Reviews */}
        {activeTab === 'reviews' && company && (
          <div className="animate-fade-in">
            <CompanyReviews
              companyId={company.uid}
              companyName={company.companyName}
              isOwner={true}
            />
          </div>
        )}

        {/* TAB 8: Settings */}
        {activeTab === 'settings' && company && (
          <div className="animate-fade-in">
            <CompanySettings
              company={company}
              onChange={(updated) => setCompany(updated)}
              onSubmit={handleSaveSettings}
            />
          </div>
        )}
      </main>
    </div>
  );
}

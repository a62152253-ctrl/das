import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getFirebaseDb } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2, Award } from 'lucide-react';
import { Company, Service, Ad, Promotion } from '../types';
import { toast } from '../lib/useToast';

// Import modular sub-components
import { CompanyProfile } from './CompanyProfile';
import { CompanyServices } from './CompanyServices';
import { CompanyGallery } from './CompanyGallery';
import { CompanyReviews } from './CompanyReviews';
import { CompanyStatistics } from './CompanyStatistics';
import { CompanyVisibility } from './CompanyVisibility';
import { CompanyAds } from './CompanyAds';
import { CompanyPromotions } from './CompanyPromotions';
import { CompanySettings } from './CompanySettings';

type CompanyTab = 
  | 'stats' 
  | 'profile' 
  | 'services' 
  | 'promos' 
  | 'gallery' 
  | 'reviews' 
  | 'visibility' 
  | 'settings';

export function CompanyDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<CompanyTab>('stats');
  const [loading, setLoading] = useState(true);

  // Core company data
  const [company, setCompany] = useState<Company | null>(null);

  // Lists management
  const [services, setServices] = useState<Service[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    async function loadCompanyData() {
      if (!user) return;
      try {
        const db = await getFirebaseDb();
        const docRef = doc(db, 'companies', user.uid);
        const docSnap = await getDoc(docRef);

        let companyInfo: Company;

        if (docSnap.exists()) {
          const data = docSnap.data();
          companyInfo = {
            ...data,
            visibilityPackage: data.visibilityPackage || 'free',
            lat: data.lat || 52.5360,
            lng: data.lng || 17.5950,
          } as Company;
        } else {
          // Fallback or initialization
          companyInfo = {
            uid: user.uid,
            companyName: profile?.name || 'Nowa Firma',
            email: user.email || '',
            nip: '',
            description: '',
            address: '',
            city: '',
            postalCode: '',
            phone: '',
            services: '',
            visibilityPackage: 'free',
            rating: 0,
            reviewCount: 0,
            lat: 52.5360,
            lng: 17.5950,
            updatedAt: new Date().toISOString()
          };
          await setDoc(docRef, companyInfo);
        }

        setCompany(companyInfo);

        // Fetch services, ads, promotions from Firestore in a real scenario
        // For now, we will leave them empty if not fetched here. 
        // A complete implementation would fetch collections where companyId === user.uid
        setServices([]);
        setAds([]);
        setPromotions([]);

      } catch (err) {
        console.error("Error loading company dashboard data", err);
        if (user) {
          const companyInfo: Company = {
            uid: user.uid,
            companyName: profile?.name || 'Nowa Firma',
            email: user.email || '',
            nip: '',
            description: '',
            address: '',
            city: '',
            postalCode: '',
            phone: '',
            services: '',
            visibilityPackage: 'free',
            rating: 0,
            reviewCount: 0,
            lat: 52.5360,
            lng: 17.5950,
            updatedAt: new Date().toISOString()
          };
          setCompany(companyInfo);
          setServices([]);
          setAds([]);
          setPromotions([]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadCompanyData();
  }, [user, profile]);

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!company || !user) return;
    
    try {
      const db = await getFirebaseDb();
      await setDoc(doc(db, 'companies', user.uid), company);
      toast.success('Dane zapisane', 'Twój profil został pomyślnie zaktualizowany.');
    } catch (err) {
      console.error(err);
      toast.error('Błąd aktualizacji', 'Nie udało się zapisać zmian.');
    }
  };

  const handleUpdateProfileGallery = async (updatedGallery: string[]) => {
    if (!company || !user) return;
    const updated = { ...company, gallery: updatedGallery };
    setCompany(updated);
    try {
      const db = await getFirebaseDb();
      await setDoc(doc(db, 'companies', user.uid), updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleServicesAdd = (name: string, price: number, description: string) => {
    if (!company) return;
    const newServ: Service = {
      id: Math.random().toString(),
      companyId: company.uid,
      companyName: company.companyName,
      name,
      price,
      description,
      category: 'Inne'
    };
    setServices([...services, newServ]);
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handlePromosAdd = (title: string, discount: string, description: string) => {
    if (!company) return;
    const newPromo: Promotion = {
      id: Math.random().toString(),
      companyId: company.uid,
      companyName: company.companyName,
      title,
      description,
      discountValue: discount,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    setPromotions([...promotions, newPromo]);
  };

  const handleDeletePromo = (id: string) => {
    setPromotions(promotions.filter(p => p.id !== id));
  };

  const handleAdsAdd = (title: string, description: string, price?: number) => {
    if (!company) return;
    const newAd: Ad = {
      id: Math.random().toString(),
      companyId: company.uid,
      companyName: company.companyName,
      title,
      description,
      price,
      city: company.city,
      createdAt: new Date().toISOString(),
      status: 'active',
      views: 0,
      category: 'Praca'
    };
    setAds([...ads, newAd]);
  };

  const handleDeleteAd = (id: string) => {
    setAds(ads.filter(a => a.id !== id));
  };

  const handleUpgradeVisibility = async (tier: 'free' | 'silver' | 'gold' | 'platinum') => {
    if (!company || !user) return;
    const updated = { ...company, visibilityPackage: tier };
    setCompany(updated);
    
    try {
      const db = await getFirebaseDb();
      await setDoc(doc(db, 'companies', user.uid), updated);
      toast.success('Zmieniono pakiet widoczności', `Twój nowy pakiet to: ${tier.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      toast.error('Błąd zmiany pakietu', 'Nie udało się zaktualizować pakietu widoczności.');
    }
  };

  if (loading || !company) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Title section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{company.companyName}</h1>
          <p className="text-slate-500 font-medium mt-1">Panel administracyjny wizytówki, usług i widoczności</p>
        </div>
        <div className="flex gap-2">
          {company.visibilityPackage && company.visibilityPackage !== 'free' && (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-200">
              <Award className="w-4 h-4" />
              Pakiet {company.visibilityPackage.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-px mb-8 scrollbar-none">
        {[
          { id: 'stats', label: 'Statystyki' },
          { id: 'profile', label: 'Profil firmy' },
          { id: 'services', label: 'Usługi i Cennik' },
          { id: 'promos', label: 'Promocje i Ogłoszenia' },
          { id: 'gallery', label: 'Galeria' },
          { id: 'reviews', label: 'Opinie' },
          { id: 'visibility', label: 'Widoczność' },
          { id: 'settings', label: 'Ustawienia' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as CompanyTab)}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        {activeTab === 'stats' && <CompanyStatistics company={company} />}
        
        {activeTab === 'profile' && (
          <CompanyProfile company={company} onChange={setCompany} onSubmit={handleUpdateProfile} />
        )}
        
        {activeTab === 'services' && (
          <CompanyServices services={services} onAdd={handleServicesAdd} onDelete={handleDeleteService} />
        )}
        
        {activeTab === 'promos' && (
          <div className="space-y-12">
            <CompanyPromotions promotions={promotions} onAdd={handlePromosAdd} onDelete={handleDeletePromo} />
            <div className="h-px bg-slate-200 w-full" />
            <CompanyAds ads={ads} onAdd={handleAdsAdd} onDelete={handleDeleteAd} />
          </div>
        )}

        {activeTab === 'gallery' && (
          <CompanyGallery gallery={company.gallery || []} onUpdateGallery={handleUpdateProfileGallery} />
        )}

        {activeTab === 'reviews' && <CompanyReviews reviews={[]} />}

        {activeTab === 'visibility' && (
          <CompanyVisibility company={company} onUpgrade={handleUpgradeVisibility} />
        )}

        {activeTab === 'settings' && (
          <CompanySettings company={company} onChange={setCompany} onSubmit={handleUpdateProfile} />
        )}
      </div>
    </div>
  );
}

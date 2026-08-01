import React, { useState, useEffect } from 'react';
import { 
  MapPin, Star, Building2, Phone, Mail, Globe, 
  ExternalLink, Calendar, Facebook, Instagram, Video, Award, 
  ShieldCheck, Check, Copy, ChevronDown, ChevronUp, Clock, 
  CreditCard, Sparkles, MessageSquare, Info, Heart, ArrowLeft, Share2, ArrowUpRight
} from 'lucide-react';
import { Company, Service, Promotion, Review, FavoriteCompany } from '../../types';
import { fetchSearchData } from '../../lib/SearchEngine';
import { useAuth } from '../../lib/AuthContext';
import { recordCompanyView, recordCompanyClick } from '../../lib/AnalyticsEngine';
import { recordHistoryItem } from '../../lib/HistoryEngine';
import { toggleFavoriteCompany, subscribeUserFavorites } from '../../lib/FavoritesEngine';
import { getOrCreateConversation } from '../../lib/ChatEngine';
import { BookingModal } from '../booking/BookingModal';
import { CompanyReviews } from '../reviews/CompanyReviews';
import { SkeletonProfile } from '../ui/Skeleton';
import { addToast } from '../ui/Toast';

interface Props {
  companyId: string;
  onBack: () => void;
  onOpenChat?: (conversationId: string) => void;
}

export function CompanyPublicProfile({ companyId, onBack, onOpenChat }: Props) {
  const { user, profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  
  // Favorites State
  const [userFavorites, setUserFavorites] = useState<FavoriteCompany[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedServiceIdForBooking, setSelectedServiceIdForBooking] = useState<string | undefined>();

  const isOwner = user?.uid === companyId || profile?.role === 'firma' && user?.uid === companyId;

  useEffect(() => {
    async function loadCompanyData() {
      try {
        const { companies, services: allServices, promotions: allPromos } = await fetchSearchData();
        const found = companies.find(c => c.uid === companyId);
        if (found) {
          setCompany(found);
          setServices(allServices.filter(s => s.companyId === companyId && s.isActive !== false));
          setPromotions(allPromos.filter(p => p.companyId === companyId && p.isActive !== false));

          // Record analytics & history
          recordCompanyView(companyId);
          if (user) {
            recordHistoryItem(user.uid, 'company_view', found.companyName, found.city, found.uid);
          }
        }
      } catch (err) {
        console.error("Error loading company profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanyData();
  }, [companyId, user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserFavorites(user.uid, (favs) => {
      setUserFavorites(favs);
      setIsFavorited(favs.some(f => f.companyId === companyId));
    });
    return () => unsub();
  }, [user, companyId]);

  const handleToggleFav = async () => {
    if (!user || !company) return;
    const newFavStatus = await toggleFavoriteCompany(user.uid, company, userFavorites);
    setIsFavorited(newFavStatus);
    addToast(newFavStatus ? 'Dodano firmę do ulubionych!' : 'Usunięto z ulubionych.', newFavStatus ? 'success' : 'info');
  };

  const handleStartChat = async () => {
    if (!user || !company) return;
    recordCompanyClick(companyId, 'message');
    try {
      const convId = await getOrCreateConversation(
        user.uid,
        company.uid,
        profile?.name || user.displayName || 'Klient',
        company.companyName
      );
      if (onOpenChat) onOpenChat(convId);
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Skopiowano kod promocyjny: ${code}`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: company?.companyName || 'LokalniePRO',
        text: `Zobacz profil firmy ${company?.companyName} w LokalniePRO!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Skopiowano link do profilu firmy do schowka!', 'success');
    }
  };

  if (loading) {
    return <SkeletonProfile />;
  }

  if (!company) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-4">
        <p className="text-sm font-semibold">Nie znaleziono profilu wybranej firmy.</p>
        <button 
          onClick={onBack} 
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          Powrót
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
      
      {/* Special Banner for Company Preview Mode */}
      {isOwner && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 border border-indigo-500/40 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Tryb Podglądu Wizytówki</h3>
              <p className="text-xs text-indigo-200">Tak Twój profil firmy jest widoczny dla poszukujących klientów.</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white text-indigo-900 hover:bg-slate-100 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
          >
            Wróć do Panelu Zarządzania
          </button>
        </div>
      )}

      {/* Back & Actions header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {isOwner ? 'Powrót do panelu' : 'Powrót do listy'}
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Udostępnij profil"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Udostępnij</span>
          </button>

          {!isOwner && user && (
            <button
              onClick={handleToggleFav}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                isFavorited
                  ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="hidden sm:inline">{isFavorited ? 'Zapisano' : 'Zapisz'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="relative h-48 sm:h-64 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800">
          {company.mainPhoto && (
            <img src={company.mainPhoto} alt={company.companyName} className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 sm:left-8 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden shrink-0 flex items-center justify-center">
                {company.logo ? (
                  <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-indigo-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{company.companyName}</h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-300" /> {company.city}, {company.address}</span>
                  {company.foundedYear && <span>• Rok zał. {company.foundedYear}</span>}
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {company.rating || 5.0} ({company.reviewCount || 0} opinii)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user && !isOwner && (
                <button
                  onClick={handleStartChat}
                  className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl font-semibold text-xs transition-all flex items-center gap-2 border border-white/30 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> Chat Realtime
                </button>
              )}

              <button
                onClick={() => {
                  recordCompanyClick(companyId, 'booking');
                  setShowBookingModal(true);
                }}
                className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Calendar className="w-4 h-4" /> Rezerwuj Wizytę
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid Bar */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Telefon kontaktowy</p>
              <a 
                href={`tel:${company.phone}`} 
                onClick={() => recordCompanyClick(companyId, 'phone')}
                className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600"
              >
                {company.phone || 'Brak numeru'}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Adres E-mail</p>
              <a href={`mailto:${company.email}`} className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600">
                {company.email || 'Brak e-maila'}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Social Media / WWW</p>
              <div className="flex items-center gap-2.5 mt-0.5">
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" onClick={() => recordCompanyClick(companyId, 'web')} title="Strona WWW">
                    <Globe className="w-4 h-4 text-slate-600 hover:text-indigo-600 dark:text-slate-300 transition-colors" />
                  </a>
                )}
                {company.instagram && (
                  <a href={company.instagram} target="_blank" rel="noreferrer" title="Instagram">
                    <Instagram className="w-4 h-4 text-pink-600 hover:opacity-80 transition-opacity" />
                  </a>
                )}
                {company.facebook && (
                  <a href={company.facebook} target="_blank" rel="noreferrer" title="Facebook">
                    <Facebook className="w-4 h-4 text-blue-600 hover:opacity-80 transition-opacity" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Services, Description, FAQ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">O firmie</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {company.description || 'Brak rozbudowanego opisu firmy.'}
            </p>

            {company.workingArea && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Obszar świadczenia usług:</span> {company.workingArea}
              </div>
            )}
          </div>

          {/* Services List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Oferowane Usługi i Cennik</h3>
            {services.length === 0 ? (
              <p className="text-xs text-slate-400">Brak zdefiniowanych szczegółowych usług.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {services.map(svc => (
                  <div key={svc.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{svc.name}</h4>
                      {svc.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{svc.description}</p>}
                      <span className="inline-block mt-1 text-[10px] text-slate-400">Czas: {svc.durationMin || 45} minut</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{svc.price} zł</span>
                      <button
                        onClick={() => {
                          setSelectedServiceIdForBooking(svc.id);
                          setShowBookingModal(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        Rezerwuj
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQ Section */}
          {company.faqs && company.faqs.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Najczęściej Zadawane Pytania (FAQ)</h3>
              <div className="space-y-3">
                {company.faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                      className="w-full p-3.5 text-left font-semibold text-xs text-slate-900 dark:text-white flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      {openFaqIdx === idx ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {openFaqIdx === idx && (
                      <div className="p-3.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <CompanyReviews companyId={companyId} companyName={company.companyName} />
        </div>

        {/* Right Column: Working Hours, Promotions & Details */}
        <div className="space-y-6">
          {/* Active Promotions */}
          {promotions.length > 0 && (
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-lg">
              <h4 className="font-bold text-sm uppercase tracking-wider mb-3">Aktualne Promocje</h4>
              {promotions.map(promo => (
                <div key={promo.id} className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 mb-2 border border-white/20">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs">{promo.title}</h5>
                    <span className="px-2 py-0.5 bg-white text-orange-600 rounded-md font-extrabold text-xs">
                      {promo.discountValue}
                    </span>
                  </div>
                  {promo.promoCode && (
                    <div className="mt-2 flex items-center justify-between bg-black/20 px-3 py-1.5 rounded-lg text-xs">
                      <span className="font-mono">{promo.promoCode}</span>
                      <button onClick={() => handleCopyCode(promo.promoCode!)} className="text-white hover:underline text-[10px] cursor-pointer">
                        {copiedCode === promo.promoCode ? 'Skopiowano!' : 'Kopiuj kod'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Opening Hours */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" /> Godziny Otwarcia
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              {company.openingHours ? (
                Object.entries(company.openingHours).map(([day, hrs]) => (
                  <div key={day} className="py-2 flex items-center justify-between">
                    <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{day}:</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {typeof hrs === 'string' ? hrs : (hrs as any)?.isOpen ? `${(hrs as any).open} - ${(hrs as any).close}` : 'Zamknięte'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-2">Poniedziałek - Piątek: 08:00 - 16:00</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          company={company}
          services={services}
          initialServiceId={selectedServiceIdForBooking}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
}

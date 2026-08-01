import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { 
  Heart, History, MessageSquare, Bell, Calendar, Star, 
  Sparkles, Trash2, ArrowRight, Clock, MapPin, CheckCircle, XCircle 
} from 'lucide-react';
import { Company, Booking, FavoriteCompany, UserHistoryItem, Conversation } from '../../types';
import { Sidebar } from '../common/Sidebar';
import { fetchSearchData } from '../../lib/SearchEngine';
import { subscribeUserFavorites, toggleFavoriteCompany } from '../../lib/FavoritesEngine';
import { subscribeUserHistory } from '../../lib/HistoryEngine';
import { subscribeUserBookings, updateBookingStatus } from '../../lib/BookingEngine';
import { generateSmartRecommendations, RecommendationResult } from '../../lib/RecommendationEngine';
import { ConversationList } from '../chat/ConversationList';
import { ChatWindow } from '../chat/ChatWindow';
import { SkeletonCard, SkeletonList } from '../ui/Skeleton';
import { addToast } from '../ui/Toast';

interface ClientDashboardProps {
  onNavigate?: (view: any, companyId?: string) => void;
}

export function ClientDashboard({ onNavigate }: ClientDashboardProps) {
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'favorites' | 'bookings' | 'history' | 'messages'>('recommendations');
  const [loading, setLoading] = useState(true);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all');

  // Real-time states
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [favorites, setFavorites] = useState<FavoriteCompany[]>([]);
  const [historyItems, setHistoryItems] = useState<UserHistoryItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { companies } = await fetchSearchData();
        setAllCompanies(companies);
      } catch (err) {
        console.error('Failed loading companies data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubFav = subscribeUserFavorites(user.uid, setFavorites);
    const unsubHist = subscribeUserHistory(user.uid, setHistoryItems);
    const unsubBook = subscribeUserBookings(user.uid, false, setBookings);

    return () => {
      unsubFav();
      unsubHist();
      unsubBook();
    };
  }, [user]);

  // Compute recommendations
  const recommendations: RecommendationResult[] = generateSmartRecommendations(
    allCompanies,
    favorites,
    historyItems,
    user?.location
  );

  const sidebarTabs = [
    { id: 'recommendations', label: 'Polecane dla Ciebie', icon: Sparkles },
    { id: 'favorites', label: 'Ulubione Wykonawcy', icon: Heart, badge: favorites.length },
    { id: 'bookings', label: 'Moje Rezerwacje', icon: Calendar, badge: bookings.filter(b => b.status === 'accepted' || b.status === 'pending').length },
    { id: 'messages', label: 'Wiadomości Chat', icon: MessageSquare },
    { id: 'history', label: 'Historia Przeglądania', icon: History }
  ];

  const handleCancelBooking = async (b: Booking) => {
    if (confirm('Czy na pewno chcesz anulować tę rezerwację?')) {
      await updateBookingStatus(b.id, 'cancelled', b.clientId, b.serviceName, b.date, b.startTime);
      addToast('Anulowano rezerwację wizyty.', 'info');
    }
  };

  const handleRemoveFavorite = async (fav: FavoriteCompany) => {
    if (!user) return;
    await toggleFavoriteCompany(user.uid, { uid: fav.companyId, companyName: fav.companyName } as any, favorites);
    addToast(`Usunięto ${fav.companyName} z ulubionych.`, 'info');
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg text-xs flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"><CheckCircle className="w-3.5 h-3.5" /> Zaakceptowano</span>;
      case 'pending':
        return <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold rounded-lg text-xs flex items-center gap-1 border border-amber-200 dark:border-amber-800"><Clock className="w-3.5 h-3.5" /> Oczekuje</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold rounded-lg text-xs border border-blue-200 dark:border-blue-800">Zakończona</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold rounded-lg text-xs flex items-center gap-1 border border-rose-200 dark:border-rose-800"><XCircle className="w-3.5 h-3.5" /> Anulowano</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col lg:flex-row font-sans text-slate-900 dark:text-slate-100">
      <Sidebar
        title={profile?.name || 'Klient'}
        subtitle={user?.email || ''}
        tabs={sidebarTabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
        onLogout={logout}
        onGoToSearch={() => onNavigate && onNavigate('home')}
        badge="KONTO KLIENTA"
      />

      <main className="flex-1 lg:ml-60 p-4 sm:p-8 max-w-7xl space-y-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Witaj, {profile?.name || 'Kliencie'}!</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Zarządzaj swoimi wizytami, zapisanymi wykonawcami i konwersacjami w jednym miejscu.
          </p>
        </div>

        {/* TAB 1: Smart Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" /> Polecane dla Ciebie
                </h2>
                <p className="text-xs text-slate-500">
                  Inteligentnie dopasowane firmy na podstawie Twoich zainteresowań i lokalizacji
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : recommendations.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                Brak bieżących rekomendacji. Przeglądaj firmy w wyszukiwarce, aby poznać najlepszych wykonawców!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.slice(0, 6).map((rec, idx) => (
                  <div 
                    key={rec.company.uid || idx}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold rounded-lg border border-indigo-200 dark:border-indigo-800">
                          {rec.reason}
                        </span>
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {rec.company.rating || 5.0}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{rec.company.companyName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {rec.company.city}, {rec.company.address}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                        {rec.company.description || rec.company.services}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">Dopasowanie: {rec.matchScore} pkt</span>
                      <button
                        onClick={() => onNavigate && onNavigate('company-profile', rec.company.uid)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Zobacz profil &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Favorites */}
        {activeTab === 'favorites' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Ulubione Wykonawcy ({favorites.length})
            </h2>

            {favorites.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                Nie masz jeszcze zapisanych ulubionych wykonawców.<br />
                Kliknij ikonę serduszka na profilu firmy, aby dodać ją do tej listy.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map(fav => (
                  <div key={fav.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{fav.category || 'Usługi'}</span>
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {fav.rating || 5.0}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{fav.companyName}</h3>
                      <p className="text-xs text-slate-500 mt-1">{fav.city}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <button
                        onClick={() => onNavigate && onNavigate('company-profile', fav.companyId)}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 cursor-pointer"
                      >
                        Przejdź do profilu
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(fav)}
                        className="text-xs text-rose-500 hover:underline cursor-pointer"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: User Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" /> Moje Rezerwacje Wizyt ({bookings.length})
              </h2>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'Wszystkie' },
                  { id: 'pending', label: 'Oczekujące' },
                  { id: 'accepted', label: 'Zaakceptowane' },
                  { id: 'completed', label: 'Zakończone' },
                  { id: 'cancelled', label: 'Anulowane' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setBookingStatusFilter(st.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      bookingStatusFilter === st.id
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {bookings.filter(b => bookingStatusFilter === 'all' || b.status === bookingStatusFilter).length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                {bookings.length === 0 
                  ? 'Nie złożyłeś jeszcze żadnej rezerwacji wizyty. Przejdź do profilu wykonawcy, aby zarezerwować termin.'
                  : 'Brak rezerwacji o wybranym statusie.'}
              </div>
            ) : (
              <div className="space-y-4">
                {bookings
                  .filter(b => bookingStatusFilter === 'all' || b.status === bookingStatusFilter)
                  .map(b => (
                  <div key={b.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-indigo-500/40">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{b.companyName}</h3>
                        {getStatusBadge(b.status)}
                      </div>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {b.serviceName} - {b.servicePrice} zł ({b.serviceDurationMin || 45} min)
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> {b.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" /> {b.startTime} - {b.endTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {b.status === 'pending' || b.status === 'accepted' ? (
                        <button
                          onClick={() => handleCancelBooking(b)}
                          className="px-3.5 py-2 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold hover:bg-rose-100 cursor-pointer transition-colors"
                        >
                          Anuluj wizytę
                        </button>
                      ) : null}
                      <button
                        onClick={() => onNavigate && onNavigate('company-profile', b.companyId)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                      >
                        Profil firmy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Messages Realtime */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" /> Rozmowy Chat Realtime
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
                    Wybierz konwersację z listy po lewej stronie, aby otworzyć bezpieczną konwersację z wykonawcą.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: History */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" /> Ostatnia Aktywność i Historia
            </h2>

            {historyItems.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                Brak zapisanej historii aktywności.
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/60">
                {historyItems.map(item => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      {item.subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

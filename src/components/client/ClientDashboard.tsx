import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { 
  Heart, History, MessageSquare, Bell, Calendar, Star, 
  Sparkles, Trash2, ArrowRight, Clock, MapPin, CheckCircle, XCircle,
  TrendingUp, Users, CalendarDays, Activity, Filter, Building2, LogOut,
  Settings, ChevronDown, Flame, BarChart3, AlertCircle, Eye
} from 'lucide-react';
import { Company, Booking, FavoriteCompany, UserHistoryItem, Conversation } from '@/types';
import { Sidebar } from '@/components/common/layout/Sidebar';
import { Card, CardHeader, CardBody, CardFooter, StatCard, Button, Badge, Tabs, SkeletonCard, SkeletonList, addToast } from '@/components/ui';
import { fetchSearchData } from '@/lib/SearchEngine';
import { subscribeUserFavorites, toggleFavoriteCompany } from '@/lib/FavoritesEngine';
import { subscribeUserHistory } from '@/lib/HistoryEngine';
import { subscribeUserBookings, updateBookingStatus } from '@/lib/BookingEngine';
import { generateSmartRecommendations, RecommendationResult } from '@/lib/RecommendationEngine';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { cn } from '@/lib/utils';

interface ClientDashboardProps {
  onNavigate?: (view: any, companyId?: string) => void;
}

export function ClientDashboard({ onNavigate }: ClientDashboardProps) {
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'favorites' | 'bookings' | 'messages' | 'history'>('recommendations');
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
  const recommendations: RecommendationResult[] = useMemo(() => generateSmartRecommendations(
    allCompanies,
    favorites,
    historyItems,
    user?.location
  ), [allCompanies, favorites, historyItems, user?.location]);

  const activeBookingsCount = useMemo(
    () => bookings.filter(b => b.status === 'accepted' || b.status === 'completed').length,
    [bookings]
  );

  const filteredBookings = useMemo(
    () => bookings.filter(b => bookingStatusFilter === 'all' || b.status === bookingStatusFilter),
    [bookings, bookingStatusFilter]
  );

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
    const statusConfig = {
      accepted: { variant: 'success' as const, text: 'Zaakceptowano' },
      pending: { variant: 'warning' as const, text: 'Oczekuje' },
      completed: { variant: 'info' as const, text: 'Zakończona' },
      cancelled: { variant: 'danger' as const, text: 'Anulowano' }
    };
    const config = statusConfig[status];
    return <Badge variant={config.variant} size="sm">{config.text}</Badge>;
  };

  const sidebarTabs = [
    { id: 'recommendations', label: '✨ Polecane', icon: Sparkles },
    { id: 'favorites', label: '❤️ Ulubione', icon: Heart },
    { id: 'bookings', label: '📅 Rezerwacje', icon: Calendar },
    { id: 'messages', label: '💬 Wiadomości', icon: MessageSquare },
    { id: 'history', label: '⏱️ Historia', icon: History }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col lg:flex-row font-sans transition-all duration-300">
      <Sidebar
        title={profile?.name || 'Klient'}
        subtitle={user?.email || 'Email'}
        tabs={sidebarTabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as any)}
        onLogout={logout}
        badge={`${favorites.length} ulubionych`}
      />

      <main className="flex-1 lg:ml-60 p-4 sm:p-8 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] font-black text-indigo-600 dark:text-indigo-400 mb-2">
                Mój Panel
              </p>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Witaj, {profile?.name || 'Kliencie'}!
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Zarządzaj rezerwacjami, ulubionymi i wiadomościami
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { icon: Heart, label: 'Ulubione', value: favorites.length },
              { icon: Calendar, label: 'Nadchodzące', value: bookings.filter(b => b.status === 'accepted').length },
              { icon: Star, label: 'Średnia ocena', value: `${(allCompanies.reduce((s, c) => s + (c.rating || 5), 0) / Math.max(allCompanies.length, 1)).toFixed(1)}★` },
              { icon: MessageSquare, label: 'Wiadomości', value: bookings.length }
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-4 bg-slate-50 dark:bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <stat.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{stat.label}</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-3">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          
          {/* RECOMMENDATIONS TAB */}
          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {recommendations.length === 0 ? (
                <div className="rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-12 text-center">
                  <Sparkles className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Brak rekomendacji</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                    Zacznij przeglądać firmy, aby otrzymać personalizowane rekomendacje
                  </p>
                  <Button variant="gradient" onClick={() => onNavigate?.('home')}>
                    <Eye className="w-4 h-4 mr-2" />
                    Odkryj firmy
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.slice(0, 6).map((rec, idx) => (
                    <motion.div
                      key={rec.company.uid || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card variant="elevated" interactive onClick={() => onNavigate?.('company-profile', rec.company.uid)} className="h-full">
                        <CardBody>
                          <div className="flex items-start justify-between mb-4">
                            <Badge variant="primary" size="sm">{rec.reason}</Badge>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                {rec.company.rating || 5.0}
                              </span>
                            </div>
                          </div>

                          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">
                            {rec.company.companyName}
                          </h3>

                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-3">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            {rec.company.city}
                          </p>

                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                            {rec.company.description || rec.company.services}
                          </p>
                        </CardBody>

                        <CardFooter className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Dopasowanie: {rec.matchScore} pkt
                          </span>
                          <Button size="sm" variant="ghost" rightIcon={ArrowRight}>
                            Profil
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* FAVORITES TAB */}
          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {favorites.length === 0 ? (
                <div className="rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-12 text-center">
                  <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Brak ulubionych</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                    Dodaj firmy do ulubionych, aby mieć szybki dostęp
                  </p>
                  <Button variant="gradient" onClick={() => onNavigate?.('home')}>
                    Przeglądaj firmy
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((fav, idx) => (
                    <motion.div
                      key={fav.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card variant="elevated" className="h-full flex flex-col">
                        <CardBody className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="primary" size="sm">{fav.category || 'Usługi'}</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold">{fav.rating || 5.0}</span>
                            </div>
                          </div>

                          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">
                            {fav.companyName}
                          </h3>

                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            {fav.city}
                          </p>
                        </CardBody>

                        <CardFooter className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => onNavigate?.('company-profile', fav.companyId)}
                            className="flex-1"
                          >
                            Profil
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveFavorite(fav)}
                            className="text-rose-600 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: '📋 Wszystkie', count: bookings.length },
                  { id: 'pending', label: '⏳ Oczekujące', count: bookings.filter(b => b.status === 'pending').length },
                  { id: 'accepted', label: '✅ Zaakceptowane', count: bookings.filter(b => b.status === 'accepted').length },
                  { id: 'completed', label: '🏁 Zakończone', count: bookings.filter(b => b.status === 'completed').length },
                  { id: 'cancelled', label: '❌ Anulowane', count: bookings.filter(b => b.status === 'cancelled').length }
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setBookingStatusFilter(st.id as any)}
                    className={cn(
                      'px-4 py-2 rounded-xl font-semibold text-sm transition-all',
                      bookingStatusFilter === st.id
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    )}
                  >
                    {st.label} {st.count > 0 && <span className="ml-1 text-xs">({st.count})</span>}
                  </button>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-12 text-center">
                  <Calendar className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {bookings.length === 0 ? 'Brak rezerwacji' : 'Brak rezerwacji o wybranym statusie'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                    {bookings.length === 0 
                      ? 'Zarezerwuj wizytę u wykonawcy'
                      : 'Zmień filter, aby zobaczyć inne rezerwacje'}
                  </p>
                  {bookings.length === 0 && (
                    <Button variant="gradient" onClick={() => onNavigate?.('home')}>
                      Zarezerwuj wizytę
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((b, idx) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card variant="elevated">
                        <CardBody>
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                  {b.companyName}
                                </h3>
                                {getStatusBadge(b.status)}
                              </div>

                              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 mb-3">
                                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                                  {b.serviceName} - {b.servicePrice} zł
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="w-4 h-4" />
                                  <span>{b.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{b.startTime} - {b.endTime}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {(b.status === 'pending' || b.status === 'accepted') && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleCancelBooking(b)}
                                >
                                  Anuluj
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => onNavigate?.('company-profile', b.companyId)}
                              >
                                Profil
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
                  <ConversationList
                    onSelectConversation={setSelectedConversation}
                    selectedId={selectedConversation?.id}
                  />
                </div>
                <div className="lg:col-span-2">
                  {selectedConversation ? (
                    <ChatWindow conversation={selectedConversation} />
                  ) : (
                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-12 text-center border border-slate-200 dark:border-slate-700">
                      <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        Wybierz konwersację
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Kliknij rozmowę po lewej stronie
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {historyItems.length === 0 ? (
                <div className="rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-12 text-center">
                  <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Brak historii</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Gdy zaczniesz przeglądać firmy, pojawi się tutaj historia
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card variant="outlined" className="hover:shadow-md transition-all">
                        <CardBody>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                              <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  {item.title}
                                </h4>
                                {item.subtitle && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(item.timestamp).toLocaleString('pl-PL')}
                            </span>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

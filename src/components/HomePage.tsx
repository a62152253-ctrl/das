import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Star,
  ChevronRight,
  Building2,
  Tag,
  FileText,
  ShieldCheck,
  Zap,
  HeartHandshake,
  Clock,
  TrendingUp,
  Search,
  BadgeCheck,
  ArrowUpRight,
  History,
  Heart,
  Flame,
  Loader2
} from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { ViewMore } from '@/components/common/modals/ViewMore';
import { UserSearchHistory } from '@/components/common/modals/UserSearchHistory';
import { fetchSearchData, getCategoriesWithCounts } from '@/lib/SearchEngine';
import { Company, Promotion, Ad } from '@/types';
import { SearchBot } from '@/components/search/bot/SearchBot';
import { Skeleton, Button } from '@/components/ui';
import { motion } from 'framer-motion';

interface Props {
  onSearch: (query: string, city: string) => void;
  onSelectCompany: (companyId: string) => void;
}

interface RecentSearch {
  id: string;
  query: string;
  city: string;
}

const CompanyCardSmall: React.FC<{
  company: Company;
  onSelect: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}> = ({ company, onSelect, isFavorite, onToggleFavorite }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -4 }}
    onClick={onSelect}
    className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
  >
    {/* Image */}
    <div className="relative h-28 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 flex items-center justify-center group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors overflow-hidden">
      {company.mainPhoto ? (
        <img
          src={company.mainPhoto}
          alt={company.companyName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <Building2 className="w-6 h-6 text-indigo-400/60" />
      )}
      {onToggleFavorite && (
        <button
          onClick={onToggleFavorite}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all shadow-sm ${
            isFavorite
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-3 h-3 ${isFavorite ? 'fill-white' : ''}`} />
        </button>
      )}
    </div>

    {/* Content */}
    <div className="p-3 flex-1 flex flex-col">
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-md truncate">
          {company.category || 'Usługi'}
        </span>
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/20">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{company.rating || 5.0}</span>
        </div>
      </div>

      <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {company.companyName}
      </h3>

      <p className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-0.5 mb-2">
        <MapPin className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
        <span className="line-clamp-1">{company.city}</span>
      </p>

      <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 flex-1">
        {company.description || company.services}
      </p>
    </div>
  </motion.div>
);

export function HomePage({ onSearch, onSelectCompany }: Props) {
  const [popularCompanies, setPopularCompanies] = useState<Company[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [avgRating, setAvgRating] = useState(4.9);
  
  // ViewMore states
  const [viewMoreOpen, setViewMoreOpen] = useState(false);
  const [viewMoreTitle, setViewMoreTitle] = useState('');
  const [viewMoreItems, setViewMoreItems] = useState<Company[]>([]);
  
  // Search History Modal
  const [searchHistoryOpen, setSearchHistoryOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { companies, promotions } = await fetchSearchData();
        const cats = await getCategoriesWithCounts();
        
        setAllCompanies(companies);
        setPopularCompanies(companies.slice(0, 6));
        setActivePromotions(promotions.slice(0, 4));
        setCategories(cats);

        // Calculate average rating
        if (companies.length > 0) {
          const avg = companies.reduce((sum, c) => sum + (c.rating || 5), 0) / companies.length;
          setAvgRating(parseFloat(avg.toFixed(1)));
        }
      } catch (err) {
        console.error('Error loading home page data', err);
      } finally {
        setLoading(false);
      }
    }

    try {
      const saved = localStorage.getItem('lokalnie_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));
      
      const savedFav = localStorage.getItem('lokalnie_favorite_ids');
      if (savedFav) setFavorites(JSON.parse(savedFav));
    } catch (err) {
      console.error('Could not read local data', err);
    }

    loadData();
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('lokalnie_favorite_ids', JSON.stringify(updated));
  };

  const openViewMore = (title: string, items: Company[]) => {
    setViewMoreTitle(title);
    setViewMoreItems(items);
    setViewMoreOpen(true);
  };

  const statItems = [
    {
      label: 'Szybkie rezerwacje',
      value: '0-2 min',
      icon: Clock,
      isStatic: true
    },
    {
      label: 'Firmy dostępne',
      value: allCompanies.length,
      icon: Building2,
      isStatic: false
    },
    {
      label: 'Średnia ocena',
      value: `${avgRating}★`,
      icon: Star,
      isStatic: false
    },
    {
      label: 'Aktywne promocje',
      value: activePromotions.length,
      icon: Tag,
      isStatic: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* HERO SECTION - SEARCH IS MAIN FOCUS */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-48 -mb-48" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 border border-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer">
              <Flame className="w-4 h-4 text-amber-300" /> 
              Premium Serwis Lokalny
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-4">
              Szukaj usług<br />na swoim osiedlu
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Najszybciej zarezerwuj najlepszych wykonawców w Twojej okolicy. Weryfikowane firmy, opinie klientów, promocje.
            </p>
          </motion.div>

          {/* GIANT SEARCH BAR */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl shadow-slate-950/50 p-8 sm:p-10">
              <div className="mb-4">
                <span className="text-xs uppercase tracking-[0.35em] font-bold text-slate-400">Wpisz szukaną usługę</span>
              </div>
              <SearchBar initialQuery="" onSearch={onSearch} />
              
              {/* Search Tips */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Szybko</p>
                    <p className="text-xs">Rezerwacja w 2 minuty</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Bezpiecznie</p>
                    <p className="text-xs">Weryfikowane firmy</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Godnie</p>
                    <p className="text-xs">Opinie rzeczywiste</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats - REAL DATA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid gap-3 sm:grid-cols-4 text-center"
          >
            {statItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <item.icon className="w-5 h-5 mx-auto mb-2 text-slate-300" />
                <motion.p
                  key={item.isStatic ? 'static' : allCompanies.length + activePromotions.length}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl font-bold text-white"
                >
                  {typeof item.value === 'number' ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {item.value}{item.label === 'Średnia ocena' ? '' : item.label === 'Aktywne promocje' ? '+' : item.label === 'Firmy dostępne' ? '+' : ''}
                    </motion.span>
                  ) : (
                    item.value
                  )}
                </motion.p>
                <p className="text-xs text-slate-400 mt-1">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Content Below Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ostatnie wyszukiwania</h2>
              </div>
              <button
                onClick={() => setSearchHistoryOpen(true)}
                className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline cursor-pointer group"
              >
                <span>Pokaż wszystkie</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  onClick={() => onSearch(item.query, item.city)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-all cursor-pointer hover:shadow-md"
                >
                  {item.query || 'Wszystko'} · {item.city}
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Popular Companies */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              Popularne firmy
            </h2>
            {allCompanies.length > 6 && (
              <button
                onClick={() => openViewMore('Popularne firmy', allCompanies)}
                className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline cursor-pointer group"
              >
                <span>Zobacz wszystkie</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse h-48" />
              ))}
            </div>
          ) : popularCompanies.length === 0 ? (
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-12 border border-indigo-100 dark:border-indigo-900/30 text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Brak firm w Twojej okolicy</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                Spróbuj wyszukać konkretną usługę lub zmień lokalizację, aby znaleźć dostępnych wykonawców.
              </p>
              <Button
                variant="gradient"
                onClick={() => onSearch('', 'Poznań')}
              >
                Przeszukaj dostępne usługi
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularCompanies.map((company, idx) => (
                <div key={idx}>
                  <CompanyCardSmall
                    company={company}
                    onSelect={() => onSelectCompany(company.uid)}
                    isFavorite={favorites.includes(company.uid)}
                    onToggleFavorite={(e) => toggleFavorite(company.uid, e)}
                  />
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Active Promotions */}
        {activePromotions.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                Aktywne promocje
              </h2>
              {activePromotions.length > 4 && (
                <button
                  onClick={() => openViewMore(
                    'Aktywne promocje',
                    activePromotions.map(p => ({
                      ...p,
                      uid: p.id,
                      companyName: p.companyName,
                      city: p.companyCity || '',
                      category: 'Promocja',
                      address: '',
                      services: p.description,
                      description: p.description,
                      rating: 5.0
                    } as any))
                  )}
                  className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline cursor-pointer group"
                >
                  <span>Wszyst. promocje</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activePromotions.map((promo, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950/20 dark:to-amber-950/20 rounded-2xl p-5 border border-rose-200 dark:border-rose-900/30 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-lg">
                      {promo.discountValue}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-right truncate">
                      {promo.companyName}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1 group-hover:text-rose-600 transition-colors">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {promo.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Categories */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            Popularne kategorie
          </h2>
          {categories.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {categories.slice(0, 12).map((cat, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  onClick={() => onSearch(cat.name)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer hover:shadow-md whitespace-nowrap"
                >
                  {cat.name}
                  <span className="text-xs text-slate-500 dark:text-slate-500 ml-1.5">({cat.count})</span>
                </motion.button>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      <SearchBot onSelectCompany={onSelectCompany} />

      {/* ViewMore Modal */}
      <ViewMore
        isOpen={viewMoreOpen}
        onClose={() => setViewMoreOpen(false)}
        title={viewMoreTitle}
        items={viewMoreItems}
        onSelectCompany={(id) => {
          setViewMoreOpen(false);
          onSelectCompany(id);
        }}
      />
      
      {/* Search History Modal */}
      <UserSearchHistory
        isOpen={searchHistoryOpen}
        onClose={() => setSearchHistoryOpen(false)}
        onSearch={onSearch}
      />
    </div>
  );
}

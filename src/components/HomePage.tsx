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
  History
} from 'lucide-react';
import { SearchBar } from './SearchBar';
import { fetchSearchData, getCategoriesWithCounts } from '../lib/SearchEngine';
import { Company, Promotion, Ad } from '../types';
import { SearchBot } from './SearchBot';
import { Skeleton } from './ui/Skeleton';

interface Props {
  onSearch: (query: string, city: string) => void;
  onSelectCompany: (companyId: string) => void;
}

interface RecentSearch {
  id: string;
  query: string;
  city: string;
}

const QUICK_TAGS = ['#fryzjer', '#mechanik', '#hydraulik', '#pizza', '#remont', '#stomatolog', '#lokalne'];

const SEARCH_MOMENTS = [
  { label: 'Dostępne dziś', query: 'wolny termin dziś', icon: Clock, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { label: 'Najlepiej oceniane', query: 'najlepiej oceniane usługi', icon: Star, tone: 'text-amber-600 bg-amber-50 border-amber-100' },
  { label: 'Promocje w okolicy', query: 'promocje rabaty', icon: Tag, tone: 'text-rose-600 bg-rose-50 border-rose-100' },
  { label: 'Firmy premium', query: 'zweryfikowane firmy', icon: BadgeCheck, tone: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
];

function HomeSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-md p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-4 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-3 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <Skeleton className="mt-6 h-20 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

export function HomePage({ onSearch, onSelectCompany }: Props) {
  const [popularCompanies, setPopularCompanies] = useState<Company[]>([]);
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { companies, promotions, ads } = await fetchSearchData();
        const cats = await getCategoriesWithCounts();
        setPopularCompanies(companies.slice(0, 3));
        setActivePromotions(promotions.slice(0, 2));
        setRecentAds(ads.slice(0, 2));
        setCategories(cats);
      } catch (err) {
        console.error('Error loading home page data', err);
      } finally {
        setLoading(false);
      }
    }

    try {
      const saved = localStorage.getItem('lokalnie_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved).slice(0, 4));
    } catch (err) {
      console.error('Could not read recent searches', err);
    }

    loadData();
  }, []);

  const runSearch = (query: string, city = 'Poznań') => {
    onSearch(query, city);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/70 via-slate-50 to-slate-100 px-4 pb-24 pt-8 font-sans dark:from-indigo-950/40 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100 transition-colors duration-300">
      <section className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_420px]">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/90 dark:bg-slate-900/90 dark:border-indigo-800/60 px-4 py-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/5 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
              <span>Inteligentna wyszukiwarka lokalna</span>
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:mx-0 lg:text-7xl">
              Znajdź usługę, termin i <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">sprawdzoną firmę.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 lg:mx-0">
              Jedno miejsce do szybkiego wyboru lokalnych wykonawców, promocji, opinii i rezerwacji. Bez chaosu, bez zgadywania, z jasnym przejściem od wyszukiwania do kontaktu.
            </p>

            <div className="mt-8">
              <SearchBar initialQuery="" onSearch={onSearch} />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => runSearch(tag.replace('#', ''))}
                  className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {recentSearches.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <History className="h-3.5 w-3.5" />
                  Ostatnie
                </span>
                {recentSearches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => runSearch(item.query, item.city)}
                    className="rounded-xl bg-slate-900 dark:bg-indigo-950 dark:border dark:border-indigo-800/50 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-600 hover:-translate-y-0.5 cursor-pointer"
                  >
                    {item.query || 'Wszystko'} · {item.city}
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-white/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
            <div className="rounded-2xl bg-slate-950 dark:bg-slate-900 border border-slate-800 p-5 text-white shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Panel decyzji</p>
                  <h2 className="mt-1 text-xl font-black tracking-tight">Szybki wybór</h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                  <Search className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {SEARCH_MOMENTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => runSearch(item.query)}
                      className="group rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left transition-all hover:-translate-y-0.5 hover:bg-white/[0.1] hover:border-indigo-500/40 cursor-pointer"
                    >
                      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl border ${item.tone}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-black tracking-tight group-hover:text-indigo-300 transition-colors">{item.label}</span>
                      <span className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white">
                        Szukaj <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950 p-3.5 shadow-sm">
                <p className="text-2xl font-black text-slate-950 dark:text-white">{popularCompanies.length || '3+'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">firmy na start</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950 p-3.5 shadow-sm">
                <p className="text-2xl font-black text-slate-950 dark:text-white">{activePromotions.length || '2+'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">promocje</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950 p-3.5 shadow-sm">
                <p className="text-2xl font-black text-amber-500">4.8</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">średnia ocen</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 text-center md:grid-cols-3">
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-4 shadow-sm backdrop-blur-md">
            <Zap className="h-5 w-5 shrink-0 text-indigo-500" />
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Szybkie dopasowanie intencji</span>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-4 shadow-sm backdrop-blur-md">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Oddzielne flow klienta i firmy</span>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-4 shadow-sm backdrop-blur-md">
            <HeartHandshake className="h-5 w-5 shrink-0 text-amber-500" />
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Kontakt, opinie i rezerwacje</span>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl space-y-16">
        {loading ? (
          <HomeSkeleton />
        ) : (
          <>
            {popularCompanies.length > 0 && (
              <div>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Rekomendowane</p>
                    <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">Firmy gotowe do pokazania klientowi</h3>
                  </div>
                  <button
                    onClick={() => runSearch('')}
                    className="hidden items-center gap-1.5 rounded-xl bg-slate-950 dark:bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-md cursor-pointer sm:flex"
                  >
                    Zobacz wszystkie <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {popularCompanies.map((comp, index) => (
                    <button
                      key={comp.uid}
                      onClick={() => onSelectCompany(comp.uid)}
                      className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 text-left shadow-sm backdrop-blur-md transition-all hover:-translate-y-1.5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shadow-inner">
                            {comp.logo ? <img src={comp.logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-7 w-7 text-slate-400" />}
                          </div>
                          <span className="rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            TOP {index + 1}
                          </span>
                        </div>
                        <h4 className="mt-5 text-xl font-black text-slate-950 dark:text-white transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 tracking-tight">{comp.companyName}</h4>
                        <p className="mt-2 flex items-center text-xs font-bold text-slate-400 dark:text-slate-400">
                          <MapPin className="mr-1 h-3.5 w-3.5 text-indigo-500 shrink-0" /> {comp.city}, {comp.address}
                        </p>
                        <p className="mt-3 line-clamp-2 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">{comp.description}</p>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                        <span className="flex items-center gap-1.5 text-xs font-black text-amber-500 bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1 rounded-lg">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          {comp.rating || '5.0'}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-black text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                          Profil firmy <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-sm backdrop-blur-md">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-rose-500 dark:text-rose-400">Okazje</p>
                    <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">Promocje i rabaty</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-3.5">
                  {activePromotions.length > 0 ? activePromotions.map((promo) => (
                    <div key={promo.id} className="flex items-start gap-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 p-4 transition-all hover:bg-rose-50 dark:hover:bg-rose-950/40">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-900/40">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="rounded-lg bg-rose-600 text-white px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase">{promo.discountValue}</span>
                        <h4 className="mt-2 text-sm font-black text-slate-950 dark:text-white">{promo.title}</h4>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">{promo.description}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs font-bold text-slate-400">Brak aktywnych promocji do pokazania.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-sm backdrop-blur-md">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400">Ogłoszenia</p>
                    <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">Najnowsze potrzeby i oferty</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-3.5">
                  {recentAds.length > 0 ? recentAds.map((ad) => (
                    <div key={ad.id} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-4 transition-all hover:bg-slate-100/80 dark:hover:bg-slate-800">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{ad.category}</span>
                        {ad.price ? <span className="text-sm font-black text-slate-950 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">{ad.price} zł</span> : null}
                      </div>
                      <h4 className="mt-2 text-sm font-black text-slate-950 dark:text-white">{ad.title}</h4>
                      <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">{ad.description}</p>
                    </div>
                  )) : (
                    <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs font-bold text-slate-400">Brak nowych ogłoszeń do pokazania.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <div>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Kategorie usług</p>
              <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">Szybkie wejścia do najważniejszych branż</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-400">Popularne w Twojej okolicy</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(categories.length > 0 ? categories : [
              { name: 'Uroda i Styl', count: 12 },
              { name: 'Motoryzacja', count: 8 },
              { name: 'Usługi domowe', count: 15 },
              { name: 'Gastronomia', count: 20 },
              { name: 'Zdrowie', count: 6 },
              { name: 'Edukacja', count: 4 },
              { name: 'Finanse', count: 5 },
              { name: 'Nieruchomości', count: 9 }
            ]).map((cat) => (
              <button
                key={cat.name}
                onClick={() => runSearch(cat.name)}
                className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 text-left shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-black text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{cat.name}</span>
                    <span className="mt-1 block text-[11px] font-bold text-slate-400">{cat.count} ofert</span>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <SearchBot onSelectCompany={onSelectCompany} />
    </div>
  );
}

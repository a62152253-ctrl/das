import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Star, ChevronRight, Building2, Tag, FileText, Loader2 } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { fetchSearchData } from '../lib/SearchEngine';
import { Company, Promotion, Ad } from '../types';

interface Props {
  onSearch: (query: string, city: string) => void;
  onSelectCompany: (companyId: string) => void;
}

export function HomePage({ onSearch, onSelectCompany }: Props) {
  const [popularCompanies, setPopularCompanies] = useState<Company[]>([]);
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { companies, promotions, ads } = await fetchSearchData();
        // Just take some for display
        setPopularCompanies(companies.slice(0, 3));
        setActivePromotions(promotions.slice(0, 2));
        setRecentAds(ads.slice(0, 2));
      } catch (err) {
        console.error("Error loading home page data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="py-16 px-4 md:py-20">
      {/* Hero header */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-black uppercase tracking-widest mb-6 border border-blue-500/10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Szybkie wyszukiwanie lokalne</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-none mb-6">
          Znajdź to, czego szukasz <br className="hidden sm:inline" /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">w kilka sekund</span>
        </h1>
        <p className="text-base text-slate-500 max-w-2xl mx-auto font-semibold">
          LOKALNIE PRO to baza wiedzy o lokalnych firmach, usługach, promocjach i ogłoszeniach. Wpisz pytanie i otrzymaj gotową odpowiedź.
        </p>
      </div>

      {/* Central search bar */}
      <SearchBar initialQuery="" onSearch={onSearch} />

      {/* Promos, companies, ads, categories, map grids below search */}
      <div className="max-w-6xl mx-auto mt-20 space-y-16">
        
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Popular Companies (Wizytówki) */}
            {popularCompanies.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Najpopularniejsze lokalne firmy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {popularCompanies.map(comp => (
                    <div 
                      key={comp.uid} 
                      onClick={() => onSelectCompany(comp.uid)}
                      className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 hover:shadow-xl hover:border-blue-500/50 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100 mb-4">
                          {comp.logo ? <img src={comp.logo} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-6 h-6 text-slate-400" />}
                        </div>
                        <h4 className="font-extrabold text-slate-950 text-base">{comp.companyName}</h4>
                        <p className="text-xs text-slate-400 mt-1 font-bold flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1" /> {comp.city}, {comp.address}
                        </p>
                        <p className="text-slate-550 text-xs font-semibold leading-relaxed line-clamp-2 mt-3">{comp.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center text-amber-500 text-xs font-bold gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{comp.rating}</span>
                        </div>
                        <span className="text-xs font-black text-blue-600 flex items-center">Profil firmy <ChevronRight className="w-3 h-3" /></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Promotions & Ads Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Active Deals */}
              {activePromotions.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Promocje i rabaty</h3>
                  <div className="space-y-4">
                    {activePromotions.map(promo => (
                      <div key={promo.id} className="p-5 bg-white border border-slate-200 rounded-3xl flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
                          <Tag className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="inline-block text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md mb-2">
                            {promo.discountValue}
                          </span>
                          <h4 className="font-extrabold text-slate-950 text-sm">{promo.title}</h4>
                          <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">{promo.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New classified ads */}
              {recentAds.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Najnowsze ogłoszenia</h3>
                  <div className="space-y-4">
                    {recentAds.map(ad => (
                      <div key={ad.id} className="p-5 bg-white border border-slate-200 rounded-3xl flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ad.category}</span>
                            {ad.price && <span className="text-sm font-black text-slate-900">{ad.price} zł</span>}
                          </div>
                          <h4 className="font-extrabold text-slate-950 text-sm mt-2">{ad.title}</h4>
                          <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed line-clamp-1">{ad.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Categories */}
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 font-sans">Kategorie usług</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Uroda i Styl', 'Motoryzacja', 'Usługi domowe', 'Gastronomia'].map((cat, idx) => (
              <button 
                key={idx}
                onClick={() => onSearch(cat, 'Gniezno')}
                className="bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-blue-500 hover:text-blue-600 transition-colors font-bold text-slate-700 flex items-center justify-between cursor-pointer"
              >
                <span>{cat}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

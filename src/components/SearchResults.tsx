import React, { useState, useEffect } from 'react';
import { SearchResultItem } from '../lib/RankingEngine';
import { SearchSortOption } from '../lib/SearchEngine';
import { Star, MapPin, Tag, Briefcase, FileText, ExternalLink, Heart, Share2, ArrowUpDown, Sparkles } from 'lucide-react';
import { addToast } from './ui/Toast';

interface Props {
  results: SearchResultItem[];
  query?: string;
  onSelectCompany: (companyId: string) => void;
  onContactCompany?: (companyId: string, companyName: string) => void;
}

export function SearchResults({ results, onSelectCompany, onContactCompany }: Props) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SearchSortOption>('relevance');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lokalnie_favorite_ids');
      if (saved) setFavorites(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter(f => f !== id);
      addToast('Usunięto z ulubionych', 'info');
    } else {
      updated = [...favorites, id];
      addToast('Dodano do ulubionych!', 'success');
    }
    setFavorites(updated);
    localStorage.setItem('lokalnie_favorite_ids', JSON.stringify(updated));
  };

  const handleShare = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    addToast(`Skopiowano link do "${title}" do schowka.`, 'success');
  };

  // Filter by item type and minimum rating
  const filteredResults = results.filter(r => {
    if (selectedType !== 'all' && r.type !== selectedType) return false;
    if (minRatingFilter > 0 && (r.rating || 0) < minRatingFilter) return false;
    return true;
  });

  // Sort results locally
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating || b.score - a.score;
    if (sortBy === 'distance') return (a.distance ?? 999) - (b.distance ?? 999);
    if (sortBy === 'price_asc') return (a.price ?? 999999) - (b.price ?? 999999);
    if (sortBy === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);
    return b.score - a.score; // relevance
  });

  if (results.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 max-w-xl mx-auto font-sans">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-indigo-100 dark:border-indigo-900">
          <MapPin className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Brak dopasowanych ofert</h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs leading-relaxed">
          Spróbuj wpisać inne zapytanie lub zmienić frazę. Nasz wyszukiwarkowy algorytm dopasowuje wyniki na podstawie odległości, specyfikacji oraz ocen wykonawców.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Controls Bar: Type Filter, Rating Filter & Sorting */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Type tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {[
            { id: 'all', label: `Wszystkie (${results.length})` },
            { id: 'company', label: `Wizytówki (${results.filter(r => r.type === 'company').length})` },
            { id: 'service', label: `Usługi (${results.filter(r => r.type === 'service').length})` },
            { id: 'ad', label: `Ogłoszenia (${results.filter(r => r.type === 'ad').length})` },
            { id: 'promotion', label: `Promocje (${results.filter(r => r.type === 'promotion').length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedType === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Filter Chips & Sorting Dropdown */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
          {/* Min rating filter toggle */}
          <button
            onClick={() => setMinRatingFilter(minRatingFilter === 4.5 ? 0 : 4.5)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
              minRatingFilter === 4.5
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-amber-400'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Ocena 4.5+</span>
          </button>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Sortuj:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SearchSortOption)}
              className="text-xs font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="relevance">Trafność AI</option>
              <option value="rating">Najwyższa ocena</option>
              <option value="distance">Najbliżej mnie</option>
              <option value="price_asc">Cena: rosnąco</option>
              <option value="price_desc">Cena: malejąco</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {sortedResults.map((result) => {
          const isSponsored = result.isSponsored;
          const isFav = favorites.includes(result.id);

          return (
            <div 
              key={result.id}
              className={`bg-white dark:bg-slate-800 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row hover:shadow-xl group ${
                isSponsored 
                  ? 'border-indigo-500 shadow-md shadow-indigo-500/10 bg-gradient-to-br from-indigo-50/20 via-white to-white dark:from-indigo-950/20 dark:to-slate-800' 
                  : 'border-slate-200 dark:border-slate-700/80 shadow-sm'
              }`}
            >
              {/* Sponsored Ribbon */}
              {isSponsored && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-xl z-10 shadow-sm">
                  Wyróżnione
                </div>
              )}

              {/* Thumbnail / Visual */}
              <div className="w-full md:w-48 h-40 md:h-auto bg-slate-100 dark:bg-slate-900 shrink-0 relative overflow-hidden flex items-center justify-center">
                {result.type === 'company' && result.item.mainPhoto ? (
                  <img 
                    src={result.item.mainPhoto} 
                    alt={result.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : result.type === 'company' && result.item.logo ? (
                  <img 
                    src={result.item.logo} 
                    alt={result.title} 
                    className="w-20 h-20 object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
                    {result.type === 'service' && <Briefcase className="w-10 h-10 mb-2 text-indigo-500/70" />}
                    {result.type === 'ad' && <FileText className="w-10 h-10 mb-2 text-emerald-500/70" />}
                    {result.type === 'promotion' && <Tag className="w-10 h-10 mb-2 text-amber-500/70" />}
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{result.badgeText}</span>
                  </div>
                )}

                {/* Bookmark Favorite Button */}
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(result.id, e)}
                  className={`absolute top-3 left-3 p-2 rounded-full transition-all cursor-pointer shadow-sm ${
                    isFav ? 'bg-rose-500 text-white' : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white text-slate-400 hover:text-rose-500'
                  }`}
                  title={isFav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                </button>
              </div>

              {/* Content info */}
              <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                      result.type === 'service' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' :
                      result.type === 'ad' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                      result.type === 'promotion' ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' :
                      'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {result.badgeText}
                    </span>
                    {result.distance !== undefined && (
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {result.distance.toFixed(1)} km ({result.city})
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {result.title}
                  </h3>

                  {result.type !== 'company' && (
                    <button 
                      onClick={() => onSelectCompany(result.companyId)}
                      className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-2 block text-left"
                    >
                      Wykonawca: <span className="underline">{result.companyName}</span>
                    </button>
                  )}

                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-normal line-clamp-2 mb-3">
                    {result.description}
                  </p>
                </div>

                {/* Price / Rating / Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-auto">
                  <div className="flex items-center gap-4">
                    {result.price !== undefined && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cena</span>
                        <span className="text-xl font-extrabold text-slate-900 dark:text-white">{result.price} zł</span>
                      </div>
                    )}
                    {result.discount !== undefined && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Zniżka</span>
                        <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-sm font-black border border-rose-200">{result.discount}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ocena</span>
                      <div className="flex items-center text-amber-500 font-bold text-xs gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{result.rating ? result.rating.toFixed(1) : '5.0'}</span>
                        <span className="text-slate-400 text-[10px] font-medium">({result.reviewCount || 0})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleShare(result.title, e)}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                      title="Udostępnij"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    {onContactCompany && (
                      <button 
                        onClick={() => onContactCompany(result.companyId, result.companyName)}
                        className="px-3 py-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Zapytaj
                      </button>
                    )}
                    <button 
                      onClick={() => onSelectCompany(result.companyId)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                    >
                      <span>Zobacz profil</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

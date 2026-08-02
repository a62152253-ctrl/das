import React, { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles, X, Building2, Tag, Megaphone, ArrowUpRight } from 'lucide-react';
import { getSuggestions, SearchSuggestionItem } from '@/lib/SearchEngine';

interface Props {
  initialQuery?: string;
  onSearch: (query: string, city: string) => void;
}

const POPULAR_SUGGESTIONS = [
  'fryzjer',
  'mechanik',
  'hydraulik Poznań',
  'stomatolog',
  'naprawa aut',
  'kosmetyczka',
  'sprzątanie mieszkań',
  'fotograf'
];

export function SearchBar({ initialQuery = '', onSearch }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(() => localStorage.getItem('last_search_city') || 'Poznań');
  const [focused, setFocused] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<SearchSuggestionItem[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  useEffect(() => {
    let active = true;
    async function fetchLiveSuggestions() {
      if (query.trim().length >= 2) {
        try {
          const list = await getSuggestions(query);
          if (active) {
            setDynamicSuggestions(list);
            setActiveSuggestionIndex(-1);
          }
        } catch (e) {
          console.error('Error fetching suggestions', e);
        }
      } else {
        if (active) {
          setDynamicSuggestions([]);
          setActiveSuggestionIndex(-1);
        }
      }
    }

    const timer = setTimeout(fetchLiveSuggestions, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!focused) return;
    const maxLen = dynamicSuggestions.length > 0 ? dynamicSuggestions.length : POPULAR_SUGGESTIONS.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev + 1) % maxLen);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev - 1 + maxLen) % maxLen);
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0) {
        e.preventDefault();
        const selected = dynamicSuggestions.length > 0 
          ? dynamicSuggestions[activeSuggestionIndex].text 
          : POPULAR_SUGGESTIONS[activeSuggestionIndex];
        handleSuggestionClick(selected);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setFocused(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setFocused(true);
      return;
    }
    setIsAnalyzing(true);
    const targetCity = city.trim() || 'Poznań';
    localStorage.setItem('last_search_city', targetCity);
    setTimeout(() => {
      setIsAnalyzing(false);
      onSearch(trimmedQuery, targetCity);
      setFocused(false);
      setActiveSuggestionIndex(-1);
    }, 250);
  };

  const handleSuggestionClick = (val: string) => {
    const targetCity = city.trim() || 'Poznań';
    setQuery(val);
    localStorage.setItem('last_search_city', targetCity);
    onSearch(val, targetCity);
    setFocused(false);
    setActiveSuggestionIndex(-1);
  };

  const handleClear = () => {
    setQuery('');
    setDynamicSuggestions([]);
    setActiveSuggestionIndex(-1);
  };

  const getSuggestionIcon = (type: SearchSuggestionItem['type']) => {
    switch (type) {
      case 'company': return <Building2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'service': return <Tag className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ad': return <Megaphone className="w-3.5 h-3.5 text-purple-400" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto w-full font-sans">
      <form
        onSubmit={handleSubmit}
        className={`relative flex flex-col md:flex-row items-center bg-slate-900/90 border rounded-2xl p-2 transition-all duration-300 shadow-2xl ${
          focused 
            ? 'border-indigo-500/80 shadow-indigo-500/10 ring-2 ring-indigo-500/20' 
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        {/* Main Search Input */}
        <div className="relative flex-1 flex items-center w-full px-3 py-2">
          <Search className="w-5 h-5 text-indigo-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Szukaj firm, usług, słów kluczowych..."
            className="w-full bg-transparent text-white text-sm placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-white rounded-full transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* City Input Divider */}
        <div className="hidden md:block w-px h-8 bg-white/10 mx-1" />

        {/* City Location Input */}
        <div className="relative flex items-center w-full md:w-48 px-3 py-2 border-t md:border-t-0 border-white/10">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mr-2" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Miasto lub kod"
            className="w-full bg-transparent text-white text-sm placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2 md:mt-0"
        >
          {isAnalyzing ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4" /> Szukaj
            </>
          )}
        </button>
      </form>

      {/* Smart Auto-Complete Dropdown Menu */}
      {focused && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-white/5 animate-fade-in">
          {dynamicSuggestions.length > 0 ? (
            <div className="p-2">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sugerowane trafienia (Smart Auto-Complete)
              </div>
              {dynamicSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(sug.text)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer text-xs transition-all ${
                    activeSuggestionIndex === idx
                      ? 'bg-indigo-600/30 text-white border border-indigo-500/30'
                      : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {getSuggestionIcon(sug.type)}
                    <span className="font-semibold">{sug.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    {sug.category}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Popularne wyszukiwania
              </div>
              <div className="flex flex-wrap gap-1.5 p-1">
                {POPULAR_SUGGESTIONS.map((pop, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(pop)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-indigo-600/30 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors border border-white/5 flex items-center gap-1"
                  >
                    <span>{pop}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

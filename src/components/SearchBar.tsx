import React, { useState } from 'react';
import { Search, MapPin, Sparkles } from 'lucide-react';

interface Props {
  initialQuery?: string;
  onSearch: (query: string, city: string) => void;
}

const POPULAR_SUGGESTIONS = [
  'fryzjer',
  'mechanik BMW',
  'hydraulik',
  'pizza',
  'mieszkanie do wynajęcia',
  'stomatolog',
  'naprawa pralek',
  'autokomis'
];

export function SearchBar({ initialQuery = '', onSearch }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState('Gniezno');
  const [focused, setFocused] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    // Symulacja czasu analizy AI dla lepszego UX
    setTimeout(() => {
      setIsAnalyzing(false);
      onSearch(query, city);
      setFocused(false);
    }, 600);
  };

  const handleSuggestionClick = (val: string) => {
    setQuery(val);
    onSearch(val, city);
    setFocused(false);
  };

  return (
    <div className="w-full relative max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative z-20">
        <div className="flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 p-2 md:p-3 gap-2">
          {/* Query input */}
          <div className="flex-1 flex items-center px-4 gap-3 relative">
            {isAnalyzing ? (
              <Sparkles className="w-6 h-6 text-blue-500 animate-pulse shrink-0" />
            ) : (
              <Search className="w-6 h-6 text-slate-400 shrink-0" />
            )}
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Czego szukasz? (np. hydraulik na już...)"
              className="w-full py-3 bg-transparent text-slate-800 text-lg font-medium focus:outline-none placeholder-slate-400"
            />
            {isAnalyzing && (
              <span className="absolute right-4 text-xs font-bold text-blue-500 animate-pulse bg-blue-50 px-2 py-1 rounded-md">
                AI analizuje...
              </span>
            )}
          </div>

          <div className="hidden md:block w-px bg-slate-200 my-2"></div>

          {/* Location input */}
          <div className="flex items-center px-4 gap-3 md:w-52">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <input 
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Lokalizacja"
              className="w-full py-3 bg-transparent text-slate-800 text-base font-bold focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Submit button */}
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl md:rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>Szukaj</span>
          </button>
        </div>
      </form>

      {/* Floating Suggestions */}
      {focused && (
        <>
          {/* Backdrop to dismiss suggestions when clicking outside */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setTimeout(() => setFocused(false), 200)}
          />
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Popularne wyszukiwania</h4>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {POPULAR_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(item)}
                  className="px-4 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-sm font-bold rounded-xl border border-slate-200/60 transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

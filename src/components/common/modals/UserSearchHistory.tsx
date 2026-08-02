import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Search, MapPin, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { Button, Badge, addToast } from '@/components/ui';

interface SearchHistoryItem {
  id: string;
  query: string;
  city: string;
  timestamp: number;
  resultCount?: number;
  clicked?: boolean;
}

interface UserSearchHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string, city: string) => void;
}

export function UserSearchHistory({ isOpen, onClose, onSearch }: UserSearchHistoryProps) {
  const [searches, setSearches] = useState<SearchHistoryItem[]>([]);
  const [selectedSearch, setSelectedSearch] = useState<SearchHistoryItem | null>(null);
  const [filterCity, setFilterCity] = useState<string>('all');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lokalnie_search_history');
      if (saved) {
        const data = JSON.parse(saved);
        setSearches(data.sort((a: SearchHistoryItem, b: SearchHistoryItem) => b.timestamp - a.timestamp));
      }
    } catch (err) {
      console.error('Error loading search history:', err);
    }
  }, [isOpen]);

  const cities = Array.from(new Set(searches.map(s => s.city))).sort();
  
  const filteredSearches = filterCity === 'all' 
    ? searches 
    : searches.filter(s => s.city === filterCity);

  const handleClearHistory = () => {
    if (confirm('Czy na pewno chcesz usunąć całą historię wyszukiwań?')) {
      setSearches([]);
      localStorage.removeItem('lokalnie_search_history');
      addToast('Historia wyszukiwań została wyczyszczona', 'info');
    }
  };

  const handleDeleteSearch = (id: string) => {
    const updated = searches.filter(s => s.id !== id);
    setSearches(updated);
    localStorage.setItem('lokalnie_search_history', JSON.stringify(updated));
    addToast('Wyszukiwanie usunięte z historii', 'info');
  };

  const handleSearch = (item: SearchHistoryItem) => {
    onSearch?.(item.query, item.city);
    onClose();
  };

  const stats = {
    totalSearches: searches.length,
    uniqueQueries: new Set(searches.map(s => s.query)).size,
    topCity: cities[0] || 'Brak',
    lastSearch: searches[0]?.timestamp
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Historia wyszukiwań</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Podgląd wszystkich Twoich poszukiwań</p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {searches.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Brak historii wyszukiwań</h3>
                  <p className="text-slate-600 dark:text-slate-400">Zacznij szukać firm, aby budować historię</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: BarChart3, label: 'Wszystkich wyszukiwań', value: stats.totalSearches },
                      { icon: Search, label: 'Unikalnych zapytań', value: stats.uniqueQueries },
                      { icon: MapPin, label: 'Główne miasto', value: stats.topCity },
                      { icon: Calendar, label: 'Ostatnie wyszukiwanie', value: stats.lastSearch ? new Date(stats.lastSearch).toLocaleDateString('pl-PL') : 'Brak' }
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 border border-indigo-100 dark:border-indigo-900/30"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <stat.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* City Filter */}
                  {cities.length > 1 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Filtruj po mieście:</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setFilterCity('all')}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                            filterCity === 'all'
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          Wszystkie ({searches.length})
                        </button>
                        {cities.map(city => {
                          const count = searches.filter(s => s.city === city).length;
                          return (
                            <button
                              key={city}
                              onClick={() => setFilterCity(city)}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                                filterCity === city
                                  ? 'bg-indigo-600 text-white shadow-lg'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {city} ({count})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Search List */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                      Wyszukiwania ({filteredSearches.length})
                    </h3>
                    <div className="space-y-2">
                      {filteredSearches.map((search, idx) => {
                        const timeAgo = Math.floor((Date.now() - search.timestamp) / 1000);
                        let timeLabel = 'Właśnie teraz';
                        if (timeAgo > 86400) timeLabel = `${Math.floor(timeAgo / 86400)} dni temu`;
                        else if (timeAgo > 3600) timeLabel = `${Math.floor(timeAgo / 3600)} godzin temu`;
                        else if (timeAgo > 60) timeLabel = `${Math.floor(timeAgo / 60)} minut temu`;

                        return (
                          <motion.div
                            key={search.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="rounded-xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                  <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h4 className="font-bold text-slate-900 dark:text-white truncate">
                                    {search.query || '(Wszystkie usługi)'}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="neutral" size="sm" dotted>
                                      <MapPin className="w-3 h-3" />
                                      {search.city}
                                    </Badge>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                      {timeLabel}
                                    </span>
                                    {search.resultCount && (
                                      <Badge variant="primary" size="sm">
                                        {search.resultCount} wyników
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSearch(search)}
                                >
                                  Powtórz
                                </Button>
                                <button
                                  onClick={() => handleDeleteSearch(search.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {searches.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Wyświetlanie {filteredSearches.length} z {searches.length} wyszukiwań
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleClearHistory}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Wyczyść historię
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export type { UserSearchHistoryProps };

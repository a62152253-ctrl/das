import React, { useState } from 'react';
import { Ad } from '@/types';
import { Plus, Trash2, Search, Eye, Calendar, Tag, DollarSign, Archive, Check, TrendingUp, BarChart3, Copy, Share2, Edit3, Clock, Zap } from 'lucide-react';

interface Props {
  ads: Ad[];
  onAdd: (title: string, description: string, price?: number) => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updated: Partial<Ad>) => void;
  onArchive?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

const AD_CATEGORIES = ['Praca', 'Kupię / Sprzedam', 'Usługi', 'Wynajem', 'Inne'];

export function CompanyAds({ ads, onAdd, onDelete, onUpdate, onArchive, onDuplicate }: Props) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(AD_CATEGORIES[0]);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'price'>('date');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const sanitizeInput = (text: string) => {
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    let parsedPrice: number | undefined = undefined;
    if (price.trim()) {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        alert('Cena / budżet musi być wartością dodatnią.');
        return;
      }
    }

    onAdd(sanitizeInput(title), sanitizeInput(description), parsedPrice);
    setTitle('');
    setPrice('');
    setDescription('');
  };

  const hasAds = ads.length > 0;

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(filterQuery.toLowerCase()) || 
                          ad.description.toLowerCase().includes(filterQuery.toLowerCase());
    
    if (activeTab === 'active') {
      return matchesSearch && ad.status === 'active';
    }
    if (activeTab === 'archived') {
      return matchesSearch && ad.status === 'archived';
    }
    return matchesSearch;
  });

  const sortedAds = [...filteredAds].sort((a, b) => {
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
    if (sortBy === 'price') return (b.price || 0) - (a.price || 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // ✨ NOWA FUNKCJA 1: Analytics Summary
  const totalViews = ads.reduce((acc, ad) => acc + (ad.views || 0), 0);
  const avgViews = ads.length > 0 ? Math.round(totalViews / ads.length) : 0;
  const topAd = ads.length > 0 ? [...ads].sort((a, b) => (b.views || 0) - (a.views || 0))[0] : null;

  // ✨ NOWA FUNKCJA 2: Duplicate Ad
  const handleDuplicateAd = (ad: Ad) => {
    if (onDuplicate) {
      onDuplicate(ad.id);
    } else {
      onAdd(`${ad.title} (kopia)`, ad.description, ad.price);
    }
  };

  // ✨ NOWA FUNKCJA 3: Archive Ad
  const handleArchiveAd = (adId: string) => {
    if (onArchive) {
      onArchive(adId);
    } else if (onUpdate) {
      onUpdate(adId, { status: 'archived' });
    }
  };

  // ✨ NOWA FUNKCJA 4: Quick Edit Ad
  const handleQuickEdit = (ad: Ad) => {
    setEditingId(ad.id);
    setTitle(ad.title);
    setDescription(ad.description);
    setPrice(ad.price?.toString() || '');
    setCategory(ad.category || AD_CATEGORIES[0]);
  };

  // ✨ NOWA FUNKCJA 5: Batch Actions
  const handleBulkArchive = () => {
    const oldAds = ads.filter(ad => {
      const createdDate = new Date(ad.createdAt || Date.now());
      const daysDiff = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 30;
    });
    oldAds.forEach(ad => handleArchiveAd(ad.id));
  };

  return (
    <div className="font-sans">
      {/* Header with analytics toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Ogłoszenia firmy</h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Twórz ogłoszenia rekrutacyjne, ogłoszenia o sprzedaży sprzętu lub informacje lokalne.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {showAnalytics ? 'Ukryj' : 'Pokaż'} Analitykę
          </button>
          {ads.filter(a => new Date(a.createdAt || Date.now()).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000).length > 0 && (
            <button
              onClick={handleBulkArchive}
              className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5" />
              Archiwizuj stare
            </button>
          )}
        </div>
      </div>

      {/* ✨ Analytics Panel */}
      {showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fadeIn">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/40 border border-indigo-200/50 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Łącznie wyświetleń</span>
              <Eye className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-black text-indigo-900">{totalViews}</p>
            <p className="text-[10px] font-semibold text-indigo-600 mt-1">Średnio {avgViews} na ogłoszenie</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 border border-emerald-200/50 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Najlepsze ogłoszenie</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-emerald-900 truncate">{topAd?.title || 'Brak'}</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-1">{topAd?.views || 0} wyświetleń</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 border border-amber-200/50 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Aktywne ogłoszenia</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-900">{ads.filter(a => a.status === 'active').length}</p>
            <p className="text-[10px] font-semibold text-amber-600 mt-1">z {ads.length} łącznie</p>
          </div>
        </div>
      )}
      
      <div className={`grid grid-cols-1 ${hasAds ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
        {/* Form add left */}
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200/50 p-6 rounded-2xl space-y-4 h-fit">
          <h4 className="font-bold text-slate-900 text-sm mb-3">Dodaj ogłoszenie</h4>
          
          <div>
            <label className="notion-label">Kategoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="notion-input bg-white border border-slate-200 cursor-pointer"
            >
              {AD_CATEGORIES.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="notion-label">Tytuł ogłoszenia</label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="notion-input bg-white border border-slate-200"
              placeholder="np. Poszukujemy kosmetyczki"
            />
          </div>

          <div>
            <label className="notion-label">Cena / Budżet (opcjonalnie)</label>
            <input 
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="notion-input bg-white border border-slate-200"
              placeholder="np. 4500"
            />
          </div>

          <div>
            <label className="notion-label">Treść ogłoszenia</label>
            <textarea 
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="notion-input bg-white border border-slate-200 resize-y"
              placeholder="Wpisz pełną treść ogłoszenia..."
            />
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-lg shadow-md shadow-indigo-600/10 transition-colors cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" />
            Dodaj ogłoszenie
          </button>
        </form>

        {/* Ads list right */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Tabs & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
              {(['all', 'active', 'archived'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-white text-slate-800 shadow-2xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'all' && `Wszystkie (${ads.length})`}
                  {tab === 'active' && `Aktywne (${ads.filter(a => a.status === 'active').length})`}
                  {tab === 'archived' && `Archiwum (${ads.filter(a => a.status === 'archived').length})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none"
              >
                <option value="date">Sortuj: Najnowsze</option>
                <option value="views">Sortuj: Wyświetlenia</option>
                <option value="price">Sortuj: Cena</option>
              </select>

              {ads.length > 1 && (
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Szukaj ogłoszeń..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>
              )}
            </div>
          </div>

          {sortedAds.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200/65 rounded-2xl text-slate-400 font-semibold text-xs">
              Brak ogłoszeń pasujących do wybranych kryteriów.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {sortedAds.map(ad => {
                const isArchived = ad.status === 'archived';
                return (
                  <div 
                    key={ad.id} 
                    className={`p-4 bg-white border rounded-xl flex flex-col justify-between hover:shadow-md transition-all duration-200 ${
                      isArchived ? 'border-slate-200 opacity-60' : 'border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase bg-indigo-50 text-indigo-600 border border-indigo-100/40 px-2 py-0.5 rounded leading-none">
                            {ad.category || 'Ogólne'}
                          </span>
                          {isArchived && (
                            <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded leading-none">
                              Zarchiwizowane
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm leading-snug">{ad.title}</h5>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{ad.description}</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {ad.price ? (
                          <span className="font-extrabold text-slate-900 text-sm">{ad.price} zł</span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Brak ceny</span>
                        )}
                        
                        {/* ✨ Quick Actions */}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleDuplicateAd(ad)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                            title="Duplikuj ogłoszenie"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleQuickEdit(ad)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                            title="Edytuj ogłoszenie"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!isArchived && (
                            <button 
                              onClick={() => handleArchiveAd(ad.id)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                              title="Archiwizuj ogłoszenie"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => onDelete(ad.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Usuń ogłoszenie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        Wyświetlenia: {ad.views || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Dodano: {ad.createdAt || 'Dzisiaj'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


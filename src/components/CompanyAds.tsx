import React, { useState } from 'react';
import { Ad } from '../types';
import { Plus, Trash2, Search, Eye, Calendar, Tag, DollarSign, Archive, Check } from 'lucide-react';

interface Props {
  ads: Ad[];
  onAdd: (title: string, description: string, price?: number) => void;
  onDelete: (id: string) => void;
}

const AD_CATEGORIES = ['Praca', 'Kupię / Sprzedam', 'Usługi', 'Wynajem', 'Inne'];

export function CompanyAds({ ads, onAdd, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(AD_CATEGORIES[0]);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'archived'>('all');

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

  return (
    <div className="font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Ogłoszenia firmy</h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Twórz ogłoszenia rekrutacyjne, ogłoszenia o sprzedaży sprzętu lub informacje lokalne.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            {/* Filter Tabs */}
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

          {filteredAds.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200/65 rounded-2xl text-slate-400 font-semibold text-xs">
              Brak ogłoszeń pasujących do wybranych kryteriów.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredAds.map(ad => {
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
                        <button 
                          onClick={() => onDelete(ad.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Usuń ogłoszenie"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        Wyświetlenia: {ad.views || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Dodano: Dzisiaj
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

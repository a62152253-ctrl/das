import React, { useState } from 'react';
import { Ad } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  ads: Ad[];
  onAdd: (title: string, description: string, price?: number) => void;
  onDelete: (id: string) => void;
}

export function CompanyAds({ ads, onAdd, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onAdd(title, description, price ? parseFloat(price) : undefined);
    setTitle('');
    setPrice('');
    setDescription('');
  };

  return (
    <div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Ogłoszenia firmy</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4 h-fit">
          <h4 className="font-extrabold text-slate-900">Dodaj ogłoszenie prasowe / lokalne</h4>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tytuł ogłoszenia</label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              placeholder="np. Poszukiwany fryzjer do salonu"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Sugerowana cena / budżet (opcjonalnie)</label>
            <input 
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              placeholder="np. 4500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Treść ogłoszenia</label>
            <textarea 
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              placeholder="Wpisz treść..."
            />
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Dodaj ogłoszenie
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-extrabold text-slate-900">Aktualne ogłoszenia ({ads.length})</h4>
          {ads.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400">
              Brak dodanych ogłoszeń.
            </div>
          ) : (
            <div className="space-y-3">
              {ads.map(ad => (
                <div key={ad.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-start hover:shadow-sm transition-shadow">
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-base">{ad.title}</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ad.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Wyświetlenia: {ad.views || 0}</span>
                      <span>Dodano: dzisiaj</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    {ad.price && <span className="font-black text-slate-900">{ad.price} zł</span>}
                    <button 
                      onClick={() => onDelete(ad.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

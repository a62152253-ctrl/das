import React, { useState } from 'react';
import { Promotion } from '../types';
import { Plus, Trash2, Tag } from 'lucide-react';

interface Props {
  promotions: Promotion[];
  onAdd: (title: string, discount: string, description: string) => void;
  onDelete: (id: string) => void;
}

export function CompanyPromotions({ promotions, onAdd, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [discount, setDiscount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !discount.trim()) return;
    onAdd(title, discount, description);
    setTitle('');
    setDiscount('');
    setDescription('');
  };

  return (
    <div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Promocje i zniżki</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4 h-fit">
          <h4 className="font-extrabold text-slate-900">Dodaj nowy kupon rabatowy</h4>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tytuł oferty</label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              placeholder="np. Rabat środy z kolorem"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Wielkość obniżki (np. -20%, 50 zł taniej)</label>
            <input 
              type="text"
              required
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              placeholder="np. -20%"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Warunki promocji (krótki opis)</label>
            <textarea 
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              placeholder="np. Obowiązuje przy rezerwacji telefonicznej..."
            />
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Dodaj promocję
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-extrabold text-slate-900">Aktywne kupony rabatowe ({promotions.length})</h4>
          {promotions.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400">
              Brak aktywnych promocji.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {promotions.map(p => (
                <div key={p.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow relative">
                  <div className="absolute top-4 right-4 bg-red-50 text-red-650 font-black px-2.5 py-1 rounded-lg border border-red-100 text-sm">
                    {p.discountValue}
                  </div>
                  <div className="pr-16">
                    <div className="flex items-center gap-1.5 text-blue-600 mb-2">
                      <Tag className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Kupon aktywny</span>
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-base">{p.title}</h5>
                    <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">{p.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wygasa za: 7 dni</span>
                    <button 
                      onClick={() => onDelete(p.id)}
                      className="p-1 text-slate-450 hover:text-red-500 text-xs font-bold rounded transition-colors cursor-pointer"
                    >
                      Usuń
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

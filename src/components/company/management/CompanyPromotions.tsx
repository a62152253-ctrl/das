import React, { useState } from 'react';
import { Promotion } from '@/types';
import { Plus, Trash2, Tag, Calendar, Sparkles, Check, X, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';

interface Props {
  promotions: Promotion[];
  onAdd: (title: string, discount: string, description: string, promoCode?: string, expiresAt?: string) => void;
  onDelete: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
}

export function CompanyPromotions({ promotions, onAdd, onDelete, onToggleActive }: Props) {
  const [title, setTitle] = useState('');
  const [discount, setDiscount] = useState('');
  const [description, setDescription] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const sanitizeInput = (text: string) => {
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
  };

  const handleGeneratePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'LOK-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPromoCode(code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !discount.trim()) return;

    let selectedExpiry = expiresAt;
    if (!selectedExpiry) {
      selectedExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      selectedExpiry = new Date(selectedExpiry).toISOString();
    }

    onAdd(
      sanitizeInput(title), 
      sanitizeInput(discount), 
      sanitizeInput(description), 
      sanitizeInput(promoCode), 
      selectedExpiry
    );

    setTitle('');
    setDiscount('');
    setDescription('');
    setPromoCode('');
    setExpiresAt('');
  };

  const hasPromotions = promotions.length > 0;
  const activePromoCount = promotions.filter(p => p.isActive !== false).length;

  return (
    <div className="font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Kupony promocyjne</h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Twórz kody zniżkowe widoczne bezpośrednio na profilu firmy dla klientów.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
          <span className="font-semibold">Aktywnych kuponów: <span className="text-slate-900 font-bold">{activePromoCount}</span></span>
          <span className="font-semibold">Łącznie ofert: <span className="text-slate-900 font-bold">{promotions.length}</span></span>
        </div>
      </div>
      
      <div className={`grid grid-cols-1 ${hasPromotions ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
        
        {/* Form to Add Promotion */}
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200/50 p-6 rounded-2xl space-y-4 h-fit">
          <h4 className="font-bold text-slate-900 text-sm mb-3">Dodaj nowy kupon</h4>
          
          <div>
            <label className="notion-label">Tytuł oferty</label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="notion-input bg-white border border-slate-200"
              placeholder="np. Rabat środy z kolorem"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="notion-label">Wielkość obniżki</label>
              <input 
                type="text"
                required
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="notion-input bg-white border border-slate-200"
                placeholder="np. -20% lub 50 zł"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="notion-label mb-0">Kod rabatowy</label>
                <button 
                  type="button" 
                  onClick={handleGeneratePromoCode} 
                  className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                  title="Generuj kod"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Losowy
                </button>
              </div>
              <input 
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="notion-input bg-white border border-slate-200 text-indigo-600 font-bold"
                placeholder="np. LATO20"
              />
            </div>
          </div>

          <div>
            <label className="notion-label">Data wygaśnięcia</label>
            <input 
              type="date"
              value={expiresAt}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="notion-input bg-white border border-slate-200 cursor-pointer"
            />
          </div>

          <div>
            <label className="notion-label">Warunki promocji</label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="notion-input bg-white border border-slate-200 resize-y"
              placeholder="np. Obowiązuje na wszystkie usługi fryzjerskie..."
            />
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-lg shadow-md shadow-indigo-600/10 transition-colors cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" />
            Dodaj promocję
          </button>
        </form>

        {/* Promotions List Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-bold text-slate-900 text-sm">Aktywne kupony rabatowe ({activePromoCount})</h4>
          {promotions.length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200/60 rounded-2xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 bg-slate-100">
                <Tag className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Brak promocji</h4>
              <p className="text-xs text-slate-500">Utwórz swoją pierwszą promocję za pomocą formularza po lewej stronie</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {promotions.map(p => {
                const isPromoActive = p.isActive !== false;
                const daysLeft = p.expiresAt 
                  ? Math.max(0, Math.ceil((new Date(p.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                  : 7;

                return (
                  <div key={p.id} className={`p-5 bg-white border rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 relative ${!isPromoActive ? 'border-slate-200 opacity-60' : 'border-slate-200/80'}`}>
                    <div className="absolute top-4 right-4 bg-rose-50 text-rose-650 font-bold px-2 py-0.5 rounded-lg border border-rose-100 text-xs shadow-3xs leading-none">
                      {p.discountValue}
                    </div>
                    <div className={`absolute left-4 top-4 px-2 py-0.5 rounded-full text-[10px] font-bold ${isPromoActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                      {isPromoActive ? 'Aktywny' : 'Wyłączony'}
                    </div>
                    
                    <div className="pr-16">
                      <div className="flex items-center gap-1 text-slate-400 mb-2">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{isPromoActive ? 'Kupon aktywny' : 'Kupon wyłączony'}</span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-sm leading-snug">{p.title}</h5>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{p.description}</p>
                      
                      {p.promoCode && (
                        <div className="mt-3.5 inline-flex items-center gap-1.5 bg-indigo-50/50 border border-indigo-100/50 text-[11px] font-semibold text-slate-700 px-2 py-0.5 rounded-lg leading-none">
                          Kod: <span className="text-indigo-600 font-bold">{p.promoCode}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {daysLeft > 0 ? `Wygasa za: ${daysLeft} dni` : 'Wygasła'}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {onToggleActive && (
                          <button
                            onClick={() => onToggleActive(p.id, !isPromoActive)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            title={isPromoActive ? "Deaktywuj kupon" : "Aktywuj kupon"}
                          >
                            {isPromoActive ? <ToggleRight className="w-6 h-6 text-indigo-600" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                          </button>
                        )}
                        <button 
                          onClick={() => onDelete(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Usuń kupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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


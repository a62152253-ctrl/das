import React, { useState } from 'react';
import { Service } from '../types';
import { Plus, Trash2, Search, Tag, Sparkles, Clock, Edit2, Check, X, ShieldAlert, Eye, EyeOff } from 'lucide-react';

interface Props {
  services: Service[];
  onAdd: (name: string, price: number, description: string, category?: string, durationMin?: number, isActive?: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updated: Partial<Service>) => void;
}

const CATEGORY_OPTIONS = ['Pielęgnacja', 'Koloryzacja', 'Diagnoza & Konsultacja', 'Pakiet Specjalny', 'Inne'];

export function CompanyServices({ services, onAdd, onDelete, onUpdate }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [filterQuery, setFilterQuery] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('30');
  const [editCategory, setEditCategory] = useState(CATEGORY_OPTIONS[0]);

  const sanitizeInput = (text: string) => {
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    const parsedDuration = parseInt(duration) || 30;
    if (!name.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Wprowadź poprawną nazwę oraz cenę większą od zera.');
      return;
    }
    onAdd(sanitizeInput(name), parsedPrice, sanitizeInput(description), category, parsedDuration, true);
    setName('');
    setPrice('');
    setDescription('');
    setDuration('30');
  };

  const handleStartEdit = (service: Service) => {
    setEditingId(service.id);
    setEditName(service.name);
    setEditPrice(service.price.toString());
    setEditDescription(service.description || '');
    setEditDuration((service.durationMin || 30).toString());
    setEditCategory(service.category || CATEGORY_OPTIONS[0]);
  };

  const handleSaveEdit = (id: string) => {
    const parsedPrice = parseFloat(editPrice);
    const parsedDuration = parseInt(editDuration) || 30;
    if (!editName.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Wprowadź poprawną nazwę oraz cenę większą od zera.');
      return;
    }
    onUpdate(id, {
      name: sanitizeInput(editName),
      price: parsedPrice,
      description: sanitizeInput(editDescription),
      category: editCategory,
      durationMin: parsedDuration
    });
    setEditingId(null);
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const avgPrice = services.length > 0
    ? Math.round(services.reduce((acc, curr) => acc + curr.price, 0) / services.length)
    : 0;

  return (
    <div className="font-sans">
      {/* Overview stats header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Usługi i Cennik</h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Zarządzaj cennikiem oferowanym klientom oraz czasem trwania zabiegów.</p>
        </div>
        {services.length > 0 && (
          <div className="flex items-center gap-2.5 bg-indigo-50/50 border border-indigo-100/50 px-4 py-2 rounded-xl">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Średnia cena usługi: <span className="font-bold text-indigo-600">{avgPrice} zł</span></span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form add (Left Column) */}
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200/50 p-6 rounded-2xl space-y-4 h-fit">
          <h4 className="font-bold text-slate-900 text-sm mb-3">Dodaj nową usługę</h4>
          
          <div>
            <label className="notion-label">Kategoria usługi</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="notion-input bg-white border border-slate-200 cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="notion-label">Nazwa usługi</label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="notion-input bg-white border border-slate-200"
              placeholder="np. Strzyżenie brody"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="notion-label">Cena (zł)</label>
              <input 
                type="number"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="notion-input bg-white border border-slate-200"
                placeholder="np. 60"
              />
            </div>
            <div>
              <label className="notion-label">Czas trwania (min)</label>
              <input 
                type="number"
                required
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="notion-input bg-white border border-slate-200"
                placeholder="np. 30"
              />
            </div>
          </div>

          <div>
            <label className="notion-label">Krótki opis</label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="notion-input bg-white border border-slate-200 resize-y"
              placeholder="np. Trimowanie brody maszynką i gorący ręcznik..."
            />
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-lg shadow-md shadow-indigo-600/10 transition-colors cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" />
            Dodaj do cennika
          </button>
        </form>

        {/* Service list (Right Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <h4 className="font-bold text-slate-900 text-sm">Aktualny cennik ({services.length})</h4>
            {services.length > 2 && (
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filtruj usługi..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-slate-300"
                />
              </div>
            )}
          </div>
          
          {services.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200/60 rounded-2xl text-slate-400 font-semibold text-xs">
              Brak dodanych usług. Uzupełnij swoją ofertę za pomocą formularza po lewej stronie.
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-200/50 rounded-2xl text-slate-400 font-semibold text-xs">
              Brak wyników wyszukiwania dla "{filterQuery}"
            </div>
          ) : (
            <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white shadow-2xs divide-y divide-slate-100">
              {filteredServices.map(s => {
                const isEditing = editingId === s.id;
                return (
                  <div key={s.id} className={`p-4 transition-all hover:bg-slate-50/50 ${!s.isActive ? 'opacity-65' : ''}`}>
                    {isEditing ? (
                      <div className="space-y-4 bg-slate-50/50 p-3 rounded-lg border border-slate-200/60 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="notion-label">Nazwa usługi</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="notion-input bg-white border border-slate-200"
                            />
                          </div>
                          <div>
                            <label className="notion-label">Kategoria</label>
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="notion-input bg-white border border-slate-200 cursor-pointer"
                            >
                              {CATEGORY_OPTIONS.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="notion-label">Cena (zł)</label>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="notion-input bg-white border border-slate-200"
                            />
                          </div>
                          <div>
                            <label className="notion-label">Czas (min)</label>
                            <input
                              type="number"
                              value={editDuration}
                              onChange={(e) => setEditDuration(e.target.value)}
                              className="notion-input bg-white border border-slate-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="notion-label">Opis</label>
                          <textarea
                            rows={2}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="notion-input bg-white border border-slate-200 resize-y"
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-white text-slate-600 font-bold rounded-lg text-[10px] cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            Anuluj
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(s.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Zapisz
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100/30">{s.category || 'Ogólne'}</span>
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {s.durationMin || 30} min
                            </span>
                            {!s.isActive && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100/50">Ukryta</span>
                            )}
                          </div>
                          <p className="font-bold text-slate-850 text-sm leading-snug">{s.name}</p>
                          {s.description && <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.description}</p>}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t border-slate-50 sm:border-0">
                          <span className="font-extrabold text-slate-900 text-base">{s.price} zł</span>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onUpdate(s.id, { isActive: !s.isActive })}
                              className={`p-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                s.isActive 
                                  ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' 
                                  : 'text-slate-400 hover:text-emerald-650 hover:bg-emerald-50'
                              }`}
                              title={s.isActive ? "Ukryj w profilu" : "Pokaż w profilu"}
                            >
                              {s.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleStartEdit(s)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edytuj usługę"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              onClick={() => onDelete(s.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-550 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Usuń usługę"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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

import React, { useState } from 'react';
import { Service } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  services: Service[];
  onAdd: (name: string, price: number, description: string) => void;
  onDelete: (id: string) => void;
}

export function CompanyServices({ services, onAdd, onDelete }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    onAdd(name, parseFloat(price), description);
    setName('');
    setPrice('');
    setDescription('');
  };

  return (
    <div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Usługi i Cennik</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form add */}
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4 h-fit">
          <h4 className="font-extrabold text-slate-900">Dodaj nową usługę</h4>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nazwa usługi</label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              placeholder="np. Strzyżenie brody"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Cena (zł)</label>
            <input 
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              placeholder="np. 60"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Krótki opis</label>
            <textarea 
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              placeholder="np. Trimowanie brody maszynką..."
            />
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl shadow-lg shadow-blue-600/10 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Dodaj do cennika
          </button>
        </form>

        {/* Service list */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-extrabold text-slate-900">Aktualny cennik usługi ({services.length})</h4>
          
          {services.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400">
              Brak dodanych usług. Uzupełnij swoją ofertę powyżej!
            </div>
          ) : (
            <div className="space-y-3">
              {services.map(s => (
                <div key={s.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <p className="font-bold text-slate-900 text-base">{s.name}</p>
                    {s.description && <p className="text-xs text-slate-550 font-medium mt-1">{s.description}</p>}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-black text-slate-900 text-lg">{s.price} zł</span>
                    <button 
                      onClick={() => onDelete(s.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

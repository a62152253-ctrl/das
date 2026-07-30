import React from 'react';
import { Company } from '../types';

interface Props {
  company: Company;
  onChange: (updated: Company) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CompanyProfile({ company, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h3 className="text-xl font-extrabold text-slate-900 mb-4">Profil Firmy</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nazwa firmy</label>
          <input 
            type="text" 
            value={company.companyName} 
            onChange={(e) => onChange({ ...company, companyName: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">NIP</label>
          <input 
            type="text" 
            value={company.nip} 
            onChange={(e) => onChange({ ...company, nip: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Opis działalności</label>
          <textarea 
            rows={4}
            value={company.description} 
            onChange={(e) => onChange({ ...company, description: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Adres</label>
          <input 
            type="text" 
            value={company.address} 
            onChange={(e) => onChange({ ...company, address: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Miasto</label>
          <input 
            type="text" 
            value={company.city} 
            onChange={(e) => onChange({ ...company, city: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Telefon kontaktowy</label>
          <input 
            type="text" 
            value={company.phone} 
            onChange={(e) => onChange({ ...company, phone: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Strona WWW</label>
          <input 
            type="text" 
            value={company.website || ''} 
            onChange={(e) => onChange({ ...company, website: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Linki społecznościowe</label>
          <input 
            type="text" 
            value={company.socialLinks || ''} 
            onChange={(e) => onChange({ ...company, socialLinks: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            placeholder="https://facebook.com/twojafirma"
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/10 transition-all cursor-pointer"
      >
        Zapisz profil
      </button>
    </form>
  );
}

import React from 'react';
import { Company } from '../types';
import { Award } from 'lucide-react';

interface Props {
  company: Company;
  onUpgrade: (tier: 'free' | 'silver' | 'gold' | 'platinum') => void;
}

export function CompanyVisibility({ company, onUpgrade }: Props) {
  const current = company.visibilityPackage || 'free';

  return (
    <div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">Pakiety widoczności lokalnej</h3>
      <p className="text-slate-500 font-medium text-sm mb-10">Wybierz pakiet widoczności. Wycena zależy od korzyści pozycjonowania w rankingu wyszukiwarki.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Free tier */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
          current === 'free' ? 'border-slate-900 ring-2 ring-slate-950/10' : 'border-slate-200'
        }`}>
          <div>
            <h4 className="text-lg font-extrabold text-slate-900">Bezpłatny</h4>
            <p className="text-slate-500 text-xs mt-1">Podstawowy profil firmy</p>
            <p className="text-3xl font-black text-slate-900 mt-4">0 zł <span className="text-xs text-slate-400 font-bold">/ mies.</span></p>
            
            <ul className="space-y-3 mt-6 text-xs text-slate-600 font-bold">
              <li className="flex items-center gap-2">✓ Podstawowy profil</li>
              <li className="flex items-center gap-2 text-slate-400">✗ Priorytet w wynikach (+0%)</li>
              <li className="flex items-center gap-2 text-slate-400">✗ Oznaczony jako sponsorowany</li>
            </ul>
          </div>
          <button 
            disabled={current === 'free'}
            onClick={() => onUpgrade('free')}
            className={`w-full mt-8 py-2.5 rounded-xl text-xs font-black transition-colors ${
              current === 'free' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
            }`}
          >
            {current === 'free' ? 'Aktualny pakiet' : 'Wybierz pakiet'}
          </button>
        </div>

        {/* Silver tier */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
          current === 'silver' ? 'border-slate-900 ring-2 ring-slate-950/10' : 'border-slate-200'
        }`}>
          <div>
            <h4 className="text-lg font-extrabold text-slate-900">Srebrny</h4>
            <p className="text-slate-500 text-xs mt-1">Lekki dopalacz pozycji</p>
            <p className="text-3xl font-black text-slate-900 mt-4">49 zł <span className="text-xs text-slate-400 font-bold">/ mies.</span></p>
            
            <ul className="space-y-3 mt-6 text-xs text-slate-600 font-bold">
              <li className="flex items-center gap-2">✓ Rozbudowany cennik</li>
              <li className="flex items-center gap-2">✓ Priorytet w wynikach (+5%)</li>
              <li className="flex items-center gap-2 text-slate-400">✗ Oznaczony jako sponsorowany</li>
            </ul>
          </div>
          <button 
            disabled={current === 'silver'}
            onClick={() => onUpgrade('silver')}
            className={`w-full mt-8 py-2.5 rounded-xl text-xs font-black transition-colors ${
              current === 'silver' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
            }`}
          >
            {current === 'silver' ? 'Aktualny pakiet' : 'Wybierz pakiet'}
          </button>
        </div>

        {/* Gold tier */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
          current === 'gold' ? 'border-slate-900 ring-2 ring-slate-950/10' : 'border-slate-200'
        }`}>
          <div>
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-extrabold text-slate-900">Złoty</h4>
              <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Popularny</span>
            </div>
            <p className="text-slate-500 text-xs mt-1">Świetna lokalna widoczność</p>
            <p className="text-3xl font-black text-slate-900 mt-4">99 zł <span className="text-xs text-slate-400 font-bold">/ mies.</span></p>
            
            <ul className="space-y-3 mt-6 text-xs text-slate-600 font-bold">
              <li className="flex items-center gap-2">✓ Kompletny profil (galeria)</li>
              <li className="flex items-center gap-2">✓ Priorytet w wynikach (+10%)</li>
              <li className="flex items-center gap-2">✓ Oznaczenie jako Sponsorowany</li>
            </ul>
          </div>
          <button 
            disabled={current === 'gold'}
            onClick={() => onUpgrade('gold')}
            className={`w-full mt-8 py-2.5 rounded-xl text-xs font-black transition-colors ${
              current === 'gold' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg shadow-blue-600/10'
            }`}
          >
            {current === 'gold' ? 'Aktualny pakiet' : 'Wybierz pakiet'}
          </button>
        </div>

        {/* Platinum tier */}
        <div className={`p-6 rounded-3xl border relative flex flex-col justify-between overflow-hidden ${
          current === 'platinum' ? 'border-blue-600 ring-2 ring-blue-500/10' : 'border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl">
            Max Boost
          </div>
          <div>
            <h4 className="text-lg font-extrabold text-slate-900">Platynowy</h4>
            <p className="text-slate-500 text-xs mt-1">Maksymalna lokalna widoczność</p>
            <p className="text-3xl font-black text-slate-900 mt-4">199 zł <span className="text-xs text-slate-400 font-bold">/ mies.</span></p>
            
            <ul className="space-y-3 mt-6 text-xs text-slate-600 font-bold">
              <li className="flex items-center gap-2">✓ Pełen profil + VIP wyróżnienie</li>
              <li className="flex items-center gap-2">✓ Maksymalny priorytet (+15%)</li>
              <li className="flex items-center gap-2">✓ Sponsorowany + top banery</li>
            </ul>
          </div>
          <button 
            disabled={current === 'platinum'}
            onClick={() => onUpgrade('platinum')}
            className={`w-full mt-8 py-2.5 rounded-xl text-xs font-black transition-colors ${
              current === 'platinum' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg shadow-blue-600/10'
            }`}
          >
            {current === 'platinum' ? 'Aktualny pakiet' : 'Wybierz pakiet'}
          </button>
        </div>
      </div>
    </div>
  );
}

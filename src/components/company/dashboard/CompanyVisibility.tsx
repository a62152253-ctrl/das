import React from 'react';
import { Company } from "@/types";
import { Award, CheckCircle, Zap, Crown, Sparkles } from 'lucide-react';

interface Props {
  company: Company;
  onUpgrade: (tier: 'free' | 'silver' | 'gold' | 'platinum') => void;
}

export function CompanyVisibility({ company, onUpgrade }: Props) {
  const current = company.visibilityPackage || 'free';

  return (
    <div className="font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Pakiety widoczności</h3>
          <p className="text-slate-500 font-medium text-xs mt-0.5">Wybierz pakiet widoczności i zdominuj lokalny ranking pozycjonowania AI.</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100/50">
          <Zap className="w-3.5 h-3.5" />
          <span>Wyszukiwanie AI</span>
        </span>
      </div>

      {/* Active Boost Live Status Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-[#181822] to-slate-950 text-white rounded-2xl p-6 mb-8 border border-white/[0.05] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">Aktualny status pozycjonowania</span>
              <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">Aktywny</span>
            </div>
            <h4 className="text-base font-bold tracking-tight text-white mt-1">
              {current === 'platinum' && '🚀 Pakiet PLATYNOWY: Pozycja #1 TOP SPONSOROWANE'}
              {current === 'gold' && '⭐ Pakiet ZŁOTY: Wyróżniona pozycja TOP 3'}
              {current === 'silver' && '⚡ Pakiet SREBRNY: Podwyższona widoczność (+50 pkt)'}
              {current === 'free' && '⚙️ Pakiet BEZPŁATNY: Podstawowe pozycjonowanie w wynikach'}
            </h4>
            <p className="text-slate-400 text-xs mt-0.5">
              Twoja wizytówka ma przypisane dodatkowe punkty (+{current === 'platinum' ? '500' : current === 'gold' ? '150' : current === 'silver' ? '50' : '0'} pkt w algorytmie wyszukiwarki).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Free tier */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
          current === 'free' ? 'border-slate-800 ring-1 ring-slate-900 bg-slate-50/40 shadow-xs' : 'border-slate-200 bg-white'
        }`}>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Standard</span>
            <h4 className="text-base font-bold text-slate-900">Bezpłatny</h4>
            <p className="text-slate-500 text-xs mt-0.5">Podstawowa wizytówka</p>
            <p className="text-2xl font-black text-slate-900 mt-4">0 zł <span className="text-xs text-slate-400 font-bold">/ mies.</span></p>
            
            <ul className="space-y-2.5 mt-6 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Podstawowy profil firmy</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-4 text-center font-bold text-slate-400">×</span>
                <span>Brak priorytetu w wynikach</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-4 text-center font-bold text-slate-400">×</span>
                <span>Oznaczenie Sponsorowane</span>
              </li>
            </ul>
          </div>
          <button 
            disabled={current === 'free'}
            onClick={() => onUpgrade('free')}
            className={`w-full mt-8 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              current === 'free' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {current === 'free' ? 'Aktualny pakiet' : 'Wybierz pakiet'}
          </button>
        </div>

        {/* Silver tier */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
          current === 'silver' ? 'border-slate-800 ring-1 ring-slate-900 bg-slate-50/40 shadow-xs' : 'border-slate-200 bg-white'
        }`}>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Standard+</span>
            <h4 className="text-base font-bold text-slate-900">Srebrny</h4>
            <p className="text-slate-500 text-xs mt-0.5">Podniesienie pozycji</p>
            <p className="text-2xl font-black text-slate-900 mt-4">49 zł <span className="text-xs text-slate-400 font-bold">/ mies.</span></p>
            
            <ul className="space-y-2.5 mt-6 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Rozbudowany cennik usług</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Priorytet w wynikach (+5%)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-4 text-center font-bold text-slate-400">×</span>
                <span>Oznaczenie Sponsorowane</span>
              </li>
            </ul>
          </div>
          <button 
            disabled={current === 'silver'}
            onClick={() => onUpgrade('silver')}
            className={`w-full mt-8 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              current === 'silver' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {current === 'silver' ? 'Aktualny pakiet' : 'Wybierz pakiet'}
          </button>
        </div>

        {/* Gold tier */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
          current === 'gold' ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50/10 shadow-xs' : 'border-slate-200 bg-white'
        }`}>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600">Polecany</span>
              <span className="bg-amber-100/60 text-amber-800 text-[8px] font-bold uppercase px-2 py-0.5 rounded leading-none border border-amber-200/40">Popularny</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>Złoty</span>
              <Award className="w-4 h-4 text-amber-550" />
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">Wysoka lokalna widoczność</p>
            <p className="text-2xl font-black text-slate-900 mt-4">99 zł <span className="text-xs text-slate-400 font-bold">/ mies.</span></p>
            
            <ul className="space-y-2.5 mt-6 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Kompletny profil z galerią</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Priorytet w wynikach (+10%)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Odznaka "Sponsorowane"</span>
              </li>
            </ul>
          </div>
          <button 
            disabled={current === 'gold'}
            onClick={() => onUpgrade('gold')}
            className={`w-full mt-8 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              current === 'gold' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50' 
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
            }`}
          >
            {current === 'gold' ? 'Aktualny pakiet' : 'Wybierz pakiet'}
          </button>
        </div>

        {/* Platinum tier */}
        <div className={`p-6 rounded-2xl border relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg ${
          current === 'platinum' ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/10 shadow-xs glow-indigo' : 'border-slate-200 bg-white'
        }`}>
          <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[8px] font-bold uppercase px-3 py-1 rounded-bl-xl shadow-xs">
            Max AI Boost
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">VIP Premium</span>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>Platynowy</span>
              <Crown className="w-4 h-4 text-indigo-600" />
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">Maksymalny priorytet</p>
            <p className="text-2xl font-black text-slate-900 mt-4">199 zł <span className="text-xs text-slate-400 font-bold">/ mies.</span></p>
            
            <ul className="space-y-2.5 mt-6 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Pełny profil VIP + Top Galeria</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Maksymalny priorytet AI (+15%)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Baner na stronie głównej</span>
              </li>
            </ul>
          </div>
          <button 
            disabled={current === 'platinum'}
            onClick={() => onUpgrade('platinum')}
            className={`w-full mt-8 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              current === 'platinum' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-650 text-white hover:opacity-95 shadow-md shadow-indigo-600/10'
            }`}
          >
            {current === 'platinum' ? 'Aktualny pakiet' : 'Wybierz pakiet'}
          </button>
        </div>
      </div>
    </div>
  );
}


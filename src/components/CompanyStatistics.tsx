import React from 'react';
import { Company } from '../types';
import { Eye, PhoneCall, Globe, MessageSquare, Star, Sparkles, TrendingUp, Users } from 'lucide-react';

interface Props {
  company: Company;
}

export function CompanyStatistics({ company }: Props) {
  return (
    <div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Analityka obecności lokalnej</h3>
      
      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Wyświetlenia wizytówki</span>
            <Eye className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-950">2,548</p>
          <span className="text-[10px] font-bold text-emerald-600">+14.5% w tym tyg.</span>
        </div>

        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Zapytania wyszukiwarki</span>
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-950">846</p>
          <span className="text-[10px] font-bold text-emerald-600">+5.2% w tym tyg.</span>
        </div>

        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Kliknięcia w telefon</span>
            <PhoneCall className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-950">53</p>
          <span className="text-[10px] font-bold text-emerald-600">+8.3% w tym tyg.</span>
        </div>

        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Wiadomości czatu</span>
            <MessageSquare className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-slate-950">17</p>
          <span className="text-[10px] font-bold text-emerald-600">+12% w tym tyg.</span>
        </div>
      </div>

      {/* Extra counts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
        <div>
          <h4 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span>Popularne słowa kluczowe</span>
          </h4>
          <div className="space-y-3 max-w-md">
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-700">1. fryzjer damski gniezno</span>
              <span className="text-sm font-extrabold text-slate-900">420 wyszukiwań</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-700">2. strzyżenie męskie combo</span>
              <span className="text-sm font-extrabold text-slate-900">280 wyszukiwań</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-700">3. barber shop Rynek</span>
              <span className="text-sm font-extrabold text-slate-900">115 wyszukiwań</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Skuteczność pakietu widoczności</span>
          </h4>
          <div className="p-6 bg-blue-50/20 border border-blue-150 rounded-2xl space-y-3">
            <p className="text-sm font-bold text-slate-700">Aktualny pakiet: <span className="text-blue-600 font-extrabold">{(company.visibilityPackage || 'free').toUpperCase()}</span></p>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Twój pakiet daje Ci dodatkowe **{company.visibilityPackage === 'platinum' ? '15%' : company.visibilityPackage === 'gold' ? '10%' : company.visibilityPackage === 'silver' ? '5%' : '0%'}** punktów do pozycji w rankingu wyszukiwarki. Uzupełnienie godzin otwarcia podniesie Twój wynik o kolejne 15%!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

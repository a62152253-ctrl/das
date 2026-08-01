import React from 'react';
import { Company, Statistics } from '../types';
import { Eye, PhoneCall, MessageSquare, Star, Sparkles, TrendingUp, Users, CheckCircle2, AlertCircle, ArrowUpRight, Award } from 'lucide-react';

interface Props {
  company: Company;
  stats: Statistics | null;
}

export function CompanyStatistics({ company, stats }: Props) {
  const views = stats?.views ?? 0;
  const searches = stats?.searches ?? 0;
  const phones = stats?.phones ?? 0;
  const messages = stats?.messages ?? 0;

  // Profile Completeness Score Calculation
  const completenessItems = [
    { label: 'Nazwa i miasto', done: !!(company.companyName && company.city) },
    { label: 'Numer telefonu', done: !!company.phone },
    { label: 'Opis działalności (>30 znaków)', done: !!(company.description && company.description.length >= 30) },
    { label: 'Zdjęcie główne / logo', done: !!(company.logo || company.mainPhoto) },
    { label: 'Dodane social media (IG, FB, TikTok)', done: !!(company.instagram || company.facebook || company.tiktok) },
    { label: 'Godziny otwarcia', done: !!(company.openingHours && Object.keys(company.openingHours).length > 0) },
    { label: 'Certyfikaty', done: !!(company.certificates && company.certificates.length > 0) }
  ];
  const completedCount = completenessItems.filter(i => i.done).length;
  const scorePercent = Math.round((completedCount / completenessItems.length) * 100);

  // Dynamic Keywords based on Company Services & Name
  const keywordsList = company.services
    ? company.services.split(',').map(s => s.trim()).filter(Boolean).slice(0, 4)
    : [company.companyName, `${company.companyName} ${company.city || 'Gniezno'}`];

  // SVG parameters for circle progress
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const strokeOffset = circ - (scorePercent / 100) * circ;

  return (
    <div className="space-y-10 font-sans">
      {/* Top Welcome / Overview banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Witaj w panelu statystyk</h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Pozycjonowanie Twojej wizytówki w lokalnej wyszukiwarce LOKALNIE PRO.
          </p>
        </div>

        {/* Circular Progress Completeness Badge */}
        <div className="flex items-center gap-4 bg-slate-50/70 border border-slate-200/50 p-4 rounded-xl shadow-xs">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-slate-200 fill-none"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-indigo-600 fill-none transition-all duration-500 ease-out"
                strokeWidth="4"
                strokeDasharray={circ}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-extrabold text-slate-900">{scorePercent}%</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Wypełnienie wizytówki</span>
            <span className="text-[10px] font-semibold text-indigo-600">{completedCount} z {completenessItems.length} uzupełnionych sekcji</span>
          </div>
        </div>
      </div>
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Wyświetlenia wizytówki', val: views, change: '+14.5%', icon: Eye, color: 'text-blue-500 bg-blue-50 border-blue-100' },
          { label: 'Zapytania w wyszukiwarce', val: searches, change: '+5.2%', icon: Users, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
          { label: 'Wybrane numery tel.', val: phones, change: '+8.3%', icon: PhoneCall, color: 'text-amber-500 bg-amber-50 border-amber-100' },
          { label: 'Rozpoczęte czaty', val: messages, change: '+12%', icon: MessageSquare, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-6 bg-white border border-slate-200/60 rounded-xl hover:shadow-md hover:border-slate-300/60 transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</span>
              <div className={`p-2 rounded-lg border ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{kpi.val.toLocaleString('pl-PL')}</p>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid of Keywords and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
        
        {/* Słowa kluczowe */}
        <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-6">
          <h4 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span>Najpopularniejsze słowa kluczowe</span>
          </h4>
          <p className="text-[11px] font-medium text-slate-500 mb-4">
            Frazy, na które Twoja firma wyświetla się lokalnie. Używaj ich w opisach usług, aby wzmocnić pozycję.
          </p>
          <div className="space-y-2">
            {keywordsList.map((kw, index) => (
              <div key={index} className="flex justify-between items-center py-2.5 px-4 bg-white rounded-xl border border-slate-200/40 shadow-2xs">
                <span className="text-xs font-semibold text-slate-800">{index + 1}. {kw} ({company.city || 'Gniezno'})</span>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded">Wysoki CTR</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rekomendacje algorytmu */}
        <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-6">
          <h4 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Zalecenia podnoszące pozycję AI</span>
          </h4>
          <p className="text-[11px] font-medium text-slate-500 mb-4">
            Algorytm ocenia kompletność wizytówki. Każda zaznaczona funkcja podnosi szansę na rekomendację.
          </p>
          <div className="space-y-2">
            {completenessItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-slate-200/20 bg-white shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className={`text-xs font-semibold truncate ${item.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {item.label}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded leading-none shrink-0 ${
                  item.done ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 border border-indigo-100/50'
                }`}>
                  {item.done ? 'Gotowe' : '+15 pkt AI'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

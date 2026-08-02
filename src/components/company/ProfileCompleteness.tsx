import React from 'react';
import { Company } from '@/types';
import { calculateProfileCompleteness } from '@/lib/RankingEngine';
import { CheckCircle2, XCircle, Award } from 'lucide-react';

interface ProfileCompletenessProps {
  company: Company;
  onNavigateToEdit?: () => void;
}

export const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({ company, onNavigateToEdit }) => {
  // calculateProfileCompleteness returns 0-20 score, so percentage = (score / 20) * 100
  const score20 = calculateProfileCompleteness(company);
  const percentage = Math.min(100, Math.round((score20 / 20) * 100));

  const checklist = [
    { label: 'Zdjęcie główne i logo', completed: !!(company.logo || company.mainPhoto) },
    { label: 'Opis działalności i rok założenia', completed: !!(company.description && company.description.length > 20) },
    { label: 'Usługi i cennik', completed: !!(company.services && company.services.length > 5) },
    { label: 'Godziny otwarcia', completed: !!(company.openingHours && Object.keys(company.openingHours).length > 0) },
    { label: 'Pytania i Odpowiedzi (FAQ)', completed: !!(company.faqs && company.faqs.length > 0) },
    { label: 'Social Media (Instagram/FB/TikTok/WWW)', completed: !!(company.instagram || company.facebook || company.tiktok || company.website) },
    { label: 'Galeria zdjęć realizacji', completed: !!(company.gallery && company.gallery.length > 0) },
    { label: 'Włączenie rezerwacji wizyt online', completed: !!company.bookingEnabled }
  ];

  const getBarColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Wskaźnik Uzupełnienia Profilu</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Kompletne profile otrzymują wyższą pozycję w wyszukiwarce</p>
          </div>
        </div>
        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(percentage)}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {checklist.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 py-1">
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <span className={item.completed ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400 dark:text-slate-500 line-through'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {percentage < 100 && onNavigateToEdit && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-right">
          <button
            onClick={onNavigateToEdit}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            Uzupełnij brakujące dane profilu &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

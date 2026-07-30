import React from 'react';
import { SearchResultItem } from '../lib/RankingEngine';
import { Star, MapPin, Tag, Briefcase, FileText, Phone, ExternalLink, Calendar } from 'lucide-react';

interface Props {
  results: SearchResultItem[];
  onSelectCompany: (companyId: string) => void;
  onContactCompany: (companyId: string, companyName: string) => void;
}

export function SearchResults({ results, onSelectCompany, onContactCompany }: Props) {
  if (results.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-xl mx-auto">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
          <MapPin className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Brak dopasowanych ofert</h3>
        <p className="text-slate-500 font-medium leading-relaxed">
          Spróbuj wpisać inne zapytanie lub zmień lokalizację. Nasz algorytm dopasowuje wyniki na podstawie odległości, trafności oraz ocen klientów.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result) => {
        const isSponsored = result.isSponsored;

        return (
          <div 
            key={result.id}
            className={`bg-white rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row hover:shadow-xl ${
              isSponsored 
                ? 'border-blue-500 shadow-md shadow-blue-500/5 bg-gradient-to-br from-blue-50/20 to-white' 
                : 'border-slate-200 shadow-sm'
            }`}
          >
            {/* Sponsored Indicator Ribbon */}
            {isSponsored && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-xl z-10">
                Sponsorowane
              </div>
            )}

            {/* Thumbnail / Visual */}
            <div className="w-full md:w-48 h-40 md:h-auto bg-slate-100 shrink-0 relative overflow-hidden flex items-center justify-center">
              {result.type === 'company' && result.item.mainPhoto ? (
                <img 
                  src={result.item.mainPhoto} 
                  alt={result.title} 
                  className="w-full h-full object-cover"
                />
              ) : result.type === 'company' && result.item.logo ? (
                <img 
                  src={result.item.logo} 
                  alt={result.title} 
                  className="w-20 h-20 object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                  {result.type === 'service' && <Briefcase className="w-10 h-10 mb-2 text-blue-500/70" />}
                  {result.type === 'ad' && <FileText className="w-10 h-10 mb-2 text-emerald-500/70" />}
                  {result.type === 'promotion' && <Tag className="w-10 h-10 mb-2 text-amber-500/70" />}
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{result.badgeText}</span>
                </div>
              )}
            </div>

            {/* Content info */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    result.type === 'service' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    result.type === 'ad' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    result.type === 'promotion' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {result.badgeText}
                  </span>
                  {result.distance !== undefined && (
                    <span className="text-slate-500 text-sm font-bold flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                      {result.distance.toFixed(1)} km stąd ({result.city})
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2 hover:text-blue-600 transition-colors">
                  {result.title}
                </h3>

                {result.type !== 'company' && (
                  <button 
                    onClick={() => onSelectCompany(result.companyId)}
                    className="text-sm font-bold text-slate-500 hover:text-blue-600 mb-3 block"
                  >
                    Oferowane przez: <span className="underline">{result.companyName}</span>
                  </button>
                )}

                <p className="text-slate-600 text-sm leading-relaxed font-medium line-clamp-2 mb-4">
                  {result.description}
                </p>
              </div>

              {/* Price / Discount / Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-4">
                  {result.price !== undefined && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cena</span>
                      <span className="text-2xl font-black text-slate-900">{result.price} zł</span>
                    </div>
                  )}
                  {result.discount !== undefined && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Zniżka</span>
                      <span className="px-3 py-1 bg-red-50 text-red-600 rounded-xl text-xl font-black border border-red-100">{result.discount}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ocena firmy</span>
                    <div className="flex items-center text-amber-500 font-bold gap-1 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span>{result.rating.toFixed(1)}</span>
                      <span className="text-slate-400 text-xs font-medium">({result.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onContactCompany(result.companyId, result.companyName)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Zapytaj
                  </button>
                  <button 
                    onClick={() => onSelectCompany(result.companyId)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Zobacz profil</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

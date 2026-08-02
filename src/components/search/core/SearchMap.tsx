import React, { useState } from 'react';
import { SearchResultItem } from '@/lib/RankingEngine';
import { MapPin, Navigation, Star, X } from 'lucide-react';

interface Props {
  results: SearchResultItem[];
  onSelectCompany: (companyId: string) => void;
}

export function SearchMap({ results, onSelectCompany }: Props) {
  const [selectedPin, setSelectedPin] = useState<SearchResultItem | null>(null);

  // Filter to entries that actually have location information
  const mapResults = results.filter(r => r.distance !== undefined);

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative h-[500px] flex flex-col glow-blue">
      {/* Map Header */}
      <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800 z-10">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-500 animate-pulse" />
          <h3 className="font-bold text-white text-sm">Mapa Lokalna (Gniezno)</h3>
        </div>
        <span className="text-xs font-bold text-slate-500">{mapResults.length} punktów na mapie</span>
      </div>

      {/* Grid Canvas acting as a simulated geographic map */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] flex items-center justify-center">
        {/* Custom mock elements on the map representing main streets of Gniezno */}
        <div className="absolute inset-0 opacity-10 flex flex-col justify-around pointer-events-none p-10 select-none">
          <div className="h-px bg-white w-full border-dashed" />
          <div className="h-px bg-white w-full border-dashed" />
          <div className="w-px bg-white h-full border-dashed absolute left-1/3" />
          <div className="w-px bg-white h-full border-dashed absolute left-2/3" />
        </div>

        {/* Central landmark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-850/50 border border-slate-800 px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 tracking-widest uppercase select-none">
          Centrum Miasta
        </div>

        {/* Dynamic Pins */}
        {mapResults.map((res, index) => {
          // Compute mock X/Y coordinates based on lat/lng offsets from Gniezno center (approx 52.5360, 17.5950)
          const latDiff = res.item.lat ? (res.item.lat - 52.5360) : 0;
          const lngDiff = res.item.lng ? (res.item.lng - 17.5950) : 0;

          // Scale difference to fit within container percentages
          // Bounds: max lat offset ~0.02, max lng offset ~0.02
          const topPercent = 50 - (latDiff * 1500); // Inverse Y for latitude
          const leftPercent = 50 + (lngDiff * 1500);

          const left = Math.max(10, Math.min(90, leftPercent));
          const top = Math.max(10, Math.min(90, topPercent));

          return (
            <button
              key={res.id}
              onClick={() => setSelectedPin(res)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer focus:outline-none"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <div className="relative">
                {/* Pin element */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border transition-all ${
                  selectedPin?.id === res.id 
                    ? 'bg-blue-600 border-white scale-125' 
                    : res.isSponsored 
                      ? 'bg-blue-500/20 border-blue-400 text-blue-400 hover:scale-110' 
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:scale-110'
                }`}>
                  <MapPin className={`w-4 h-4 ${selectedPin?.id === res.id ? 'text-white' : 'text-current'}`} />
                </div>

                {/* Hover label */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 border border-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {res.title}
                </div>
              </div>
            </button>
          );
        })}

        {/* Selected Card Popup */}
        {selectedPin && (
          <div className="absolute bottom-6 left-6 right-6 bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-start justify-between shadow-2xl animate-in slide-in-from-bottom-4 duration-200 z-30">
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                {selectedPin.badgeText}
              </span>
              <h4 className="text-white font-extrabold text-base tracking-tight mt-2">{selectedPin.title}</h4>
              <p className="text-slate-400 text-xs mt-1 font-medium">{selectedPin.address}, {selectedPin.city}</p>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center text-amber-400 font-bold text-xs gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{selectedPin.rating}</span>
                </div>
                {selectedPin.distance !== undefined && (
                  <span className="text-slate-500 text-xs font-semibold">
                    {selectedPin.distance.toFixed(1)} km stąd
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
              <button 
                onClick={() => setSelectedPin(null)}
                className="p-1 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelectCompany(selectedPin.companyId)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Szczegóły
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

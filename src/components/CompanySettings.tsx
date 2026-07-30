import React from 'react';
import { Company } from '../types';

interface Props {
  company: Company;
  onChange: (updated: Company) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CompanySettings({ company, onChange, onSubmit }: Props) {
  const handleHoursChange = (day: string, value: string) => {
    const openingHours = { ...company.openingHours, [day]: value };
    onChange({ ...company, openingHours });
  };

  const daysOfWeek = ['Poniedziałek - Piątek', 'Sobota', 'Niedziela'];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h3 className="text-xl font-extrabold text-slate-900 mb-4">Ustawienia wizytówki i konta</h3>
      
      {/* Geolocation Coordinate Settings */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
        <h4 className="font-extrabold text-slate-900 text-sm">Współrzędne geograficzne (Pozycja na mapie)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Szerokość geograficzna (Lat)</label>
            <input 
              type="number"
              step="any"
              value={company.lat}
              onChange={(e) => onChange({ ...company, lat: parseFloat(e.target.value) || 52.5360 })}
              className="w-full p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Długość geograficzna (Lng)</label>
            <input 
              type="number"
              step="any"
              value={company.lng}
              onChange={(e) => onChange({ ...company, lng: parseFloat(e.target.value) || 17.5950 })}
              className="w-full p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Opening Hours Settings */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
        <h4 className="font-extrabold text-slate-900 text-sm">Godziny otwarcia</h4>
        <div className="space-y-3">
          {daysOfWeek.map(day => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">{day}</span>
              <input 
                type="text"
                value={company.openingHours?.[day] || 'Zamknięte'}
                onChange={(e) => handleHoursChange(day, e.target.value)}
                className="p-2.5 border border-slate-200 bg-white rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 w-full sm:w-60 text-slate-800"
                placeholder="np. 08:00 - 16:00"
              />
            </div>
          ))}
        </div>
      </div>

      <button 
        type="submit" 
        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
      >
        Zapisz konfigurację
      </button>
    </form>
  );
}

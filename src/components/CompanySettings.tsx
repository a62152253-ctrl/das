import React from 'react';
import { Company } from '../types';
import { MapPin, Globe, Compass, Clock, Save, Info } from 'lucide-react';

interface Props {
  company: Company;
  onChange: (updated: Company) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const DAYS_OF_WEEK = [
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
  'Niedziela'
];

export function CompanySettings({ company, onChange, onSubmit }: Props) {
  const handleHoursChange = (day: string, value: string) => {
    const openingHours = { ...company.openingHours, [day]: value };
    onChange({ ...company, openingHours });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Konfiguracja i pozycjonowanie mapy</h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Skonfiguruj współrzędne geograficzne i godziny pracy wyświetlane na mapie.</p>
        </div>
      </div>
      
      {/* Geolocation Coordinate Settings */}
      <div className="bg-slate-50/50 border border-slate-200/50 p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
            <Compass className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Współrzędne geograficzne (Pozycja na mapie)</h4>
            <p className="text-[11px] font-medium text-slate-500">Określ pozycję markera firmy na mapie wyszukiwania w mieście {company.city || 'Gniezno'}.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="notion-label">Szerokość geograficzna (Latitude)</label>
            <input 
              type="number"
              step="any"
              value={company.lat}
              onChange={(e) => onChange({ ...company, lat: parseFloat(e.target.value) || 52.5360 })}
              className="notion-input bg-white border border-slate-200"
            />
          </div>
          <div>
            <label className="notion-label">Długość geograficzna (Longitude)</label>
            <input 
              type="number"
              step="any"
              value={company.lng}
              onChange={(e) => onChange({ ...company, lng: parseFloat(e.target.value) || 17.5950 })}
              className="notion-input bg-white border border-slate-200"
            />
          </div>
        </div>

        <div className="p-3 bg-amber-50/55 rounded-xl border border-amber-100/50 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-800 leading-relaxed font-semibold">
            Marker Twojej firmy zostanie automatycznie umieszczony na interaktywnej mapie. Wprowadź precyzyjne współrzędne z Google Maps, aby klienci bez problemu znaleźli Twój lokal.
          </p>
        </div>
      </div>

      {/* Opening Hours Settings */}
      <div className="bg-slate-50/50 border border-slate-200/50 p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Szczegółowe godziny otwarcia</h4>
            <p className="text-[11px] font-medium text-slate-500">Skonfiguruj godziny pracy dla każdego dnia tygodnia.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 pt-2 max-w-xl">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
              <span className="text-xs font-semibold text-slate-700 w-28">{day}</span>
              <input 
                type="text"
                value={company.openingHours?.[day] || ''}
                onChange={(e) => handleHoursChange(day, e.target.value)}
                className="notion-input bg-white border border-slate-200 w-full sm:w-64"
                placeholder="np. 08:00 - 16:00 lub Zamknięte"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all cursor-pointer text-xs"
        >
          <Save className="w-4 h-4" />
          Zapisz konfigurację
        </button>
      </div>
    </form>
  );
}

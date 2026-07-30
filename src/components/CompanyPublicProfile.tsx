import React, { useState, useEffect } from 'react';
import { MapPin, Star, Building2, Phone, Mail, Globe, Loader2 } from 'lucide-react';
import { Company } from '../types';
import { fetchSearchData } from '../lib/SearchEngine';

interface Props {
  companyId: string;
  onBack: () => void;
  onContact: (companyId: string, companyName: string) => void;
}

export function CompanyPublicProfile({ companyId, onBack, onContact }: Props) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompany() {
      try {
        const { companies } = await fetchSearchData();
        const found = companies.find(c => c.uid === companyId);
        if (found) {
          setCompany(found);
        }
      } catch (err) {
        console.error("Error loading company profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadCompany();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Nie znaleziono firmy</h2>
        <button onClick={onBack} className="text-blue-600 hover:underline">Wróć do wyników</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button 
        onClick={onBack}
        className="mb-6 font-bold text-sm text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
      >
        ← Powrót
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main panel info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-blue-700 to-indigo-800 relative">
              {company.mainPhoto && (
                <img 
                  src={company.mainPhoto} 
                  alt={company.companyName} 
                  className="w-full h-full object-cover opacity-60"
                />
              )}
            </div>

            <div className="px-6 md:px-8 pb-10 relative">
              <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-xl absolute -top-12 border border-slate-100 flex items-center justify-center">
                <div className="w-full h-full bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center">
                  {company.logo ? (
                    <img src={company.logo} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-10 h-10 text-slate-400" />
                  )}
                </div>
              </div>

              <div className="pt-16">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{company.companyName}</h2>
                    <p className="text-slate-500 font-bold flex items-center mt-2">
                      <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                      {company.address}, {company.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 text-sm font-bold self-start">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{company.rating} ({company.reviewCount} opinii)</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">O firmie</h3>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {company.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery */}
          {company.gallery && company.gallery.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 mb-4">Galeria realizacji</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {company.gallery.map((img, idx) => (
                  <div key={idx} className="h-32 bg-slate-100 rounded-2xl overflow-hidden shadow-sm hover:scale-[1.02] transition-transform">
                    <img src={img} alt="realizacja" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services cennik list */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6">Usługi i Cennik</h3>
            <div className="space-y-4">
              {company.services.split(',').filter(Boolean).map((serv, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    <span className="font-bold text-slate-800">{serv.trim()}</span>
                  </div>
                </div>
              ))}
              {(!company.services || company.services.trim() === '') && (
                <p className="text-slate-500 text-sm">Ta firma nie dodała jeszcze cennika.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">Kontakt i lokalizacja</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Telefon</span>
                  <span className="font-bold text-slate-800">{company.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">E-mail</span>
                  <span className="font-bold text-slate-800">{company.email}</span>
                </div>
              </div>

              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Strona WWW</span>
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => onContact(company.uid, company.companyName)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/10 transition-colors cursor-pointer text-sm"
            >
              Napisz wiadomość
            </button>
          </div>

          {/* Hours */}
          {company.openingHours && Object.keys(company.openingHours).length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 mb-4">Godziny otwarcia</h3>
              <div className="space-y-2">
                {Object.entries(company.openingHours).map(([days, hours]) => (
                  <div key={days} className="flex justify-between text-sm font-medium text-slate-600">
                    <span>{days}</span>
                    <span className="font-bold text-slate-800">{hours as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

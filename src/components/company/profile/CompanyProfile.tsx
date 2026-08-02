import React, { useState } from 'react';
import { Company } from '../../../types';
import { Building2, Globe, Phone, Mail, Link as LinkIcon, Plus, Trash2, ShieldCheck, Clock, Share2, HelpCircle, Heart, CreditCard, Landmark, CheckCircle } from 'lucide-react';

interface Props {
  company: Company;
  onChange: (updated: Company) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'Darmowe Wi-Fi' },
  { id: 'parking', label: 'Prywatny parking' },
  { id: 'aircon', label: 'Klimatyzacja' },
  { id: 'disabled', label: 'Dostęp dla niepełnosprawnych' },
  { id: 'kids', label: 'Przyjazny dzieciom / Strefa zabaw' },
  { id: 'coffee', label: 'Darmowa kawa / herbata' }
];

const PAYMENT_OPTIONS = [
  { id: 'cash', label: 'Gotówka' },
  { id: 'card', label: 'Karta płatnicza' },
  { id: 'blik', label: 'BLIK' },
  { id: 'transfer', label: 'Przelew bankowy' }
];

const LANGUAGE_OPTIONS = [
  { id: 'pl', label: 'Polski' },
  { id: 'en', label: 'Angielski' },
  { id: 'de', label: 'Niemiecki' },
  { id: 'ua', label: 'Ukraiński' }
];

export function CompanyProfile({ company, onChange, onSubmit }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'hours' | 'socials' | 'features' | 'certs' | 'faq'>('basic');
  const [newCert, setNewCert] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  // Helpers for list manipulation
  const toggleArrayItem = (field: 'languages' | 'paymentMethods' | 'amenities', item: string) => {
    const currentList = company[field] || [];
    const updatedList = currentList.includes(item)
      ? currentList.filter(x => x !== item)
      : [...currentList, item];
    onChange({ ...company, [field]: updatedList });
  };

  const handleAddCertificate = () => {
    if (!newCert.trim()) return;
    const currentCerts = company.certificates || [];
    onChange({ ...company, certificates: [...currentCerts, newCert.trim()] });
    setNewCert('');
  };

  const handleRemoveCertificate = (index: number) => {
    const currentCerts = company.certificates || [];
    onChange({ ...company, certificates: currentCerts.filter((_, idx) => idx !== index) });
  };

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    const currentFaqs = company.faqs || [];
    onChange({
      ...company,
      faqs: [...currentFaqs, { question: newFaqQ.trim(), answer: newFaqA.trim() }]
    });
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleRemoveFaq = (index: number) => {
    const currentFaqs = company.faqs || [];
    onChange({ ...company, faqs: currentFaqs.filter((_, idx) => idx !== index) });
  };

  const handleOpeningHoursChange = (day: string, value: string) => {
    const currentHours = company.openingHours || {};
    onChange({
      ...company,
      openingHours: {
        ...currentHours,
        [day]: value
      }
    });
  };

  return (
    <div className="font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Profil Firmy</h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Uzupełnij wszystkie dane rejestracyjne oraz udogodnienia.</p>
        </div>
      </div>

      {/* Tabs for better organization */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl mb-8 overflow-x-auto max-w-max border border-slate-200/50">
        {(['basic', 'hours', 'socials', 'features', 'certs', 'faq'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveSubTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === tab 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab === 'basic' && 'Dane podstawowe'}
            {tab === 'hours' && 'Godziny otwarcia'}
            {tab === 'socials' && 'Social Media'}
            {tab === 'features' && 'Udogodnienia'}
            {tab === 'certs' && 'Certyfikaty'}
            {tab === 'faq' && 'FAQ'}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {activeSubTab === 'basic' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Dane rejestracyjne */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/30 border border-slate-200/50 p-6 rounded-2xl">
              <div className="md:col-span-2">
                <h4 className="font-bold text-slate-900 text-sm mb-1">Dane podstawowe</h4>
                <p className="text-[11px] font-medium text-slate-500">Oficjalne informacje o Twojej działalności gospodarczej.</p>
              </div>
              
              <div>
                <label className="notion-label">Nazwa firmy</label>
                <input 
                  type="text" 
                  value={company.companyName} 
                  onChange={(e) => onChange({ ...company, companyName: e.target.value })}
                  className="notion-input focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="notion-label">NIP</label>
                <input 
                  type="text" 
                  value={company.nip} 
                  onChange={(e) => onChange({ ...company, nip: e.target.value })}
                  className="notion-input focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="notion-label">Rok założenia</label>
                <input 
                  type="number" 
                  min="1900"
                  max={new Date().getFullYear()}
                  value={company.foundedYear || ''} 
                  onChange={(e) => onChange({ ...company, foundedYear: parseInt(e.target.value) || undefined })}
                  className="notion-input focus:bg-white"
                  placeholder="np. 2018"
                />
              </div>

              <div>
                <label className="notion-label">Telefon kontaktowy</label>
                <input 
                  type="text" 
                  value={company.phone} 
                  onChange={(e) => onChange({ ...company, phone: e.target.value })}
                  className="notion-input focus:bg-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="notion-label">Opis działalności</label>
                <textarea 
                  rows={4}
                  value={company.description} 
                  onChange={(e) => onChange({ ...company, description: e.target.value })}
                  className="notion-input focus:bg-white resize-y"
                  required
                />
              </div>
            </div>

            {/* Adres i Strona WWW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/30 border border-slate-200/50 p-6 rounded-2xl">
              <div className="md:col-span-2">
                <h4 className="font-bold text-slate-900 text-sm mb-1">Lokalizacja i strona internetowa</h4>
                <p className="text-[11px] font-medium text-slate-500">Adres fizyczny oraz odnośniki sieciowe.</p>
              </div>

              <div>
                <label className="notion-label">Adres</label>
                <input 
                  type="text" 
                  value={company.address} 
                  onChange={(e) => onChange({ ...company, address: e.target.value })}
                  className="notion-input focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="notion-label">Miasto</label>
                <input 
                  type="text" 
                  value={company.city} 
                  onChange={(e) => onChange({ ...company, city: e.target.value })}
                  className="notion-input focus:bg-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="notion-label">Strona WWW</label>
                <input 
                  type="text" 
                  value={company.website || ''} 
                  onChange={(e) => onChange({ ...company, website: e.target.value })}
                  className="notion-input focus:bg-white"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Rezerwacje online */}
            <div className="bg-slate-50/30 border border-slate-200/50 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 border border-indigo-150 rounded-lg">
                  <Clock className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-950 text-sm">System rezerwacji online</h4>
                  <p className="text-[11px] font-medium text-slate-500">Pozwól klientom zamawiać wizyty bezpośrednio z Twojego profilu.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <input
                  type="checkbox"
                  id="bookingEnabled"
                  checked={company.bookingEnabled || false}
                  onChange={(e) => onChange({ ...company, bookingEnabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="bookingEnabled" className="text-xs font-semibold text-slate-700 cursor-pointer">Włącz przycisk "Zarezerwuj online" na moim profilu</label>
              </div>

              {company.bookingEnabled && (
                <div className="mt-3 animate-fadeIn">
                  <label className="notion-label">Link do zewnętrznej rezerwacji (np. Booksy, Calendly)</label>
                  <input
                    type="text"
                    value={company.bookingUrl || ''}
                    onChange={(e) => onChange({ ...company, bookingUrl: e.target.value })}
                    className="notion-input focus:bg-white"
                    placeholder="https://booksy.com/pl-pl/..."
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'hours' && (
          <div className="bg-slate-50/30 border border-slate-200/50 p-6 rounded-2xl space-y-4 animate-fadeIn">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Godziny otwarcia</h4>
              <p className="text-[11px] font-medium text-slate-500 mb-6">Wpisz godziny pracy w formacie np. "08:00 - 16:00" lub "Zamknięte".</p>
            </div>

            {['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'].map(day => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0">
                <span className="text-xs font-semibold text-slate-750 w-28">{day}</span>
                <input
                  type="text"
                  placeholder="np. 08:00 - 16:00 lub Zamknięte"
                  value={company.openingHours?.[day] || ''}
                  onChange={(e) => handleOpeningHoursChange(day, e.target.value)}
                  className="notion-input focus:bg-white w-full sm:w-64"
                />
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'socials' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-50/30 border border-slate-200/50 p-6 rounded-2xl space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Media Społecznościowe</h4>
                <p className="text-[11px] font-medium text-slate-500">Odnośniki do kanałów social media.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="notion-label">Facebook URL</label>
                  <input
                    type="text"
                    value={company.facebook || ''}
                    onChange={(e) => onChange({ ...company, facebook: e.target.value })}
                    className="notion-input focus:bg-white"
                    placeholder="https://facebook.com/twoja_firma"
                  />
                </div>

                <div>
                  <label className="notion-label">Instagram URL</label>
                  <input
                    type="text"
                    value={company.instagram || ''}
                    onChange={(e) => onChange({ ...company, instagram: e.target.value })}
                    className="notion-input focus:bg-white"
                    placeholder="https://instagram.com/twoja_firma"
                  />
                </div>

                <div>
                  <label className="notion-label">TikTok URL</label>
                  <input
                    type="text"
                    value={company.tiktok || ''}
                    onChange={(e) => onChange({ ...company, tiktok: e.target.value })}
                    className="notion-input focus:bg-white"
                    placeholder="https://tiktok.com/@twoja_firma"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50/30 border border-slate-200/50 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 border border-red-100 rounded-lg">
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Zdjęcie zespołu</h4>
                  <p className="text-[11px] font-medium text-slate-500">Dodaj zdjęcie swoich pracowników, aby zbudować zaufanie klientów.</p>
                </div>
              </div>

              <div>
                <label className="notion-label">URL Zdjęcia zespołu</label>
                <input
                  type="text"
                  value={company.teamPhoto || ''}
                  onChange={(e) => onChange({ ...company, teamPhoto: e.target.value })}
                  className="notion-input focus:bg-white"
                  placeholder="https://images.unsplash.com/... lub inna grafika"
                />
              </div>
              {company.teamPhoto && (
                <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-50 relative mt-2 shadow-xs">
                  <img src={company.teamPhoto} alt="Podgląd zespołu" className="w-full h-full object-cover animate-fadeIn" />
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'features' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Udogodnienia */}
            <div className="bg-slate-50/30 border border-slate-200/50 p-6 rounded-2xl">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Udogodnienia (Amenities)</h4>
              <p className="text-[11px] font-medium text-slate-500 mb-4">Zaznacz opcje dostępne na miejscu w Twoim lokalu.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AMENITY_OPTIONS.map(opt => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`amenity_${opt.id}`}
                      checked={(company.amenities || []).includes(opt.label)}
                      onChange={() => toggleArrayItem('amenities', opt.label)}
                      className="w-4 h-4 text-indigo-600 border-slate-400 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor={`amenity_${opt.id}`} className="text-xs font-medium text-slate-700 cursor-pointer">{opt.label}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Metody Płatności */}
            <div className="bg-slate-50/30 border border-slate-200/50 p-6 rounded-2xl">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Akceptowane płatności</h4>
              <p className="text-[11px] font-medium text-slate-500 mb-4">Zaznacz metody płatności, jakimi klienci mogą zapłacić na miejscu.</p>

              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_OPTIONS.map(opt => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`pay_${opt.id}`}
                      checked={(company.paymentMethods || []).includes(opt.label)}
                      onChange={() => toggleArrayItem('paymentMethods', opt.label)}
                      className="w-4 h-4 text-indigo-600 border-slate-400 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor={`pay_${opt.id}`} className="text-xs font-medium text-slate-700 cursor-pointer">{opt.label}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Języki obsługi */}
            <div className="bg-slate-50/30 border border-slate-200/50 p-6 rounded-2xl">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Języki obsługi klientów</h4>
              <p className="text-[11px] font-medium text-slate-500 mb-4">W jakich językach rozmawiacie ze swoimi klientami?</p>

              <div className="grid grid-cols-2 gap-3">
                {LANGUAGE_OPTIONS.map(opt => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`lang_${opt.id}`}
                      checked={(company.languages || []).includes(opt.label)}
                      onChange={() => toggleArrayItem('languages', opt.label)}
                      className="w-4 h-4 text-indigo-600 border-slate-400 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor={`lang_${opt.id}`} className="text-xs font-medium text-slate-700 cursor-pointer">{opt.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'certs' && (
          <div className="bg-slate-50/30 border border-slate-200/50 p-6 rounded-2xl space-y-6 animate-fadeIn">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Certyfikaty i uprawnienia zawodowe</h4>
              <p className="text-[11px] font-medium text-slate-500">Dodaj dyplomy, ukończone kursy lub zezwolenia (np. certyfikat mechaniczny, dyplom kosmetologiczny).</p>
            </div>

            <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 focus-within:border-slate-300">
              <input
                type="text"
                placeholder="np. Dyplom Mistrzowski - Kosmetologia Estetyczna"
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                className="flex-1 px-3 py-2 bg-transparent text-xs font-semibold placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCertificate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Dodaj
              </button>
            </div>

            {company.certificates && company.certificates.length > 0 ? (
              <div className="space-y-2">
                {company.certificates.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3.5 bg-white border border-slate-200/60 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>{cert}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertificate(index)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400 py-6 border border-dashed border-slate-200/60 rounded-xl bg-white/50">Brak dodanych certyfikatów.</p>
            )}
          </div>
        )}

        {activeSubTab === 'faq' && (
          <div className="bg-slate-50/30 border border-slate-200/50 p-6 rounded-2xl space-y-6 animate-fadeIn">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Najczęściej zadawane pytania (FAQ)</h4>
              <p className="text-[11px] font-medium text-slate-500">Pomóż klientom uzyskać szybkie odpowiedzi bezpośrednio z Twojej wizytówki.</p>
            </div>

            <div className="space-y-3 bg-white border border-slate-200/60 p-5 rounded-xl shadow-2xs">
              <h5 className="text-xs font-bold text-slate-800">Dodaj nowe pytanie FAQ</h5>
              <div>
                <input
                  type="text"
                  placeholder="Pytanie: np. Czy przed zabiegiem należy przyjść bez makijażu?"
                  value={newFaqQ}
                  onChange={(e) => setNewFaqQ(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-300 focus:bg-slate-50/30 mb-2.5"
                />
                <textarea
                  rows={2}
                  placeholder="Odpowiedź: np. Tak, ułatwi to sprawne przeprowadzenie usługi kosmetycznej..."
                  value={newFaqA}
                  onChange={(e) => setNewFaqA(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-300 focus:bg-slate-50/30"
                />
              </div>
              <button
                type="button"
                onClick={handleAddFaq}
                className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Dodaj do listy FAQ
              </button>
            </div>

            {company.faqs && company.faqs.length > 0 ? (
              <div className="space-y-3">
                {company.faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-white border border-slate-200/65 rounded-xl space-y-1.5 relative shadow-3xs">
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(index)}
                      className="absolute top-4 right-4 p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-xs font-bold text-slate-900 pr-8">P: {faq.question}</p>
                    <p className="text-xs font-medium text-slate-600 pr-8">O: {faq.answer}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400 py-6 border border-dashed border-slate-200/60 rounded-xl bg-white/50">Brak zdefiniowanych pytań FAQ.</p>
            )}
          </div>
        )}

        <div className="pt-6 border-t border-slate-200/60">
          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all cursor-pointer text-sm"
          >
            Zapisz profil firmy
          </button>
        </div>
      </form>
    </div>
  );
}

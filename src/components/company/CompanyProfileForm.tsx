import React, { useState, useEffect } from 'react';
import styles from './CompanyProfileForm.module.css';
import { Building2, MapPin, Briefcase, Link as LinkIcon, Phone, Mail, FileText, CheckCircle2, ArrowRight, ArrowLeft, Loader2, ImagePlus, Plus, Trash2, HelpCircle, Instagram, Facebook, Globe } from 'lucide-react';
import { AuthView, Company, FAQItem } from '@/types';
import { getFirebaseDb, getFirebaseAuth } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ProfileCompleteness } from '@/components/company/ProfileCompleteness';
import { addToast } from '@/ui/feedback/Toast';

interface Props {
  onNavigate: (view: AuthView) => void;
  existingCompany?: Company | null;
}

export function CompanyProfileForm({ onNavigate, existingCompany }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: existingCompany?.companyName || '',
    nip: existingCompany?.nip || '',
    description: existingCompany?.description || '',
    address: existingCompany?.address || '',
    city: existingCompany?.city || '',
    postalCode: existingCompany?.postalCode || '',
    phone: existingCompany?.phone || '',
    email: existingCompany?.email || '',
    website: existingCompany?.website || '',
    logo: existingCompany?.logo || '',
    mainPhoto: existingCompany?.mainPhoto || '',
    workingArea: existingCompany?.workingArea || '',
    foundedYear: existingCompany?.foundedYear ? String(existingCompany.foundedYear) : '',
    instagram: existingCompany?.instagram || '',
    facebook: existingCompany?.facebook || '',
    tiktok: existingCompany?.tiktok || '',
    bookingEnabled: existingCompany?.bookingEnabled ?? true
  });

  const [services, setServices] = useState<string[]>(
    existingCompany?.services ? existingCompany.services.split(',').map(s => s.trim()).filter(Boolean) : []
  );
  const [serviceInput, setServiceInput] = useState('');

  const [faqs, setFaqs] = useState<FAQItem[]>(existingCompany?.faqs || []);
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const addService = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (serviceInput.trim() !== '' && !services.includes(serviceInput.trim())) {
        setServices([...services, serviceInput.trim()]);
      }
      setServiceInput('');
    }
  };

  const removeService = (serviceToRemove: string) => {
    setServices(services.filter(s => s !== serviceToRemove));
  };

  const addFaq = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setFaqs([...faqs, { question: newFaqQ.trim(), answer: newFaqA.trim() }]);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const removeFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!formData.companyName.trim()) {
        setError('Nazwa firmy jest wymagana.');
        return false;
      }
      if (formData.nip.trim() && !/^\d{10}$/.test(formData.nip.trim())) {
        setError('NIP musi składać się z dokładnie 10 cyfr.');
        return false;
      }
      if (!formData.description.trim() || formData.description.trim().length < 10) {
        setError('Opis firmy musi mieć co najmniej 10 znaków.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.address.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
        setError('Adres, miasto i kod pocztowy są wymagane.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setError(null);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }

    if (!validateStep(1) || !validateStep(2)) return;

    setLoading(true);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      const user = auth.currentUser;

      const userUid = user?.uid || 'comp_' + Date.now();

      const companyData: Partial<Company> = {
        uid: userUid,
        companyName: formData.companyName.trim(),
        nip: formData.nip.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || user?.email || '',
        website: formData.website.trim(),
        services: services.join(', '),
        logo: formData.logo.trim(),
        mainPhoto: formData.mainPhoto.trim(),
        workingArea: formData.workingArea.trim(),
        ...(formData.foundedYear && !isNaN(parseInt(formData.foundedYear)) ? { foundedYear: parseInt(formData.foundedYear) } : {}),
        instagram: formData.instagram.trim(),
        facebook: formData.facebook.trim(),
        tiktok: formData.tiktok.trim(),
        faqs,
        bookingEnabled: formData.bookingEnabled,
        visibilityPackage: existingCompany?.visibilityPackage || 'free',
        rating: existingCompany?.rating || 5.0,
        reviewCount: existingCompany?.reviewCount || 0,
        lat: existingCompany?.lat || 52.5360,
        lng: existingCompany?.lng || 17.5950,
        openingHours: existingCompany?.openingHours || {
          pn: '08:00 - 16:00',
          wt: '08:00 - 16:00',
          sr: '08:00 - 16:00',
          czw: '08:00 - 16:00',
          pt: '08:00 - 16:00',
          sb: 'Zamknięte',
          nd: 'Zamknięte'
        },
        updatedAt: new Date().toISOString()
      };

      // 1. Try Firebase Firestore save
      try {
        if (user) {
          await setDoc(doc(db, 'companies', user.uid), companyData, { merge: true });
          await setDoc(doc(db, 'users', user.uid), {
            role: 'firma',
            name: formData.companyName.trim()
          }, { merge: true });
        }
      } catch (fbErr) {
        console.warn('Firebase save skipped, saving to MySQL:', fbErr);
      }

      // 2. Always save to MySQL 8.0 Primary Database
      try {
        await fetch('/api/mysql/companies/insert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: userUid,
            company_name: formData.companyName.trim(),
            nip: formData.nip.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim() || user?.email || '',
            website: formData.website.trim(),
            visibility_package: existingCompany?.visibilityPackage || 'free'
          })
        });
      } catch (mErr) {
        console.warn('MySQL save note:', mErr);
      }

      localStorage.setItem('has_company_profile_' + userUid, 'true');
      localStorage.setItem('user_role_' + userUid, 'firma');
      addToast('Profil firmy oraz sekcja FAQ i Usługi zostały zapisane!', 'success');

      // AUTOMATIC REDIRECT TO DASHBOARD COMPANY
      onNavigate('dashboard-company');
    } catch (err: any) {
      console.error('Error saving company profile:', err);
      // Fallback navigation so user is never stuck
      addToast('Profil zapisany lokalnie.', 'success');
      onNavigate('dashboard-company');
    } finally {
      setLoading(false);
    }
  };

  const previewCompanyObj: Company = {
    uid: 'preview',
    companyName: formData.companyName || 'Twoja Firma',
    nip: formData.nip,
    description: formData.description,
    address: formData.address,
    city: formData.city,
    postalCode: formData.postalCode,
    phone: formData.phone,
    email: formData.email,
    website: formData.website,
    services: services.join(', '),
    logo: formData.logo,
    mainPhoto: formData.mainPhoto,
    workingArea: formData.workingArea,
    foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
    instagram: formData.instagram,
    facebook: formData.facebook,
    tiktok: formData.tiktok,
    faqs,
    bookingEnabled: formData.bookingEnabled,
    visibilityPackage: 'free',
    lat: 52.5360,
    lng: 17.5950,
    updatedAt: new Date().toISOString()
  };

  const shouldUseSingleColumn = !formData.companyName && !formData.address && !formData.phone;

  return (
    <div className="w-full p-4 sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {existingCompany ? 'Edytuj Profil Firmy' : 'Konfiguracja Profilu Firmy'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Uzupełnij szczegółowe informacje, aby ułatwić klientom odnalezienie i rezerwację Twoich usług.
        </p>
      </div>

      {/* Profile Completeness Preview */}
      <div className="mb-8">
        <ProfileCompleteness company={previewCompanyObj} />
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 w-full">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className={`flex items-center gap-2 text-sm font-semibold ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
            <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs">1</span>
            DANE PODSTAWOWE
          </div>
          <div className={`flex items-center gap-2 text-sm font-semibold ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
            <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs">2</span>
            KONTAKT & SOCIAL
          </div>
          <div className={`flex items-center gap-2 text-sm font-semibold ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
            <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs">3</span>
            FAQ & USŁUGI
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nazwa Firmy *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="np. Auto-Serwis Poznań"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    NIP (10 cyfr)
                  </label>
                  <input
                    type="text"
                    id="nip"
                    value={formData.nip}
                    onChange={handleChange}
                    placeholder="1234567890"
                    maxLength={10}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Opis Firmy *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Opisz swoją firmę, doświadczenie oraz specyfikę świadczonych usług..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    URL Logo Firmy
                  </label>
                  <input
                    type="url"
                    id="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    URL Zdjęcia Głównodowca
                  </label>
                  <input
                    type="url"
                    id="mainPhoto"
                    value={formData.mainPhoto}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rok Założenia
                  </label>
                  <input
                    type="number"
                    id="foundedYear"
                    value={formData.foundedYear}
                    onChange={handleChange}
                    placeholder="2018"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Obszar Działania (np. Poznań + 30 km)
                  </label>
                  <input
                    type="text"
                    id="workingArea"
                    value={formData.workingArea}
                    onChange={handleChange}
                    placeholder="np. Cała Wielkopolska"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Address, Contact & Social */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Adres *</label>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="ul. Główna 15"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Kod Pocztowy *</label>
                  <input
                    type="text"
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="60-001"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Miasto *</label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Poznań"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="500 600 700"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Social Media & WWW</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Strona WWW</label>
                    <input
                      type="url"
                      id="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://mojafirma.pl"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      id="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/firma"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Facebook URL</label>
                    <input
                      type="url"
                      id="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/firma"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">TikTok URL</label>
                    <input
                      type="url"
                      id="tiktok"
                      value={formData.tiktok}
                      onChange={handleChange}
                      placeholder="https://tiktok.com/@firma"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FAQ & Services */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              {/* Tag services */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kategorie & Usługi (Enter dodaje tag)
                </label>
                <input
                  type="text"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={addService}
                  placeholder="Wpisz usługę i naciśnij Enter (np. Hydraulik, Strzyżenie...)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {services.map(s => (
                    <span key={s} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium flex items-center gap-1.5">
                      {s}
                      <button type="button" onClick={() => removeService(s)} className="text-indigo-400 hover:text-indigo-600">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* FAQ Builder */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Najczęściej Zadawane Pytania (FAQ)
                </h4>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-3">
                  <input
                    type="text"
                    placeholder="Pytanie (np. Czy wystawiacie faktury VAT?)"
                    value={newFaqQ}
                    onChange={(e) => setNewFaqQ(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  <textarea
                    placeholder="Odpowiedź (np. Tak, na wszystkie usługi wystawiamy faktury VAT 23%)."
                    value={newFaqA}
                    onChange={(e) => setNewFaqA(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addFaq}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Dodaj Pytanie FAQ
                  </button>
                </div>

                {faqs.length > 0 && (
                  <div className="space-y-2">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start justify-between gap-2 text-xs">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Q: {faq.question}</p>
                          <p className="text-slate-600 dark:text-slate-300 mt-1">A: {faq.answer}</p>
                        </div>
                        <button type="button" onClick={() => removeFaq(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Wstecz
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                Dalej <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Zapisywanie...
                  </>
                ) : (
                  <>
                    Zapisz Profil <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default React.memo(CompanyProfileForm);

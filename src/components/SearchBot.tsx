import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, ArrowRight, Sparkles, Building2, Star, CheckCircle, RefreshCw, HelpCircle, Loader2 } from 'lucide-react';
import { fetchSearchData } from '../lib/SearchEngine';
import { Company, Service } from '../types';

interface SearchBotProps {
  onSelectCompany: (companyId: string) => void;
}

interface Step {
  id: 'category' | 'budget' | 'urgency' | 'results';
  title: string;
}

export function SearchBot({ onSelectCompany }: SearchBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'category' | 'budget' | 'urgency' | 'results'>('category');
  
  // Selection States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [urgency, setUrgency] = useState<string | null>(null); // 'today' | 'weekend' | 'any'
  
  // Result States
  const [loadingResults, setLoadingResults] = useState(false);
  const [matchedServices, setMatchedServices] = useState<Array<{ service: Service; company: Company }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [step, matchedServices, loadingResults]);

  const categoriesList = [
    { label: 'Uroda i Styl', value: 'Uroda i Styl', icon: '✂️' },
    { label: 'Motoryzacja', value: 'Motoryzacja', icon: '🚗' },
    { label: 'Usługi domowe', value: 'Usługi domowe', icon: '🏠' },
    { label: 'Gastronomia', value: 'Gastronomia', icon: '🍕' },
    { label: 'Medycyna', value: 'Medycyna', icon: '🩺' }
  ];

  const budgetOptions = [
    { label: 'Tani budżet (do 50 zł)', value: 50 },
    { label: 'Średni budżet (do 100 zł)', value: 100 },
    { label: 'Standard (do 200 zł)', value: 200 },
    { label: 'Bez limitu budżetu', value: 999999 }
  ];

  const urgencyOptions = [
    { label: 'Dzisiaj / Na już ⚡', value: 'today' },
    { label: 'W ten weekend 📅', value: 'weekend' },
    { label: 'Dowolny termin ⏳', value: 'any' }
  ];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setStep('budget');
  };

  const handleBudgetSelect = (budget: number) => {
    setMaxBudget(budget);
    setStep('urgency');
  };

  const handleUrgencySelect = async (urg: string) => {
    setUrgency(urg);
    setStep('results');
    setLoadingResults(true);

    try {
      const { companies, services } = await fetchSearchData();
      
      // Filter matching services
      const filtered: Array<{ service: Service; company: Company }> = [];
      
      services.forEach(service => {
        if (!service.isActive) return;
        
        // Find parent company
        const parent = companies.find(c => c.uid === service.companyId);
        if (!parent) return;

        // Verify category match
        const parentCat = parent.services.split(',')[0]?.trim() || '';
        const isCatMatch = parentCat.toLowerCase().includes(selectedCategory!.toLowerCase()) || 
                           service.category.toLowerCase().includes(selectedCategory!.toLowerCase()) ||
                           selectedCategory === 'Usługi domowe' && (service.category.includes('remont') || service.category.includes('hydraulik'));
        
        if (!isCatMatch) return;

        // Verify budget match
        if (maxBudget && service.price > maxBudget) return;

        // Verify urgency / opening hours (simulate if today/weekend is matched)
        if (urg === 'today') {
          // Verify if company has opening hours defined
          if (!parent.openingHours) return;
        }

        filtered.push({ service, company: parent });
      });

      // Sort by sponsored tier and ratings
      filtered.sort((a, b) => {
        const tierScore = (b.company.visibilityPackage === 'platinum' ? 300 : b.company.visibilityPackage === 'gold' ? 200 : b.company.visibilityPackage === 'silver' ? 100 : 0) -
                           (a.company.visibilityPackage === 'platinum' ? 300 : a.company.visibilityPackage === 'gold' ? 200 : a.company.visibilityPackage === 'silver' ? 100 : 0);
        const ratingScore = (b.company.rating || 0) - (a.company.rating || 0);
        return tierScore || ratingScore;
      });

      setTimeout(() => {
        setMatchedServices(filtered.slice(0, 4));
        setLoadingResults(false);
      }, 800);

    } catch (e) {
      console.error(e);
      setLoadingResults(false);
    }
  };

  const resetBot = () => {
    setSelectedCategory(null);
    setMaxBudget(null);
    setUrgency(null);
    setMatchedServices([]);
    setStep('category');
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full p-4 shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center cursor-pointer group"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider pr-1 hidden sm:inline">Bot Wyszukiwania</span>
          </div>
        )}
      </button>

      {/* Expandable Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-full max-w-[360px] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[460px] animate-in slide-in-from-bottom duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-650 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs leading-none">Lokalnie Bot</h4>
                <span className="text-[9px] font-bold opacity-80 mt-0.5 block">Szybkie ustrukturyzowane szukanie</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Chat Body (Flow log) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar text-[11px] font-semibold text-slate-700">
            
            {/* Greeting */}
            <div className="flex gap-2 items-start max-w-[85%]">
              <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-xs shrink-0 select-none">
                🤖
              </div>
              <div className="bg-white border border-slate-200/75 p-3 rounded-2xl rounded-bl-none shadow-3xs">
                Cześć! Jestem Twoim pomocnikiem. Znajdę dla Ciebie idealną usługę. Wybierz branżę, której szukasz:
              </div>
            </div>

            {/* Category Step Selection */}
            {selectedCategory && (
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white px-3 py-2 rounded-2xl rounded-br-none shadow-3xs max-w-[80%] text-right font-bold">
                  {selectedCategory}
                </div>
              </div>
            )}

            {step === 'category' && (
              <div className="grid grid-cols-1 gap-2 pl-8">
                {categoriesList.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategorySelect(cat.value)}
                    className="w-full text-left p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all cursor-pointer shadow-3xs text-[11px] font-bold flex items-center gap-2"
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Budget Step */}
            {selectedCategory && (
              <div className="flex gap-2 items-start max-w-[85%] animate-in fade-in duration-200">
                <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-xs shrink-0 select-none">
                  🤖
                </div>
                <div className="bg-white border border-slate-200/75 p-3 rounded-2xl rounded-bl-none shadow-3xs">
                  Świetnie. Jaki budżet maksymalny planujesz na wizytę?
                </div>
              </div>
            )}

            {maxBudget && (
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white px-3 py-2 rounded-2xl rounded-br-none shadow-3xs max-w-[80%] text-right font-bold">
                  Budżet: {maxBudget === 999999 ? 'Dowolny' : `do ${maxBudget} zł`}
                </div>
              </div>
            )}

            {step === 'budget' && (
              <div className="grid grid-cols-1 gap-2 pl-8">
                {budgetOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleBudgetSelect(opt.value)}
                    className="w-full text-left p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all cursor-pointer shadow-3xs font-bold"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Urgency Step */}
            {maxBudget && (
              <div className="flex gap-2 items-start max-w-[85%] animate-in fade-in duration-200">
                <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-xs shrink-0 select-none">
                  🤖
                </div>
                <div className="bg-white border border-slate-200/75 p-3 rounded-2xl rounded-bl-none shadow-3xs">
                  Kiedy chciałbyś zarezerwować termin?
                </div>
              </div>
            )}

            {urgency && (
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white px-3 py-2 rounded-2xl rounded-br-none shadow-3xs max-w-[80%] text-right font-bold">
                  {urgencyOptions.find(o => o.value === urgency)?.label}
                </div>
              </div>
            )}

            {step === 'urgency' && (
              <div className="grid grid-cols-1 gap-2 pl-8">
                {urgencyOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleUrgencySelect(opt.value)}
                    className="w-full text-left p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all cursor-pointer shadow-3xs font-bold"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Results Step */}
            {step === 'results' && (
              <div className="flex gap-2 items-start max-w-[85%]">
                <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-xs shrink-0 select-none">
                  🤖
                </div>
                <div className="bg-white border border-slate-200/75 p-3 rounded-2xl rounded-bl-none shadow-3xs">
                  {loadingResults ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Filtrowanie ofert lokalnych...</span>
                    </div>
                  ) : matchedServices.length === 0 ? (
                    'Niestety, nie znalazłem żadnych ofert spełniających te kryteria w Gnieźnie.'
                  ) : (
                    `Znalazłem ${matchedServices.length} pasujące oferty w Gnieźnie:`
                  )}
                </div>
              </div>
            )}

            {!loadingResults && step === 'results' && matchedServices.length > 0 && (
              <div className="space-y-3.5 pl-8 animate-in fade-in duration-300">
                {matchedServices.map(({ service, company }) => (
                  <div 
                    key={service.id} 
                    className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between shadow-3xs relative overflow-hidden"
                  >
                    {company.visibilityPackage === 'platinum' && (
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg">
                        AI Recommended
                      </div>
                    )}
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-xs truncate max-w-[190px]">
                        {service.name}
                      </h5>
                      <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                        {company.companyName}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                        <span className="font-black text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          {service.price} zł
                        </span>
                        <span className="flex items-center gap-0.5 font-bold text-amber-500">
                          ★ {company.rating || 5.0}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onSelectCompany(company.uid);
                      }}
                      className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer text-center"
                    >
                      Pokaż szczegóły i rezerwuj
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer (Reset / Restart options) */}
          {step === 'results' && !loadingResults && (
            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <button
                onClick={resetBot}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/50 text-indigo-750 font-bold rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Szukaj od nowa
              </button>
            </div>
          )}

        </div>
      )}
    </>
  );
}

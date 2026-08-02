import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { MessageBubble } from '../bot/MessageBubble';
import { Company, Service } from '../../../types';
import { SEARCH_BOT_LOCATION } from '../bot/botConstants';

interface ResultsViewProps {
  loadingResults: boolean;
  matchedServices: Array<{ service: Service; company: Company }>;
  onSelectCompany: (companyId: string, shouldClose: boolean) => void;
}

export const ResultsView = memo(function ResultsView({
  loadingResults,
  matchedServices,
  onSelectCompany
}: ResultsViewProps) {
  return (
    <div className="space-y-3.5 pl-8">
      <MessageBubble
        isBot={true}
        text={
          loadingResults
            ? null
            : matchedServices.length === 0
              ? `Niestety, nie znalazłem żadnych ofert spełniających te kryteria w ${SEARCH_BOT_LOCATION}.`
              : `Znalazłem ${matchedServices.length} pasujące oferty w ${SEARCH_BOT_LOCATION}:`
        }
      >
        {loadingResults && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Filtrowanie ofert lokalnych...</span>
          </div>
        )}
      </MessageBubble>

      {!loadingResults && matchedServices.length > 0 && (
        <div className="space-y-3.5 animate-in fade-in duration-300">
          {matchedServices.map(({ service, company }) => (
            <ServiceCard
              key={service.id}
              service={service}
              company={company}
              onSelect={onSelectCompany}
            />
          ))}
        </div>
      )}
    </div>
  );
});

interface ServiceCardProps {
  service: Service;
  company: Company;
  onSelect: (companyId: string, shouldClose: boolean) => void;
}

const ServiceCard = memo(function ServiceCard({ service, company, onSelect }: ServiceCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between shadow-3xs relative overflow-hidden">
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
        onClick={() => onSelect(company.uid, true)}
        className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer text-center"
      >
        Pokaż szczegóły i rezerwuj
      </button>
    </div>
  );
});

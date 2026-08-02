import React, { memo, useCallback } from 'react';
import { CATEGORIES_LIST, BUDGET_OPTIONS, URGENCY_OPTIONS } from '@/components/search/bot/botConstants';
import { OptionGrid } from '@/components/search/bot/OptionButton';
import { MessageBubble } from '@/components/search/bot/MessageBubble';

interface StepCategoryProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onCategorySelect: (category: string) => void;
  onQuerySubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const StepCategory = memo(function StepCategory({
  searchTerm,
  onSearchTermChange,
  onCategorySelect,
  onQuerySubmit
}: StepCategoryProps) {
  return (
    <div className="space-y-3 pl-8">
      <form onSubmit={onQuerySubmit} className="flex gap-2">
        <input
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Napisz, czego szukasz (np. hydraulik, fryzjer, naprawa okien)"
          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-300"
        />
        <button
          type="submit"
          className="rounded-2xl bg-indigo-600 text-white px-4 py-2 text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          Dalej
        </button>
      </form>
      <OptionGrid
        options={CATEGORIES_LIST}
        onSelect={onCategorySelect}
      />
    </div>
  );
});

interface StepBudgetProps {
  customBudget: string;
  onCustomBudgetChange: (value: string) => void;
  onBudgetSelect: (budget: number) => void;
  onCustomBudgetSubmit: () => void;
}

export const StepBudget = memo(function StepBudget({
  customBudget,
  onCustomBudgetChange,
  onBudgetSelect,
  onCustomBudgetSubmit
}: StepBudgetProps) {
  return (
    <div className="space-y-3 pl-8">
      <MessageBubble isBot={true} text="Jaka kwota jest dla Ciebie komfortowa?" />
      <div className="space-y-2">
        <OptionGrid
          options={BUDGET_OPTIONS}
          onSelect={onBudgetSelect}
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={customBudget}
            onChange={(e) => onCustomBudgetChange(e.target.value)}
            placeholder="Wpisz własny budżet"
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-300"
          />
          <button
            type="button"
            onClick={onCustomBudgetSubmit}
            className="rounded-2xl bg-indigo-600 text-white px-4 py-2 text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            Ustaw
          </button>
        </div>
      </div>
    </div>
  );
});

interface StepUrgencyProps {
  onUrgencySelect: (urgency: string) => void;
}

export const StepUrgency = memo(function StepUrgency({ onUrgencySelect }: StepUrgencyProps) {
  return (
    <div className="grid grid-cols-1 gap-2 pl-8">
      <OptionGrid
        options={URGENCY_OPTIONS}
        onSelect={onUrgencySelect}
      />
    </div>
  );
});

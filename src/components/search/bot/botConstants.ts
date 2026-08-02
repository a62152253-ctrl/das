// Extract constants for better tree-shaking and maintainability
export const CATEGORIES_LIST = [
  { label: 'Uroda i Styl', value: 'Uroda i Styl', icon: '✂️' },
  { label: 'Motoryzacja', value: 'Motoryzacja', icon: '🚗' },
  { label: 'Usługi domowe', value: 'Usługi domowe', icon: '🏠' },
  { label: 'Gastronomia', value: 'Gastronomia', icon: '🍕' },
  { label: 'Medycyna', value: 'Medycyna', icon: '🩺' }
] as const;

export const BUDGET_OPTIONS = [
  { label: 'Tani budżet (do 50 zł)', value: 50 },
  { label: 'Średni budżet (do 100 zł)', value: 100 },
  { label: 'Standard (do 200 zł)', value: 200 },
  { label: 'Bez limitu budżetu', value: 999999 }
] as const;

export const URGENCY_OPTIONS = [
  { label: 'Dzisiaj / Na już ⚡', value: 'today' },
  { label: 'W ten weekend 📅', value: 'weekend' },
  { label: 'Dowolny termin ⏳', value: 'any' }
] as const;

export const VISIBILITY_TIER_SCORE: Record<string, number> = {
  platinum: 300,
  gold: 200,
  silver: 100
} as const;

export const MAX_RESULTS = 4;
export const RESULTS_LOAD_DELAY = 0; // Remove artificial delay for instant feedback
export const SEARCH_BOT_LOCATION = 'Gnieźnie';
